import { createContext } from "react";

import { EvmWalletSelectorContextType } from "./EvmWalletSelectorContext.types";

export const EvmWalletSelectorContext = createContext<EvmWalletSelectorContextType | undefined>(undefined);
