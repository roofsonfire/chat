import { Message } from "@/lib/types";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn("flex items-start space-x-4", isUser ? "justify-end" : "")}
      role="article"
      aria-label={`${isUser ? "User" : "Assistant"} message`}
    >
      <div
        className={cn(
          "max-w-[80%] rounded-lg px-4 py-2",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground"
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
        <p className="break-words whitespace-pre-wrap">{message.content}</p>
      </div>
    </div>
  );
}
