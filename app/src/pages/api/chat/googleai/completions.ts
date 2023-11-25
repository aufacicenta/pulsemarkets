import { NextApiRequest, NextApiResponse } from "next";
import { helpers } from "@google-cloud/aiplatform";

import logger from "providers/logger";
import { ChatLabel } from "context/message/MessageContext.types";
import { FileAgentRequest } from "../types";
import chat from "providers/chat";
import { GoogleAIPrediction } from "providers/googleai/googleai.types";
import json from "providers/json";
import googleai from "providers/googleai";

import { examples } from "./examples";

export default async function Fn(request: NextApiRequest, response: NextApiResponse) {
  try {
    logger.info(`getting googleai chat completion`);

    const data: FileAgentRequest =
      typeof request.body.body === "string" ? JSON.parse(request.body.body, json.reviver) : request.body.body;

    const prompt = googleai.convertFileAgentRequestMessagesToValidPrompt(data, {
      context: `You are an intelligent file reader. You can understand the content of any file. If the prompt matches the examples in more than 90%, you should format the reply as a JSON function_call. If the prompt implies a date, replace YYYYMMDD with the implied date and format the date as YYYYMMDD.`,
      examples,
    });

    const [predictionResponse] = await googleai.predict(prompt, googleai.getEndpoint({}));

    if (!predictionResponse?.predictions) {
      throw new Error("No prediction response");
    }

    const prediction = helpers.fromValue((predictionResponse.predictions as protobuf.common.IValue[])[0]);

    const normalizedChoices = chat.transformGoogleAIPredictionResponseToStandardChoice(
      prediction as GoogleAIPrediction,
    );

    const { choices, promises } = chat.processFunctionCalls(normalizedChoices);

    if (promises.length > 0) {
      const responses = await Promise.all(promises.map((promise) => promise(data.currentMessage, request)));

      response.status(200).json({ choices: responses });

      return;
    }

    response.status(200).json({ choices });
  } catch (error) {
    logger.error(error);

    response.status(500).json({
      error: (error as Error).message,
      choices: [
        {
          message: {
            role: "assistant",
            content: "Apologies, I couldn't resolve this request. Try again.",
            label: ChatLabel.chat_completion_error,
            readOnly: true,
            type: "text",
          },
        },
      ],
    });
  }
}
