import logger from "providers/logger";

import { NanonetsResults } from "./nanonets.types";

const getRawText = (result: NanonetsResults) => {
  try {
    logger.info(`Getting nanonets raw text from ${result.results[0].page_data.length} pages`);

    const raw_text = result.results[0].page_data.map((data) => data.raw_text).join("\n");

    return raw_text;
  } catch (error) {
    console.log(error);

    throw error;
  }
};

export default getRawText;
