import { ReactNode } from "react";

import { AccountId } from "providers/near/contracts/market/market.types";

export type PromptWarsProps = {
  marketId: AccountId;
  children?: ReactNode;
  className?: string;
};

export type PromptWarsContainerProps = {
  marketId: AccountId;
};
