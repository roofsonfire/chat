"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ImageIcon, SendIcon, CloseIcon } from "@/components/ui/icons";
import Image from "next/image";
import { useImageUpload } from "@/lib/hooks/use-image-upload";

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
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const { imagePreview, imageError, handleImageChange, removeImage } =
    useImageUpload();

  const handleImageChangeWrapper = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleImageChange(e, setImage);
  };

  const handleRemoveImage = () => {
    removeImage(setImage, fileInputRef);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-background border-t p-4"
      data-testid="message-input-form"
    >
      {imageError && (
        <div
          className="bg-destructive/10 text-destructive mb-2 rounded-md p-2 text-sm"
          data-testid="image-error"
        >
          {imageError}
        </div>
      )}
      {imagePreview && (
        <div className="relative mb-4" data-testid="image-preview-container">
          <Image
            src={imagePreview}
            alt="Uploaded image attached to chat message"
            width={80}
            height={80}
            className="rounded-lg"
            data-testid="image-preview"
          />
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="absolute top-0 right-0"
            onClick={handleRemoveImage}
            aria-label="Remove image"
            data-testid="remove-image-button"
          >
            <CloseIcon className="h-6 w-6" />
          </Button>
        </div>
      )}
      <div className="relative">
        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={() => fileInputRef.current?.click()}
          aria-label="Attach image"
          data-testid="attach-image-button"
        >
          <ImageIcon className="h-6 w-6" />
        </Button>
        <Input
          value={input}
          onChange={handleInputChange}
          placeholder="Type a message..."
          className="pr-12 pl-12"
          disabled={isLoading}
          aria-label="Message input"
          data-testid="message-input"
        />
        <Button
          type="submit"
          size="icon"
          className="absolute top-1/2 right-2 -translate-y-1/2"
          disabled={isLoading}
          aria-label="Send message"
          data-testid="send-message-button"
        >
          <SendIcon className="h-6 w-6" />
        </Button>
        <Input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleImageChangeWrapper}
          className="hidden"
          id="image-upload"
          aria-label="Upload image"
          data-testid="image-upload-input"
        />
      </div>
    </form>
  );
}
