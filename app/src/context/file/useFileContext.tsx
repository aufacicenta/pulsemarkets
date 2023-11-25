import { useContext } from "react";

import { FileContext } from "./FileContext";

export const useFileContext = () => {
  const context = useContext(FileContext);

  if (context === undefined) {
    throw new Error("useFileContext must be used within a FileContext");
  }

  return context;
};
