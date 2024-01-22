import { ReactNode } from "react";

import { PromptWarsMarketContractValues } from "context/evm/prompt-wars-market-contract/PromptWarsMarketContractContext.types";

export type PromptInputCardProps = {
  onSubmit: (prompt: string) => void;
  onClickFAQsButton: () => void;
  marketContractValues: PromptWarsMarketContractValues;
  children?: ReactNode;
  className?: string;
};
