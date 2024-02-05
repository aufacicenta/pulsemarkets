/* eslint-disable @typescript-eslint/naming-convention */
// TODO: do we need this file ?
import React, { useState } from "react";
import { useAccount } from "wagmi";

import { useToastContext } from "hooks/useToastContext/useToastContext";
import { Typography } from "ui/typography/Typography";
import date from "providers/date";
import { DeployMarketContractArgs } from "providers/near/contracts/market-factory/market-factory.types";
import near from "providers/near";
import { MarketFactoryContract } from "providers/near/contracts/market-factory";
import pulse from "providers/pulse";
import switchboard from "providers/switchboard";
import { DEFAULT_FEE_RATIO } from "providers/near/getConfig";

import {
  NearMarketFactoryContractContextActions,
  NearMarketFactoryContractContextControllerProps,
  PartialCreatePriceMarketContractArgs,
} from "./NearMarketFactoryContractContext.types";
import { NearMarketFactoryContractContext } from "./NearMarketFactoryContractContext";

export const NearMarketFactoryContractContextController = ({
  children,
}: NearMarketFactoryContractContextControllerProps) => {
  const [marketId, setMarketId] = useState("");
  const [latestPriceMarketsIds, setLatestPriceMarketsIds] = useState<string[]>([]);
  const [actions, setActions] = useState<NearMarketFactoryContractContextActions>({
    fetchLatestPriceMarkets: {
      isLoading: false,
    },
  });

  const toast = useToastContext();
  const { isConnected } = useAccount();
  // TODO:
  const walletState = { context: { connection: undefined, wallet: undefined } };

  const assertWalletConnection = () => {
    if (!isConnected) {
      toast.trigger({
        variant: "error",
        withTimeout: true,
        // @TODO i18n
        title: "Wallet is not connected",
        children: <Typography.Text>Check your internet connection, your NEAR balance and try again.</Typography.Text>,
      });

      throw new Error("ERR_MARKET_FACTORY_WALLET_IS_NOT_CONNECTED");
    }
  };

  const fetchLatestPriceMarkets = async () => {
    setActions((prev) => ({
      ...prev,
      fetchLatestPriceMarkets: {
        isLoading: true,
      },
    }));

    try {
      const marketFactory = await MarketFactoryContract.loadFromGuestConnection();
      const marketsList = await marketFactory.get_markets_list();

      if (!marketsList) {
        throw new Error("ERR_FAILED_TO_FETCH_MARKETS");
      }

      marketsList.reverse();

      const latest = marketsList.slice(0, 7);

      const first = [...latest].shift();

      setLatestPriceMarketsIds(latest.filter((name) => name !== first));
    } catch {
      toast.trigger({
        variant: "error",
        withTimeout: true,
        // @TODO i18n
        title: "Failed to fetch latest price markets",
        children: <Typography.Text>Try refreshing the page, or check your internet connection.</Typography.Text>,
      });
    }

    setActions((prev) => ({
      ...prev,
      fetchLatestPriceMarkets: {
        isLoading: false,
      },
    }));
  };

  const fetchLatestPriceMarket = async () => {
    try {
      const marketFactory = await MarketFactoryContract.loadFromGuestConnection();
      const marketsList = await marketFactory.get_markets_list();

      if (!marketsList) {
        throw new Error("ERR_FAILED_TO_FETCH_MARKETS");
      }

      const latestMarketId = marketsList.pop();

      if (!latestMarketId) {
        throw new Error("ERR_MARKET_FACTORY_HAS_NO_MARKETS");
      }

      setMarketId(latestMarketId);
    } catch {
      toast.trigger({
        variant: "error",
        withTimeout: true,
        // @TODO i18n
        title: "Failed to fetch recent markets",
        children: <Typography.Text>Try refreshing the page, or check your internet connection.</Typography.Text>,
      });
    }
  };

  const createMarket = async (args: DeployMarketContractArgs) => {
    try {
      assertWalletConnection();

      const contractAddress = near.getConfig().marketFactoryAccountId;
      const contract = new MarketFactoryContract(contractAddress, undefined, walletState.context.wallet);

      await contract.createMarket(args);
    } catch (error) {
      console.log(error);
    }
  };

  const createPriceMarket = async ({
    startsAt: starts_at,
    endsAt: ends_at,
    resolutionWindow,
  }: PartialCreatePriceMarketContractArgs) => {
    try {
      assertWalletConnection();

      const contractAddress = near.getConfig().marketFactoryAccountId;
      const contract = new MarketFactoryContract(contractAddress, undefined, walletState.context.wallet);

      const dao_account_id = near.getConfig().marketDaoAccountId;

      const collateralToken = pulse.getConfig().COLLATERAL_TOKENS[0];

      // @TODO set to the corresponding Switchboard aggregator feed address
      const ix = {
        address: [
          173, 62, 255, 125, 45, 251, 162, 167, 128, 129, 25, 33, 146, 248, 118, 134, 118, 192, 215, 84, 225, 222, 198,
          48, 70, 49, 212, 195, 84, 136, 96, 56,
        ],
      };

      const current_price = (await switchboard.fetchCurrentPrice(switchboard.jobs.testnet.near.btcUsd)).toFixed(2);

      const createPriceMarketArgs: DeployMarketContractArgs = {
        market: {
          description: "",
          info: "",
          category: "crypto",
          options: ["yes", "no"],
          starts_at,
          ends_at,
          utc_offset: date.constants.DEFAULT_TIMEZONE_OFFSET,
        },
        collateral_token: {
          id: collateralToken.accountId,
          decimals: collateralToken.decimals,
          balance: 0,
          fee_balance: 0,
        },
        fees: {
          // 2% of 6 precision decimals
          fee_ratio: DEFAULT_FEE_RATIO,
        },
        resolution: {
          window: resolutionWindow,
          ix,
        },
        management: {
          dao_account_id,
        },
        price: {
          value: Number(current_price),
          base_currency_symbol: pulse.getConfig().priceMarket.defaultBaseCurrency.symbol,
          target_currency_symbol: pulse.getConfig().priceMarket.defaultTargetCurrency.symbol,
        },
      };

      await contract.createMarket(createPriceMarketArgs);

      await fetchLatestPriceMarket();
    } catch (error) {
      console.log(error);
    }
  };

  const props = {
    fetchLatestPriceMarket,
    fetchLatestPriceMarkets,
    createMarket,
    createPriceMarket,
    latestPriceMarketsIds,
    marketId,
    actions,
  };

  return (
    <NearMarketFactoryContractContext.Provider value={props}>{children}</NearMarketFactoryContractContext.Provider>
  );
};
