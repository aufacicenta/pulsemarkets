import { ChatCompletionMessage } from "openai/resources/chat";
import { Dispatch, ReactNode, SetStateAction } from "react";

import { DropzoneFileExtended } from "ui/dropzone/Dropzone.types";

export enum DropboxESignLabel {
  dropbox_esign_request_success = "dropbox:esign:request:success",
  dropbox_esign_request_error = "dropbox:esign:request:error",
  dropbox_esign_unauthorized = "dropbox:esign:unauthorized",
}

export enum ChatLabel {
  chat_extract_pdf_success = "chat:extract:pdf:success",
  chat_extract_pdf_error = "chat:extract:pdf:error",
  chat_completion_success = "chat:completion:success",
  chat_completion_error = "chat:completion:error",
}

export type ChatMessageBase = ChatCompletionMessage & {
  id?: string;
  beforeContentComponent?: ReactNode;
  afterContentComponent?: ReactNode;
  hasInnerHtml?: boolean;
  type?: "text" | "readonly" | "file";
  label?: DropboxESignLabel | ChatLabel;
};

export type TextChatCompletionMessage = {
  type: "text";
} & ChatMessageBase;

export type ReadOnlyChatCompletionMessage = {
  type: "readonly";
} & ChatMessageBase;

export type FileChatCompletionMessage = {
  type: "file";
  file: DropzoneFileExtended;
} & ChatMessageBase;

export type ChatContextMessage = FileChatCompletionMessage | TextChatCompletionMessage | ReadOnlyChatCompletionMessage;

export type MessageContextActions = {
  isProcessingRequest: boolean;
};

export type MessageContextControllerProps = {
  children: ReactNode;
};

export type MessageContextType = {
  messages: Array<ChatContextMessage>;
  actions: MessageContextActions;
  setActions: Dispatch<SetStateAction<MessageContextActions>>;
  displayInitialMessage: () => void;
  appendMessage: (message: ChatContextMessage) => ChatContextMessage;
  updateMessage: (message: ChatContextMessage) => ChatContextMessage;
  deleteMessage: (id: ChatContextMessage["id"]) => void;
  transformId: (id: string) => string;
  getPlainMessages: () => Array<Pick<ChatContextMessage, "role" | "content">>;
  extractApiRequestValues: (message: ChatContextMessage) => Pick<ChatContextMessage, "role" | "content">;
};
