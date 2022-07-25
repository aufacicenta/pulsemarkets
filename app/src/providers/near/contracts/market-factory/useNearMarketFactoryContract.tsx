import { useToastContext } from "hooks/useToastContext/useToastContext";
import { useWalletStateContext } from "hooks/useWalletStateContext/useWalletStateContext";
import { Typography } from "ui/typography/Typography";

import { MarketFactoryContract } from ".";
import { DeployMarketContractArgs } from "./market-factory.types";

export default () => {
  const toast = useToastContext();
  const wallet = useWalletStateContext();

  const assertWalletConnection = () => {
    if (!wallet.isConnected.get()) {
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

  const createMarket = async (args: DeployMarketContractArgs) => {
    try {
      assertWalletConnection();

      await MarketFactoryContract.createMarket(wallet.context.get().connection!, args);
    } catch (error) {
      console.log(error);
    }
  };

  return {
    contract: MarketFactoryContract,
    createMarket,
  };
};
