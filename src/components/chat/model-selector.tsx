"use client";

import React from "react";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

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
  const [responseStyle, setResponseStyle] = React.useState("balanced");
  const [creativityLevel, setCreativityLevel] = React.useState([50]);

  return (
    <div className="flex flex-col gap-4">
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
              <div className="flex items-center gap-2 truncate">
                <span className="truncate font-medium">
                  {
                    VERTEX_AI_MODELS[
                      selectedModel as keyof typeof VERTEX_AI_MODELS
                    ]?.name
                  }
                </span>
                {VERTEX_AI_MODELS[
                  selectedModel as keyof typeof VERTEX_AI_MODELS
                ]?.capabilities?.includes("image-output" as never) && (
                  <Badge variant="secondary" className="text-xs">
                    <ImageIcon className="mr-1 h-3 w-3" />
                    Images
                  </Badge>
                )}
              </div>
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

      <div className="space-y-4">
        <div>
          <Label className="text-sm font-medium">Response Style</Label>
          <RadioGroup
            value={responseStyle}
            onValueChange={setResponseStyle}
            className="mt-2 flex gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="concise" id="concise" />
              <Label htmlFor="concise" className="text-sm">
                Concise
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="balanced" id="balanced" />
              <Label htmlFor="balanced" className="text-sm">
                Balanced
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="detailed" id="detailed" />
              <Label htmlFor="detailed" className="text-sm">
                Detailed
              </Label>
            </div>
          </RadioGroup>
        </div>

        <div>
          <Label className="text-sm font-medium">
            Creativity Level: {creativityLevel[0]}%
          </Label>
          <Slider
            value={creativityLevel}
            onValueChange={setCreativityLevel}
            max={100}
            step={10}
            className="mt-2"
          />
        </div>
      </div>
    </div>
  );
}
