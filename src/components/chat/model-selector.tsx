"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAvailableModels } from "@/lib/hooks/use-available-models";
import { VERTEX_AI_MODELS } from "@/lib/constants/vertex-ai-models";
import { ImageIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ModelSelectorProps {
  selectedModel: string;
  onModelChange: (modelId: string) => void;
  disabled?: boolean;
}

export function ModelSelector({
  selectedModel,
  onModelChange,
  disabled = false,
}: ModelSelectorProps) {
  const { models, isLoading } = useAvailableModels();

  return (
    <div className="flex items-center gap-2">
      <Select
        value={selectedModel}
        onValueChange={onModelChange}
        disabled={disabled || isLoading}
      >
        <SelectTrigger id="model-select" className="w-full sm:w-[240px]">
          {isLoading ? (
            <span className="text-muted-foreground">Loading models...</span>
          ) : (
            <SelectValue placeholder="Select a model" />
          )}
        </SelectTrigger>
        <SelectContent>
          {models.map((model) => {
            const modelDef =
              VERTEX_AI_MODELS[model.id as keyof typeof VERTEX_AI_MODELS];
            const canGenerateImages = modelDef?.capabilities?.includes(
              "image-output" as never
            );

            return (
              <SelectItem key={model.id} value={model.id}>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{model.name}</span>
                    {canGenerateImages && (
                      <Badge variant="secondary" className="text-xs">
                        <ImageIcon className="mr-1 h-3 w-3" />
                        Images
                      </Badge>
                    )}
                  </div>
                  <span className="text-muted-foreground text-xs">
                    {model.description}
                  </span>
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}
