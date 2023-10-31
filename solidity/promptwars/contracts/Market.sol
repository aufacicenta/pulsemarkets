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

    uint constant EVENT_PERIOD_NANOS = 5 minutes;
    uint constant STAGE_PERIOD_NANOS = 5 minutes;
    uint constant CREATE_OUTCOME_TOKEN_PRICE = 10_000;
    uint constant FEE_RATIO = 20_000_000;
    uint constant BUY_SELL_THRESHOLD = 75;

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
}
