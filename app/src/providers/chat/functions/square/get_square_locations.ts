import { APIChatHeaderKeyNames, FileAgentRequest } from "api/chat/types";
import { NextApiRequest } from "next";
import { ApiError } from "square";

import { ChatCompletionChoice, get_square_locations_args } from "providers/chat/chat.types";
import logger from "providers/logger";
import { SquareAPILabel } from "context/message/MessageContext.types";
import square from "providers/square";

import { SquareGetLocationsMetadata } from "./square.types";

const get_square_locations = async (
  _args: get_square_locations_args,
  choice: ChatCompletionChoice,
  _currentMessage: FileAgentRequest["currentMessage"],
  request: NextApiRequest,
): Promise<ChatCompletionChoice> => {
  try {
    logger.info(`get_square_locations: ${JSON.stringify(_args)}`);

    const accessToken = request.body.headers[APIChatHeaderKeyNames.x_square_access_token] as string;

    if (!accessToken) {
      return square.getSquareAuthChoice(choice);
    }

    const response = await square.getClient(accessToken).locationsApi.listLocations();

    logger.info(response.result);

    if (!response.result.locations) {
      return {
        finish_reason: "function_call",
        index: 0,
        message: {
          role: "assistant",
          content: `You have no Square locations.`,
          type: "text",
          label: SquareAPILabel.square_get_locations_request_success,
        },
      };
    }

    return {
      finish_reason: "function_call",
      index: 0,
      message: {
        role: "assistant",
        type: "text",
        label: SquareAPILabel.square_get_locations_request_success,
        hasInnerHtml: true,
        metadata: {
          locationIds: response.result.locations.map((location) => location.id),
        } as SquareGetLocationsMetadata,
        content: `Here are your all your Square locations:

${response.result.locations
  .map(
    (location) =>
      `### ${location.businessName} (${location.id})
${location.address?.addressLine1 || ""}, ${location.address?.locality || ""} ${
        location.address?.administrativeDistrictLevel1 || ""
      }, ${location.address?.country || ""} ${location.address?.postalCode || ""}.
Status: **${location.status}**`,
  )
  .join("\n\n")}`,
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

export default get_square_locations;
