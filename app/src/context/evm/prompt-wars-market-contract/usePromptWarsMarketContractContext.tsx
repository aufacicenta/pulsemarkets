import { useContext } from "react";

import { PromptWarsMarketContractContext } from "./PromptWarsMarketContractContext";

export const usePromptWarsMarketContractContext = () => {
  const context = useContext(PromptWarsMarketContractContext);

  if (context === undefined) {
    throw new Error("usePromptWarsMarketContractContext must be used within a PromptWarsMarketContractContext");
  }

  return context;
};
