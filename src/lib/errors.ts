export class AppError extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class VertexAIError extends AppError {
  constructor(
    message = "An unexpected error occurred with the Vertex AI service."
  ) {
    super(message, 500);
    Object.setPrototypeOf(this, VertexAIError.prototype);
  }
}
