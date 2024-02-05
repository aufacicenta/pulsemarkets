import React from "react";
import { createWeb3Modal, defaultWagmiConfig } from "@web3modal/wagmi/react";
import { WagmiConfig, configureChains } from "wagmi";
import { optimismSepolia, optimism } from "viem/chains";
import { publicProvider } from "wagmi/providers/public";

import { EvmWalletSelectorContext } from "./EvmWalletSelectorContext";
import {
  EvmWalletSelectorContextControllerProps,
  EvmWalletSelectorContextType,
} from "./EvmWalletSelectorContext.types";

const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID;

if (!projectId) {
  throw new Error("No WalletConnect Project Id found");
}

const metadata = {
  name: "Web3Modal",
  description: "Web3Modal Example",
  url: "https://web3modal.com",
  icons: ["https://avatars.githubusercontent.com/u/37784886"],
};

const { chains } = configureChains([optimismSepolia, optimism], [publicProvider()]);
const wagmiConfig = defaultWagmiConfig({ chains, projectId, metadata });

createWeb3Modal({
  wagmiConfig,
  projectId,
  chains,
});

export const EvmWalletSelectorContextController = ({ children }: EvmWalletSelectorContextControllerProps) => {
  const props: EvmWalletSelectorContextType = {};

  return (
    <WagmiConfig config={wagmiConfig}>
      <EvmWalletSelectorContext.Provider value={props}>{children}</EvmWalletSelectorContext.Provider>
    </WagmiConfig>
  );
};
