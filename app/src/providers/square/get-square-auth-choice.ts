import { SquareAPILabel } from "context/message/MessageContext.types";
import { ChatCompletionChoice } from "providers/chat/chat.types";

const scopes = ["MERCHANT_PROFILE_READ", "ORDERS_READ", "PAYMENTS_READ"].join("+");
const endpoint = process.env.SQUARE_OAUTH_ENDPOINT as string;

const getSquareAuthChoice = (choice: ChatCompletionChoice): ChatCompletionChoice => ({
  ...choice,
  message: {
    ...choice.message,
    content: `You need to connect your Square account first: <a href="${endpoint}?client_id=${
      process.env.SQUARE_APP_ID
    }&scope=${scopes}&session=false&state=${Date.now()}">Click to authorize</a>.`,
    hasInnerHtml: true,
    readOnly: true,
    type: "text",
    label: SquareAPILabel.square_request_auth_error,
  },
});

export default getSquareAuthChoice;
