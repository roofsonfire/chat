import { VertexAI, GenerateContentRequest, Part } from "@google-cloud/vertexai";
import { Message } from "@/lib/types";
import { env } from "@/lib/env";
import { VertexAIError } from "../errors";
import { logger } from "../logger";
import { DEFAULT_MODEL_ID } from "@/lib/constants/vertex-ai-models";

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
   * @param modelId - The Vertex AI model to use (defaults to env variable or DEFAULT_MODEL_ID)
   * @returns AsyncGenerator for streaming text responses
   * @throws {VertexAIError} When the AI service fails to respond
   */
  async stream(messages: Message[], modelId?: string) {
    const selectedModelId =
      modelId || env.GOOGLE_VERTEX_AI_MODEL_ID || DEFAULT_MODEL_ID;

    logger.info("Starting chat stream", {
      modelId: selectedModelId,
      messageCount: messages.length,
      hasImages: messages.some((m) => m.image),
    });

    const generativeModel = this.vertexAI.getGenerativeModel({
      model: selectedModelId,
    });

    const contents = messages.map((message, index) => {
      const parts: Part[] = [{ text: message.content }];

      if (message.image) {
        logger.debug(`Processing image for message ${index}`, {
          hasImage: true,
          imageLength: message.image.length,
        });

        const imageParts = message.image.split(",");
        if (imageParts.length > 1 && imageParts[1]) {
          // Extract MIME type from data URL (e.g., "data:image/jpeg;base64")
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

    const req: GenerateContentRequest = {
      contents,
    };

    logger.debug("Sending request to Vertex AI", {
      contentCount: contents.length,
      partsPerContent: contents.map((c) => c.parts.length),
    });

    try {
      const streamingResp = await generativeModel.generateContentStream(req);
      logger.info("Successfully initialized stream from Vertex AI");
      return streamingResp.stream;
    } catch (error) {
      logger.error("Error streaming from Vertex AI", {
        error,
        modelId: selectedModelId,
        messageCount: messages.length,
        hasImages: messages.some((m) => m.image),
      });

      // Provide more specific error messages
      if (error instanceof Error) {
        if (error.message.includes("403")) {
          throw new VertexAIError(
            "Access denied. Please check your API permissions for the selected model."
          );
        } else if (error.message.includes("404")) {
          throw new VertexAIError(
            `Model '${selectedModelId}' not found. Please verify the model name.`
          );
        } else if (error.message.includes("400")) {
          throw new VertexAIError(
            "Invalid request. Please check your input format."
          );
        } else if (error.message.includes("429")) {
          throw new VertexAIError(
            "Rate limit exceeded. Please wait a moment before trying again."
          );
        }
      }

      throw new VertexAIError();
    }
  }

  /**
   * Streams responses from the AI model and converts to a ReadableStream.
   * This method properly handles the stream lifecycle to avoid aggregation errors.
   *
   * @param messages - Array of conversation messages with roles and content
   * @param modelId - The Vertex AI model to use (defaults to env variable or DEFAULT_MODEL_ID)
   * @returns ReadableStream for HTTP response streaming
   * @throws {VertexAIError} When the AI service fails to respond
   */
  async streamToReadable(
    messages: Message[],
    modelId?: string
  ): Promise<ReadableStream> {
    const selectedModelId =
      modelId || env.GOOGLE_VERTEX_AI_MODEL_ID || DEFAULT_MODEL_ID;

    logger.info("Starting chat stream", {
      modelId: selectedModelId,
      messageCount: messages.length,
      hasImages: messages.some((m) => m.image),
    });

    const generativeModel = this.vertexAI.getGenerativeModel({
      model: selectedModelId,
    });

    const contents = messages.map((message, index) => {
      const parts: Part[] = [{ text: message.content }];

      if (message.image) {
        logger.debug(`Processing image for message ${index}`, {
          hasImage: true,
          imageLength: message.image.length,
        });

        const imageParts = message.image.split(",");
        if (imageParts.length > 1 && imageParts[1]) {
          // Extract MIME type from data URL (e.g., "data:image/jpeg;base64")
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

    const req: GenerateContentRequest = {
      contents,
    };

    logger.debug("Sending request to Vertex AI", {
      contentCount: contents.length,
      partsPerContent: contents.map((c) => c.parts.length),
    });

    try {
      const streamingResp = await generativeModel.generateContentStream(req);
      logger.info("Successfully initialized stream from Vertex AI");

      // Create ReadableStream directly from the streaming response
      // We'll manually iterate and convert to avoid double-consumption
      let chunkCount = 0;
      let totalTextLength = 0;
      let imageCount = 0;

      const readableStream = new ReadableStream({
        async start(controller) {
          try {
            logger.debug("Starting stream processing");

            // Use the stream from the response
            for await (const chunk of streamingResp.stream) {
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

                // Handle text parts
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

                // Handle image parts
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

      // Suppress SDK's internal aggregation attempt
      streamingResp.response.catch((err) => {
        logger.debug("Suppressed SDK aggregation error (expected)", {
          errorMessage: err?.message || String(err),
        });
      });

      return readableStream;
    } catch (error) {
      logger.error("Error streaming from Vertex AI", {
        error,
        modelId: selectedModelId,
        messageCount: messages.length,
        hasImages: messages.some((m) => m.image),
      });

      // Provide more specific error messages
      if (error instanceof Error) {
        if (error.message.includes("403")) {
          throw new VertexAIError(
            "Access denied. Please check your API permissions for the selected model."
          );
        } else if (error.message.includes("404")) {
          throw new VertexAIError(
            `Model '${selectedModelId}' not found. Please verify the model name.`
          );
        } else if (error.message.includes("400")) {
          throw new VertexAIError(
            "Invalid request. Please check your input format."
          );
        } else if (error.message.includes("429")) {
          throw new VertexAIError(
            "Rate limit exceeded. Please wait a moment before trying again."
          );
        }
      }

      throw new VertexAIError();
    }
  }
}
