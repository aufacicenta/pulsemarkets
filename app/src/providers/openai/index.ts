import OpenAI from "openai";

const MAX_TOKENS = 4097;

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const model = "gpt-3.5-turbo";

export default { client, model, MAX_TOKENS };
