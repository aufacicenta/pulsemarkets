import { NextApiRequest, NextApiResponse } from "next";

import logger from "providers/logger";
import square from "providers/square";

import { OAuthTokenStoreKey } from "./oauth.types";

export default async function Fn(request: NextApiRequest, response: NextApiResponse) {
  try {
    logger.info(`processing square authorization callback`);

    const query = request.query as { state: string; code: string };

    const res = await square.getClient().oAuthApi.obtainToken({
      clientId: process.env.SQUARE_APP_ID!,
      clientSecret: process.env.SQUARE_APP_SECRET!,
      code: query.code,
      grantType: "authorization_code",
    });

    logger.info(`setting cookie ${OAuthTokenStoreKey.square_api} and redirecting`);

    response.setHeader("Set-Cookie", [`${OAuthTokenStoreKey.square_api}=${JSON.stringify(res.result)}; Path=/`]);

    response.redirect(301, `/`);
  } catch (error) {
    logger.error(error);

    response.redirect(301, `/`);
  }
}
