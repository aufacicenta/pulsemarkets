import { useContext } from "react";

import { AuthorizationContext } from "./AuthorizationContext";

export const useAuthorizationContext = () => {
  const context = useContext(AuthorizationContext);

  if (context === undefined) {
    throw new Error("useAuthorizationContext must be used within a AuthorizationContext");
  }

  return context;
};
