import React, { useState } from "react";
import { setTimeout } from "timers";
import { useRouter } from "next/router";

import { useToastContext } from "hooks/useToastContext/useToastContext";
import { Typography } from "ui/typography/Typography";
import { PromptWarsMarketContract } from "providers/near/contracts/prompt-wars/contract";
import {
  GetOutcomeTokenArgs,
  Prompt,
  PromptWarsMarketContractStatus,
  PromptWarsMarketContractValues,
} from "providers/near/contracts/prompt-wars/prompt-wars.types";
import { useWalletStateContext } from "context/wallet/state/useWalletStateContext";
import { FungibleTokenContract } from "providers/near/contracts/fungible-token/contract";
import currency from "providers/currency";
import { useRoutes } from "hooks/useRoutes/useRoutes";
import { ErrorCode } from "providers/near/error-codes";

import {
  NearPromptWarsMarketContractContextContextActions,
  NearPromptWarsMarketContractContextControllerProps,
} from "./NearPromptWarsMarketContractContextContext.types";
import { NearPromptWarsMarketContractContext } from "./NearPromptWarsMarketContractContext";

let marketContract: PromptWarsMarketContract;

export const NearPromptWarsMarketContractContextController = ({
  children,
  marketId,
}: NearPromptWarsMarketContractContextControllerProps) => {
  const [marketContractValues, setMarketContractValues] = useState<PromptWarsMarketContractValues>();
  const [actions, setActions] = useState<NearPromptWarsMarketContractContextContextActions>({
    fetchMarketContractValues: {
      isLoading: false,
    },
    ftTransferCall: {
      success: false,
      isLoading: false,
    },
    create: {
      isLoading: false,
    },
  });

  const routes = useRoutes();
  const router = useRouter();

  const toast = useToastContext();

  const walletStateContext = useWalletStateContext();

  const getMarketStatus = (values: PromptWarsMarketContractValues): PromptWarsMarketContractStatus => {
    if (!values) {
      return PromptWarsMarketContractStatus.LOADING;
    }

    if (values?.isOpen) {
      return PromptWarsMarketContractStatus.OPEN;
    }

    if (values?.isOver && values.isResolved) {
      return PromptWarsMarketContractStatus.RESOLVED;
    }

    if (values?.isOver && !values.isRevealWindowExpired) {
      return PromptWarsMarketContractStatus.REVEALING;
    }

    if (values?.isOver && !values.isResolutionWindowExpired) {
      return PromptWarsMarketContractStatus.RESOLVING;
    }

    if (values?.isOver && values.isExpiredUnresolved) {
      return PromptWarsMarketContractStatus.UNRESOLVED;
    }

    return PromptWarsMarketContractStatus.CLOSED;
  };

  const fetchMarketContractValues = async () => {
    setActions((prev) => ({
      ...prev,
      fetchMarketContractValues: {
        isLoading: true,
      },
    }));

    try {
      // Wait 1 second to allow flags to change
      setTimeout(async () => {
        try {
          const contract = await PromptWarsMarketContract.loadFromGuestConnection(marketId);

          const [
            market,
            resolution,
            fees,
            management,
            collateralToken,
            outcomeIds,
            isResolved,
            isOpen,
            isOver,
            isRevealWindowExpired,
            isResolutionWindowExpired,
            isExpiredUnresolved,
          ] = await Promise.all([
            contract.get_market_data(),
            contract.get_resolution_data(),
            contract.get_fee_data(),
            contract.get_management_data(),
            contract.get_collateral_token_metadata(),
            contract.get_outcome_ids(),
            contract.is_resolved(),
            contract.is_open(),
            contract.is_over(),
            contract.is_reveal_window_expired(),
            contract.is_resolution_window_expired(),
            contract.is_expired_unresolved(),
          ]);

          const values: PromptWarsMarketContractValues = {
            market,
            resolution,
            fees,
            management,
            collateralToken,
            outcomeIds,
            isResolved,
            isOpen,
            isOver,
            isRevealWindowExpired,
            isResolutionWindowExpired,
            isExpiredUnresolved,
            status: PromptWarsMarketContractStatus.LOADING,
          };

          const status = getMarketStatus(values);

          values.status = status;

          setMarketContractValues(values);
        } catch (error) {
          console.log(error);
        }
      }, 1000);
    } catch {
      toast.trigger({
        variant: "error",
        withTimeout: true,
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

  const assertWalletConnection = () => {
    if (!walletStateContext.isConnected) {
      toast.trigger({
        variant: "info",
        withTimeout: true,
        title: "Wallet is not connected",
        children: <Typography.Text>Check your internet connection, your NEAR balance and try again.</Typography.Text>,
      });

      throw new Error("ERR_USE_NEAR_MARKET_CONTRACT_INVALID_WALLET_CONNECTION");
    }
  };

  const ftTransferCall = async (prompt: Prompt) => {
    if (!marketContractValues) {
      return;
    }

    try {
      assertWalletConnection();

      setActions((prev) => ({
        ...prev,
        ftTransferCall: {
          ...prev.ftTransferCall,
          isLoading: true,
        },
      }));

      const amount = marketContractValues.fees.price.toString();
      const msg = JSON.stringify({ CreateOutcomeTokenArgs: { prompt: JSON.stringify(prompt) } });

      await FungibleTokenContract.ftTransferCall(
        walletStateContext.context.wallet!,
        marketContractValues.collateralToken.id!,
        {
          receiver_id: marketId,
          amount,
          msg,
        },
      );

      setActions((prev) => ({
        ...prev,
        ftTransferCall: {
          ...prev.ftTransferCall,
          isLoading: false,
          success: true,
        },
      }));

      toast.trigger({
        variant: "confirmation",
        withTimeout: true,
        title: "Your prompt was successfully submitted",
        children: (
          <Typography.Text>{`Transferred USDT ${currency.convert.toDecimalsPrecisionString(
            amount,
            marketContractValues.collateralToken.decimals!,
          )} to ${marketId}`}</Typography.Text>
        ),
      });

      fetchMarketContractValues();
    } catch (error) {
      if ((error as Error).message === ErrorCode.ERR_FungibleTokenContract_ftTransferCall) {
        toast.trigger({
          variant: "error",
          title: "Failed to make transfer call",
          children: <Typography.Text>You already transferred to this match.</Typography.Text>,
        });
      } else {
        toast.trigger({
          variant: "error",
          title: "Failed to make transfer call",
          children: (
            <Typography.Text>Check your internet connection, connect your wallet and try again.</Typography.Text>
          ),
        });
      }

      setActions((prev) => ({
        ...prev,
        ftTransferCall: {
          ...prev.ftTransferCall,
          isLoading: false,
          success: true,
        },
      }));
    }
  };

  const sell = async () => {
    try {
      assertWalletConnection();

      await PromptWarsMarketContract.sell(walletStateContext.context.wallet!, marketId);

      toast.trigger({
        variant: "confirmation",
        withTimeout: false,
        title: "Success",
        children: <Typography.Text>Check your new wallet balance.</Typography.Text>,
      });
    } catch {
      toast.trigger({
        variant: "error",
        withTimeout: true,
        title: "Failed to call sell method",
        children: (
          <Typography.Text>Check your internet connection, your NEAR wallet connection and try again.</Typography.Text>
        ),
      });
    }
  };

  const getOutcomeToken = async (args: GetOutcomeTokenArgs) => {
    try {
      if (!marketContract) {
        marketContract = await PromptWarsMarketContract.loadFromGuestConnection(marketId);
      }

      const outcomeToken = await marketContract.get_outcome_token(args);

      return outcomeToken;
    } catch (error) {
      console.log(error);
    }

    return undefined;
  };

  const create = async () => {
    setActions((prev) => ({
      ...prev,
      create: {
        isLoading: true,
      },
    }));

    try {
      const response = await fetch(routes.api.promptWars.create());

      if (!response.ok) {
        throw new Error("ERR_USE_NEAR_PROMPT_WARS_MARKET_CONTRACT_CREATE_FAILED");
      }

      router.push(routes.dashboard.promptWars.home());
    } catch (error) {
      console.log(error);

      toast.trigger({
        variant: "error",
        withTimeout: false,
        title: "Failed to create a new market",
        children: <Typography.Text>The server must have run out of funds. Please try again later.</Typography.Text>,
      });
    }

    setActions((prev) => ({
      ...prev,
      create: {
        isLoading: false,
      },
    }));
  };

  const props = {
    fetchMarketContractValues,
    marketContractValues,
    ftTransferCall,
    sell,
    getOutcomeToken,
    actions,
    marketId,
    create,
  };

  return (
    <NearPromptWarsMarketContractContext.Provider value={props}>
      {children}
    </NearPromptWarsMarketContractContext.Provider>
  );
};
