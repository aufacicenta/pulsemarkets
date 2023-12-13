import { useContext } from "react";

import { PromptWarsMarketContractContext } from "./PromptWarsMarketContractContext";

export const useEVMPromptWarsMarketContractContext = () => {
  const context = useContext(PromptWarsMarketContractContext);

  if (context === undefined) {
    throw new Error("useEVMPromptWarsMarketContractContext must be used within a PromptWarsMarketContractContext");
  }

  return context;
};
