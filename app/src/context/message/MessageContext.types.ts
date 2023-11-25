import { ChatCompletionMessage } from "openai/resources/chat";
import { Dispatch, ReactNode, SetStateAction } from "react";

import { SquareGetLocationsMetadata } from "providers/chat/functions/square/square.types";
import { DropzoneFileExtended } from "ui/dropzone/Dropzone.types";

export enum SquareAPILabel {
  square_get_locations_request_success = "square:get_locations:request:success",
  square_get_locations_request_error = "square:get_locations:request:error",
  square_get_payments_request_success = "square:get_payments:request:success",
  square_get_payments_request_error = "square:get_payments:request:error",
  square_search_orders_request_success = "square:search_orders:request:success",
  square_search_orders_request_error = "square:search_orders:request:error",
  square_request_auth_error = "square:request:auth:error",
}

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
  hasInnerHtml?: boolean; // Setting this to true will render text with Markdown parsing and or HTML parsing such as anchor elements
  readOnly?: boolean;
  type?: "text" | "file";
  label?: DropboxESignLabel | ChatLabel | SquareAPILabel;
  metadata?: SquareGetLocationsMetadata;
};

export type TextChatCompletionMessage = {
  type: "text";
} & ChatMessageBase;

export type FileChatCompletionMessage = {
  type: "file";
  file: DropzoneFileExtended;
} & ChatMessageBase;

export type ChatContextMessage = FileChatCompletionMessage | TextChatCompletionMessage;

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
  last: () => ChatContextMessage;
  displayInitialMessage: () => void;
  clearMessages: () => void;
  saveMessageThread: () => void;
  loadMessageThread: (index: number) => void;
  getMessageById: (id: string) => ChatContextMessage | undefined;
  appendMessage: (message: ChatContextMessage) => ChatContextMessage;
  updateMessage: (message: ChatContextMessage) => ChatContextMessage;
  deleteMessage: (id: ChatContextMessage["id"]) => void;
  transformId: (id: string) => string;
  getPlainMessages: () => Array<Pick<ChatContextMessage, "role" | "content">>;
  extractApiRequestValues: (message: ChatContextMessage) => Pick<ChatContextMessage, "role" | "content">;
};
