"use client";

import { useState } from "react";
import { Message } from "@/lib/types";
import { DEFAULT_MODEL_ID } from "@/lib/constants/vertex-ai-models";

export function useChatState() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<string>(DEFAULT_MODEL_ID);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };
  return {
    messages,
    setMessages,
    input,
    setInput,
    handleInputChange,
    isLoading,
    setIsLoading,
    image,
    setImage,
    selectedModel,
    setSelectedModel,
  };
}
