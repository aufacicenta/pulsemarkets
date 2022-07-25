import { Contract, WalletConnection } from "near-api-js";
import * as nearAPI from "near-api-js";
import { BN } from "bn.js";

import { DEFAULT_NETWORK_ENV } from "../../getConfig";
import near from "providers/near";

import { DeployMarketContractArgs, MarketContractMethods, MarketFactoryContractValues } from "./market-factory.types";
import { CHANGE_METHODS, VIEW_METHODS } from "./constants";

export class MarketFactoryContract {
  values: MarketFactoryContractValues | undefined;

  contract: Contract & MarketContractMethods;

  contractAddress: string;

  constructor(contract: Contract & MarketContractMethods) {
    this.contract = contract;
    this.contractAddress = contract.contractId;
  }

  static getDefaultContractValues = (): MarketFactoryContractValues => ({
    marketsCount: 0,
  });

  static async createMarket(connection: WalletConnection, args: DeployMarketContractArgs) {
    try {
      const contractAddress = near.getConfig(DEFAULT_NETWORK_ENV).marketFactoryAccountId;
      const contract = await MarketFactoryContract.loadFromWalletConnection(connection, contractAddress);

      const base64args = Buffer.from(JSON.stringify(args)).toString("base64");

      const attachedDeposit = new BN(near.parseNearAmount(Number(args.market.options.length + 1.5).toString())!);

      await contract.create_market(
        { args: base64args },
        new BN("60000000000000").toNumber(),
        attachedDeposit.toString(),
      );

      return contract;
    } catch (error) {
      console.log(error);
    }

    return null;
  }

  static async loadFromGuestConnection() {
    const connection = await nearAPI.connect({
      keyStore: new nearAPI.keyStores.InMemoryKeyStore(),
      headers: {},
      ...near.getConfig(DEFAULT_NETWORK_ENV),
    });

    const account = await connection.account(near.getConfig(DEFAULT_NETWORK_ENV).guestWalletId);
    const contractMethods = { viewMethods: VIEW_METHODS, changeMethods: CHANGE_METHODS };
    const contractAddress = near.getConfig(DEFAULT_NETWORK_ENV).marketFactoryAccountId;

    const contract = near.initContract<MarketContractMethods>(account, contractAddress, contractMethods);

    return new MarketFactoryContract(contract);
  }

  static async loadFromWalletConnection(connection: WalletConnection, contractAddress: string) {
    const account = await connection.account();
    const contractMethods = { viewMethods: VIEW_METHODS, changeMethods: CHANGE_METHODS };

    return near.initContract<MarketContractMethods>(account, contractAddress, contractMethods);
  }

  async getMarketsList() {
    try {
      const result = await this.contract.get_markets_list();

      return result;
    } catch (error) {
      console.log(error);
    }

    return null;
  }
}
