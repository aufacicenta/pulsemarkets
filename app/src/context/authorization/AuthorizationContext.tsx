import { createContext } from "react";

import { AuthorizationContextType } from "./AuthorizationContext.types";

export const AuthorizationContext = createContext<AuthorizationContextType | undefined>(undefined);
