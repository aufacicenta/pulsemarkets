/* eslint-disable no-restricted-syntax */
import { FileAgentRequest } from "api/chat/types";

import { ChatPrompt, Prompt } from "./googleai.types";

const convertFileAgentRequestMessagesToValidPrompt = (
  data: FileAgentRequest,
  partialPrompt: Pick<ChatPrompt, "context" | "examples">,
): Prompt => {
  const messages = data.messages.map((message) => ({ author: message.role, content: message.content! }));

  messages.push({ author: data.currentMessage.role, content: data.currentMessage.content! });

  if (messages.length === 1) {
    return {
      ...partialPrompt,
      messages,
    } as ChatPrompt;
  }

  const inputMessages: Array<{ author: string; content: string }> = [];

  messages.reduce((acc, curr, index, arr) => {
    inputMessages.push(curr);

    const next = arr[index + 1];

    if (!next) {
      return acc;
    }

    const bothAreUsers = curr.author === "user" && next.author === "user";

    if (bothAreUsers) {
      inputMessages.push({ author: "assistant", content: "Continue the conversation..." });
    }

    return curr;
  }, messages[0]);

  return {
    ...partialPrompt,
    messages: inputMessages,
  } as ChatPrompt;
};

export default convertFileAgentRequestMessagesToValidPrompt;
