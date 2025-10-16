import { Bot } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface HeaderProps {
  selectedModel?: string;
  onModelChange?: (modelId: string) => void;
}

export function Header({ selectedModel, onModelChange }: HeaderProps) {
  return (
    <Card>
      <CardHeader>
        <CardContent className="flex items-center justify-between p-0">
          <div className="flex items-center gap-4">
            <Bot className="text-accent h-6 w-6" />
            <CardTitle className="text-xl">AI Assistant</CardTitle>
          </div>
          {selectedModel && onModelChange && (
            <Select value={selectedModel} onValueChange={onModelChange}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gemini-1.5-flash">Flash</SelectItem>
                <SelectItem value="gemini-1.5-pro">Pro</SelectItem>
              </SelectContent>
            </Select>
          )}
        </CardContent>
      </CardHeader>
    </Card>
  );
}
