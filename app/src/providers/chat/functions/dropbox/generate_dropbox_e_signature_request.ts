import { APIChatHeaderKeyNames, FileAgentRequest } from "api/chat/types";
import { NextApiRequest } from "next";
import { HttpError } from "@dropbox/sign";

import { ChatCompletionChoice, generate_dropbox_e_signature_request_args } from "providers/chat/chat.types";
import logger from "providers/logger";
import supabase from "providers/supabase";
import dropbox from "providers/dropbox";
import { CreateEmbeddedSignatureRequestArgs } from "providers/dropbox/dropbox.types";
import { DropboxESignLabel } from "context/message/MessageContext.types";

const generate_dropbox_e_signature_request = async (
  args: generate_dropbox_e_signature_request_args,
  choice: ChatCompletionChoice,
  _currentMessage: FileAgentRequest["currentMessage"],
  request: NextApiRequest,
): Promise<ChatCompletionChoice> => {
  try {
    logger.info(`generate_dropbox_e_signature_request: ${args}`);

    const accessToken = request.body.headers[APIChatHeaderKeyNames.x_dropbox_access_token] as string;

    const embeddedSignatureRequestArgs: CreateEmbeddedSignatureRequestArgs = {
      title: args.title,
      subject: args.subject,
      message: args.message,
      signers: args.signers.split(",").map((signer) => {
        const [name, email] = signer.split("[");

        return {
          name: name.trim(),
          emailAddress: email.replace("]", "").trim(),
        };
      }),
    };

    const body = JSON.parse(request.body.body);

    const bucketName = body.currentMessageMetadata?.bucketName;

    const { signedUrl } = await supabase.storage.createSignedURL(bucketName!, args.file_name, 60);

    const fileUrls = [signedUrl];

    const result = await dropbox.createEmbeddedSignatureRequest(accessToken, embeddedSignatureRequestArgs, fileUrls);

    return {
      finish_reason: "function_call",
      index: 0,
      message: {
        role: "assistant",
        content: `A Dropbox Sign™ request was created for "**${args.file_name}**".

[Click to manage this request](${result.body.signatureRequest?.detailsUrl}).

Is there anything else I can do for you?`,
        type: "text",
        hasInnerHtml: true,
        label: DropboxESignLabel.dropbox_esign_request_success,
      },
    };
  } catch (error) {
    logger.error(error);

    if (
      (error as HttpError)?.body?.error?.errorName === "unauthorized" ||
      (error as HttpError)?.body?.error?.errorName === "invalid_grant"
    ) {
      return {
        ...choice,
        message: {
          ...choice.message,
          content: `You need to connect your Dropbox account first: <a href="https://app.hellosign.com/oauth/authorize?response_type=code&client_id=${
            process.env.DROPBOX_CLIENT_ID
          }&state=${Date.now()}&redirect_uri=${process.env.DROPBOX_REDIRECT_URI}">Click to authorize</a>.`,
          hasInnerHtml: true,
          readOnly: true,
          type: "text",
          label: DropboxESignLabel.dropbox_esign_unauthorized,
        },
      };
    }

    if ((error as HttpError)?.body?.error?.errorMsg) {
      return {
        ...choice,
        message: {
          ...choice.message,
          content: (error as HttpError)?.body?.error?.errorMsg,
          readOnly: true,
          type: "text",
          label: DropboxESignLabel.dropbox_esign_request_error,
        },
      };
    }

    throw error;
  }
};

export default generate_dropbox_e_signature_request;
