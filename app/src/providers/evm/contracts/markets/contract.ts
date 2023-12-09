import { ethers, BrowserProvider, JsonRpcSigner } from "ethers";
import { type WalletClient, getWalletClient } from "@wagmi/core";

import MaketABI from "../../../../../../solidity/promptwars/artifacts/contracts/Market.sol/Market.json";

type Timestamp = number;
type WrappedBalance = number;

type MarketData = {
  imageUri: string;
  startsAt: Timestamp;
  endsAt: Timestamp;
};

type Player = {
  id: string;
  prompt: string;
  outputImgUri: string;
  result: string;
  balance: number;
};

type CollateralToken = {
  id: string;
  balance: WrappedBalance;
  decimals: number;
  feeBalance: number;
};

type Resolution = {
  window: number;
  revealWindow: number;
  resolvedAt: Timestamp;
  playerId: string;
};

type Management = {
  daoAccountId: string;
  marketCreatorAccountId: string;
  selfDestructWindow: Timestamp;
  buySellThreshold: WrappedBalance;
};

type Fees = {
  price: WrappedBalance;
  feeRatio: WrappedBalance;
  claimedAt: Timestamp;
};

export function walletClientToSigner(walletClient: WalletClient) {
  const { account, chain, transport } = walletClient;
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  };
  const provider = new BrowserProvider(transport, network);
  const signer = new JsonRpcSigner(provider, account.address);

  return signer;
}

/** Action to convert a viem Wallet Client to an ethers.js Signer. */
export async function getEthersSigner({ chainId }: { chainId?: number } = {}) {
  const walletClient = await getWalletClient({ chainId });

  if (!walletClient) return undefined;

  return walletClientToSigner(walletClient);
}

type PromptWarsMarketContractMethods = {
  get_market_data: () => Promise<MarketData>;
  get_resolution_data: () => Promise<Resolution>;
  get_fee_data: () => Promise<Fees>;
  get_management_data: () => Promise<Management>;
  get_collateral_token_metadata: () => Promise<CollateralToken>;
  get_block_timestamp: () => Promise<ethers.BigNumberish>;
  resolved_at: () => Promise<Timestamp>;
  get_amount_mintable: (amount: WrappedBalance) => Promise<[WrappedBalance, WrappedBalance]>;
  get_amount_payable_unresolved: () => Promise<Array<WrappedBalance>>;
  get_amount_payable_resolved: () => Promise<Array<WrappedBalance>>;
  get_precision_decimals: () => Promise<WrappedBalance>;
  // flags
  is_resolved: () => Promise<boolean>;
  is_open: () => Promise<boolean>;
  is_over: () => Promise<boolean>;
  is_reveal_window_expired: () => Promise<boolean>;
  is_resolution_window_expired: () => Promise<boolean>;
  is_self_destruct_window_expired: () => Promise<boolean>;
  is_expired_unresolved: () => Promise<boolean>;
  // mutators
  sell: () => Promise<number>;
  reveal: (playerId: string, result: string, outputImgUri: string) => Promise<void>;
  resolve: (playerId: string) => Promise<boolean>;
};

class MarketContract {
  private contract: ethers.Contract & PromptWarsMarketContractMethods;

  private contractAddress: string;

  constructor(provider: ethers.Provider, address: string) {
    this.contract = new ethers.Contract(address, MaketABI.abi, provider) as ethers.Contract &
      PromptWarsMarketContractMethods;
    this.contractAddress = address;
  }

  async getMarketData(): Promise<MarketData> {
    try {
      const marketData = await this.contract.get_market_data();

      return marketData;
    } catch (error) {
      console.error("Error fetching market data:", error);
      throw error;
    }
  }

  async getResolutionData(): Promise<Resolution> {
    try {
      const resolutionData = await this.contract.get_resolution_data();

      return resolutionData;
    } catch (error) {
      console.error("Error fetching Resolution Date:", error);
      throw error;
    }
  }

  async getFeesData(): Promise<Fees> {
    try {
      const feesData = await this.contract.get_fees_data();

      return feesData as Fees;
    } catch (error) {
      console.error("Error while fetching fees data:", error);
      throw error;
    }
  }

  async getManagementData(): Promise<Management> {
    try {
      const managementData = await this.contract.get_management_data();

      return managementData as Management;
    } catch (error) {
      console.error("Error while fetching management data:", error);
      throw error;
    }
  }

  async getCollateralTokenData(): Promise<CollateralToken> {
    try {
      const collateralTokenData = await this.contract.get_collateral_token_data();

      return collateralTokenData as CollateralToken;
    } catch (error) {
      console.error("Error while fetching collateral token data:", error);
      throw error;
    }
  }

  async getBlockTimestamp(): Promise<ethers.BigNumberish> {
    try {
      const timestamp = await this.contract.get_block_timestamp();

      return timestamp;
    } catch (error) {
      console.error("Error while fetching block timestamp:", error);
      throw error;
    }
  }

  // TODO
  // async sell(): Promise<number> {
  //   try {
  //     const signer = await getEthersSigner();

  //     const sellAmount = 1;

  //     return sellAmount;
  //   } catch (error) {
  //     console.error("Error while selling:", error);
  //     throw error;
  //   }
  // }

  async reveal(playerId: string, result: string, outputImgUri: string): Promise<void> {
    try {
      await this.contract.reveal(playerId, result, outputImgUri);
    } catch (error) {
      console.error("Error while revealing:", error);
      throw error;
    }
  }

  // TODO
  // async resolve(playerId: string): Promise<void> {
  //   try {
  //     await this.contract.resolve(playerId);
  //   } catch (error) {
  //     console.error("Error while resolving:", error);
  //     throw error;
  //   }
  // }

  async register(prompt: string): Promise<void> {
    try {
      await this.contract.register(prompt);
    } catch (error) {
      console.error("Error in registering player:", error);
      throw error;
    }
  }

  async getPlayer(playerId: string): Promise<Player> {
    try {
      const player = await this.contract.get_player(playerId);

      return player as Player;
    } catch (error) {
      console.error("Error while fetching player data:", error);
      throw error;
    }
  }

  async getAmountMintable(amount: number): Promise<[number, number]> {
    try {
      const result = await this.contract.get_amount_mintable(amount);

      return [result[0], result[1]];
    } catch (error) {
      console.error("Error while fetching mintable amount:", error);
      throw error;
    }
  }

  async getPlayersCount(): Promise<number> {
    try {
      const count = await this.contract.get_players_count();

      return count.toNumber();
    } catch (error) {
      console.error("Error while fetching players count:", error);
      throw error;
    }
  }
}

export default MarketContract;
