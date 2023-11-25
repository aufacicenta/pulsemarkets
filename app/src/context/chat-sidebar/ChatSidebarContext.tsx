import { createContext } from "react";

import { ChatSidebarContextType } from "./ChatSidebarContext.types";

export const ChatSidebarContext = createContext<ChatSidebarContextType | undefined>(undefined);
