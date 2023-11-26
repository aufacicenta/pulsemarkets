// TODO: do we need this file ?
import React, { useEffect, useState } from "react";
import { useAccount } from "wagmi";

import {
  BalanceOfArgs,
  GetAmountMintableArgs,
  GetAmountPayableArgs,
  MarketContractValues,
  OutcomeToken,
  SellArgs,
} from "providers/near/contracts/market/market.types";
import { useToastContext } from "hooks/useToastContext/useToastContext";
import { MarketContract } from "providers/near/contracts/market";
import { Typography } from "ui/typography/Typography";
import date from "providers/date";
import currency from "providers/currency";

import { NearMarketContractContext } from "./NearMarketContractContext";
import {
  NearMarketContractContextActions,
  NearMarketContractContextControllerProps,
} from "./NearMarketContractContext.types";

export const NearMarketContractContextController = ({
  children,
  marketId,
}: NearMarketContractContextControllerProps) => {
  const [outcomeTokensExtended, setOutcomeTokensExtended] = useState<OutcomeToken[]>();
  const [marketContractValues, setMarketContractValues] = useState<MarketContractValues>();
  const [selectedOutcomeToken, setSelectedOutcomeToken] = useState<OutcomeToken | undefined>(undefined);
  const [actions, setActions] = useState<NearMarketContractContextActions>({
    fetchMarketContractValues: {
      isLoading: false,
    },
  });

  const toast = useToastContext();

  const { isConnected, address } = useAccount();

  // TODO:
  const walletState = {
    context: {
      connection: null,
      wallet: null,
    },
  };

  const fetchMarketContractValues = async () => {
    setActions((prev) => ({
      ...prev,
      fetchMarketContractValues: {
        isLoading: true,
      },
    }));

    try {
      const contract = await MarketContract.loadFromGuestConnection(marketId);
      const market = await contract.getMarketData();
      const price = await contract.getPricingData();
      const resolutionWindow = await contract.getResolutionWindow();
      const buySellTimestamp = await contract.getBuySellTimestamp();
      const blockTimestamp = await contract.getBlockTimestamp();
      const isOver = await contract.isOver();
      const isOpen = await contract.isOpen();
      const isResolutionWindowExpired = await contract.isResolutionWindowExpired();
      const isResolved = await contract.isResolved();
      const collateralTokenMetadata = await contract.getCollateralTokenMetadata();
      const feeRatio = await contract.getFeeRatio();
      const resolution = await contract.getResolutionData();

      if (price) {
        market.description = `Will ${price.base_currency_symbol} be above ${currency.convert.toFormattedString(
          price.value,
        )}?`;
      }

      const outcomeTokens = (
        await Promise.all(
          market.options.map((_option, outcomeId) => contract.getOutcomeToken({ outcome_id: outcomeId })),
        )
      ).filter(Boolean);

      if (!outcomeTokens) {
        throw new Error("ERR_FAILED_TO_FETCH_OUTCOME_TOKENS");
      }

      setMarketContractValues({
        market,
        resolutionWindow,
        isOver,
        isResolved,
        isOpen,
        isResolutionWindowExpired,
        collateralTokenMetadata,
        outcomeTokens: outcomeTokens as Array<OutcomeToken>,
        feeRatio,
        buySellTimestamp,
        blockTimestamp,
        resolution: {
          ...resolution,
          // @TODO set to actual feed_id from current contract
          feed_id: "CfHFMUiP8BbTGkt9AvTFYzVPgoNxCz16zPD6huoRUwUB",
        },
        price,
      });

      setSelectedOutcomeToken(outcomeTokens[0]);
    } catch {
      toast.trigger({
        variant: "error",
        withTimeout: true,
        // @TODO i18n
        title: "Failed to fetch market data",
        children: <Typography.Text>Try refreshing the page, or check your internet connection.</Typography.Text>,
      });
    }

    setActions((prev) => ({
      ...prev,
      fetchMarketContractValues: {
        isLoading: false,
      },
    }));
  };

  const updatePriceMarketDescription = async () => {
    const market = marketContractValues?.market;
    const price = marketContractValues?.price;

    if (!market || !price) {
      return;
    }

    market.description =
      date.now().valueOf() > market.ends_at
        ? `Will ${price.base_currency_symbol} be above ${currency.convert.toFormattedString(price.value)}?`
        : `Will ${price.base_currency_symbol} be above ${currency.convert.toFormattedString(
            price.value,
          )} ${date.timeFromNow.asDefault(market.ends_at)}?`;

    setMarketContractValues((prev) => ({
      ...prev!,
      price,
    }));
  };

  useEffect(() => {
    if (!marketContractValues?.price) {
      return undefined;
    }

    updatePriceMarketDescription();

    const interval = setInterval(async () => {
      updatePriceMarketDescription();
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [marketContractValues?.price]);

  const assertWalletConnection = () => {
    if (!isConnected) {
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

  const getBalanceOf = async (args: BalanceOfArgs) => {
    try {
      const contract = await MarketContract.loadFromGuestConnection(marketId);
      const balance = await contract.balanceOf(args);

      return balance;
    } catch {
      return 0;
    }
  };

  const getAmountMintable = async (args: GetAmountMintableArgs) => {
    try {
      assertWalletConnection();

      const [contract] = await MarketContract.loadFromWalletConnection(walletState.context.connection!, marketId);
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

      const [contract] = await MarketContract.loadFromWalletConnection(walletState.context.connection!, marketId);
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

      await MarketContract.sell(walletState.context.wallet!, marketId, args);

      toast.trigger({
        variant: "confirmation",
        withTimeout: false,
        // @TODO i18n
        title: "Success",
        children: (
          <Typography.Text>{`Sold ${currency.convert.toDecimalsPrecisionString(
            args.amount,
            marketContractValues?.collateralTokenMetadata?.decimals!,
          )} of "${marketContractValues?.market.options[args.outcome_id]}"`}</Typography.Text>
        ),
      });
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

  const calculateTotalOutcomeTokensPosition = async () => {
    if (!isConnected || !marketContractValues?.outcomeTokens) {
      return;
    }

    const promises = marketContractValues.outcomeTokens.map((token) =>
      getBalanceOf({ outcome_id: token.outcome_id, account_id: address! }).then((balance_of) => ({
        ...token,
        balance_of,
        value: marketContractValues.market.options[token.outcome_id],
        position: token.total_supply === 0 ? 0 : (balance_of / token.total_supply) * 100,
      })),
    );

    const result = await Promise.all(promises);

    setOutcomeTokensExtended(result);
  };

  const onClickResolveMarket = async () => {
    try {
      assertWalletConnection();

      const result = await MarketContract.aggregatorRead(walletState.context.wallet!, marketId);

      return result;
    } catch {
      toast.trigger({
        variant: "error",
        withTimeout: true,
        // @TODO i18n
        title: "Failed to resolve market",
        children: <Typography.Text>Check your internet connection, your NEAR balance and try again.</Typography.Text>,
      });

      return false;
    }
  };

  const onClickOutcomeToken = (outcomeToken: OutcomeToken) => {
    setSelectedOutcomeToken(outcomeToken);
  };

  const bettingPeriodExpired = () =>
    !!marketContractValues?.buySellTimestamp && date.now().valueOf() > marketContractValues.buySellTimestamp;

  const props = {
    marketContractValues,
    fetchMarketContractValues,
    getBalanceOf,
    getAmountMintable,
    getAmountPayable,
    sell,
    onClickResolveMarket,
    onClickOutcomeToken,
    bettingPeriodExpired,
    actions,
    selectedOutcomeToken,
    marketId,
    calculateTotalOutcomeTokensPosition,
    outcomeTokensExtended,
  };

  return <NearMarketContractContext.Provider value={props}>{children}</NearMarketContractContext.Provider>;
};
