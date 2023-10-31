import { expect } from "chai";
import { ethers } from "hardhat";

describe("Market", function () {
  it("Initialize: call constructor", async function () {
    const Market = await ethers.getContractFactory("Market");

    const _market = { imageUri: "", startsAt: 0, endsAt: 0 };

    const _management = {
      daoAccountId: "dao_account.eth",
      marketCreatorAccountId: "creator.eth",
      selfDestructWindow: 0,
      buySellThreshold: 0,
    };

    const _collateralToken = {
      id: "usdt.eth",
      balance: 0,
      decimals: 0,
      feeBalance: 0,
    };

    const market = await Market.deploy(_market, _management, _collateralToken);
    await market.deployed();

    // expect(await market.greet()).to.equal("Hello, world!");

    // const setGreetingTx = await market.setGreeting("Hola, mundo!");

    // // wait until the transaction is mined
    // await setGreetingTx.wait();

    // expect(await market.greet()).to.equal("Hola, mundo!");
  });
});
