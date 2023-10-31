import { NextApiRequest, NextApiResponse } from "next";

import logger from "providers/logger";
import pulse from "providers/pulse";
import { PromptWarsMarketContract } from "providers/near/contracts/prompt-wars/contract";

export default async function Fn(_request: NextApiRequest, response: NextApiResponse) {
  try {
    const marketId = await pulse.promptWars.getLatestMarketId();

    await PromptWarsMarketContract.resolve(marketId!);

    await PromptWarsMarketContract.sellResolved(marketId!);

    const marketContract = await PromptWarsMarketContract.loadFromGuestConnection(marketId!);

    const blockTimestamp = await marketContract.get_block_timestamp();
    const resolution = await marketContract.get_resolution_data();
    const ms = resolution.window - blockTimestamp;

    logger.info(`setting timeout to call the claim_fees method for market ${marketId} in ${ms} ms`);
    setTimeout(async () => {
      try {
        logger.info(`calling the claim_fees method for market ${marketId}`);
        await PromptWarsMarketContract.claimFees(marketId!);
      } catch (error) {
        logger.error(error);
      }
    }, ms);

    response.status(200).json({ marketId });
  } catch (error) {
    logger.error(error);
    response.status(500).json({ error: (error as Error).message });
  }
}
