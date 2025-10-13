import { VertexAIError } from ".";

export function handleVertexAIError(error: Error, modelId?: string): never {
  if (error.message.includes("403")) {
    throw new VertexAIError(
      "Access denied. Please check your API permissions for the selected model."
    );
  } else if (error.message.includes("404")) {
    throw new VertexAIError(
      `Model '${modelId}' not found. Please verify the model name.`
    );
  } else if (error.message.includes("400")) {
    throw new VertexAIError("Invalid request. Please check your input format.");
  } else if (error.message.includes("429")) {
    throw new VertexAIError(
      "Rate limit exceeded. Please wait a moment before trying again."
    );
  }

  throw new VertexAIError();
}
