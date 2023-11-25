import * as DropboxSign from "@dropbox/sign";

import logger from "providers/logger";

import { CreateEmbeddedSignatureRequestArgs } from "./dropbox.types";

const createEmbeddedSignatureRequest = async (
  accessToken: string,
  args: CreateEmbeddedSignatureRequestArgs,
  fileUrls: DropboxSign.SignatureRequestCreateEmbeddedRequest["fileUrls"],
) => {
  logger.info(`createEmbeddedSignatureRequest`);

  const signatureRequestApi = new DropboxSign.SignatureRequestApi();

  signatureRequestApi.accessToken = accessToken;

  const signingOptions: DropboxSign.SubSigningOptions = {
    draw: true,
    type: true,
    upload: true,
    phone: true,
    defaultType: DropboxSign.SubSigningOptions.DefaultTypeEnum.Draw,
  };

  const data: DropboxSign.SignatureRequestCreateEmbeddedRequest = {
    clientId: process.env.DROPBOX_CLIENT_ID!,
    title: args.title,
    subject: args.subject,
    message: args.message,
    signers: args.signers,
    fileUrls,
    signingOptions,
    testMode: true,
  };

  const result = await signatureRequestApi.signatureRequestCreateEmbedded(data);

  return result;
};

export default createEmbeddedSignatureRequest;
