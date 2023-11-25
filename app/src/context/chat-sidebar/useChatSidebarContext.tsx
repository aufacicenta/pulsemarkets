import { useContext } from "react";

import { ChatSidebarContext } from "./ChatSidebarContext";

export const useChatSidebarContext = () => {
  const context = useContext(ChatSidebarContext);

  if (context === undefined) {
    throw new Error("useChatSidebarContext must be used within a ChatSidebarContext");
  }

  return context;
};
