"use client";

import { useState, useEffect } from "react";
import { useChat } from "@/lib/hooks/use-chat";
import { ChatHistory } from "./chat-history";
import { MessageInput } from "./message-input";
import { ModelSelector } from "./model-selector";
import { Sparkles } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "next-themes";
import {
  Settings,
  MessageSquare,
  Palette,
  Zap,
  Plus,
  Trash2,
  Search,
} from "lucide-react";

export function Chat() {
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    setImage,
    selectedModel,
    setSelectedModel,
    clearHistory,
  } = useChat();
  const { setTheme } = useTheme();

  const [open, setOpen] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  const exportChat = () => {
    const content = messages.map((m) => `${m.role}: ${m.content}`).join("\n");
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "chat-history.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <SidebarProvider>
      <div
        className="flex h-full w-full flex-col p-4"
        data-testid="chat-container"
      >
        <Card className="mb-4">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem>
                      <BreadcrumbPage>AI Chat Assistant</BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </div>
              <SidebarTrigger />
            </div>
          </CardHeader>
          <div className="p-4 pt-0">
            <ModelSelector
              selectedModel={selectedModel}
              onModelChange={setSelectedModel}
              disabled={isLoading}
            />
          </div>
        </Card>
        <Separator className="my-4" />
        <div className="flex flex-1 flex-col">
          <div className="flex-1 overflow-y-auto">
            <div
              className="mx-auto h-full max-w-3xl pb-4"
              data-testid="chat-history-container"
            >
              <ChatHistory messages={messages} isLoading={isLoading} />
            </div>
          </div>
          <div className="flex-shrink-0">
            <MessageInput
              input={input}
              handleInputChange={handleInputChange}
              handleSubmit={handleSubmit}
              isLoading={isLoading}
              setImage={setImage}
            />
          </div>
        </div>
      </div>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2 px-4 py-2">
            <Settings className="h-5 w-5" />
            <span className="font-semibold">Settings</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="chat-settings">
              <AccordionTrigger className="px-2 py-1 text-sm">
                <div className="flex items-center">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Chat Settings
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-1 pl-6">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button className="hover:bg-accent w-full rounded px-2 py-1 text-left text-sm">
                      Clear History
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Clear Chat History</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently
                        delete all messages in this conversation.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={clearHistory}>
                        Clear History
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                <button
                  className="hover:bg-accent w-full rounded px-2 py-1 text-left text-sm"
                  onClick={exportChat}
                >
                  Export Chat
                </button>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="appearance">
              <AccordionTrigger className="px-2 py-1 text-sm">
                <div className="flex items-center">
                  <Palette className="mr-2 h-4 w-4" />
                  Appearance
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-1 pl-6">
                <button
                  className="hover:bg-accent w-full rounded px-2 py-1 text-left text-sm"
                  onClick={() => setTheme("light")}
                >
                  Light Mode
                </button>
                <button
                  className="hover:bg-accent w-full rounded px-2 py-1 text-left text-sm"
                  onClick={() => setTheme("dark")}
                >
                  Dark Mode
                </button>
                <button
                  className="hover:bg-accent w-full rounded px-2 py-1 text-left text-sm"
                  onClick={() => setTheme("system")}
                >
                  System
                </button>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="performance">
              <AccordionTrigger className="px-2 py-1 text-sm">
                <div className="flex items-center">
                  <Zap className="mr-2 h-4 w-4" />
                  Performance
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-1 pl-6">
                <div className="flex items-center justify-between px-2 py-1">
                  <span className="text-sm">Streaming</span>
                  <Badge variant="secondary">On</Badge>
                </div>
                <div className="flex items-center justify-between px-2 py-1">
                  <span className="text-sm">Cache</span>
                  <Badge variant="secondary">Enabled</Badge>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </SidebarContent>
      </Sidebar>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Chat Actions">
            <CommandItem
              onSelect={() => runCommand(() => console.log("New Chat"))}
            >
              <Plus className="mr-2 h-4 w-4" />
              <span>New Chat</span>
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => console.log("Clear History"))}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              <span>Clear History</span>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Model Selection">
            <CommandItem
              onSelect={() =>
                runCommand(() => setSelectedModel("gemini-2.5-flash-image"))
              }
            >
              <span>Gemini 2.5 Flash</span>
            </CommandItem>
            <CommandItem
              onSelect={() =>
                runCommand(() => setSelectedModel("gemini-1.5-flash-002"))
              }
            >
              <span>Gemini 1.5 Flash</span>
            </CommandItem>
            <CommandItem
              onSelect={() =>
                runCommand(() => setSelectedModel("gemini-1.5-pro-002"))
              }
            >
              <span>Gemini 1.5 Pro</span>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Settings">
            <CommandItem
              onSelect={() => runCommand(() => console.log("Open Settings"))}
            >
              <Settings className="mr-2 h-4 w-4" />
              <span>Open Settings</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </SidebarProvider>
  );
}
