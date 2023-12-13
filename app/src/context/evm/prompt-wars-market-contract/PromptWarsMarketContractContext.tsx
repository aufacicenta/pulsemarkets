import { createContext } from "react";

import { PromptWarsMarketContractContextType } from "./PromptWarsMarketContractContext.types";

export const PromptWarsMarketContractContext = createContext<PromptWarsMarketContractContextType | undefined>(
  undefined,
);
