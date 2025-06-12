import { AiModel } from "@repo/db";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";
import { Brain, ChevronDown, Eye, FileText, Globe } from "lucide-react";
import { useState } from "react";

interface SelectAIModelProps {
  selectedModel: string | null;
  setSelectedModel: (model: string) => void;
  models: Array<AiModel>;
}

export const SelectAIModel = ({
  selectedModel,
  setSelectedModel,
  models,
}: SelectAIModelProps) => {
  const [open, setOpen] = useState(false);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 text-xs text-foreground hover:bg-accent transition-all rounded font-bold py-1 px-2">
          {selectedModel && models?.length
            ? models.find((model) => model.slug === selectedModel)?.name
            : "Select Model"}{" "}
          <ChevronDown className="w-4 h-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>AI Models</DropdownMenuLabel>

        {models?.map((model) => (
          <DropdownMenuItem key={model.slug} asChild>
            <button
              onClick={() => {
                setSelectedModel(model.slug);
                setOpen(false);
              }}
              className={`flex items-center p-2 gap-2 min-h-[50px] min-w-[400px] justify-between hover:bg-accent ${
                selectedModel === model.slug ? "bg-accent" : ""
              }`}
            >
              <div className="flex items-center gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={model.logo}
                  width={12}
                  height={12}
                  alt={model.name}
                  className="w-3 h-3"
                />
                <span>
                  {model.name}{" "}
                  <span className="text-xs text-muted-foreground">
                    {model.credits} Credits
                  </span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                {model.imageAnalysis && (
                  <span>
                    <Eye className="text-orange-800 w-4 h-4" />
                  </span>
                )}
                {model.pdfAnalysis && (
                  <span>
                    <FileText className="text-green-800 w-4 h-4" />
                  </span>
                )}
                {model.webAnalysis && (
                  <span>
                    <Globe className="text-blue-800 w-4 h-4" />
                  </span>
                )}
                {model.reasoning && (
                  <span>
                    <Brain className="text-black w-4 h-4" />
                  </span>
                )}
              </div>
            </button>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
