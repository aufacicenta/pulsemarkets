import { ReactNode } from "react";

export enum FormFieldNames {
  message = "message",
}

export type ChatFormValues = {
  message: string;
};

export type DropboxChatContainerProps = {
  children?: ReactNode;
  className?: string;
};

export type DropboxChatProps = {
  onSubmit: (event?: Partial<Pick<React.SyntheticEvent, "preventDefault" | "stopPropagation">>) =>
    | Promise<
        | {
            [key: string]: any;
          }
        | undefined
      >
    | undefined;
  children?: ReactNode;
  className?: string;
};
