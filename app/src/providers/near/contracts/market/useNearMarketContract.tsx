import { useEffect, useState } from "react";

import { useToastContext } from "hooks/useToastContext/useToastContext";
import { Typography } from "ui/typography/Typography";
import { useWalletStateContext } from "hooks/useWalletStateContext/useWalletStateContext";

import { MarketContract } from ".";
import {
  AccountId,
  BalanceOfArgs,
  GetAmountMintableArgs,
  GetAmountPayableArgs,
  MarketContractValues,
  OutcomeToken,
  SellArgs,
} from "./market.types";

export default ({ marketId, preventLoad = false }: { marketId: AccountId; preventLoad?: boolean }) => {
  const [marketContractValues, setMarketContractValues] = useState<MarketContractValues>();

  const toast = useToastContext();
  const wallet = useWalletStateContext();

  const fetchMarketContractValues = async () => {
    try {
      const contract = await MarketContract.loadFromGuestConnection(marketId);
      const market = await contract.getMarketData();
      const resolutionWindow = await contract.getResolutionWindow();
      const isPublished = await contract.isPublished();
      const isOver = await contract.isOver();
      const isResolutionWindowExpired = await contract.isResolutionWindowExpired();
      const isResolved = await contract.isResolved();
      const collateralTokenMetadata = await contract.getCollateralTokenMetadata();
      const feeRatio = await contract.getFeeRatio();

      if (!market || !resolutionWindow || !collateralTokenMetadata || !feeRatio) {
        throw new Error("Failed to fetch market data");
      }

      const outcomeTokens = !isPublished
        ? []
        : (
            await Promise.all(
              market.options.map((_option, outcomeId) => contract.getOutcomeToken({ outcome_id: outcomeId })),
            )
          ).filter(Boolean);

      if (isPublished && !outcomeTokens) {
        throw new Error("Failed to fetch outcome tokens data");
      }

      setMarketContractValues({
        market,
        resolutionWindow,
        isPublished,
        isOver,
        isResolved,
        isResolutionWindowExpired,
        collateralTokenMetadata,
        outcomeTokens: outcomeTokens as Array<OutcomeToken>,
        feeRatio,
      });
    } catch {
      toast.trigger({
        variant: "error",
        withTimeout: true,
        // @TODO i18n
        title: "Failed to fetch market data",
        children: <Typography.Text>Try refreshing the page, or check your internet connection.</Typography.Text>,
      });
    }
  };

  useEffect(() => {
    if (!preventLoad) {
      fetchMarketContractValues();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [marketId, preventLoad]);

  const assertWalletConnection = () => {
    if (!wallet.isConnected.get()) {
      toast.trigger({
        variant: "info",
        withTimeout: true,
        // @TODO i18n
        title: "Wallet is not connected",
        children: <Typography.Text>Check your internet connection, your NEAR balance and try again.</Typography.Text>,
      });

      throw new Error("ERR_USE_NEAR_MARKET_CONTRACT_INVALID_WALLET_CONNECTION");
    }
  };

  const onClickPublishMarket = async () => {
    // @TODO check if wallet is connected or display wallet connect modal
    try {
      assertWalletConnection();

      const [contract] = await MarketContract.loadFromWalletConnection(wallet.context.get().connection!, marketId);
      const result = await contract.publish({ marketOptionsLength: marketContractValues!.market.options.length });

      return result;
    } catch {
      toast.trigger({
        variant: "error",
        withTimeout: true,
        // @TODO i18n
        title: "Failed to publish market",
        children: <Typography.Text>Check your internet connection, your NEAR balance and try again.</Typography.Text>,
      });

      return false;
    }
  };

  const getBalanceOf = async ({ outcome_id }: Omit<BalanceOfArgs, "account_id">) => {
    // @TODO check if wallet is connected or display wallet connect modal
    try {
      assertWalletConnection();

      const [contract] = await MarketContract.loadFromWalletConnection(wallet.context.get().connection!, marketId);
      const balance = await contract.balanceOf({ outcome_id, account_id: wallet.address.get()! });

      return balance;
    } catch {
      return 0;
    }
  };

  const getAmountMintable = async (args: GetAmountMintableArgs) => {
    try {
      assertWalletConnection();

      const [contract] = await MarketContract.loadFromWalletConnection(wallet.context.get().connection!, marketId);
      const balance = await contract.getAmountMintable(args);

      return balance;
    } catch {
      toast.trigger({
        variant: "error",
        withTimeout: true,
        // @TODO i18n
        title: "Failed to fetch amount mintable",
        children: (
          <Typography.Text>Check your internet connection, your NEAR wallet connection and try again.</Typography.Text>
        ),
      });
    }

    return [0, 0, 0, 0, 0];
  };

  const getAmountPayable = async (args: GetAmountPayableArgs) => {
    try {
      assertWalletConnection();

      const [contract] = await MarketContract.loadFromWalletConnection(wallet.context.get().connection!, marketId);
      const balance = await contract.getAmountPayable(args);

      return balance;
    } catch {
      toast.trigger({
        variant: "error",
        withTimeout: true,
        // @TODO i18n
        title: "Failed to fetch amount payable",
        children: (
          <Typography.Text>Check your internet connection, your NEAR wallet connection and try again.</Typography.Text>
        ),
      });
    }

    return [0, 0];
  };

  const sell = async (args: SellArgs) => {
    try {
      assertWalletConnection();

      const [contract] = await MarketContract.loadFromWalletConnection(wallet.context.get().connection!, marketId);
      await contract.sell(args);
    } catch {
      toast.trigger({
        variant: "error",
        withTimeout: true,
        // @TODO i18n
        title: "Failed to call sell method",
        children: (
          <Typography.Text>Check your internet connection, your NEAR wallet connection and try again.</Typography.Text>
        ),
      });
    }
  };

  return {
    contract: MarketContract,
    marketContractValues,
    onClickPublishMarket,
    fetchMarketContractValues,
    getBalanceOf,
    getAmountMintable,
    getAmountPayable,
    sell,
  };
};
