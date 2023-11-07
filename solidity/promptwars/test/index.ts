/* eslint-disable node/no-unsupported-features/es-builtins */
/* eslint-disable no-unused-expressions */
import { expect } from "chai";
import { BigNumber } from "ethers";
import { ethers, network } from "hardhat";

const DAO_ACCOUNT_ID = "dao_account.eth";
const MARKET_CREATOR_ACCOUNT_ID = "creator.eth";
const COLLATERAL_TOKEN_ACCOUNT_ID = "usdt.eth";

async function createMarketContract() {
  const Market = await ethers.getContractFactory("Market");

  const _market = { imageUri: "", startsAt: 0, endsAt: 0 };

  const _management = {
    daoAccountId: DAO_ACCOUNT_ID,
    marketCreatorAccountId: MARKET_CREATOR_ACCOUNT_ID,
    selfDestructWindow: 0,
    buySellThreshold: 0,
  };

  const _collateralToken = {
    id: COLLATERAL_TOKEN_ACCOUNT_ID,
    balance: 0,
    decimals: 0,
    feeBalance: 0,
  };

  const market = await Market.deploy(_market, _management, _collateralToken);

  return market.deployed();
}

describe("Market", function () {
  it("Initialize: call constructor", async function () {
    const market = await createMarketContract();

    const marketData = await market.get_market_data();

    // console.log(marketData);

    expect(marketData).to.have.lengthOf(3);

    const [imageUri, startsAt, endsAt] = marketData;

    expect(imageUri).to.equal("");
    expect(startsAt.toString()).to.not.be.null;
    expect(endsAt.toString()).to.not.be.null;

    const resolutionData = await market.get_resolution_data();

    // console.log(resolutionData);

    expect(resolutionData).to.have.lengthOf(4);

    const [resolutionWindow, revealWindow, resolvedAt, result] = resolutionData;

    expect(resolutionWindow.toString()).to.not.be.null;
    expect(revealWindow.toString()).to.not.be.null;
    expect(resolvedAt.toString()).to.equal("0");
    expect(result.toString()).to.equal("0");

    const feesData = await market.get_fees_data();

    // console.log(feesData);

    const [price, feeRatio, claimedAt] = feesData;

    expect(price.toString()).to.equal("10000");
    expect(feeRatio.toString()).to.equal("20");
    expect(claimedAt.toString()).to.equal("0");

    const managementData = await market.get_management_data();

    // console.log(managementData);

    const [
      daoAccountId,
      marketCreatorAccountId,
      selfDestructWindow,
      buySellThreshold,
    ] = managementData;

    expect(daoAccountId).to.equal(DAO_ACCOUNT_ID);
    expect(marketCreatorAccountId).to.equal(MARKET_CREATOR_ACCOUNT_ID);
    expect(selfDestructWindow.toString()).to.not.be.null;
    expect(buySellThreshold.toString()).to.equal("75");

    const collateralTokenData = await market.get_collateral_token_data();

    // console.log(collateralTokenData);

    const [id, balance, decimals, feeBalance] = collateralTokenData;

    expect(id).to.equal(COLLATERAL_TOKEN_ACCOUNT_ID);
    expect(balance.toString()).to.equal("0");
    expect(decimals.toString()).to.equal("0");
    expect(feeBalance.toString()).to.equal("0");
  });

  it("create_outcome_token: should create token and emit event", async () => {
    const market = await createMarketContract();

    const prompt = "Sample Prompt";

    const amount = BigNumber.from(120_000);
    const [amountMintable, fee] = await market.get_amount_mintable(amount);

    const collateralTokenBalance = amount;
    const collateralTokenFeeBalance = fee;

    // console.log({ amountMintable, fee });

    const playerId = await ethers.getSigner(network.config.from!);

    await expect(market.register_player(amount, playerId.address, prompt))
      .to.emit(market, "CreateOutcomeToken")
      .withArgs(
        amount,
        playerId.address,
        amountMintable,
        fee,
        collateralTokenBalance,
        collateralTokenFeeBalance
      );

    const player = await market.get_player(playerId.address);

    expect(player.id).to.equal(playerId.address);
    expect(player.prompt).to.equal(prompt);
    expect(player.supply).to.equal(amountMintable);

    const collateralTokenData = await market.get_collateral_token_data();

    expect(collateralTokenData.balance.toString()).to.equal(amount.toString());
    expect(collateralTokenData.feeBalance.toString()).to.equal(fee.toString());

    const playersCount = await market.get_players_count();
    expect(playersCount).to.equal(1);
  });
});
