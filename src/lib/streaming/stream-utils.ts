import { GenerateContentResponse } from "@google-cloud/vertexai";
import { logger } from "@/lib/logger";

/**
 * Stream chunk types for multimodal responses
 */
export interface TextChunk {
  type: "text";
  content: string;
}

export interface ImageChunk {
  type: "image";
  mimeType: string;
  data: string;
}

export type StreamChunk = TextChunk | ImageChunk;

/**
 * Converts a Vertex AI async generator stream into a Web API ReadableStream.
 * Extracts both text and image content from each chunk and streams it to the client.
 *
 * For image generation models (gemini-2.5-flash-image), responses may contain
 * both text and inline_data (images) parts.
 *
 * @param stream - AsyncGenerator from Vertex AI generateContentStream
 * @returns ReadableStream that can be consumed by the Response API
 */
export function toReadableStream(
  stream: AsyncGenerator<GenerateContentResponse>
): ReadableStream {
  let chunkCount = 0;
  let totalTextLength = 0;
  let imageCount = 0;

  return new ReadableStream({
    async start(controller) {
      try {
        logger.debug("Starting stream processing");

        let hasReceivedAnyChunk = false;

        for await (const chunk of stream) {
          hasReceivedAnyChunk = true;
          chunkCount++;

          logger.debug(`Processing chunk ${chunkCount}`, {
            hasCandidates: !!chunk.candidates,
            candidateCount: chunk.candidates?.length,
            finishReason: chunk.candidates?.[0]?.finishReason,
            safetyRatings: chunk.candidates?.[0]?.safetyRatings?.length,
          });

          // Check for finish reason or safety blocks
          const candidate = chunk.candidates?.[0];
          if (candidate?.finishReason && candidate.finishReason !== "STOP") {
            logger.warn("Stream ended with non-STOP finish reason", {
              finishReason: candidate.finishReason,
              safetyRatings: candidate.safetyRatings,
            });
          }

          // Process all parts in the response (may contain multiple text/image parts)
          const parts = chunk.candidates?.[0]?.content?.parts || [];

          if (parts.length === 0) {
            logger.debug(`Chunk ${chunkCount} has no parts`);
            continue;
          }

          logger.debug(`Chunk ${chunkCount} has ${parts.length} parts`);

          for (let i = 0; i < parts.length; i++) {
            const part = parts[i];

            if (!part) {
              logger.debug(
                `Part ${i + 1} from chunk ${chunkCount} is undefined`
              );
              continue;
            }

            // Handle text parts
            if (part.text) {
              totalTextLength += part.text.length;
              logger.debug(
                `Enqueuing text part ${i + 1} from chunk ${chunkCount}`,
                {
                  textLength: part.text.length,
                  totalSoFar: totalTextLength,
                }
              );

              const textChunk: TextChunk = {
                type: "text",
                content: part.text,
              };
              controller.enqueue(JSON.stringify(textChunk) + "\n");
            }

            // Handle image parts (inlineData in camelCase)
            if (part.inlineData) {
              imageCount++;
              logger.info(
                `Enqueuing image part ${i + 1} from chunk ${chunkCount}`,
                {
                  mimeType: part.inlineData.mimeType,
                  dataLength: part.inlineData.data?.length || 0,
                  totalImages: imageCount,
                }
              );

              const imageChunk: ImageChunk = {
                type: "image",
                mimeType: part.inlineData.mimeType || "image/png",
                data: part.inlineData.data || "",
              };
              controller.enqueue(JSON.stringify(imageChunk) + "\n");
            }
          }
        }

        if (!hasReceivedAnyChunk) {
          logger.warn("Stream completed but no chunks were received!");
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

        // Send error message to client
        const errorMessage =
          "\n\n[Error: Stream processing failed. Please try again.]";
        controller.enqueue(errorMessage);
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
}
