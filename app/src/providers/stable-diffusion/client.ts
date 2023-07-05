import axios, { Axios } from "axios";
import { PromptCreationRequestBody, StableDiffusionConfigOptions } from "./client.types";
import { Prediction } from "replicate";

export class StableDiffusionClient {
  private readonly httpClient: Axios | undefined = undefined;
  private readonly clientConfig: StableDiffusionConfigOptions;

  constructor(clientConfig?: StableDiffusionConfigOptions) {
    this.clientConfig = clientConfig ?? {
      baseURL: "https://api.replicate.com/v1",
      auth: process.env.REPLICATE_API_TOKEN ?? "",
      modelVersion: process.env.REPLICATE_MODEL ?? "",
    };

    if (!this.httpClient) {
      this.httpClient = axios.create({
        baseURL: clientConfig?.baseURL,
        headers: {
          Authorization: `Token ${clientConfig?.auth}`,
        },
      });
    }
  }

  async create({ prompt }: PromptCreationRequestBody) {
    if (!this.httpClient) {
      throw new Error("Stable Diffusion HTTP Client has not been initialized");
    }

    try {
      const { clientConfig } = this;

      const predictionResponse = await this.httpClient.post<Prediction>(clientConfig.baseURL, {
        version: clientConfig.modelVersion,
        input: { prompt },
      });

      if (axios.isAxiosError(predictionResponse)) {
        console.error(predictionResponse);
        throw new Error("Error calling Stable Diffusion API");
      }

      return predictionResponse.data;
    } catch (error) {
      //@TODO Handle error properly
    }
  }
}
