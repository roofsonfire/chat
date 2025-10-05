/**
 * Utilities for image processing and validation.
 */

/** Maximum allowed file size for images (5MB) */
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

/** Allowed image MIME types */
export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

/**
 * Validates an image file against size and type constraints.
 *
 * @param file - The image file to validate
 * @returns Object with validation result and error message if invalid
 */
export function validateImageFile(file: File): {
  valid: boolean;
  error?: string;
} {
  if (!file.type.startsWith("image/")) {
    return {
      valid: false,
      error: "File must be an image",
    };
  }

  if (
    !ALLOWED_IMAGE_TYPES.includes(
      file.type as (typeof ALLOWED_IMAGE_TYPES)[number]
    )
  ) {
    return {
      valid: false,
      error: `Image type ${file.type} is not supported. Allowed types: ${ALLOWED_IMAGE_TYPES.join(", ")}`,
    };
  }

  if (file.size > MAX_IMAGE_SIZE) {
    return {
      valid: false,
      error: `Image size ${(file.size / 1024 / 1024).toFixed(2)}MB exceeds maximum allowed size of ${MAX_IMAGE_SIZE / 1024 / 1024}MB`,
    };
  }

  return { valid: true };
}

/**
 * Converts a File object to a base64-encoded string.
 * Useful for uploading images to APIs that accept base64 data.
 *
 * @param file - The image file to convert
 * @returns Promise that resolves to a base64-encoded data URL string
 * @throws {Error} When file reading fails
 */
export const imageToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};
