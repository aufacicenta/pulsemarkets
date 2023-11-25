import OpenAI from "openai";

import logger from "providers/logger";
import { GoogleAIPrediction } from "providers/googleai/googleai.types";

const transformGoogleAIPredictionResponseToStandardChoice = (
  prediction: GoogleAIPrediction,
): OpenAI.Chat.Completions.ChatCompletion["choices"] => {
  logger.info(prediction);

  const choices: OpenAI.Chat.Completions.ChatCompletion["choices"] = [];

  if (!(prediction as { candidates: Array<{ content: string }> })?.candidates) {
    const content = (prediction as { content: string })?.content;

    if (!content) {
      throw new Error("Prediction has no content");
    }

    const choice: OpenAI.Chat.ChatCompletion.Choice = {
      index: 0,
      finish_reason: "stop",
      message: {
        role: "assistant",
        content,
      },
    };

    logger.info(choice);

    choices.push(choice);

    return choices;
  }

  const { content } = (prediction as { candidates: Array<{ content: string }> }).candidates[0];

  try {
    const { function_call } = JSON.parse(content);

    const choice: OpenAI.Chat.ChatCompletion.Choice = {
      index: 0,
      finish_reason: "function_call",
      message: {
        role: "assistant",
        content: "",
        function_call,
      },
    };

    logger.info(choice);

    choices.push(choice);

    return choices;
  } catch (error) {
    logger.error(error);
    logger.error("Content is not a function call. Continue with default content.");

    const choice: OpenAI.Chat.ChatCompletion.Choice = {
      index: 0,
      finish_reason: "stop",
      message: {
        role: "assistant",
        content,
      },
    };

    logger.info(choice);

    choices.push(choice);

    return choices;
  }
};

export default transformGoogleAIPredictionResponseToStandardChoice;
