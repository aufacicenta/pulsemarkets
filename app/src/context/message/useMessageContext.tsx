import { useContext } from "react";

import { MessageContext } from "./MessageContext";

export const useMessageContext = () => {
  const context = useContext(MessageContext);

  if (context === undefined) {
    throw new Error("useMessageContext must be used within a MessageContext");
  }

  return context;
};
