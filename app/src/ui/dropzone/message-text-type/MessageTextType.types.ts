import { ReactNode } from "react";

import { TextChatCompletionMessage } from "context/message/MessageContext.types";

export type MessageTextTypeProps = {
  message: TextChatCompletionMessage;
  children?: ReactNode;
  className?: string;
};
