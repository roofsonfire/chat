import { VertexAI, GenerateContentRequest, Part } from "@google-cloud/vertexai";
import { Message } from "@/lib/types";
import { env } from "@/lib/env";

export class ChatService {
  private vertexAI: VertexAI;

  constructor() {
    this.vertexAI = new VertexAI({
      project: env.GOOGLE_PROJECT_ID,
      location: env.GOOGLE_LOCATION,
    });
  }

  async stream(messages: Message[]) {
    const generativeModel = this.vertexAI.getGenerativeModel({
      model: "gemini-1.5-flash-001",
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

    const streamingResp = await generativeModel.generateContentStream(req);
    return streamingResp.stream;
  }
}
