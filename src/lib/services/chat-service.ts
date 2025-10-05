import { VertexAI, GenerateContentRequest, Part } from "@google-cloud/vertexai";
import { Message } from "@/lib/types";
import { env } from "@/lib/env";
import { VertexAIError } from "../errors";
import { logger } from "../logger";

/**
 * Service class for handling chat interactions with Google Vertex AI.
 * Provides streaming responses for multimodal conversations.
 */
export class ChatService {
  private vertexAI: VertexAI;

  constructor() {
    this.vertexAI = new VertexAI({
      project: env.GOOGLE_PROJECT_ID,
      location: env.GOOGLE_LOCATION,
    });
  }

  /**
   * Streams responses from the AI model for a given conversation.
   * Supports both text and image inputs.
   *
   * @param messages - Array of conversation messages with roles and content
   * @returns AsyncGenerator for streaming text responses
   * @throws {VertexAIError} When the AI service fails to respond
   */
  async stream(messages: Message[]) {
    const generativeModel = this.vertexAI.getGenerativeModel({
      model: env.GOOGLE_VERTEX_AI_MODEL_ID,
    });

    const contents = messages.map((message) => {
      const parts: Part[] = [{ text: message.content }];
      if (message.image) {
        const imageParts = message.image.split(",");
        if (imageParts.length > 1 && imageParts[1]) {
          parts.push({
            inlineData: {
              mimeType: "image/jpeg",
              data: imageParts[1],
            },
          });
        }
      }
      return {
        role: message.role,
        parts,
      };
    });

    const req: GenerateContentRequest = {
      contents,
    };

    try {
      const streamingResp = await generativeModel.generateContentStream(req);
      return streamingResp.stream;
    } catch (error) {
      logger.error("Error streaming from Vertex AI", { error });
      throw new VertexAIError();
    }
  }
}
