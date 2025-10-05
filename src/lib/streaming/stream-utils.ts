import { GenerateContentResponse } from "@google-cloud/vertexai";

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
