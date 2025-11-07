"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import Textarea from "react-textarea-autosize";
import { ImageIcon, SendIcon, CloseIcon } from "@/components/ui/icons";
import Image from "next/image";
import { useImageUpload } from "@/lib/hooks/use-image-upload";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";

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
  const [uploadProgress, setUploadProgress] = React.useState(0);
  const [isUploading, setIsUploading] = React.useState(false);

  const handleImageChangeWrapper = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setIsUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 100);

    try {
      await handleImageChange(e, setImage);
      setUploadProgress(100);
      setTimeout(() => setIsUploading(false), 500);
    } catch (error) {
      console.error("Image upload failed:", error);
      clearInterval(progressInterval);
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleRemoveImage = () => {
    removeImage(setImage, fileInputRef);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-background p-4"
      data-testid="message-input-form"
    >
      <div className="flex items-center space-x-2">
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
        <Textarea
          value={input}
          onChange={handleInputChange}
          placeholder="Type a message..."
          className="min-h-[40px] flex-1 resize-none bg-transparent focus-within:outline-none"
          rows={1}
          disabled={isLoading}
          aria-label="Message input"
          data-testid="message-input"
        />
        <Button
          type="submit"
          size="icon"
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
      {imageError && (
        <Alert variant="destructive" className="mt-2" data-testid="image-error">
          <AlertDescription>{imageError}</AlertDescription>
        </Alert>
      )}
      {isUploading && (
        <div className="mt-2">
          <div className="text-muted-foreground mb-1 flex items-center justify-between text-sm">
            <span>Uploading image...</span>
            <span>{uploadProgress}%</span>
          </div>
          <Progress value={uploadProgress} className="h-2" />
        </div>
      )}
      {imagePreview && (
        <div className="relative mt-4" data-testid="image-preview-container">
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
    </form>
  );
}
