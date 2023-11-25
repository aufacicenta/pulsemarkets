import { APIChatHeaderKeyNames, FileAgentRequest } from "api/chat/types";
import { NextApiRequest } from "next";
import { ApiError } from "square";
import { helpers } from "@google-cloud/aiplatform";

import { ChatCompletionChoice, search_square_orders_args } from "providers/chat/chat.types";
import logger from "providers/logger";
import { SquareAPILabel } from "context/message/MessageContext.types";
import square from "providers/square";
import date from "providers/date";
import json from "providers/json";
import googleai from "providers/googleai";
import transformGoogleAIPredictionResponseToStandardChoice from "providers/chat/normalize-googleai-prediction-response";
import { GoogleAIPrediction } from "providers/googleai/googleai.types";

const search_square_orders = async (
  args: search_square_orders_args,
  choice: ChatCompletionChoice,
  _currentMessage: FileAgentRequest["currentMessage"],
  request: NextApiRequest,
): Promise<ChatCompletionChoice> => {
  try {
    logger.info(`search_square_orders: ${JSON.stringify(args)}`);

    const accessToken = request.body.headers[APIChatHeaderKeyNames.x_square_access_token] as string;

    if (!accessToken) {
      return square.getSquareAuthChoice(choice);
    }

    const startAt = args?.date_time_filter?.created_at?.start_at
      ? date.client(args?.date_time_filter?.created_at?.start_at).toDate().toISOString()
      : undefined;

    const response = await square.getClient(accessToken).ordersApi.searchOrders({
      locationIds: [args.location_id],
      query: {
        filter: {
          dateTimeFilter: {
            createdAt: {
              startAt,
            },
          },
          customerFilter: {},
        },
      },
      limit: 10,
      returnEntries: false,
    });

    if (!response.result.orders) {
      return {
        finish_reason: "function_call",
        index: 0,
        message: {
          role: "assistant",
          content: `You have no Square orders for this datetime range.`,
          type: "text",
          label: SquareAPILabel.square_get_payments_request_success,
        },
      };
    }

    const prompt = {
      prompt: `Given this JSON data (DO NOT RETURN THE JSON DATA IN YOUR RESPONSE) only analyze it and reply with what's needed:

${JSON.stringify(response.result.orders, json.replacer)}

${JSON.parse(request.body.body).currentMessage.content}}`,
    };

    const [predictionResponse] = await googleai.predict(prompt, googleai.getEndpoint({ model: "text-bison-32k" }), {
      maxOutputTokens: 8000,
    });

    if (!predictionResponse?.predictions) {
      throw new Error("No prediction response");
    }

    const prediction = helpers.fromValue((predictionResponse.predictions as protobuf.common.IValue[])[0]);

    const [normalizedChoice] = transformGoogleAIPredictionResponseToStandardChoice(prediction as GoogleAIPrediction);

    return {
      ...normalizedChoice,
      message: {
        ...normalizedChoice.message,
        type: "text",
        label: SquareAPILabel.square_search_orders_request_success,
        hasInnerHtml: true,
      },
    };
  } catch (error) {
    logger.error(error);

    if (
      error instanceof ApiError &&
      error.errors &&
      error.errors?.filter((e) => e.code === "UNAUTHORIZED").length > 0
    ) {
      return square.getSquareAuthChoice(choice);
    }

    throw error;
  }
};

export default search_square_orders;
