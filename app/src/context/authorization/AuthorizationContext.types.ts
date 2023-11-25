import { OAuthTokenStoreKey } from "api/oauth/oauth.types";
import { ReactNode } from "react";

export type AccessTokens = {
  [OAuthTokenStoreKey.dropbox_esign]?: string;
  [OAuthTokenStoreKey.square_api]?: string;
};

export type AuthItem = {
  name: string;
  isAuthorized: boolean;
  key: OAuthTokenStoreKey;
};

export type AuthorizationContextControllerProps = {
  children: ReactNode;
};

export type AuthorizationContextType = {
  accessTokens: AccessTokens;
  authItems: Array<AuthItem>;
  revokeAuth: (key: OAuthTokenStoreKey) => void;
  getGuestId: () => string | null;
  generateGuestId: () => string;
  verifyDropboxESignAuthorization: () => Promise<void>;
  verifySquareAPIAuthorization: () => Promise<void>;
};
