import { useContext } from "react";

import { EvmWalletSelectorContext } from "./EvmWalletSelectorContext";

export const useEvmWalletSelectorContext = () => {
  const context = useContext(EvmWalletSelectorContext);

  if (context === undefined) {
    throw new Error("useEvmWalletSelectorContext must be used within a EvmWalletSelectorContext");
  }

  return context;
};
