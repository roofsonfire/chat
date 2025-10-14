import { useState } from "react";
import { imageToBase64, validateImageFile } from "@/lib/utils/image-validation";
import { logger } from "@/lib/logger";

export function useImageUpload() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);

  const handleImageChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    setImage: (image: string | null) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset previous error
    setImageError(null);

    // Validate the image file
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setImageError(validation.error || "Invalid image file");
      logger.warn("Image validation failed", { error: validation.error });
      return;
    }

    try {
      const base64Image = await imageToBase64(file);
      setImage(base64Image);
      setImagePreview(base64Image);
    } catch (error) {
      setImageError("Failed to process image");
      logger.error("Error converting image to base64", { error });
    }
  };

  const removeImage = (
    setImage: (image: string | null) => void,
    fileInputRef: React.RefObject<HTMLInputElement | null>
  ) => {
    setImage(null);
    setImagePreview(null);
    setImageError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return {
    imagePreview,
    imageError,
    handleImageChange,
    removeImage,
  };
}
