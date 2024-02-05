import { ReactNode } from "react";

import { PromptWarsMarketContractValues } from "context/evm/prompt-wars-market-contract/PromptWarsMarketContractContext.types";

export type ImgPromptCardProps = {
  onClickCreateNewGame: () => void;
  onClaimDepositUnresolved: () => void;
  marketContractValues: PromptWarsMarketContractValues;
  marketId: string;
  currentResultElement?: ReactNode;
  datesElement?: ReactNode;
  children?: ReactNode;
  className?: string;
};
