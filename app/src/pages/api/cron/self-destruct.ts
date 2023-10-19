import { NextApiRequest, NextApiResponse } from "next";

import logger from "providers/logger";
import { PromptWarsMarketContract } from "providers/near/contracts/prompt-wars/contract";
import { MarketFactoryContract } from "providers/near/contracts/market-factory";

export default async function Fn(_request: NextApiRequest, response: NextApiResponse) {
  const apiKey = _request.headers.authorization || _request.query.apiKey;

  if (process.env.CRON_API_KEY !== apiKey) {
    return response.status(401).json({ message: "Not authenticated" });
  }

  if (_request.method !== "POST") {
    return response.status(405).json({ message: "Invalid method" });
  }

  try {
    const marketFactory = await MarketFactoryContract.loadFromGuestConnection();
    const marketsList = await marketFactory.get_markets_list();

    await Promise.all(
      marketsList!.map(async (marketId) => {
        try {
          const contract = await PromptWarsMarketContract.loadFromGuestConnection(marketId!);
          const isSelfDestructWindowExpired = await contract.is_self_destruct_window_expired();

          if (!isSelfDestructWindowExpired) {
            logger.info(`ERR_LATEST_MARKET_IS_STILL_ACTIVE for market ${marketId}`);
          } else {
            await PromptWarsMarketContract.selfDestruct(marketId);
            logger.info(`self_destruct method called for market ${marketId}`);
          }
        } catch (error) {
          logger.error(error);
        }
      }),
    );

    return response.status(200).json({});
  } catch (error) {
    logger.error(error);

    return response.status(500).json({ error: (error as Error).message });
  }
}
