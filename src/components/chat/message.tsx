import { Message } from "@/lib/types";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  return (
    <div
      className={cn(
        "flex items-start space-x-4",
        message.role === "user" ? "justify-end" : ""
      )}
    >
      <div
        className={cn(
          "rounded-lg px-4 py-2",
          message.role === "user"
            ? "bg-blue-500 text-white"
            : "bg-gray-200 text-gray-900"
        )}
      >
        {message.image && (
          <Image
            src={message.image}
            alt="User uploaded content"
            width={200}
            height={200}
            className="mb-2 rounded-lg"
          />
        )}
        <p>{message.content}</p>
      </div>
    </div>
  );
}
