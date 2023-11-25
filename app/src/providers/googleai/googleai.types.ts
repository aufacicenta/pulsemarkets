export type CandidatesPrediction = { candidates: Array<{ content: string }> };

export type ContentPrediction = { content: string };

export type GoogleAIPrediction = CandidatesPrediction | ContentPrediction;

export type Example = { input: { content: string }; output: { content: string } };

export type ChatPrompt = {
  context: string;
  messages: Array<{ author: string; content: string }>;
  examples?: Example[];
};

export type TextPrompt = { prompt: string };

export type Prompt = ChatPrompt | TextPrompt;

export type Endpoint = {
  publisher: string;
  model: string;
  project: string;
  location: string;
};
