// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/math/Math.sol";
import "@openzeppelin/contracts/utils/math/SafeCast.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Market is Ownable {
    using Math for uint;
    using SafeCast for uint;

    // ================================================================
    // |                        STRUCTS                                 |
    // ================================================================

    struct MarketData {
        // The IPFS reference-image hash of the expected prompts
        string imageUri;
        // Datetime nanos: the market is open
        uint startsAt;
        // Datetime nanos: the market is closed
        uint endsAt;
    }

    struct Player {
        // the account id of the outcomeToken
        address id;
        // the outcome value, in this case, the prompt submitted to the competition
        string prompt;
        // the outcome value, in this case, the prompt submitted to the competition
        string outputImgUri;
        // store the result from the image comparison: percentageDiff or pixelDifference
        string result;
        // total supply of this outcomeToken
        uint balance;
    }

    struct CollateralToken {
        address id;
        uint balance;
        uint decimals;
        uint feeBalance;
    }

    struct Resolution {
        // Time to free up the market
        uint window;
        // Time after the market ends and before the resolution window starts
        uint revealWindow;
        // When the market is resolved, set only by fn resolve
        uint resolvedAt;
        // When the market is resolved, set only by fn resolve
        address playerId;
    }

    struct Management {
        // Gets sent fees when claiming window is open
        string daoAccountId;
        // Gets back the storage deposit upon self-destruction
        string marketCreatorAccountId;
        // Set at initialization, the market may be destroyed by the creator to claim the storage deposit
        uint selfDestructWindow;
        // Set at initialization, determines when to close bets
        uint buySellThreshold;
    }

    struct Fees {
        // Price to charge when creating an outcome token
        uint price;
        // Decimal fee to charge upon a bet
        uint feeRatio;
        // When fees got sent to the DAO
        uint claimedAt;
    }

    struct CreateOutcomeTokenArgs {
        // the outcome value, in this case, the prompt submitted to the competition
        string prompt;
    }

    // ================================================================
    // |                            STATE                             |
    // ================================================================

    mapping(address => Player) players;
    address[] private _playerIds;

    MarketData private _market;
    Resolution private _resolution;
    Fees private _fees;
    Management private _management;
    CollateralToken private _collateralToken;

    // ================================================================
    // |                        MODIFIERS                             |
    // ================================================================

    modifier assertBeforeEnd() {
        require(_is_before_market_ends(), "ERR_EVENT_ENDED");
        _;
    }

    modifier assertEnoughParticipants() {
        require(_playerIds.length > 0, "ERR_RESOLVE_0_PARTICIPANTS");
        _;
    }

    modifier assertIsNotResolved() {
        require(!_is_resolved(), "ERR_EVENT_IS_RESOLVED");
        _;
    }

    modifier assertIsRevealWindowOpen() {
        require(!_is_reveal_window_expired(), "ERR_REVEAL_WINDOW_EXPIRED");
        _;
    }

    modifier assertIsResolutionWindowOpen() {
        require(
            !_is_resolution_window_expired(),
            "ERR_RESOLUTION_WINDOW_EXPIRED"
        );
        _;
    }

    modifier assertPrice(uint amount) {
        require(amount >= _fees.price, "ERR_ASSERT_PRICE_INSUFFICIENT_AMOUNT");
        _;
    }

    modifier assertIsPlayerRegistered(address playerId) {
        require(_player_exists(playerId), "ERR_PLAYER_IS_NOT_REGISTERED");
        _;
    }

    modifier assertPlayerIsNotRegistered(address playerId) {
        require(!_player_exists(playerId), "ERR_PLAYER_EXISTS");
        _;
    }

    // ================================================================
    // |                        CONSTANTS                             |
    // ================================================================

    uint constant EVENT_PERIOD_TIMESTAMP = 5 minutes;
    uint constant STAGE_PERIOD_TIMESTAMP = 5 minutes;
    uint constant SELF_DESTRUCT_TIMESTAMP = 7 days;
    uint constant CREATE_OUTCOME_TOKEN_PRICE = 10_000;
    uint constant FEE_RATIO = 20;
    uint constant BUY_SELL_THRESHOLD = 75;

    // ================================================================
    // |                          Events                              |
    // ================================================================

    event RegisterPlayer(
        uint amount,
        address outcomeId,
        uint supply,
        uint fee,
        uint collateralTokenBalance,
        uint collateralTokenFeeBalance
    );

    event RevealPlayerResult(
        address playerId,
        string result,
        string outputImgUri
    );

    event ResolutionSuccess(
        address playerId,
        string result,
        string outputImgUri
    );

    event InternalSellUnresolved(address payee, uint amount);

    // ================================================================
    // |                          PUBLIC                              |
    // ================================================================

    /**
     * @notice Constructs a new Market contract.
     * @dev Contract deployment involves a series of initializations including market dates, management parameters, collateral balance, resolution timing, and fees.
     * @param market An instance of the MarketData struct that contains the attributes of the market such as the image URI and the start and end timings.
     * @param management An instance of the Management struct that contains fields necessary for managing the contract such as the DAO account ID, the creator account ID, the window to self-destruct, and the threshold to determine when to close bets.
     * @param collateralToken An instance of the CollateralToken struct that contains token-related data such as the token id, its balance, decimals, and the fee balance.
     */
    constructor(
        MarketData memory market,
        Management memory management,
        CollateralToken memory collateralToken
    ) Ownable(msg.sender) {
        uint startsAt = market.startsAt;
        uint endsAt = startsAt + EVENT_PERIOD_TIMESTAMP;
        uint revealWindow = endsAt + STAGE_PERIOD_TIMESTAMP;
        uint resolutionWindow = revealWindow + STAGE_PERIOD_TIMESTAMP;
        uint selfDestructWindow = resolutionWindow + SELF_DESTRUCT_TIMESTAMP;

        market.startsAt = startsAt;
        market.endsAt = endsAt;
        _market = market;

        management.selfDestructWindow = selfDestructWindow;
        management.buySellThreshold = BUY_SELL_THRESHOLD;
        _management = management;

        collateralToken.balance = 0;
        collateralToken.feeBalance = 0;
        _collateralToken = collateralToken;

        _resolution.window = resolutionWindow;
        _resolution.revealWindow = revealWindow;

        _fees.price = CREATE_OUTCOME_TOKEN_PRICE;
        _fees.feeRatio = FEE_RATIO;
    }

    /**
     * @notice This function is used to create a new Player record. A Player may enter the game before the event starts.
     * @notice A player must have approved an ERC20 of minimum the game price amount to get registered.
     * @notice A player executes this transaction. A player registers itself.
     * @param prompt A string value representing the prompt submitted to the competition. This becomes the outcome value of the created outcome token.
     * @dev we may change "prompt" for "value" in the future, so that we store any data for any game (or modify it depending on the game)
     */
    function register(
        string memory prompt
    ) public assertPlayerIsNotRegistered(msg.sender) assertBeforeEnd {
        address playerId = msg.sender;

        uint amount = _internal_transfer_from(
            playerId,
            address(this),
            _fees.price
        );

        Player storage player = players[playerId];

        uint amountMintable;
        uint fee;
        (amountMintable, fee) = get_amount_mintable(amount);

        player.id = playerId;
        player.prompt = prompt;
        player.balance = amountMintable;

        _playerIds.push(playerId);

        players[playerId] = player;

        _collateralToken.balance += amount;
        _collateralToken.feeBalance += fee;

        emit RegisterPlayer(
            amount,
            playerId,
            player.balance,
            fee,
            _collateralToken.balance,
            _collateralToken.feeBalance
        );
    }

    /**
     * @notice This function is used to reveal a player's result.
     * @param playerId The ID of the player to reveal the result for.
     * @param result The player's result.
     * @param outputImgUri The output image URI of the player.
     */
    function reveal(
        address playerId,
        string memory result,
        string memory outputImgUri
    )
        public
        onlyOwner
        assertIsRevealWindowOpen
        assertIsPlayerRegistered(playerId)
        assertIsNotResolved
    {
        Player storage player = players[playerId];

        player.result = result;
        player.outputImgUri = outputImgUri;

        emit RevealPlayerResult(playerId, result, outputImgUri);
    }

    function resolve(
        address playerId
    )
        public
        onlyOwner
        assertEnoughParticipants
        assertIsResolutionWindowOpen
        assertIsNotResolved
        assertIsPlayerRegistered(playerId)
    {
        _resolution.playerId = playerId;
        _resolution.resolvedAt = block.timestamp;

        Player storage player = players[playerId];

        string memory result = player.result;
        string memory outputImgUri = player.outputImgUri;

        emit ResolutionSuccess(playerId, result, outputImgUri);
    }

    // @TODO test for this method for both cases
    function sell() public returns (uint) {
        if (_is_expired_unresolved()) {
            return _internal_sell_unresolved();
        }

        return _internal_sell_resolved();
    }

    // ================================================================
    // |                        Public VIEWS                          |
    // ================================================================

    /**
     * @return The market data of the contract.
     */
    function get_market_data() public view returns (MarketData memory) {
        return _market;
    }

    /**
     * @return The resolution data of the contract.
     */
    function get_resolution_data() public view returns (Resolution memory) {
        return _resolution;
    }

    /**
     * @return The fees data of the contract.
     */
    function get_fees_data() public view returns (Fees memory) {
        return _fees;
    }

    /**
     * @return The management data of the contract.
     */
    function get_management_data() public view returns (Management memory) {
        return _management;
    }

    /**
     * @return The collateral token data of the contract.
     */
    function get_collateral_token_data()
        public
        view
        returns (CollateralToken memory)
    {
        return _collateralToken;
    }

    /**
     * @param playerId The player's address.
     * @return The outcome token data of a specified player.
     */
    function get_player(
        address playerId
    ) public view assertIsPlayerRegistered(playerId) returns (Player memory) {
        return players[playerId];
    }

    /**
     * @param amount The amount to be minted.
     * @return The amount of mintable tokens and the fee.
     */
    function get_amount_mintable(uint amount) public view returns (uint, uint) {
        uint fee = _calculate_percentage(amount, _fees.feeRatio);
        uint amountMintable = amount - fee;

        return (amountMintable, fee);
    }

    /**
     * @return The total number of players.
     */
    function get_players_count() public view returns (uint256) {
        return _playerIds.length;
    }

    /**
     * @return The current block timestamp
     */
    function get_block_timestamp() public view returns (uint256) {
        return block.timestamp;
    }

    // ================================================================
    // |                        PRIVATE FLAGS                         |
    // ================================================================

    /**
     * @notice Check if the contract is resolved.
     * @dev Compares current timestamp with resolution window.
     * @return bool Whether the contract is resolved or not.
     */
    function _is_resolved() private view returns (bool) {
        return _resolution.resolvedAt != 0;
    }

    function _is_before_market_ends() private view returns (bool) {
        return block.timestamp <= _market.endsAt;
    }

    function _is_reveal_window_expired() private view returns (bool) {
        return block.timestamp > _resolution.revealWindow;
    }

    function _is_resolution_window_expired() private view returns (bool) {
        return block.timestamp > _resolution.window;
    }

    function _is_expired_unresolved() private view returns (bool) {
        return
            !_is_before_market_ends() &&
            _is_resolution_window_expired() &&
            !_is_resolved();
    }

    function _player_exists(address playerId) private view returns (bool) {
        return address(players[playerId].id) != address(0);
    }

    // ================================================================
    // |                        INTERNAL                              |
    // ================================================================

    function _internal_sell_unresolved() private returns (uint) {
        address senderId = msg.sender;

        Player memory payee = get_player(senderId);

        uint playerBalance = payee.balance;

        uint amountMintable;
        (amountMintable, ) = get_amount_mintable(_fees.price);

        // @TODO test for this error and method
        require(
            playerBalance == amountMintable,
            "ERR_SELL_INSUFFICIENT_BALANCE"
        );

        _internal_transfer(senderId, playerBalance);

        payee.balance = 0;

        emit InternalSellUnresolved(senderId, playerBalance);

        return playerBalance;
    }

    // @TODO implement logic
    function _internal_sell_resolved() private view returns (uint) {
        Player memory payee = get_player(msg.sender);

        uint playerBalance = payee.balance;

        return playerBalance;
    }

    function _internal_transfer(
        address _to,
        uint _amount
    ) private returns (uint) {
        address _tokenAddr = _collateralToken.id;

        ERC20 token = ERC20(_tokenAddr);

        // @TODO test error and method
        require(token.transfer(_to, _amount), "ERR_INTERNAL_TRANSFER_FAILED");

        return _amount;
    }

    function _internal_transfer_from(
        address _from,
        address _to,
        uint _amount
    ) private returns (uint) {
        address _tokenAddr = _collateralToken.id;

        ERC20 token = ERC20(_tokenAddr);

        // @TODO test error and method
        require(
            token.transferFrom(_from, _to, _amount),
            "ERR_INTERNAL_TRANSFER_FROM_FAILED"
        );

        return _amount;
    }

    // ================================================================
    // |                        PRIVATE UTILS                         |
    // ================================================================

    /**
     * @notice Calculate percentage of amount.
     * @dev Used for calculating fees and other percentage based calculations.
     * @param amount The base amount.
     * @param bps Basis Points. The percentage.
     * @return uint The calculated amount after applying the percentage.
     */
    function _calculate_percentage(
        uint amount,
        uint bps
    ) private pure returns (uint) {
        require((amount * bps) >= 10_000);

        return (amount * bps) / 10_000;
    }
}
