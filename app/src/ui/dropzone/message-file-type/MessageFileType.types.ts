import { ReactNode } from "react";

import { FileChatCompletionMessage } from "context/message/MessageContext.types";
import { DropzoneFileExtended } from "../Dropzone.types";

export type MessageFilTypeOptionsProps = {
  file: DropzoneFileExtended;
  fieldName: string;
};

export type MessageFileTypeProps = {
  message: FileChatCompletionMessage;
  children?: ReactNode;
  className?: string;
};
