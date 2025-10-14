import {
  VertexAI,
  GenerateContentRequest,
  Part,
  GenerativeModel,
} from "@google-cloud/vertexai";
import { Message, UserMessage } from "@/lib/types";
import { env } from "@/lib/env";
import { logger } from "../logger";
import { DEFAULT_MODEL_ID } from "@/lib/constants/vertex-ai-models";
import { handleVertexAIError } from "@/lib/errors/vertex-ai-errors";

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
   * Prepares the content request from messages for Vertex AI.
   */
  private _prepareContentRequest(messages: Message[]): GenerateContentRequest {
    const contents = messages.map((message, index) => {
      const parts: Part[] = [{ text: message.content }];

      // Only user messages can have images
      if (message.role === "user" && (message as UserMessage).image) {
        const userMessage = message as UserMessage;
        logger.debug(`Processing image for message ${index}`, {
          hasImage: true,
          imageLength: userMessage.image!.length,
        });

        const imageParts = userMessage.image!.split(",");
        if (imageParts.length > 1 && imageParts[1]) {
          const mimeTypeMatch = imageParts[0]?.match(/data:([^;]+)/);
          const mimeType = mimeTypeMatch?.[1] || "image/jpeg";

          logger.debug(`Image details for message ${index}`, {
            mimeType,
            base64Length: imageParts[1].length,
          });

          parts.push({
            inlineData: {
              mimeType,
              data: imageParts[1],
            },
          });
        } else {
          logger.warn(`Invalid image format for message ${index}`);
        }
      }

      return {
        role: message.role,
        parts,
      };
    });

    return { contents };
  }

  /**
   * Sets up common streaming parameters and logs the request.
   */
  private _setupStream(
    messages: Message[],
    modelId?: string
  ): {
    generativeModel: GenerativeModel;
    req: GenerateContentRequest;
    selectedModelId: string;
    messageCount: number;
    hasImages: boolean;
  } {
    const selectedModelId =
      modelId || env.GOOGLE_VERTEX_AI_MODEL_ID || DEFAULT_MODEL_ID;
    const generativeModel = this.vertexAI.getGenerativeModel({
      model: selectedModelId,
    });
    const req = this._prepareContentRequest(messages);
    const messageCount = messages.length;
    const hasImages = messages.some(
      (m) => m.role === "user" && (m as UserMessage).image
    );

    logger.info("Starting chat stream", {
      modelId: selectedModelId,
      messageCount,
      hasImages,
    });

    logger.debug("Sending request to Vertex AI", {
      contentCount: req.contents.length,
      partsPerContent: req.contents.map((c) => c.parts.length),
    });

    return { generativeModel, req, selectedModelId, messageCount, hasImages };
  }

  /**
   * Streams responses from the AI model for a given conversation.
   * Supports both text and image inputs.
   *
   * @param messages - Array of conversation messages with roles and content
   * @param modelId - The Vertex AI model to use (defaults to env variable or DEFAULT_MODEL_ID)
   * @returns AsyncGenerator for streaming text responses
   * @throws {VertexAIError} When the AI service fails to respond
   */
  async stream(messages: Message[], modelId?: string) {
    const { generativeModel, req, selectedModelId, messageCount, hasImages } =
      this._setupStream(messages, modelId);

    try {
      const resp = await generativeModel.generateContentStream(req);
      logger.info("Successfully initialized stream from Vertex AI");
      return resp.stream;
    } catch (error) {
      logger.error("Error streaming from Vertex AI", {
        error,
        modelId: selectedModelId,
        messageCount,
        hasImages,
      });
      handleVertexAIError(error as Error, selectedModelId);
    }
  }

  async streamToReadable(
    messages: Message[],
    modelId?: string
  ): Promise<ReadableStream> {
    const { generativeModel, req, selectedModelId, messageCount, hasImages } =
      this._setupStream(messages, modelId);

    try {
      const resp = await generativeModel.generateContentStream(req);
      logger.info("Successfully initialized stream from Vertex AI");

      let chunkCount = 0;
      let totalTextLength = 0;
      let imageCount = 0;

      const readableStream = new ReadableStream({
        async start(controller) {
          try {
            logger.debug("Starting stream processing");

            for await (const chunk of resp.stream) {
              chunkCount++;

              logger.debug(`Processing chunk ${chunkCount}`, {
                hasCandidates: !!chunk.candidates,
                candidateCount: chunk.candidates?.length,
                finishReason: chunk.candidates?.[0]?.finishReason,
              });

              const parts = chunk.candidates?.[0]?.content?.parts || [];

              if (parts.length === 0) {
                logger.debug(`Chunk ${chunkCount} has no parts`);
                continue;
              }

              logger.debug(`Chunk ${chunkCount} has ${parts.length} parts`);

              for (const part of parts) {
                if (!part) continue;

                if (part.text) {
                  totalTextLength += part.text.length;
                  logger.debug(`Enqueuing text part from chunk ${chunkCount}`, {
                    textLength: part.text.length,
                    totalSoFar: totalTextLength,
                  });

                  const textChunk = {
                    type: "text" as const,
                    content: part.text,
                  };
                  controller.enqueue(JSON.stringify(textChunk) + "\n");
                }

                if (part.inlineData) {
                  imageCount++;
                  logger.info(`Enqueuing image part from chunk ${chunkCount}`, {
                    mimeType: part.inlineData.mimeType,
                    dataLength: part.inlineData.data?.length || 0,
                    totalImages: imageCount,
                  });

                  const imageChunk = {
                    type: "image" as const,
                    mimeType: part.inlineData.mimeType || "image/png",
                    data: part.inlineData.data || "",
                  };
                  controller.enqueue(JSON.stringify(imageChunk) + "\n");
                }
              }
            }

            logger.info("Stream completed successfully", {
              totalChunks: chunkCount,
              totalTextLength,
              totalImages: imageCount,
            });

            controller.close();
          } catch (error) {
            logger.error("Error in stream processing", {
              error,
              chunksProcessed: chunkCount,
              totalTextLength,
              totalImages: imageCount,
            });

            const errorMessage =
              "\n\n[Error: Stream processing failed. Please try again.]";
            controller.enqueue(
              JSON.stringify({ type: "text", content: errorMessage }) + "\n"
            );
            controller.close();
          }
        },

        cancel(reason) {
          logger.info("Stream cancelled by client", {
            reason,
            chunksProcessed: chunkCount,
          });
        },
      });

      resp.response.catch((err: unknown) => {
        logger.debug("Suppressed SDK aggregation error (expected)", {
          errorMessage: (err as Error)?.message || String(err),
        });
      });

      return readableStream;
    } catch (error) {
      logger.error("Error streaming from Vertex AI", {
        error,
        modelId: selectedModelId,
        messageCount,
        hasImages,
      });
      handleVertexAIError(error as Error, selectedModelId);
    }
  }
}
