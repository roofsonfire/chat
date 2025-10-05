"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ImageIcon, SendIcon, CloseIcon } from "@/components/ui/icons";
import { imageToBase64, validateImageFile } from "@/lib/utils/image-validation";
import Image from "next/image";
import { logger } from "@/lib/logger";

interface MessageInputProps {
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
  setImage: (image: string | null) => void;
}

export function MessageInput({
  input,
  handleInputChange,
  handleSubmit,
  isLoading,
  setImage,
}: MessageInputProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset previous error
    setImageError(null);

    // Validate the image file
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setImageError(validation.error || "Invalid image file");
      logger.warn("Image validation failed", { error: validation.error });
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
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

  const handleRemoveImage = () => {
    setImage(null);
    setImagePreview(null);
    setImageError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-background border-t p-4">
      {imageError && (
        <div className="bg-destructive/10 text-destructive mb-2 rounded-md p-2 text-sm">
          {imageError}
        </div>
      )}
      {imagePreview && (
        <div className="relative mb-4">
          <Image
            src={imagePreview}
            alt="Image preview"
            width={80}
            height={80}
            className="rounded-lg"
          />
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="absolute top-0 right-0"
            onClick={handleRemoveImage}
            aria-label="Remove image"
          >
            <CloseIcon className="h-6 w-6" />
          </Button>
        </div>
      )}
      <div className="relative">
        <Input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleImageChange}
          className="hidden"
          id="image-upload"
          aria-label="Upload image"
        />
        <label htmlFor="image-upload">
          <Button
            type="button"
            size="icon"
            variant="ghost"
            asChild
            aria-label="Attach image"
          >
            <span className="cursor-pointer">
              <ImageIcon className="h-6 w-6" />
            </span>
          </Button>
        </label>
        <Input
          value={input}
          onChange={handleInputChange}
          placeholder="Type a message..."
          className="pr-12 pl-12"
          disabled={isLoading}
          aria-label="Message input"
        />
        <Button
          type="submit"
          size="icon"
          className="absolute top-1/2 right-2 -translate-y-1/2"
          disabled={isLoading}
          aria-label="Send message"
        >
          <SendIcon className="h-6 w-6" />
        </Button>
      </div>
    </form>
  );
}
