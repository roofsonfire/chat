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
