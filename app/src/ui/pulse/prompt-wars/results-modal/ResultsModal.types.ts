import { ReactNode } from "react";

import { OutcomeId } from "providers/near/contracts/prompt-wars/prompt-wars.types";
import { PromptWarsMarketContractValues } from "context/evm/prompt-wars-market-contract/PromptWarsMarketContractContext.types";

export type ResultsModalProps = {
  onClose: () => void;
  marketContractValues: PromptWarsMarketContractValues;
  children?: ReactNode;
  className?: string;
};

export type ResultsModalOutcomeToken = {
  outcomeId: OutcomeId;
  outputImgUrl: string;
  prompt: string;
  negativePrompt: string;
  result: number;
};
