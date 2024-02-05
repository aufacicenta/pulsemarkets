import { ReactNode } from "react";
import { Signer, ethers } from "ethers";

import { Market } from "providers/evm/contracts/prompt-wars";

type AccountId = string;
export type zeroXaddress = `0x${string}`;
export type Player = Pick<Market.PlayerStructOutput, "id" | "balance" | "result" | "prompt" | "outputImgUri">;

export type PromptWarsMarketContractContextControllerProps = {
  marketId: AccountId;
  children: ReactNode;
};

export type PromptWarsMarketContractValues = {
  market: Market.MarketDataStruct;
  resolution: Market.ResolutionStruct;
  fees: Market.FeesStruct;
  management: Market.ManagementStruct;
  collateralToken: Market.CollateralTokenStruct;
  isResolved: boolean;
  isRevealWindowExpired: boolean;
  isResolutionWindowExpired: boolean;
  isExpiredUnresolved: boolean;
  isBeforeMarketEnds: boolean;
  playersCount: number;
  status: PromptWarsMarketContractStatus;
  currentPlayer?: Player;
};

export enum PromptWarsMarketContractStatus {
  LOADING = "Loading",
  OPEN = "Open",
  REVEALING = "Revealing",
  RESOLVING = "Resolving",
  RESOLVED = "Resolved",
  UNRESOLVED = "Unresolved",
  CLOSED = "Closed",
}

export type PromptWarsMarketContractContextContextActions = {
  fetchMarketContractValues: { isLoading: boolean };
  ftTransferCall: {
    isLoading: boolean;
    success: boolean;
  };
  create: {
    isLoading: boolean;
  };
};

export type PromptWarsMarketContractContextType = {
  deploy: (
    signer: Signer,
    market: Market.MarketDataStruct,
    management: Market.ManagementStruct,
    collateralToken: Market.CollateralTokenStruct,
  ) => Promise<Market>;

  connect: (address: string, provider: ethers.Signer | ethers.Provider) => Promise<Market>;

  fetchMarketContractValues: () => Promise<void>;
  sell: () => Promise<void>;
  ftTransferCall: (prompt: string) => Promise<void>;
  create: () => Promise<void>;
  getPlayer: (playerId?: zeroXaddress) => Promise<Player | undefined>;

  actions: PromptWarsMarketContractContextContextActions;
  marketId: AccountId;
  marketContractValues?: PromptWarsMarketContractValues;
};
