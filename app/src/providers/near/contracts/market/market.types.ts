import { Gas } from "providers/near/types";

export type OutcomeId = number;
export type WrappedBalance = number;
export type AccountId = string;
export type Timestamp = number;

export type MarketData = {
  description: string;
  info: string;
  category: string;
  options: Array<string>;
  starts_at: Timestamp;
  ends_at: Timestamp;
  utc_offset: number;
};

export type CollateralTokenMetadata = {
  id: string;
  balance: number;
};

export type PriceHistory = {
  timestamp: Timestamp;
  price: WrappedBalance;
};

export type OutcomeToken = {
  accounts_length: number;
  total_supply: WrappedBalance;
  outcome_id: OutcomeId;
  price: WrappedBalance;
  price_history: Array<PriceHistory>;
};

export type MarketContractValues = {
  market: MarketData;
  resolutionWindow: Timestamp;
  isPublished: boolean;
  isOver: boolean;
  isResolutionWindowExpired: boolean;
  isResolved: boolean;
  collateralTokenMetadata: CollateralTokenMetadata;
  feeRatio: number;
  outcomeTokens?: Array<OutcomeToken>;
};

export type GetOutcomeTokenArgs = { outcome_id: OutcomeId };
export type BalanceOfArgs = { outcome_id: OutcomeId; account_id: AccountId };
export type GetAmountMintableArgs = { outcome_id: OutcomeId; amount: WrappedBalance };
export type SellArgs = { outcome_id: OutcomeId; amount: WrappedBalance };
export type GetAmountPayableArgs = { outcome_id: OutcomeId; amount: WrappedBalance; balance: WrappedBalance };

export type MarketContractMethods = {
  get_market_data: () => Promise<MarketData>;
  get_collateral_token_metadata: () => Promise<CollateralTokenMetadata>;
  dao_account_id: () => Promise<AccountId>;
  published_at: () => Promise<Timestamp>;
  resolution_window: () => Promise<Timestamp>;
  resolved_at: () => Promise<Timestamp>;
  is_published: () => Promise<boolean>;
  is_resolved: () => Promise<boolean>;
  is_open: () => Promise<boolean>;
  is_over: () => Promise<boolean>;
  is_resolution_window_expired: () => Promise<boolean>;
  balance_of: (args: BalanceOfArgs) => Promise<WrappedBalance>;
  get_outcome_token: (args: GetOutcomeTokenArgs) => Promise<OutcomeToken>;
  get_fee_ratio: () => Promise<WrappedBalance>;
  get_price_ratio: (args: { outcome_id: OutcomeId }) => Promise<WrappedBalance>;
  get_balance_boost_ratio: () => Promise<WrappedBalance>;
  publish: (args: Record<string, unknown>, gas?: Gas) => Promise<void>;
  sell: (args: SellArgs, gas?: Gas) => Promise<void>;
  get_cumulative_weight: () => Promise<WrappedBalance>;
  get_amount_mintable: (args: GetAmountMintableArgs) => Promise<Array<number>>;
  get_amount_payable: (args: GetAmountPayableArgs) => Promise<Array<number>>;
};
