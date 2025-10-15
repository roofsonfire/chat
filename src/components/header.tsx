import { Bot } from "lucide-react";

interface HeaderProps {
  selectedModel?: string;
  onModelChange?: (modelId: string) => void;
}

export function Header({ selectedModel, onModelChange }: HeaderProps) {
  return (
    <header className="border-muted bg-background border-b p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Bot className="text-accent h-6 w-6" />
          <h1 className="text-foreground text-xl font-semibold">
            AI Assistant
          </h1>
        </div>
        {selectedModel && onModelChange && (
          <select
            value={selectedModel}
            onChange={(e) => onModelChange(e.target.value)}
            className="border-muted bg-background text-foreground rounded-md border px-2 py-1"
          >
            <option value="gemini-1.5-flash">Flash</option>
            <option value="gemini-1.5-pro">Pro</option>
          </select>
        )}
      </div>
    </header>
  );
}
