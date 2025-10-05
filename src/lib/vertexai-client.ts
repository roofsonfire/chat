import { env } from "@/lib/env";
import { VertexAI } from "@google-cloud/vertexai";

const { GOOGLE_PROJECT_ID, GOOGLE_LOCATION } = env;

const vertexAI = new VertexAI({
  project: GOOGLE_PROJECT_ID,
  location: GOOGLE_LOCATION,
});

export const vertexAIClient = vertexAI;
