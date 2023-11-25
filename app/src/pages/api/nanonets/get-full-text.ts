import { NextApiRequest, NextApiResponse } from "next";

import logger from "providers/logger";

export default async function Fn(_request: NextApiRequest, response: NextApiResponse) {
  try {
    const file =
      "https://blockchainassetregistry.infura-ipfs.io/ipfs/bafybeidxxuzx6ht6qz3chhxtmyo2dhya7ykes2mo7gqptpwphvnkzptx3y/DERECHOS-INSCRIPCION-35295_249_184_3_9_22-08-2023%2016.21.06.pdf.pdf";

    logger.info(`Getting nanonets full text of file ${file}`);

    const body = new URLSearchParams();

    body.append("urls", file);
    body.append("file", file);

    const key = Buffer.from(`${process.env.NANONETS_API_KEY}:`).toString("base64");
    const Authorization = `Basic ${key}`;

    const result = await fetch("https://app.nanonets.com/api/v2/OCR/FullText", {
      method: "POST",
      headers: {
        Authorization,
      },
      body,
    });

    const json = await result.json();

    logger.info(`Done`);

    response.status(200).json({ json });
  } catch (error) {
    logger.error(error);

    response.status(500).json({ error: (error as Error).message });
  }
}
