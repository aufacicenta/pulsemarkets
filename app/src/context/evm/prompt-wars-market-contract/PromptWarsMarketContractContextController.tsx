import React, { useState } from "react";
import { Signer, ethers } from "ethers";
import { useAccount, Address } from "wagmi";
import { useRouter } from "next/router";
import { getContract, writeContract } from "@wagmi/core";

import { Market, Market__factory } from "providers/evm/contracts/prompt-wars";
import { useRoutes } from "hooks/useRoutes/useRoutes";
import { useToastContext } from "hooks/useToastContext/useToastContext";
import { Typography } from "ui/typography/Typography";
import currency from "providers/currency";

import { PromptWarsMarketContractContext } from "./PromptWarsMarketContractContext";
import {
  PromptWarsMarketContractContextControllerProps,
  PromptWarsMarketContractContextType,
  PromptWarsMarketContractValues,
  PromptWarsMarketContractContextContextActions,
  zeroXaddress,
  PromptWarsMarketContractStatus,
} from "./PromptWarsMarketContractContext.types";

const deploy = async (
  signer: Signer,
  market: Market.MarketDataStruct,
  management: Market.ManagementStruct,
  collateralToken: Market.CollateralTokenStruct,
) => {
  const contract = new Market__factory(signer);

  const PromptWarsMarketContract = await contract.deploy(market, management, collateralToken);

  if (PromptWarsMarketContract.deploymentTransaction()) {
    await PromptWarsMarketContract.deploymentTransaction()!.wait();
  }

  return PromptWarsMarketContract;
};

const connect = async (address: string, provider: ethers.Signer | ethers.Provider) => {
  const contract = new ethers.Contract(address, Market__factory.abi, provider) as unknown as Market;

  return contract;
};

let marketContract: Market;

export const PromptWarsMarketContractContextController = ({
  marketId,
  children,
}: PromptWarsMarketContractContextControllerProps) => {
  const [marketContractValues, setMarketContractValues] = useState<PromptWarsMarketContractValues>();
  const [actions, setActions] = useState<PromptWarsMarketContractContextContextActions>({
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
  const { isConnected, address } = useAccount();

  const assertWalletConnection = () => {
    if (!isConnected) {
      toast.trigger({
        variant: "info",
        withTimeout: true,
        title: "Wallet is not connected",
        children: <Typography.Text>Check your internet connection, your balance and try again.</Typography.Text>,
      });

      throw new Error("ERR_PROMPT_MARKET_CONTRACT_INVALID_WALLET_CONNECTION");
    }
  };

  const getPlayer = async (playerId?: zeroXaddress) => {
    if (!playerId) {
      return undefined;
    }

    try {
      const contract = getContract({
        address: marketId as Address,
        abi: Market__factory.abi,
      });

      const player = await contract.read.get_player([playerId as Address]);

      return {
        ...player,
        id: player.id as `0x${string}`,
      };
    } catch (error) {
      console.log(error);
    }

    return undefined;
  };

  const getMarketStatus = (values: PromptWarsMarketContractValues): PromptWarsMarketContractStatus => {
    if (!values) {
      return PromptWarsMarketContractStatus.LOADING;
    }

    const isOver = !values?.isBeforeMarketEnds;

    if (values?.isBeforeMarketEnds) {
      return PromptWarsMarketContractStatus.OPEN;
    }

    if (isOver && values.isResolved) {
      return PromptWarsMarketContractStatus.RESOLVED;
    }

    if (isOver && !values.isRevealWindowExpired) {
      return PromptWarsMarketContractStatus.REVEALING;
    }

    if (isOver && !values.isResolutionWindowExpired) {
      return PromptWarsMarketContractStatus.RESOLVING;
    }

    if (isOver && values.isExpiredUnresolved) {
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
      const contract = getContract({
        address: marketId as Address,
        abi: Market__factory.abi,
      });

      const [
        market,
        resolution,
        fees,
        management,
        collateralToken,
        isResolved,
        isRevealWindowExpired,
        isResolutionWindowExpired,
        isExpiredUnresolved,
        isBeforeMarketEnds,
        playersCount,
        currentPlayer,
      ] = await Promise.all([
        contract.read.get_market_data(),
        contract.read.get_resolution_data(),
        contract.read.get_fees_data(),
        contract.read.get_management_data(),
        contract.read.get_collateral_token_data(),
        contract.read.is_resolved(),
        contract.read.is_reveal_window_expired(),
        contract.read.is_resolution_window_expired(),
        contract.read.is_expired_unresolved(),
        contract.read.is_before_market_ends(),
        contract.read.get_players_count(),
        getPlayer(address),
      ]);

      const values: PromptWarsMarketContractValues = {
        market,
        resolution,
        fees,
        management,
        collateralToken,
        isResolved,
        isRevealWindowExpired,
        isResolutionWindowExpired,
        isExpiredUnresolved,
        isBeforeMarketEnds,
        playersCount: currency.convert.toSafeInt(playersCount),
        currentPlayer,
        status: PromptWarsMarketContractStatus.LOADING,
      };

      const status = getMarketStatus(values);

      setMarketContractValues({ ...values, status });
    } catch (error) {
      console.log(error);

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

  const sell = async () => {
    try {
      assertWalletConnection();

      await marketContract.sell();

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
          <Typography.Text>Check your internet connection, your wallet connection and try again.</Typography.Text>
        ),
      });
    }
  };

  const ftTransferCall = async (prompt: string) => {
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

      await writeContract({
        address: marketId as Address,
        abi: Market__factory.abi,
        functionName: "register",
        args: [prompt],
      });

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
        children: <Typography.Text>{`Transferred USDT ${amount} to ${marketId}`}</Typography.Text>,
      });

      fetchMarketContractValues();
    } catch {
      toast.trigger({
        variant: "error",
        title: "Failed to make transfer call",
        children: <Typography.Text>Check your internet connection, connect your wallet and try again.</Typography.Text>,
      });

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
        throw new Error("ERR_USE_PROMPT_WARS_MARKET_CONTRACT_CREATE_FAILED");
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

  const props: PromptWarsMarketContractContextType = {
    deploy,
    connect,
    fetchMarketContractValues,
    sell,
    ftTransferCall,
    actions,
    marketId,
    marketContractValues,
    create,
    getPlayer,
  };

  return <PromptWarsMarketContractContext.Provider value={props}>{children}</PromptWarsMarketContractContext.Provider>;
};
