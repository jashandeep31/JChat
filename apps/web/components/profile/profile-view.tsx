"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Sun } from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@repo/ui/components/tabs";
import { UserProfile } from "./user-profile";
import { UsageCard } from "./usage-card";
import { KeyboardShortcutsCard } from "./keyboard-shortcuts-card";
// import { UpgradeSection } from "./upgrade-section";
import { DangerZone } from "./danger-zone";
import { AttachmentsTab } from "./attachments-tab";
import { ApiKeysTab } from "./api-keys-tab";
import { Attachment, ApiKey, Model } from "./types";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
// Mock data
const mockModels: Model[] = [
  { id: "gpt-4", name: "GPT-4" },
  { id: "claude-3", name: "Claude 3 Opus" },
  { id: "gemini-pro", name: "Gemini Pro" },
  { id: "dall-e-3", name: "DALL-E 3" },
];

const initialAttachments: Attachment[] = [
  {
    id: "attach1",
    name: "project-brief.pdf",
    type: "application/pdf",
    size: "2.3 MB",
    uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
  },
  {
    id: "attach2",
    name: "logo-design.png",
    type: "image/png",
    size: "850 KB",
    uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
  },
  {
    id: "attach3",
    name: "meeting-recording.mp4",
    type: "video/mp4",
    size: "54.1 MB",
    uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
  },
  {
    id: "attach4",
    name: "archive-data.zip",
    type: "application/zip",
    size: "12.7 MB",
    uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(),
  },
];

const initialApiKeys: ApiKey[] = [
  {
    id: "key1",
    name: "My GPT-4 Key",
    key: "sk-abc123def456ghi789jkl0mno",
    model: "GPT-4",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
  },
  {
    id: "key2",
    name: "Claude Dev Key",
    key: "claude-xyz987uvw654rst321q",
    model: "Claude 3 Opus",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
  },
];

const navItems = ["Account", "API Keys", "Attachments"];

export const ProfileView = () => {
  const session = useSession();
  const [attachments, setAttachments] =
    useState<Attachment[]>(initialAttachments);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>(initialApiKeys);

  const handleDeleteAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((att) => att.id !== id));
    toast.success("Attachment deleted", {
      description: "The file has been removed.",
    });
  };

  const handleAddApiKey = (name: string, key: string, model: string) => {
    const newKeyEntry: ApiKey = {
      id: `key_${Date.now()}`,
      name,
      key,
      model,
      createdAt: new Date().toISOString(),
    };
    setApiKeys((prev) => [newKeyEntry, ...prev]);
  };

  const handleDeleteApiKey = (id: string) => {
    setApiKeys((prev) => prev.filter((key) => key.id !== id));
    toast.success("API Key Deleted", {
      description: "The API key has been removed.",
    });
  };

  if (session.status === "loading") {
    return null;
  }

  if (session.status === "unauthenticated") {
    return null;
  }

  if (!session.data?.user) {
    return null;
  }
  return (
    <div className="bg-brand-background min-h-screen p-4 sm:p-6 md:p-8 text-slate-800">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-medium hover:text-brand-pink"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Chat
          </Link>
          <div className="flex items-center gap-4">
            <button className="hover:text-brand-pink">
              <Sun className="w-5 h-5" />
            </button>
            <Link
              href="#"
              className="text-sm font-medium hover:text-brand-pink"
            >
              Sign out
            </Link>
          </div>
        </header>

        <main className="grid lg:grid-cols-12 gap-8">
          <aside className="lg:col-span-3 space-y-6">
            <UserProfile
              name={session.data?.user?.name || "unknown"}
              email={session.data?.user?.email || "unknown"}
              plan={session.data?.user.proUser ? "Pro" : "Free"}
            />
            <UsageCard used={5} total={20} />
            <KeyboardShortcutsCard />
          </aside>

          <section className="lg:col-span-9">
            <Tabs defaultValue="Account" className="w-full">
              <TabsList className="bg-brand-purple rounded-full p-1 overflow-x-auto whitespace-nowrap no-scrollbar">
                {navItems.map((item) => (
                  <TabsTrigger
                    key={item}
                    value={item}
                    className="text-slate-600 data-[state=active]:bg-white data-[state=active]:text-slate-800 data-[state=active]:shadow-sm rounded-full px-3 py-1.5 text-sm sm:px-4 sm:py-2"
                  >
                    {item}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value="Account" className="mt-8 space-y-12">
                {/* <UpgradeSection /> */}
                <DangerZone />
              </TabsContent>

              <TabsContent value="Attachments" className="mt-8">
                <AttachmentsTab
                  attachments={attachments}
                  onDeleteAttachment={handleDeleteAttachment}
                />
              </TabsContent>

              <TabsContent value="API Keys" className="mt-8">
                <ApiKeysTab
                  apiKeys={apiKeys}
                  models={mockModels}
                  onAddApiKey={handleAddApiKey}
                  onDeleteApiKey={handleDeleteApiKey}
                />
              </TabsContent>

              <TabsContent value="Customization" className="mt-8">
                <p>Customization settings will go here.</p>
              </TabsContent>

              <TabsContent value="History & Sync" className="mt-8">
                <p>History & Sync settings will go here.</p>
              </TabsContent>

              <TabsContent value="Models" className="mt-8">
                <p>Model management settings will go here.</p>
              </TabsContent>

              <TabsContent value="Contact Us" className="mt-8">
                <p>Contact Us information will go here.</p>
              </TabsContent>
            </Tabs>
          </section>
        </main>
      </div>
    </div>
  );
};

export default ProfileView;
