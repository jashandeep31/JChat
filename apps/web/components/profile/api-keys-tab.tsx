import { useState } from "react";
import { ApiKey, Model } from "./types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@repo/ui/components/card";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
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
} from "@repo/ui/components/alert-dialog";
import { Trash2, Copy, Eye, EyeOff, PlusCircle } from "lucide-react";
import { toast } from "sonner";

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const maskApiKey = (key: string) => `••••••••••••${key.slice(-4)}`;

interface ApiKeysTabProps {
  apiKeys: ApiKey[];
  models: Model[];
  onAddApiKey: (name: string, key: string, model: string) => void;
  onDeleteApiKey: (id: string) => void;
}

export const ApiKeysTab = ({
  apiKeys,
  models,
  onAddApiKey,
  onDeleteApiKey,
}: ApiKeysTabProps) => {
  const [newKeyName, setNewKeyName] = useState("");
  const [newApiKey, setNewApiKey] = useState("");
  const [selectedModel, setSelectedModel] = useState<string>(
    models[0]?.id || ""
  );
  const [showKeyMap, setShowKeyMap] = useState<Record<string, boolean>>({});

  const handleAddKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim() || !newApiKey.trim() || !selectedModel) {
      toast.error("Please fill all fields.");
      return;
    }
    const modelName =
      models.find((m) => m.id === selectedModel)?.name || selectedModel;
    onAddApiKey(newKeyName, newApiKey, modelName);
    setNewKeyName("");
    setNewApiKey("");
    toast.success(`Key "${newKeyName}" for ${modelName} has been added.`);
  };

  const copyToClipboard = (text: string, keyName: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`API key "${keyName}" copied.`);
  };

  const toggleShowKey = (keyId: string) => {
    setShowKeyMap((prev) => ({ ...prev, [keyId]: !prev[keyId] }));
  };

  return (
    <div className="space-y-8">
      <Card className="bg-white/80 backdrop-blur-sm border-none shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-slate-800">
            Add New API Key
          </CardTitle>
          <CardDescription>
            Connect your external model providers by adding their API keys.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddKey} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="keyName" className="text-sm font-medium">
                  Key Name
                </Label>
                <Input
                  id="keyName"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="e.g., My Personal OpenAI Key"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="modelSelect" className="text-sm font-medium">
                  Model Provider
                </Label>
                <Select value={selectedModel} onValueChange={setSelectedModel}>
                  <SelectTrigger id="modelSelect" className="mt-1">
                    <SelectValue placeholder="Select a model" />
                  </SelectTrigger>
                  <SelectContent>
                    {models.map((model) => (
                      <SelectItem key={model.id} value={model.id}>
                        {model.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="apiKey" className="text-sm font-medium">
                API Key
              </Label>
              <Input
                id="apiKey"
                type="password"
                value={newApiKey}
                onChange={(e) => setNewApiKey(e.target.value)}
                placeholder="Enter your API key"
                className="mt-1"
              />
            </div>
            <Button
              type="submit"
              className="bg-brand-pink hover:bg-brand-pink/90 text-white"
            >
              <PlusCircle className="w-4 h-4 mr-2" /> Add API Key
            </Button>
          </form>
        </CardContent>
      </Card>

      <div>
        <h3 className="text-xl font-semibold text-slate-800 mb-1">
          Your API Keys
        </h3>
        <p className="text-sm text-slate-500 mb-4">
          Manage your existing API key connections.
        </p>
        {apiKeys.length === 0 ? (
          <p className="text-slate-500">No API keys added yet.</p>
        ) : (
          <div className="space-y-3">
            {apiKeys.map((apiKey) => (
              <Card
                key={apiKey.id}
                className="bg-white/80 backdrop-blur-sm border-none shadow-sm"
              >
                <CardContent className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div className="flex-grow">
                    <p className="font-semibold text-slate-700">
                      {apiKey.name}
                    </p>
                    <p className="text-sm text-slate-500">
                      Provider: {apiKey.model}
                    </p>
                    <div className="flex items-center mt-1">
                      <p className="text-sm text-slate-500 font-mono mr-2">
                        {showKeyMap[apiKey.id]
                          ? apiKey.key
                          : maskApiKey(apiKey.key)}
                      </p>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-slate-500 hover:text-brand-pink"
                        onClick={() => toggleShowKey(apiKey.id)}
                      >
                        {showKeyMap[apiKey.id] ? (
                          <EyeOff className="w-3.5 h-3.5" />
                        ) : (
                          <Eye className="w-3.5 h-3.5" />
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-slate-400">
                      Added: {formatDate(apiKey.createdAt)}
                    </p>
                  </div>
                  <div className="flex space-x-2 flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(apiKey.key, apiKey.name)}
                      className="text-xs"
                    >
                      <Copy className="w-3 h-3 mr-1" /> Copy
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:bg-red-50 hover:text-red-700 text-xs"
                        >
                          <Trash2 className="w-3 h-3 mr-1" /> Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete API Key?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete the API key &quot;
                            {apiKey.name}&quot;? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => onDeleteApiKey(apiKey.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
