import aiplatform from "@google-cloud/aiplatform";

const { PredictionServiceClient } = aiplatform.v1;
const clientOptions = {
  apiEndpoint: "us-central1-aiplatform.googleapis.com",
};

export const getEndpoint = (opts: { publisher?: string; model?: string; project?: string; location?: string }) => {
  const {
    publisher = "google",
    model = "chat-bison@001",
    project = process.env.GOOGLE_PROJECT_ID,
    location = "aufacicenta.com",
  } = opts;

  return `projects/${project}/locations/${location}/publishers/${publisher}/models/${model}`;
};

const predictionServiceClient = new PredictionServiceClient(clientOptions);

export default predictionServiceClient;
