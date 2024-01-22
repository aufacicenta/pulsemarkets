import React, { useState } from "react";
import { Signer, ethers, BrowserProvider, JsonRpcSigner } from "ethers";
import { type WalletClient, useWalletClient, useAccount } from "wagmi";
import { useRouter } from "next/router";

import { Market, Market__factory } from "providers/evm/contracts/prompt-wars";
import { useRoutes } from "hooks/useRoutes/useRoutes";
import { useToastContext } from "hooks/useToastContext/useToastContext";
import { Typography } from "ui/typography/Typography";

import { PromptWarsMarketContractContext } from "./PromptWarsMarketContractContext";
import {
  PromptWarsMarketContractContextControllerProps,
  PromptWarsMarketContractContextType,
  PromptWarsMarketContractValues,
  PromptWarsMarketContractContextContextActions,
} from "./PromptWarsMarketContractContext.types";

export function walletClientToSigner(walletClient: WalletClient) {
  const { account, chain, transport } = walletClient;
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  };
  const provider = new BrowserProvider(transport, network);
  const signer = new JsonRpcSigner(provider, account.address);

  return signer;
}

/** Hook to convert a viem Wallet Client to an ethers.js Signer. */
export function useEthersSigner({ chainId }: { chainId?: number } = {}) {
  const { data: walletClient } = useWalletClient({ chainId });

  return React.useMemo(() => (walletClient ? walletClientToSigner(walletClient) : undefined), [walletClient]);
}

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

const DEPLOYED_CONTRACT_ADDRESS = "0x00";

let marketContract: Market;

export const PromptWarsMarketContractContextController = ({
  marketId,
  children,
}: PromptWarsMarketContractContextControllerProps) => {
  const routes = useRoutes();
  const router = useRouter();
  const toast = useToastContext();
  const signer = useEthersSigner();

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

  const { isConnected } = useAccount();

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
          if (!signer) throw new Error("not signed in");

          const contract = await connect(DEPLOYED_CONTRACT_ADDRESS, signer);

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
          ] = await Promise.all([
            contract.get_market_data(),
            contract.get_resolution_data(),
            contract.get_fees_data(),
            contract.get_management_data(),
            contract.get_collateral_token_data(),
            contract.is_resolved(),
            contract.is_reveal_window_expired(),
            contract.is_resolution_window_expired(),
            contract.is_expired_unresolved(),
            contract.is_before_market_ends(),
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
          };

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

      if (!signer) throw new Error("not signed in");

      const contract = await connect(DEPLOYED_CONTRACT_ADDRESS, signer);

      await contract.register(prompt);

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

  const getPlayer = async (playerId: string) => {
    try {
      if (!signer) throw new Error("not signed in");

      const contract = await connect(DEPLOYED_CONTRACT_ADDRESS, signer);
      const player = await contract.get_player(playerId);

      return player;
    } catch (error) {
      console.log(error);
    }

    return undefined;
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
    getOutcomeToken: getPlayer,
  };

  return <PromptWarsMarketContractContext.Provider value={props}>{children}</PromptWarsMarketContractContext.Provider>;
};
