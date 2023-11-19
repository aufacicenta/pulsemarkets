import Replicate from "replicate";
import { NextApiRequest, NextApiResponse } from "next";
import Jimp from "jimp";

import ipfs from "providers/ipfs";
import logger from "providers/logger";
import pulse from "providers/pulse";
import { PromptWarsMarketContract } from "providers/near/contracts/prompt-wars/contract";

const DEFAULT_IMG_DIMENSIONS = { width: 512, height: 512 };

export default async function Fn(request: NextApiRequest, response: NextApiResponse) {
  const { prompt, negative_prompt } = JSON.parse(request.body);

  try {
    const marketId = await pulse.promptWars.getLatestMarketId();

    const market = await PromptWarsMarketContract.loadFromGuestConnection(marketId!);

    const { image_uri } = await market.get_market_data();
    const sourceImgURL = ipfs.asHttpsURL(image_uri);
    const sourceImg = await Jimp.read(sourceImgURL);

    const model = "stability-ai/stable-diffusion:db21e45d3f7023abc2a46ee38a23973f6dce16bb082a930b0c49861f96d1e5bf";
    const image_dimensions = `${DEFAULT_IMG_DIMENSIONS.width}x${DEFAULT_IMG_DIMENSIONS.height}`;

    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN!,
    });

    const input = {
      prompt,
      negative_prompt,
      image_dimensions,
    };

    const [outputImgURL] = (await replicate.run(model, { input })) as Array<string>;
    const ipfsOutputImgURL = await ipfs.getFileAsIPFSUrl(outputImgURL);
    const destImg = await Jimp.read(outputImgURL);

    const { percent } = Jimp.diff(sourceImg, destImg);

    return response.status(200).json({ imageUrl: ipfsOutputImgURL, score: percent });
  } catch (error) {
    logger.error(error);

    response.status(500).json(error);
  }
}
