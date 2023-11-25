import React, { useState } from "react";

import { ChatSidebarContext } from "./ChatSidebarContext";
import { ChatSidebarContextControllerProps, ChatSidebarContextType } from "./ChatSidebarContext.types";

export const ChatSidebarContextController = ({ children }: ChatSidebarContextControllerProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = () => setIsOpen(!isOpen);

  const open = () => setIsOpen(true);

  const close = () => setIsOpen(false);

  const props: ChatSidebarContextType = {
    isOpen,
    toggle,
    open,
    close,
  };

  return <ChatSidebarContext.Provider value={props}>{children}</ChatSidebarContext.Provider>;
};
