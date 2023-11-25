import React, { useState } from "react";
import { OAuthTokenStoreKey } from "api/oauth/oauth.types";
import Cookies from "js-cookie";
import { v4 as uuidv4 } from "uuid";

import { useLocalStorage } from "hooks/useLocalStorage/useLocalStorage";
import { LocalStorageKeys } from "hooks/useLocalStorage/useLocalStorage.types";

import {
  AccessTokens,
  AuthItem,
  AuthorizationContextControllerProps,
  AuthorizationContextType,
} from "./AuthorizationContext.types";
import { AuthorizationContext } from "./AuthorizationContext";

export const AuthorizationContextController = ({ children }: AuthorizationContextControllerProps) => {
  const [accessTokens, setAccessTokens] = useState<AccessTokens>({});
  const [authItems, setAuthItems] = useState<Array<AuthItem>>([
    { name: "Dropbox Sign™", isAuthorized: false, key: OAuthTokenStoreKey.dropbox_esign },
    { name: "Square™", isAuthorized: false, key: OAuthTokenStoreKey.square_api },
  ]);

  const ls = useLocalStorage();

  const generateGuestId = () => {
    const id = `guest-${uuidv4().slice(0, 4)}`;

    ls.set(LocalStorageKeys.guestId, id);

    return id;
  };

  const getGuestId = () => ls.get<string>(LocalStorageKeys.guestId);

  const revokeAuth = (key: OAuthTokenStoreKey) => {
    Cookies.remove(key);

    setAccessTokens((prev) => ({ ...prev, [key]: null }));

    setAuthItems((prev) => {
      const i = prev.findIndex((item) => item.key === key);

      const item = prev[i];

      return Object.assign([], { ...prev, [i]: { ...item, isAuthorized: false } });
    });
  };

  const verifyDropboxESignAuthorization = async () => {
    try {
      const dropboxESignAuthResponse = Cookies.get(OAuthTokenStoreKey.dropbox_esign);

      const value = JSON.parse(dropboxESignAuthResponse!);

      setAccessTokens((prev) => ({
        ...prev,
        [OAuthTokenStoreKey.dropbox_esign]: value.access_token,
      }));

      setAuthItems((prev) => {
        const i = prev.findIndex((item) => item.key === OAuthTokenStoreKey.dropbox_esign);

        const item = prev[i];

        return Object.assign([], { ...prev, [i]: { ...item, isAuthorized: true } });
      });
    } catch (error) {
      console.log(error);
    }
  };

  const verifySquareAPIAuthorization = async () => {
    try {
      const squareApiAuthResponse = Cookies.get(OAuthTokenStoreKey.square_api);

      const value = JSON.parse(squareApiAuthResponse!);

      setAccessTokens((prev) => ({
        ...prev,
        [OAuthTokenStoreKey.square_api]: value.accessToken,
      }));

      setAuthItems((prev) => {
        const i = prev.findIndex((item) => item.key === OAuthTokenStoreKey.square_api);

        const item = prev[i];

        return Object.assign([], { ...prev, [i]: { ...item, isAuthorized: true } });
      });
    } catch (error) {
      console.log(error);
    }
  };

  const props: AuthorizationContextType = {
    verifyDropboxESignAuthorization,
    verifySquareAPIAuthorization,
    accessTokens,
    getGuestId,
    generateGuestId,
    authItems,
    revokeAuth,
  };

  return <AuthorizationContext.Provider value={props}>{children}</AuthorizationContext.Provider>;
};
