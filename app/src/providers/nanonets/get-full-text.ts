import axios from "axios";

import logger from "providers/logger";

import { NanonetsResults } from "./nanonets.types";

const getFullTextOCR = async (fileURL: string, urls?: string) => {
  try {
    logger.info(`getFullTextOCR: Getting nanonets full text of file ${urls}`);

    const body = new URLSearchParams();

    if (urls) {
      body.append("urls", urls);
    }

    body.append("file", fileURL);

    const key = Buffer.from(`${process.env.NANONETS_API_KEY}:`).toString("base64");
    const Authorization = `Basic ${key}`;

    const result = await axios.request<NanonetsResults>({
      url: "https://app.nanonets.com/api/v2/OCR/FullText",
      method: "POST",
      headers: {
        Authorization,
      },
      data: body,
      timeout: 600000,
    });

    logger.info(
      `getFullTextOCR: Got nanonets full text of file ${urls}, pages: ${result.data.results[0].page_data.length}`,
    );

    return result.data;
  } catch (error) {
    logger.error(error);

    throw error;
  }
};

export default getFullTextOCR;
