"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ImageIcon, SendIcon, CloseIcon } from "@/components/ui/icons";
import Image from "next/image";
import { useImageUpload } from "@/lib/hooks/use-image-upload";
import { Input } from "@/components/ui/input";

interface MessageInputProps {
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
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
      className="bg-background border-t p-4 sm:p-6"
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
          <div className="relative h-20 w-20">
            <Image
              src={imagePreview}
              alt="Uploaded image attached to chat message"
              fill
              className="rounded-lg object-cover"
              data-testid="image-preview"
            />
          </div>
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
          className="text-muted-foreground hover:bg-accent absolute top-2.5 left-2 h-10 w-10 transition-all duration-200 hover:scale-110 sm:h-8 sm:w-8"
        >
          <ImageIcon className="h-6 w-6" />
        </Button>
        <Textarea
          value={input}
          onChange={handleInputChange}
          placeholder="Type a message..."
          className="min-h-[40px] resize-none pr-14 pl-14 text-base sm:pr-12 sm:pl-12"
          rows={1}
          disabled={isLoading}
          aria-label="Message input"
          data-testid="message-input"
        />
        <Button
          type="submit"
          size="icon"
          className="hover:bg-primary/90 absolute top-2.5 right-2 h-10 w-10 transition-all duration-200 hover:scale-110 sm:h-8 sm:w-8"
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
