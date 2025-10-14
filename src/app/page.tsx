import { Chat } from "@/components/chat";
import { ChatLayout } from "@/components/chat/chat-layout";
import { ErrorBoundary } from "@/components/error-boundary";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center px-4 sm:px-6 lg:px-8">
          <h1 className="text-xl font-bold">AI Chat Assistant</h1>
        </div>
      </header>
      <ErrorBoundary>
        <ChatLayout>
          <Chat />
        </ChatLayout>
      </ErrorBoundary>
    </div>
  );
}
