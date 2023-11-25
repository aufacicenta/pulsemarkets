import OpenAI from "openai";
import { FileAgentRequest } from "api/chat/types";
import { NextApiRequest } from "next";

import { ChatLabel } from "context/message/MessageContext.types";

import {
  ChatCompletionChoice,
  FunctionCallName,
  extract_content_from_pdf_file_args,
  generate_dropbox_e_signature_request_args,
  get_square_locations_args,
  search_square_orders_args,
  get_square_payments_args,
} from "./chat.types";
import extract_content_from_pdf_file from "./functions/nanonets/extract_content_from_pdf_file";
import generate_dropbox_e_signature_request from "./functions/dropbox/generate_dropbox_e_signature_request";
import get_square_locations from "./functions/square/get_square_locations";
import get_square_payments from "./functions/square/get_square_payments";
import search_square_orders from "./functions/square/search_square_orders";

const processFunctionCalls = (choices: OpenAI.Chat.Completions.ChatCompletion["choices"]) => {
  const functionCalls = choices.filter((choice) => !!choice.message.function_call);

  const promises: Array<
    (currentMessage: FileAgentRequest["currentMessage"], request: NextApiRequest) => Promise<ChatCompletionChoice>
  > = [];

  if (functionCalls.length === 0) {
    return {
      choices: choices.map((choice) => ({
        ...choice,
        message: { ...choice.message, type: "text", label: ChatLabel.chat_completion_success },
      })),
      promises,
    };
  }

  const functions = {
    [FunctionCallName.extract_content_from_pdf_file]:
      (args: extract_content_from_pdf_file_args, choice: ChatCompletionChoice) =>
      (currentMessage: FileAgentRequest["currentMessage"], request: NextApiRequest) =>
        extract_content_from_pdf_file(args, choice, currentMessage, request),
    [FunctionCallName.generate_dropbox_e_signature_request]:
      (args: generate_dropbox_e_signature_request_args, choice: ChatCompletionChoice) =>
      (currentMessage: FileAgentRequest["currentMessage"], request: NextApiRequest) =>
        generate_dropbox_e_signature_request(args, choice, currentMessage, request),
    [FunctionCallName.get_square_locations]:
      (args: get_square_locations_args, choice: ChatCompletionChoice) =>
      (currentMessage: FileAgentRequest["currentMessage"], request: NextApiRequest) =>
        get_square_locations(args, choice, currentMessage, request),
    [FunctionCallName.get_square_payments]:
      (args: get_square_payments_args, choice: ChatCompletionChoice) =>
      (currentMessage: FileAgentRequest["currentMessage"], request: NextApiRequest) =>
        get_square_payments(args, choice, currentMessage, request),
    [FunctionCallName.search_square_orders]:
      (args: search_square_orders_args, choice: ChatCompletionChoice) =>
      (currentMessage: FileAgentRequest["currentMessage"], request: NextApiRequest) =>
        search_square_orders(args, choice, currentMessage, request),
  };

  functionCalls.forEach((choice) => {
    const { arguments: args, name } = choice.message.function_call!;

    promises.push(
      functions[name as FunctionCallName](typeof args === "object" ? args : (JSON.parse(args) as any), {
        ...choice,
        message: { ...choice.message, type: "text" },
      }),
    );
  });

  return { choices, promises };
};

export default processFunctionCalls;
