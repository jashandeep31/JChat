"use client";

import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from "@repo/ui/components/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@repo/ui/components/tooltip";
import { Info, WandSparkles, Loader2 } from "lucide-react";
import useModelsQuery from "@/lib/react-query/use-models-query";
import useCompanyQuery from "@/lib/react-query/use-company-query";
import type { AiModel, Company } from "@repo/db";
import { Socket } from "socket.io-client";
import { toast } from "sonner";

type ExtendedAiModel = AiModel & {
  company: Company;
  icon?: React.ComponentType<{ className?: string }>;
  info?: string;
  actions?: Array<{
    id: string;
    tooltip: string;
    icon: React.ComponentType<{ className?: string }>;
  }>;
};

interface RetryModelSelectorProps {
  children: React.ReactNode;
  questionId: string;
  chatId: string;
  socket: Socket | null;
  isStreaming: boolean;
  setIsStreaming: (value: boolean) => void;
}

type CompanyWithModels = Company & {
  models: ExtendedAiModel[];
};

export function RetryModelSelector({
  children,
  questionId,
  chatId,
  socket,
  isStreaming,
  setIsStreaming,
}: RetryModelSelectorProps) {
  const { modelsQuery } = useModelsQuery();
  const { companiesQuery } = useCompanyQuery();

  // Group models by company ID
  const modelsByCompany = React.useMemo(() => {
    if (!modelsQuery.data) return {} as Record<string, ExtendedAiModel[]>;

    return modelsQuery.data.reduce(
      (
        acc: Record<string, ExtendedAiModel[]>,
        model: AiModel & { company: Company }
      ) => {
        const companyId = model.company?.id;
        if (!companyId) return acc;

        if (!acc[companyId]) {
          acc[companyId] = [];
        }

        const extendedModel: ExtendedAiModel = {
          ...model,
          company: {
            id: model.company.id,
            name: model.company.name,
            logo: model.company.logo,
            slug: model.company.slug,
            createdAt: new Date(model.company.createdAt),
            updatedAt: new Date(model.company.updatedAt),
          },
          // Add any additional properties needed for ExtendedAiModel
        };

        acc[companyId].push(extendedModel);
        return acc;
      },
      {} as Record<string, ExtendedAiModel[]>
    );
  }, [modelsQuery.data]);

  // Get sorted list of companies with their models
  const companiesWithModels = React.useMemo<CompanyWithModels[]>(() => {
    if (!companiesQuery.data) return [];

    return companiesQuery.data
      .map((company: Company) => {
        const companyWithModels: CompanyWithModels = {
          ...company,
          models: modelsByCompany[company.id] || [],
        };
        return companyWithModels;
      })
      .filter((company: CompanyWithModels) => company.models.length > 0) // Only show companies with models
      .sort((a: CompanyWithModels, b: CompanyWithModels) =>
        a.name.localeCompare(b.name)
      ); // Sort companies by name
  }, [companiesQuery.data, modelsByCompany]);

  const handleModelSelect = (model: ExtendedAiModel) => {
    if (isStreaming) {
      toast.error("Please wait for the current response to finish");
      return;
    }
    setIsStreaming(true);
    socket?.emit("re_answer", {
      questionId,
      cid: chatId,
      modelSlug: model.slug,
    });
  };

  if (modelsQuery.isLoading || companiesQuery.isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (modelsQuery.error || companiesQuery.error) {
    return (
      <div className="p-4 text-sm text-destructive">
        Error loading models. Please try again.
      </div>
    );
  }

  if (!companiesWithModels.length) {
    return (
      <div className="p-4 text-sm text-muted-foreground">No models available.</div>
    );
  }

  return (
    <TooltipProvider delayDuration={100}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
        <DropdownMenuContent className="w-64 p-2 bg-background shadow-xl rounded-lg border border-border">
          {companiesWithModels.map((company: CompanyWithModels) => (
            <DropdownMenuSub key={company.id}>
              <DropdownMenuSubTrigger className="flex items-center justify-between w-full px-3 py-2.5 text-sm text-foreground hover:bg-accent rounded-md cursor-pointer data-[state=open]:bg-accent">
                <div className="flex items-center gap-2">
                  {company.logo ? (
                    <div className="relative h-4 w-4">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={company.logo} alt={company.name} sizes="16px" />
                    </div>
                  ) : (
                    <WandSparkles className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span>{company.name}</span>
                </div>
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent className="w-80 p-2 bg-background shadow-xl rounded-lg border border-border ml-2">
                  {company.models.map((model) => (
                    <DropdownMenuItem
                      key={model.id}
                      onClick={() => handleModelSelect(model)}
                      className="flex items-center justify-between w-full px-3 py-2.5 text-sm text-foreground hover:bg-accent rounded-md cursor-pointer group"
                    >
                      <div className="flex items-center gap-2">
                        {model.icon ? (
                          <model.icon className="h-4 w-4 text-primary" />
                        ) : (
                          <WandSparkles className="h-4 w-4 text-primary" />
                        )}
                        <span className="group-hover:text-foreground">
                          {model.name}
                        </span>
                        {model.info && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-3.5 w-3.5 text-muted-foreground group-hover:text-muted ml-1" />
                            </TooltipTrigger>
                            <TooltipContent
                              side="top"
                              className="bg-popover text-popover-foreground text-xs p-2 rounded"
                            >
                              <p>{model.info}</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                      {model.actions && model.actions.length > 0 && (
                        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          {model.actions.map((action) => (
                            <Tooltip key={action.id}>
                              <TooltipTrigger asChild>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    console.log(
                                      `Action: ${action.tooltip} for ${model.name}`
                                    );
                                  }}
                                  className="p-1 rounded-full bg-secondary hover:bg-secondary/80"
                                >
                                  <action.icon className="h-3.5 w-3.5 text-secondary-foreground" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent
                                side="top"
                                className="bg-popover text-popover-foreground text-xs p-2 rounded"
                              >
                                <p>{action.tooltip}</p>
                              </TooltipContent>
                            </Tooltip>
                          ))}
                        </div>
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </TooltipProvider>
  );
}
