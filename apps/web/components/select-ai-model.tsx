import { AiModel, Company } from "@repo/db";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from "@repo/ui/components/dropdown-menu";
import {
  Brain,
  ChevronDown,
  Eye,
  FileText,
  Globe,
  WandSparkles,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";
import useCompanyQuery from "@/lib/react-query/use-company-query";

interface SelectAIModelProps {
  selectedModel: AiModel | null;
  setSelectedModel: (model: AiModel) => void;
  models: Array<AiModel>;
}

type CompanyWithModels = Company & {
  models: AiModel[];
};

export const SelectAIModel = ({
  selectedModel,
  setSelectedModel,
  models,
}: SelectAIModelProps) => {
  const [open, setOpen] = useState(false);
  const session = useSession();
  const { companiesQuery } = useCompanyQuery();

  useEffect(() => {
    const selectedModelSlug = localStorage.getItem("selectedModel");
    if (!selectedModelSlug) return;
    const model = models.find((model) => model.slug === selectedModelSlug);
    if (model) {
      setSelectedModel(model);
    }
  }, [models, selectedModel, setSelectedModel]);

  // Group models by company ID
  const modelsByCompany = useMemo(() => {
    const result: Record<string, AiModel[]> = {};

    models.forEach((model) => {
      const companyId = model.companyId;
      if (!companyId) return;

      if (!result[companyId]) {
        result[companyId] = [];
      }

      result[companyId].push(model);
    });

    return result;
  }, [models]);

  // Get sorted list of companies with their models
  const companiesWithModels = useMemo<CompanyWithModels[]>(() => {
    if (!companiesQuery.data) return [];

    return companiesQuery.data
      .map((company: Company) => {
        return {
          ...company,
          models: modelsByCompany[company.id] || [],
        } as CompanyWithModels;
      })
      .filter((company: CompanyWithModels) => company.models.length > 0)
      .sort((a: CompanyWithModels, b: CompanyWithModels) =>
        a.name.localeCompare(b.name)
      );
  }, [companiesQuery.data, modelsByCompany]);

  const getSelectedModelName = () => {
    if (!selectedModel) return "Select Model";
    const model = models.find((model) => model.slug === selectedModel.slug);
    if (!model) return "Select Model";

    return model.name.length > 15
      ? model.name.slice(0, 15) + "..."
      : model.name;
  };

  // If companies data is not loaded yet, fall back to the original flat list
  const shouldShowCompanyGroups = companiesWithModels.length > 0;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 text-xs text-foreground hover:bg-accent transition-all rounded font-bold py-1 px-2">
          {getSelectedModelName()} <ChevronDown className="w-4 h-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-[400px]">
        <DropdownMenuLabel>AI Models</DropdownMenuLabel>

        {!shouldShowCompanyGroups &&
          models?.map((model) => (
            <DropdownMenuItem key={model.slug} asChild>
              <button
                onClick={() => {
                  localStorage.setItem("selectedModel", model.slug);
                  setSelectedModel(model);
                  setOpen(false);
                }}
                disabled={!session.data?.user?.proUser && model.requiresPro}
                className={`flex items-center p-2 gap-2 min-h-[50px] min-w-[400px] justify-between hover:bg-accent ${
                  selectedModel?.slug === model.slug ? "bg-accent" : ""
                } ${!session.data?.user?.proUser && model.requiresPro ? "opacity-50 cursor-not-allowed" : ""}`}
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
                    {model.name} {model.requiresPro && "(Pro)"}
                    <span className="text-xs text-muted-foreground">
                      {model.credits} Credits
                    </span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {model.imageAnalysis && (
                    <span>
                      <Eye className="text-primary w-4 h-4 opacity-80" />
                    </span>
                  )}
                  {model.pdfAnalysis && (
                    <span>
                      <FileText className="text-primary w-4 h-4 opacity-80" />
                    </span>
                  )}
                  {model.webAnalysis && (
                    <span>
                      <Globe className="text-primary w-4 h-4 opacity-80" />
                    </span>
                  )}
                  {model.reasoning && (
                    <span>
                      <Brain className="text-foreground w-4 h-4" />
                    </span>
                  )}
                </div>
              </button>
            </DropdownMenuItem>
          ))}

        {shouldShowCompanyGroups &&
          companiesWithModels.map((company) => (
            <DropdownMenuSub key={company.id}>
              <DropdownMenuSubTrigger className="flex items-center justify-between w-full px-3 py-2.5 text-sm hover:bg-accent rounded-md cursor-pointer">
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
                <DropdownMenuSubContent className="w-[420px] p-2 bg-background shadow-xl rounded-lg border border-border ml-2">
                  {company.models.map((model) => (
                    <DropdownMenuItem key={model.slug} asChild>
                      <button
                        onClick={() => {
                          localStorage.setItem("selectedModel", model.slug);
                          setSelectedModel(model);
                          setOpen(false);
                        }}
                        disabled={
                          !session.data?.user?.proUser && model.requiresPro
                        }
                        className={`flex items-center p-2 gap-2 min-h-[50px] w-full justify-between hover:bg-accent ${
                          selectedModel?.slug === model.slug ? "bg-accent" : ""
                        } ${!session.data?.user?.proUser && model.requiresPro ? "opacity-50 cursor-not-allowed" : ""}`}
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
                            {model.name} {model.requiresPro && "(Pro)"}
                            <span className="text-xs text-muted-foreground">
                              {model.credits} Credits
                            </span>
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {model.imageAnalysis && (
                            <span>
                              <Eye className="text-primary w-4 h-4 opacity-80" />
                            </span>
                          )}
                          {model.pdfAnalysis && (
                            <span>
                              <FileText className="text-primary w-4 h-4 opacity-80" />
                            </span>
                          )}
                          {model.webAnalysis && (
                            <span>
                              <Globe className="text-primary w-4 h-4 opacity-80" />
                            </span>
                          )}
                          {model.reasoning && (
                            <span>
                              <Brain className="text-foreground w-4 h-4" />
                            </span>
                          )}
                        </div>
                      </button>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
          ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
