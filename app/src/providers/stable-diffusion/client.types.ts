export type StableDiffusionConfigOptions = {
  auth: string;
  baseURL: string;
  modelVersion: string;
};

export type PromptCreationRequestBody = {
  prompt: string;
};
