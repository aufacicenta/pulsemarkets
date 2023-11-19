import Replicate from "replicate";
import { NextApiRequest, NextApiResponse } from "next";

import ipfs from "providers/ipfs";
import logger from "providers/logger";

const DEFAULT_IMG_DIMENSIONS = { width: 512, height: 512 };

export default async function Fn(request: NextApiRequest, response: NextApiResponse) {
  const { prompt, negative_prompt } = JSON.parse(request.body);

  try {
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

    return response.status(200).json({ imageUrl: ipfsOutputImgURL });
  } catch (error) {
    logger.error(error);

    response.status(500).json(error);
  }
}
