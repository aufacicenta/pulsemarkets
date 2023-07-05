import { ChatGPTAPI, ChatGPTAPIOptions, ChatMessage } from "chatgpt";

export class ChatGPTClient {
  private readonly chatClient: ChatGPTAPI | undefined;

  constructor(clientConfig: ChatGPTAPIOptions) {
    const config = clientConfig ?? {
      apiKey: process.env.OPENAI_API_KEY ?? "",
      completionParams: {
        max_tokens: process.env.CHAT_MAX_TOKENS ?? 200, //@TODO UPDATE THIS
      },
    };

    if (!this.chatClient) {
      this.chatClient = new ChatGPTAPI(config);
    }
  }

  async generatePrompt() {
    if (!this.chatClient) {
      throw new Error("ChatGPT Client has not been initialized");
    }

    try {
      const promptGenerationCriteria = process.env.PROMPT_GEN_CRITERIA ?? "";
      const newPrompt = await this.chatClient?.sendMessage(promptGenerationCriteria);

      return newPrompt;
    } catch (error) {
      //@TODO HANDLE ERROR PROPERLY
    }
  }
}
