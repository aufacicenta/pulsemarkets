import { ReactNode } from "react";

import { MarketContractValues } from "providers/near/contracts/market/market.types";

export type PriceMarketProps = {
  marketContractValues: MarketContractValues;
  marketId: string;
  children?: ReactNode;
  className?: string;
};