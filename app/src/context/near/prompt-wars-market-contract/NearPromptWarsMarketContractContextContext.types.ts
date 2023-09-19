import { ReactNode } from "react";

import {
  AccountId,
  GetOutcomeTokenArgs,
  OutcomeToken,
  Prompt,
  PromptWarsMarketContractValues,
} from "providers/near/contracts/prompt-wars/prompt-wars.types";

export type NearPromptWarsMarketContractContextControllerProps = {
  marketId: AccountId;
  preventLoad?: boolean;
  children: ReactNode;
};

export type NearPromptWarsMarketContractContextContextType = {
  fetchMarketContractValues: () => Promise<void>;
  ftTransferCall: (prompt: Prompt) => Promise<void>;
  sell: () => Promise<void>;
  create: () => Promise<void>;
  getOutcomeToken: (args: GetOutcomeTokenArgs) => Promise<OutcomeToken | undefined>;
  marketId: AccountId;
  marketContractValues?: PromptWarsMarketContractValues;
  actions: NearPromptWarsMarketContractContextContextActions;
};

export type NearPromptWarsMarketContractContextContextActions = {
  fetchMarketContractValues: { isLoading: boolean };
  ftTransferCall: {
    isLoading: boolean;
    success: boolean;
  };
  create: {
    isLoading: boolean;
  };
};
