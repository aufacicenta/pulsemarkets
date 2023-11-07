/* eslint-disable node/no-unsupported-features/es-builtins */
/* eslint-disable no-unused-expressions */
import { expect } from "chai";
import moment from "moment";
import { BigNumber } from "ethers";
import { ethers, network } from "hardhat";

const DAO_ACCOUNT_ID = "dao_account.eth";
const MARKET_CREATOR_ACCOUNT_ID = "creator.eth";
const COLLATERAL_TOKEN_ACCOUNT_ID = "usdt.eth";

async function getBlockTimestamp() {
  const blockNumBefore = await ethers.provider.getBlockNumber();
  const blockBefore = await ethers.provider.getBlock(blockNumBefore);
  const blockTimestamp = blockBefore.timestamp;

  return blockTimestamp;
}

async function createMarketContract(overrides?: Record<string, any>) {
  const Market = await ethers.getContractFactory("Market");

  const blockTimestamp = await getBlockTimestamp();

  const startsAt = overrides?.market?.startsAt || blockTimestamp;

  const _market = { imageUri: "", startsAt, endsAt: 0 };

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

    const [resolutionWindow, revealWindow, resolvedAt, playerId] =
      resolutionData;

    expect(resolutionWindow.toString()).to.not.be.null;
    expect(revealWindow.toString()).to.not.be.null;
    expect(resolvedAt.toString()).to.equal("0");
    expect(playerId.toString()).to.equal(
      "0x0000000000000000000000000000000000000000"
    );

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

  it("register_player: error on duplicate player address", async () => {
    const market = await createMarketContract();

    const prompt = "Sample Prompt";

    const amount = BigNumber.from(120_000);

    const playerId = ethers.Wallet.createRandom();

    await market.register_player(amount, playerId.address, prompt);

    await expect(
      market.register_player(amount, playerId.address, prompt)
    ).to.be.revertedWith("ERR_PLAYER_EXISTS");
  });

  it("register_player: error on onlyOwner modifier", async () => {
    const market = await createMarketContract();

    const owner = await ethers.getSigner(network.config.from!);
    const nonOwner = ethers.Wallet.createRandom();

    expect(await market.owner()).to.equal(owner.address);

    const prompt = "Sample Prompt";

    const amount = BigNumber.from(120_000);

    try {
      await market
        .connect(nonOwner)
        .register_player(amount, nonOwner.address, prompt);
    } catch (error) {
      expect((error as Error).message).to.match(/code=UNSUPPORTED_OPERATION?/);
    }
  });

  it("register_player: error on assertBeforeEnd modifier", async () => {
    const blockTimestamp = await getBlockTimestamp();
    const startsAt = moment.unix(blockTimestamp).add(5, "minute").unix();

    const market = await createMarketContract({ market: { startsAt } });

    // eslint-disable-next-line no-unused-vars
    const currentBlockTimestamp = await market.get_block_timestamp();

    // eslint-disable-next-line no-unused-vars
    const [, marketStartsAt, marketEndsAt] = await market.get_market_data();

    // console.log({
    //   blockTimestamp: moment.unix(blockTimestamp).format(),
    //   startsAt: moment.unix(startsAt).format(),
    //   currentBlockTimestamp: moment
    //     .unix(currentBlockTimestamp.toNumber())
    //     .format(),
    //   marketStartsAt: moment.unix(marketStartsAt.toNumber()).format(),
    //   marketEndsAt: moment.unix(marketEndsAt.toNumber()).format(),
    // });

    const prompt = "Sample Prompt";

    const amount = BigNumber.from(120_000);

    const playerId = ethers.Wallet.createRandom();

    await network.provider.send("evm_setNextBlockTimestamp", [
      moment.unix(marketEndsAt.toNumber()).add(1, "minute").unix(),
    ]);

    await expect(
      market.register_player(amount, playerId.address, prompt)
    ).to.be.revertedWith("ERR_EVENT_ENDED");
  });

  it("register_player: error on assertPrice modifier", async () => {
    const market = await createMarketContract();

    const [price] = await market.get_fees_data();

    const prompt = "Sample Prompt";

    const amount = BigNumber.from(price.toNumber() - 1000);

    const playerId = ethers.Wallet.createRandom();

    await expect(
      market.register_player(amount, playerId.address, prompt)
    ).to.be.revertedWith("ERR_ASSERT_PRICE_INSUFFICIENT_AMOUNT");
  });

  it("register_player: should create token and emit RegisterPlayer event", async () => {
    const market = await createMarketContract();

    const prompt = "Sample Prompt";

    const amount = BigNumber.from(120_000);
    const [amountMintable, fee] = await market.get_amount_mintable(amount);

    const collateralTokenBalance = amount;
    const collateralTokenFeeBalance = fee;

    // console.log({ amountMintable, fee });

    const playerId = ethers.Wallet.createRandom();

    await expect(market.register_player(amount, playerId.address, prompt))
      .to.emit(market, "RegisterPlayer")
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
    expect(player.balance).to.equal(amountMintable);

    const collateralTokenData = await market.get_collateral_token_data();

    expect(collateralTokenData.balance.toString()).to.equal(amount.toString());
    expect(collateralTokenData.feeBalance.toString()).to.equal(fee.toString());

    const playersCount = await market.get_players_count();
    expect(playersCount).to.equal(1);
  });

  it("reveal: error on onlyOwner modifier", async () => {
    const market = await createMarketContract();

    const result = "Sample Result";
    const outputImgUri = "outputImgUri";

    const nonOwner = ethers.Wallet.createRandom();

    const playerId = ethers.Wallet.createRandom();

    try {
      await market.connect(nonOwner);
      market.reveal(playerId.address, result, outputImgUri);
    } catch (error) {
      expect((error as Error).message).to.match(/code=UNSUPPORTED_OPERATION?/);
    }
  });

  it("reveal: error on assertIsRevealWindowOpen modifier", async () => {
    const blockTimestamp = await getBlockTimestamp();
    const startsAt = moment.unix(blockTimestamp).add(5, "minute").unix();

    const market = await createMarketContract({ market: { startsAt } });

    const [, revealWindow] = await market.get_resolution_data();

    const prompt = "Sample Prompt";

    const amount = BigNumber.from(120_000);

    const playerId = ethers.Wallet.createRandom();

    await market.register_player(amount, playerId.address, prompt);

    await network.provider.send("evm_setNextBlockTimestamp", [
      moment.unix(revealWindow.toNumber()).add(1, "minute").unix(),
    ]);

    const result = "Sample Result";
    const outputImgUri = "outputImgUri";

    await expect(
      market.reveal(playerId.address, result, outputImgUri)
    ).to.be.revertedWith("ERR_REVEAL_WINDOW_EXPIRED");
  });

  it("reveal: error on assertIsPlayerRegistered modifier", async () => {
    const blockTimestamp = await getBlockTimestamp();
    const startsAt = moment.unix(blockTimestamp).add(5, "minute").unix();

    const market = await createMarketContract({ market: { startsAt } });

    const playerId = ethers.Wallet.createRandom();

    const result = "Sample Result";
    const outputImgUri = "outputImgUri";

    await expect(
      market.reveal(playerId.address, result, outputImgUri)
    ).to.be.revertedWith("ERR_PLAYER_IS_NOT_REGISTERED");
  });

  it("reveal: should emit RevealPlayerResult event", async () => {
    const blockTimestamp = await getBlockTimestamp();
    const startsAt = moment.unix(blockTimestamp).add(5, "minute").unix();

    const market = await createMarketContract({ market: { startsAt } });

    const prompt = "Sample Prompt";

    const amount = BigNumber.from(120_000);

    const playerId = ethers.Wallet.createRandom();

    await market.register_player(amount, playerId.address, prompt);

    const result = "Sample Result";
    const outputImgUri = "outputImgUri";

    await expect(market.reveal(playerId.address, result, outputImgUri))
      .to.emit(market, "RevealPlayerResult")
      .withArgs(playerId.address, result, outputImgUri);

    const [id, playerPrompt, playerOutputImgUri, playerResult, playerBalance] =
      await market.get_player(playerId.address);

    const [amountMintable] = await market.get_amount_mintable(amount);

    expect(id).to.equal(playerId.address);
    expect(playerPrompt).to.equal(prompt);
    expect(playerOutputImgUri).to.equal(outputImgUri);
    expect(playerResult).to.equal(result);
    expect(playerBalance.toString()).to.equal(amountMintable.toString());
  });

  it("resolve: error on onlyOwner modifier", async () => {
    const market = await createMarketContract();

    const nonOwner = ethers.Wallet.createRandom();

    const playerId = ethers.Wallet.createRandom();

    try {
      await market.connect(nonOwner);
      market.resolve(playerId.address);
    } catch (error) {
      expect((error as Error).message).to.match(/code=UNSUPPORTED_OPERATION?/);
    }
  });

  it("resolve: error on assertEnoughParticipants modifier", async () => {
    const market = await createMarketContract();

    const playerId = ethers.Wallet.createRandom();

    await expect(market.resolve(playerId.address)).to.be.revertedWith(
      "ERR_RESOLVE_0_PARTICIPANTS"
    );
  });

  it("resolve: error on assertIsResolutionWindowOpen modifier", async () => {
    const market = await createMarketContract();

    const prompt = "Sample Prompt";

    const amount = BigNumber.from(120_000);

    const playerId = ethers.Wallet.createRandom();

    await market.register_player(amount, playerId.address, prompt);

    const [resolutionWindow] = await market.get_resolution_data();

    await network.provider.send("evm_setNextBlockTimestamp", [
      moment.unix(resolutionWindow.toNumber()).add(1, "minute").unix(),
    ]);

    await expect(market.resolve(playerId.address)).to.be.revertedWith(
      "ERR_RESOLUTION_WINDOW_EXPIRED"
    );
  });

  it("resolve: error on assertIsNotResolved modifier", async () => {
    const market = await createMarketContract();

    const prompt = "Sample Prompt";

    const amount = BigNumber.from(120_000);

    const playerId = ethers.Wallet.createRandom();

    await market.register_player(amount, playerId.address, prompt);
    await market.resolve(playerId.address);

    const [, revealWindow] = await market.get_resolution_data();

    await network.provider.send("evm_setNextBlockTimestamp", [
      moment.unix(revealWindow.toNumber()).add(1, "minute").unix(),
    ]);

    await expect(market.resolve(playerId.address)).to.be.revertedWith(
      "ERR_EVENT_IS_RESOLVED"
    );
  });

  it("resolve: error on assertIsPlayerRegistered modifier", async () => {
    const market = await createMarketContract();

    const prompt = "Sample Prompt";

    const amount = BigNumber.from(120_000);

    const playerId = ethers.Wallet.createRandom();

    await market.register_player(amount, playerId.address, prompt);

    const unregisteredPlayer = ethers.Wallet.createRandom();

    const [, revealWindow] = await market.get_resolution_data();

    await network.provider.send("evm_setNextBlockTimestamp", [
      moment.unix(revealWindow.toNumber()).add(1, "minute").unix(),
    ]);

    await expect(market.resolve(unregisteredPlayer.address)).to.be.revertedWith(
      "ERR_PLAYER_IS_NOT_REGISTERED"
    );
  });

  it("resolve: emit ResolutionSuccess event", async () => {
    const market = await createMarketContract();

    const prompt = "Sample Prompt";

    const amount = BigNumber.from(120_000);

    const playerId = ethers.Wallet.createRandom();

    await market.register_player(amount, playerId.address, prompt);

    const [resolutionWindow, revealWindow] = await market.get_resolution_data();

    await network.provider.send("evm_setNextBlockTimestamp", [
      moment.unix(revealWindow.toNumber()).subtract(1, "minute").unix(),
    ]);

    const result = "Sample Result";
    const outputImgUri = "outputImgUri";

    await market.reveal(playerId.address, result, outputImgUri);

    await network.provider.send("evm_setNextBlockTimestamp", [
      moment.unix(resolutionWindow.toNumber()).subtract(1, "minute").unix(),
    ]);

    await expect(market.resolve(playerId.address))
      .to.emit(market, "ResolutionSuccess")
      .withArgs(playerId.address, result, outputImgUri);
  });
});
