import { NextApiRequest, NextApiResponse } from "next";

import logger from "providers/logger";
import chat from "providers/chat";
import openai from "providers/openai";
import { ChatLabel } from "context/message/MessageContext.types";
import { FileAgentRequest } from "../types";
import json from "providers/json";

import functions from "./functions";

export default async function Fn(request: NextApiRequest, response: NextApiResponse) {
  try {
    logger.info(`getting chat completion from model ${openai.model}`);

    const data: FileAgentRequest =
      typeof request.body.body === "string" ? JSON.parse(request.body.body, json.reviver) : request.body.body;

    const chatCompletion = await openai.client.chat.completions.create({
      messages: [
        { role: "system", content: "You are an intelligent file reader. You can understand the content of any file." },
        ...data.messages,
        data.currentMessage,
      ],
      model: openai.model,
      functions,
    });

    logger.info(chatCompletion);

    const { choices, promises } = chat.processFunctionCalls(chatCompletion.choices);

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
