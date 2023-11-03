// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./storage.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";
import "@openzeppelin/contracts/utils/math/SafeCast.sol";

contract Market {
    using Math for uint;
    using SafeCast for uint;

    mapping(address => OutcomeToken) outcomeTokens;
    address[] public players;

    MarketData market;
    Management management;
    CollateralToken collateralToken;
    Fees fees;
    Resolution resolution;

    modifier assertIsOpen() {
        require(block.timestamp >= market.startsAt, "ERR_MARKET_NOT_OPEN");
        _;
    }

    modifier assertIsNotResolved() {
        require(!_is_resolved(), "ERR_MARKET_RESOLVED");
        _;
    }

    modifier assertPrice(uint amount) {
        require(amount >= fees.price, "ERR_ASSERT_PRICE_INSUFFICIENT_AMOUNT");
        _;
    }

    uint constant EVENT_PERIOD_NANOS = 5 minutes;
    uint constant STAGE_PERIOD_NANOS = 5 minutes;
    uint constant CREATE_OUTCOME_TOKEN_PRICE = 10_000;
    uint constant FEE_RATIO = 20_000_000;
    uint constant BUY_SELL_THRESHOLD = 75;

    event CreateOutcomeToken(
        uint amount,
        address outcomeId,
        uint supply,
        uint collateralTokenBalance,
        uint collateralTokenFeeBalance
    );

    constructor(
        MarketData memory _market,
        Management memory _management,
        CollateralToken memory _collateralToken
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

        _market.startsAt = startsAt;
        _market.endsAt = endsAt;
        market = _market;

        uint buySellThreshold;

        _management.selfDestructWindow = selfDestructWindow;
        (, buySellThreshold) = BUY_SELL_THRESHOLD.tryDiv(100);
        _management.buySellThreshold = buySellThreshold;
        management = _management;

        _collateralToken.balance = 0;
        _collateralToken.feeBalance = 0;
        collateralToken = _collateralToken;

        resolution.window = resolutionWindow;
        resolution.revealWindow = revealWindow;

        fees.price = CREATE_OUTCOME_TOKEN_PRICE;
        fees.feeRatio = FEE_RATIO;
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

        collateralToken.balance += amount;
        collateralToken.feeBalance += fee;

        emit CreateOutcomeToken(
            amount,
            senderId,
            outcomeToken.supply,
            collateralToken.balance,
            collateralToken.feeBalance
        );
    }

    function _is_resolved() private view returns (bool) {
        return resolution.resolvedAt != 0;
    }

    function _get_amount_mintable(
        uint amount
    ) private view returns (uint, uint) {
        uint fee = (amount * fees.feeRatio) / 100;
        uint amountMintable = amount - fee;

        return (amountMintable, fee);
    }
}
