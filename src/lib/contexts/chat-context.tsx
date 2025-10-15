"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface ChatContextType {
  selectedModel: string;
  setSelectedModel: (model: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [selectedModel, setSelectedModel] = useState("gemini-1.5-flash-002");

  return (
    <ChatContext.Provider value={{ selectedModel, setSelectedModel }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChatContext must be used within a ChatProvider");
  }
  return context;
}
