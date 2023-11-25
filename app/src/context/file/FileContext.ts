import { createContext } from "react";

import { FileContextType } from "./FileContext.types";

export const FileContext = createContext<FileContextType | undefined>(undefined);
