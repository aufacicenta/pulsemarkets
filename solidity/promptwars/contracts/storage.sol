// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

struct MarketData {
    // The IPFS reference-image hash of the expected prompts
    string imageUri;
    // Datetime nanos: the market is open
    uint startsAt;
    // Datetime nanos: the market is closed
    uint endsAt;
}

enum SetPriceOptions {
    Increase,
    Decrease
}

struct OutcomeToken {
    // the account id of the outcomeToken
    uint outcomeId;
    // the outcome value, in this case, the prompt submitted to the competition
    string prompt;
    // the outcome value, in this case, the prompt submitted to the competition
    string outputImgUri;
    // store the result from the image comparison: percentageDiff or pixelDifference
    string result;
    // total supply of this outcomeToken
    uint totalSupply;
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

enum Payload {
    CreateOutcomeTokenArgs
}
