import * as DropboxSign from "@dropbox/sign";

export type CreateEmbeddedSignatureRequestArgs = Pick<
  DropboxSign.SignatureRequestCreateEmbeddedRequest,
  "title" | "subject" | "message" | "signers"
>;
