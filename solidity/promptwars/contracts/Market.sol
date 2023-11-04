// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/math/Math.sol";
import "@openzeppelin/contracts/utils/math/SafeCast.sol";

contract Market {
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

    struct OutcomeToken {
        // the account id of the outcomeToken
        address outcomeId;
        // the outcome value, in this case, the prompt submitted to the competition
        string prompt;
        // the outcome value, in this case, the prompt submitted to the competition
        string outputImgUri;
        // store the result from the image comparison: percentageDiff or pixelDifference
        string result;
        // total supply of this outcomeToken
        uint supply;
    }

    struct CollateralToken {
        string id;
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
        uint result;
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

    mapping(address => OutcomeToken) outcomeTokens;
    address[] public players;

    MarketData private _market;
    Resolution private _resolution;
    Fees private _fees;
    Management private _management;
    CollateralToken private _collateralToken;

    // ================================================================
    // |                        MODIFIERS                             |
    // ================================================================

    modifier assertIsOpen() {
        require(block.timestamp >= _market.startsAt, "ERR_MARKET_NOT_OPEN");
        _;
    }

    modifier assertIsNotResolved() {
        require(!_is_resolved(), "ERR_MARKET_RESOLVED");
        _;
    }

    modifier assertPrice(uint amount) {
        require(amount >= _fees.price, "ERR_ASSERT_PRICE_INSUFFICIENT_AMOUNT");
        _;
    }

    // ================================================================
    // |                        CONSTANTS                             |
    // ================================================================

    uint constant EVENT_PERIOD_NANOS = 5 minutes;
    uint constant STAGE_PERIOD_NANOS = 5 minutes;
    uint constant CREATE_OUTCOME_TOKEN_PRICE = 10_000;
    uint constant FEE_RATIO = 20_000_000;
    uint constant BUY_SELL_THRESHOLD = 75;

    // ================================================================
    // |                          Events                              |
    // ================================================================

    event CreateOutcomeToken(
        uint amount,
        address outcomeId,
        uint supply,
        uint collateralTokenBalance,
        uint collateralTokenFeeBalance
    );

    // ================================================================
    // |                          PUBLIC                              |
    // ================================================================

    constructor(
        MarketData memory market,
        Management memory management,
        CollateralToken memory collateralToken
    ) {
        uint endsAt;
        uint revealWindow;
        uint resolutionWindow;
        uint selfDestructWindow;

        uint startsAt = block.timestamp;
        (, endsAt) = startsAt.tryAdd(EVENT_PERIOD_NANOS);
        (, revealWindow) = endsAt.tryAdd(STAGE_PERIOD_NANOS);
        (, resolutionWindow) = revealWindow.tryAdd(STAGE_PERIOD_NANOS);

        (, selfDestructWindow) = resolutionWindow.tryAdd(7 days);

        market.startsAt = startsAt;
        market.endsAt = endsAt;
        market = market;

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

    function create_outcome_token(
        uint amount,
        string memory prompt
    ) public assertIsOpen assertIsNotResolved assertPrice(amount) {
        address senderId = msg.sender;

        OutcomeToken storage outcomeToken = outcomeTokens[senderId];

        require(
            address(outcomeToken.outcomeId) == address(0),
            "ERR_CREATE_OUTCOME_TOKEN_outcome_id_EXIST"
        );

        uint amountMintable;
        uint fee;
        (amountMintable, fee) = _get_amount_mintable(amount);

        outcomeToken.outcomeId = senderId;
        outcomeToken.prompt = prompt;
        outcomeToken.supply = amountMintable;

        players.push(senderId);

        outcomeTokens[senderId] = outcomeToken;

        _collateralToken.balance += amount;
        _collateralToken.feeBalance += fee;

        emit CreateOutcomeToken(
            amount,
            senderId,
            outcomeToken.supply,
            _collateralToken.balance,
            _collateralToken.feeBalance
        );
    }

    // ================================================================
    // |                        Public VIEWS                          |
    // ================================================================

    function get_market_data() public view returns (MarketData memory) {
        return _market;
    }

    function get_resolution_data() public view returns (Resolution memory) {
        return _resolution;
    }

    function get_fees_data() public view returns (Fees memory) {
        return _fees;
    }

    function get_management_data() public view returns (Management memory) {
        return _management;
    }

    function get_collateral_token_data()
        public
        view
        returns (CollateralToken memory)
    {
        return _collateralToken;
    }

    // ================================================================
    // |                        PRIVATE                               |
    // ================================================================

    function _is_resolved() private view returns (bool) {
        return _resolution.resolvedAt != 0;
    }

    function _get_amount_mintable(
        uint amount
    ) private view returns (uint, uint) {
        uint fee = (amount * _fees.feeRatio) / 100;
        uint amountMintable = amount - fee;

        return (amountMintable, fee);
    }

    function _calculate_percentage(
        uint256 amount,
        uint256 bps
    ) private pure returns (uint256) {
        require((amount * bps) >= 10_000);

        return (amount * bps) / 10_000;
    }
}
