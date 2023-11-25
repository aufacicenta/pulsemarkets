import { createContext } from "react";

import { MessageContextType } from "./MessageContext.types";

export const MessageContext = createContext<MessageContextType | undefined>(undefined);
