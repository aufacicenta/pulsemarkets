import { Form as RFForm } from "react-final-form";
import { useEffect } from "react";

import { useMessageContext } from "context/message/useMessageContext";
import { useFormContext } from "context/form/useFormContext";
import { useAuthorizationContext } from "context/authorization/useAuthorizationContext";

import { DropboxChat } from "./DropboxChat";
import { ChatFormValues } from "./DropboxChat.types";

export const DropboxChatContainer = () => {
  const messageContext = useMessageContext();

  const formContext = useFormContext();

  const authContext = useAuthorizationContext();

  useEffect(() => {
    messageContext.displayInitialMessage();
  }, []);

  useEffect(() => {
    authContext.verifyDropboxESignAuthorization();
    authContext.verifySquareAPIAuthorization();
  }, []);

  const onSubmit = async (values: ChatFormValues) => {
    formContext.submit(values);
  };

  return (
    <RFForm
      mutators={{
        setValue: ([field, value], state, { changeValue }) => {
          changeValue(state, field, () => value);
        },
      }}
      onSubmit={onSubmit}
      render={({ handleSubmit }) => <DropboxChat onSubmit={handleSubmit} />}
    />
  );
};
