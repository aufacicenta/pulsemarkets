import React from "react";
import { createWeb3Modal } from "@web3modal/wagmi/react";
import { http, createConfig, WagmiProvider } from "wagmi";
import { mainnet, sepolia, optimism, Chain } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { EvmWalletSelectorContext } from "./EvmWalletSelectorContext";
import {
  EvmWalletSelectorContextControllerProps,
  EvmWalletSelectorContextType,
} from "./EvmWalletSelectorContext.types";

const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID;

if (!projectId) {
  throw new Error("No WalletConnect Project Id found");
}

const queryClient = new QueryClient();

const metadata = {
  name: "Web3Modal",
  description: "Web3Modal Example",
  url: "https://web3modal.com",
  icons: ["https://avatars.githubusercontent.com/u/37784886"],
  verifyUrl: "https://web3modal.com",
};

const chains = [mainnet, optimism, sepolia] as [Chain, ...Chain[]];

export const wagmiConfig = createConfig({
  chains,
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
});

createWeb3Modal({
  wagmiConfig,
  projectId,
  chains,
  metadata,
});

export const EvmWalletSelectorContextController = ({ children }: EvmWalletSelectorContextControllerProps) => {
  const props: EvmWalletSelectorContextType = {};

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <EvmWalletSelectorContext.Provider value={props}>{children}</EvmWalletSelectorContext.Provider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};
