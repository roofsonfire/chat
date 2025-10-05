import { GenerateContentResponse } from "@google-cloud/vertexai";

/**
 * Converts a Vertex AI async generator stream into a Web API ReadableStream.
 * Extracts text content from each chunk and streams it to the client.
 *
 * @param stream - AsyncGenerator from Vertex AI generateContentStream
 * @returns ReadableStream that can be consumed by the Response API
 */
export function toReadableStream(
  stream: AsyncGenerator<GenerateContentResponse>
): ReadableStream {
  return new ReadableStream({
    async pull(controller) {
      for await (const chunk of stream) {
        const text = chunk.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          controller.enqueue(text);
        }
      }
      controller.close();
    },
  });
}
