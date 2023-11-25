import { FormApi } from "final-form";
import { Dispatch, ReactNode, SetStateAction } from "react";

import { ChatFormValues } from "app/chat/dropbox-chat/DropboxChat.types";

export type FormState = FormApi<Record<string, any>, Partial<Record<string, any>>>;

export type FormContextControllerProps = {
  children: ReactNode;
};

export type FormContextType = {
  setForm: Dispatch<SetStateAction<FormState | undefined>>;
  setCurrentMessageMetadata: Dispatch<SetStateAction<Record<string, any>>>;
  setFieldValue: (field: string, text: string) => void;
  updateTextareaHeight: (id?: string) => { textarea: HTMLTextAreaElement; defaultHeight: string };
  resetTextareaHeight: () => void;
  submit: (values: ChatFormValues) => Promise<void>;
};
