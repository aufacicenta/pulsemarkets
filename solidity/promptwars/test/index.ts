/* eslint-disable node/no-unsupported-features/es-syntax */
/* eslint-disable node/no-unsupported-features/es-builtins */
/* eslint-disable no-unused-expressions */
import { expect } from "chai";
import moment from "moment";
import { BigNumber, BigNumberish } from "ethers";
import { ethers, network } from "hardhat";
import { DummyERC20, Market } from "../typechain";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

const DAO_ACCOUNT_ID = "dao_account.eth";
const MARKET_CREATOR_ACCOUNT_ID = "creator.eth";
const COLLATERAL_TOKEN_ACCOUNT_ID =
  "0x5FbDB2315678afecb367f032d93F642f64180aa3";

async function approveCollateralTokenSpending(
  collateralToken: DummyERC20,
  owner: SignerWithAddress,
  spender: string,
  amount: BigNumberish
) {
  const [, , collateralTokenOwner] = await ethers.getSigners();

  await collateralToken
    .connect(collateralTokenOwner)
    .transfer(owner.address, amount);

  return await collateralToken.connect(owner).approve(spender, amount);
}

async function getEntryAmount(market: Market) {
  const [price] = await market.get_fees_data();

  const amount = BigNumber.from(price);

  return amount;
}

async function getBlockTimestamp() {
  const blockNumBefore = await ethers.provider.getBlockNumber();
  const blockBefore = await ethers.provider.getBlock(blockNumBefore);
  const blockTimestamp = blockBefore.timestamp;

  return blockTimestamp;
}

async function createMarketContracts(marketOverrides?: Record<string, any>) {
  const collateralToken = await createERC20Contract();

  const market = await createMarketContract({
    collateralToken: { id: collateralToken.address },
    ...marketOverrides,
  });

  return { market, collateralToken };
}

async function createERC20Contract() {
  const [, , collateralTokenOwner] = await ethers.getSigners();

  const Token = await ethers.getContractFactory("DummyERC20");

  const token = await Token.connect(collateralTokenOwner).deploy(
    "name",
    "DUMMY"
  );

  return token.deployed();
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
    id: overrides?.collateralToken?.id || COLLATERAL_TOKEN_ACCOUNT_ID,
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

    const [resolutionWindow, revealWindow, resolvedAt, player] = resolutionData;

    expect(resolutionWindow.toString()).to.not.be.null;
    expect(revealWindow.toString()).to.not.be.null;
    expect(resolvedAt.toString()).to.equal("0");
    expect(player.toString()).to.equal(
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
    const { market, collateralToken } = await createMarketContracts();

    const amount = await getEntryAmount(market);

    const [, player] = await ethers.getSigners();

    await approveCollateralTokenSpending(
      collateralToken,
      player,
      market.address,
      amount.toNumber() * 2
    );

    const prompt = "Sample Prompt";

    await market.register_player(player.address, prompt);

    await expect(
      market.register_player(player.address, prompt)
    ).to.be.revertedWith("ERR_PLAYER_EXISTS");
  });

  it("register_player: error on onlyOwner modifier", async () => {
    const owner = await ethers.getSigner(network.config.from!);
    const nonOwner = ethers.Wallet.createRandom();

    const { market, collateralToken } = await createMarketContracts();

    expect(await market.owner()).to.equal(owner.address);

    const amount = await getEntryAmount(market);

    const [, player] = await ethers.getSigners();

    await approveCollateralTokenSpending(
      collateralToken,
      player,
      market.address,
      amount.toNumber()
    );

    const prompt = "Sample Prompt";

    try {
      await market.connect(nonOwner).register_player(nonOwner.address, prompt);
    } catch (error) {
      expect((error as Error).message).to.match(/code=UNSUPPORTED_OPERATION?/);
    }
  });

  it("register_player: error on assertBeforeEnd modifier", async () => {
    const blockTimestamp = await getBlockTimestamp();
    const startsAt = moment.unix(blockTimestamp).add(5, "minute").unix();

    const { market, collateralToken } = await createMarketContracts({
      market: { startsAt },
    });

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

    const amount = await getEntryAmount(market);

    const [, player] = await ethers.getSigners();

    await approveCollateralTokenSpending(
      collateralToken,
      player,
      market.address,
      amount
    );

    const prompt = "Sample Prompt";

    await network.provider.send("evm_setNextBlockTimestamp", [
      moment.unix(marketEndsAt.toNumber()).add(1, "minute").unix(),
    ]);

    await expect(
      market.register_player(player.address, prompt)
    ).to.be.revertedWith("ERR_EVENT_ENDED");
  });

  it("register_player: error on ERC20InsufficientAllowance", async () => {
    const { market, collateralToken } = await createMarketContracts();

    const amount = await getEntryAmount(market);

    const [, player] = await ethers.getSigners();

    await approveCollateralTokenSpending(
      collateralToken,
      player,
      market.address,
      amount.toNumber() - 1000
    );

    const prompt = "Sample Prompt";

    try {
      await market.register_player(player.address, prompt);
    } catch (error) {
      expect((error as Error).message).to.match(/ERC20InsufficientAllowance?/);
    }
  });

  it("register_player: should create token and emit RegisterPlayer event", async () => {
    const { market, collateralToken } = await createMarketContracts();

    const amount = await getEntryAmount(market);

    const [, player] = await ethers.getSigners();

    await approveCollateralTokenSpending(
      collateralToken,
      player,
      market.address,
      amount
    );

    const prompt = "Sample Prompt";

    const [amountMintable, fee] = await market.get_amount_mintable(amount);

    const collateralTokenBalance = amount;
    const collateralTokenFeeBalance = fee;

    // console.log({ amountMintable, fee });

    await expect(market.register_player(player.address, prompt))
      .to.emit(market, "RegisterPlayer")
      .withArgs(
        amount,
        player.address,
        amountMintable,
        fee,
        collateralTokenBalance,
        collateralTokenFeeBalance
      );

    const registeredPlayer = await market.get_player(player.address);

    expect(registeredPlayer.id).to.equal(player.address);
    expect(registeredPlayer.prompt).to.equal(prompt);
    expect(registeredPlayer.balance).to.equal(amountMintable);

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

    const [, player] = await ethers.getSigners();

    try {
      await market.connect(nonOwner);
      market.reveal(player.address, result, outputImgUri);
    } catch (error) {
      expect((error as Error).message).to.match(/code=UNSUPPORTED_OPERATION?/);
    }
  });

  it("reveal: error on assertIsRevealWindowOpen modifier", async () => {
    const blockTimestamp = await getBlockTimestamp();
    const startsAt = moment.unix(blockTimestamp).add(5, "minute").unix();

    const { market, collateralToken } = await createMarketContracts({
      market: { startsAt },
    });

    const amount = await getEntryAmount(market);

    const [, player] = await ethers.getSigners();

    await approveCollateralTokenSpending(
      collateralToken,
      player,
      market.address,
      amount
    );

    const prompt = "Sample Prompt";

    await market.register_player(player.address, prompt);

    const [, revealWindow] = await market.get_resolution_data();

    await network.provider.send("evm_setNextBlockTimestamp", [
      moment.unix(revealWindow.toNumber()).add(1, "minute").unix(),
    ]);

    const result = "Sample Result";
    const outputImgUri = "outputImgUri";

    await expect(
      market.reveal(player.address, result, outputImgUri)
    ).to.be.revertedWith("ERR_REVEAL_WINDOW_EXPIRED");
  });

  it("reveal: error on assertIsPlayerRegistered modifier", async () => {
    const blockTimestamp = await getBlockTimestamp();
    const startsAt = moment.unix(blockTimestamp).add(5, "minute").unix();

    const market = await createMarketContract({ market: { startsAt } });

    const [, player] = await ethers.getSigners();

    const result = "Sample Result";
    const outputImgUri = "outputImgUri";

    await expect(
      market.reveal(player.address, result, outputImgUri)
    ).to.be.revertedWith("ERR_PLAYER_IS_NOT_REGISTERED");
  });

  it("reveal: should emit RevealPlayerResult event", async () => {
    const blockTimestamp = await getBlockTimestamp();
    const startsAt = moment.unix(blockTimestamp).add(5, "minute").unix();

    const { market, collateralToken } = await createMarketContracts({
      market: { startsAt },
    });

    const amount = await getEntryAmount(market);

    const [, player] = await ethers.getSigners();

    await approveCollateralTokenSpending(
      collateralToken,
      player,
      market.address,
      amount
    );

    const prompt = "Sample Prompt";

    await market.register_player(player.address, prompt);

    const result = "Sample Result";
    const outputImgUri = "outputImgUri";

    await expect(market.reveal(player.address, result, outputImgUri))
      .to.emit(market, "RevealPlayerResult")
      .withArgs(player.address, result, outputImgUri);

    const [id, playerPrompt, playerOutputImgUri, playerResult, playerBalance] =
      await market.get_player(player.address);

    const [amountMintable] = await market.get_amount_mintable(amount);

    expect(id).to.equal(player.address);
    expect(playerPrompt).to.equal(prompt);
    expect(playerOutputImgUri).to.equal(outputImgUri);
    expect(playerResult).to.equal(result);
    expect(playerBalance.toString()).to.equal(amountMintable.toString());
  });

  it("resolve: error on onlyOwner modifier", async () => {
    const market = await createMarketContract();

    const nonOwner = ethers.Wallet.createRandom();

    const [, player] = await ethers.getSigners();

    try {
      await market.connect(nonOwner);
      market.resolve(player.address);
    } catch (error) {
      expect((error as Error).message).to.match(/code=UNSUPPORTED_OPERATION?/);
    }
  });

  it("resolve: error on assertEnoughParticipants modifier", async () => {
    const market = await createMarketContract();

    const [, player] = await ethers.getSigners();

    await expect(market.resolve(player.address)).to.be.revertedWith(
      "ERR_RESOLVE_0_PARTICIPANTS"
    );
  });

  it("resolve: error on assertIsResolutionWindowOpen modifier", async () => {
    const { market, collateralToken } = await createMarketContracts();

    const amount = await getEntryAmount(market);

    const [, player] = await ethers.getSigners();

    await approveCollateralTokenSpending(
      collateralToken,
      player,
      market.address,
      amount
    );

    const prompt = "Sample Prompt";

    await market.register_player(player.address, prompt);

    const [resolutionWindow] = await market.get_resolution_data();

    await network.provider.send("evm_setNextBlockTimestamp", [
      moment.unix(resolutionWindow.toNumber()).add(1, "minute").unix(),
    ]);

    await expect(market.resolve(player.address)).to.be.revertedWith(
      "ERR_RESOLUTION_WINDOW_EXPIRED"
    );
  });

  it("resolve: error on assertIsNotResolved modifier", async () => {
    const { market, collateralToken } = await createMarketContracts();

    const amount = await getEntryAmount(market);

    const [, player] = await ethers.getSigners();

    await approveCollateralTokenSpending(
      collateralToken,
      player,
      market.address,
      amount
    );

    const prompt = "Sample Prompt";

    await market.register_player(player.address, prompt);

    await market.resolve(player.address);

    const [, revealWindow] = await market.get_resolution_data();

    await network.provider.send("evm_setNextBlockTimestamp", [
      moment.unix(revealWindow.toNumber()).add(1, "minute").unix(),
    ]);

    await expect(market.resolve(player.address)).to.be.revertedWith(
      "ERR_EVENT_IS_RESOLVED"
    );
  });

  it("resolve: error on assertIsPlayerRegistered modifier", async () => {
    const { market, collateralToken } = await createMarketContracts();

    const amount = await getEntryAmount(market);

    const [, player] = await ethers.getSigners();

    await approveCollateralTokenSpending(
      collateralToken,
      player,
      market.address,
      amount
    );

    const prompt = "Sample Prompt";

    await market.register_player(player.address, prompt);

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
    const { market, collateralToken } = await createMarketContracts();

    const amount = await getEntryAmount(market);

    const [, player] = await ethers.getSigners();

    await approveCollateralTokenSpending(
      collateralToken,
      player,
      market.address,
      amount
    );

    const prompt = "Sample Prompt";

    await market.register_player(player.address, prompt);

    const [resolutionWindow, revealWindow] = await market.get_resolution_data();

    await network.provider.send("evm_setNextBlockTimestamp", [
      moment.unix(revealWindow.toNumber()).subtract(1, "minute").unix(),
    ]);

    const result = "Sample Result";
    const outputImgUri = "outputImgUri";

    await market.reveal(player.address, result, outputImgUri);

    await network.provider.send("evm_setNextBlockTimestamp", [
      moment.unix(resolutionWindow.toNumber()).subtract(1, "minute").unix(),
    ]);

    await expect(market.resolve(player.address))
      .to.emit(market, "ResolutionSuccess")
      .withArgs(player.address, result, outputImgUri);
  });

  it("sell: _is_expired_unresolved _internal_sell_unresolved", async () => {
    const [, player, collateralTokenOwner] = await ethers.getSigners();

    // const collateralTokenOwnerBalance = await collateralToken.balanceOf(
    //   collateralTokenOwner.address
    // );

    // console.log({ collateralTokenOwnerBalance });

    const { market, collateralToken } = await createMarketContracts();

    const [id] = await market.get_collateral_token_data();

    expect(id).to.equal(collateralToken.address);

    const [price] = await market.get_fees_data();

    await collateralToken
      .connect(collateralTokenOwner)
      .transfer(player.address, price);

    // const collateralTokenPlayerBalance = await collateralToken.balanceOf(
    //   player.address
    // );

    // const collateralTokenOwnerUpdatedBalance = await collateralToken.balanceOf(
    //   collateralTokenOwner.address
    // );

    // console.log({
    //   collateralTokenPlayerBalance,
    //   collateralTokenOwnerUpdatedBalance,
    // });

    const prompt = "Sample Prompt";

    // const amount = await getEntryAmount(market);

    await collateralToken.connect(player).approve(market.address, price);

    // collateralTokenPlayerBalance = await collateralToken.balanceOf(
    //   player.address
    // );

    const marketSpendingAllowance = await collateralToken.allowance(
      player.address,
      market.address
    );

    expect(marketSpendingAllowance).to.equal(price);

    await market.register_player(player.address, prompt);

    const collateralTokenPlayerBalance = await collateralToken.balanceOf(
      player.address
    );

    expect(collateralTokenPlayerBalance).to.equal(0);

    const [resolutionWindow] = await market.get_resolution_data();

    await network.provider.send("evm_setNextBlockTimestamp", [
      moment.unix(resolutionWindow.toNumber()).add(1, "minute").unix(),
    ]);

    const [amountMintable] = await market.get_amount_mintable(price);

    await expect(market.connect(player).sell())
      .to.emit(market, "InternalSellUnresolved")
      .withArgs(player.address, amountMintable);
  });
});
