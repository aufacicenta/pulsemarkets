import { FunctionCallName } from "providers/chat/chat.types";
import { Example } from "providers/googleai/googleai.types";

export const examples: Example[] = [
  {
    input: { content: "List all my Square locations" },
    output: {
      content: `{"function_call": { "name": "${FunctionCallName.get_square_locations}", "arguments": {} }`,
    },
  },
  {
    input: { content: "Get all my square orders of this month" },
    output: {
      content: `{"function_call": { "name": "${FunctionCallName.search_square_orders}", "arguments": { "date_time_filter": { "created_at": { "start_at": "YYYYMMDD" } } } } }`,
    },
  },
  {
    input: { content: "Get all my square payments of this year" },
    output: {
      content: `{"function_call": { "name": "${FunctionCallName.get_square_payments}", "arguments": { "begin_time": "YYYYMMDD", "end_time": "YYYYMMDD" } } }`,
    },
  },
  {
    input: { content: "What's the total amount of my last square payments of this month" },
    output: {
      content: `{"function_call": { "name": "${FunctionCallName.get_square_payments}", "arguments": { "begin_time": "YYYYMMDD", "end_time": "YYYYMMDD" } } }`,
    },
  },
  {
    input: { content: "Only if there is a .pdf extension, get the full text of the file and explain it." },
    output: {
      content: `{"function_call": { "name": "${FunctionCallName.extract_content_from_pdf_file}", "arguments": { "file_name": "The name of a PDF file, e.g. a-file.pdf" } } }`,
    },
  },
  {
    input: {
      content: "Call this function if the file is a PDF and you want to generate a Dropbox e-signature request.",
    },
    output: {
      content: `{"function_call": { "name": "${FunctionCallName.generate_dropbox_e_signature_request}", "arguments": { "file_name": "The name of a PDF file, e.g. a-file.pdf", "title": "The title of the embedded signature request.", "subject": "The subject of the embedded signature request.", "message": "The message of the embedded signature request.", "signers": "Comma separated emails of signers. eg. Name Lastname [email@email.com]" } } }`,
    },
  },
];
