import { FunctionCallName } from "providers/chat/chat.types";

export default [
  {
    name: FunctionCallName.extract_content_from_pdf_file,
    description: "Only if there is a .pdf extension, get the full text of the file and explain it.",
    parameters: {
      type: "object",
      properties: {
        file_name: {
          type: "string",
          description: "The name of a PDF file, e.g. a-file.pdf",
        },
        unit: { type: "string" },
      },
      required: ["file_name"],
    },
  },
  {
    name: FunctionCallName.generate_dropbox_e_signature_request,
    description: "Call this function if the file is a PDF and you want to generate a Dropbox e-signature request.",
    parameters: {
      type: "object",
      properties: {
        file_name: {
          type: "string",
          description: "The name of a PDF file, e.g. a-file.pdf",
        },
        title: {
          type: "string",
          description: "The title of the embedded signature request.",
        },
        subject: {
          type: "string",
          description: "The subject of the embedded signature request.",
        },
        message: {
          type: "string",
          description: "The message of the embedded signature request.",
        },
        signers: {
          type: "string",
          description: "Comma separated emails of signers. eg. Name Lastname [email@email.com]",
        },
        unit: { type: "string" },
      },
      required: ["file_name", "title", "subject", "message", "signers"],
    },
  },
];
