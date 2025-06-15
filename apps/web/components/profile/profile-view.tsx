"use client";

import React from "react";
import { ArrowLeft } from "lucide-react";
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
import { signOut, useSession } from "next-auth/react";
import { Button } from "@repo/ui/components/button";
import useUserQuery from "@/lib/react-query/use-user-query";
import { useRouter } from "next/navigation";
// Mock data

const navItems = ["Account", "API Keys", "Attachments"];

export const ProfileView = () => {
  const router = useRouter();
  const session = useSession();
  const { userQuery } = useUserQuery();
  console.log(userQuery.data);

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
    <div className="bg-brand-background min-h-screen p-4 sm:p-6 md:p-8 text-foreground">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <Button
            onClick={() => {
              router.back();
            }}
            variant="link"
            className="flex items-center gap-2 text-sm font-medium hover:text-brand-pink"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Chat
          </Button>
          <div className="flex items-center gap-4">
            <Button
              onClick={async () => {
                await signOut({
                  redirectTo: "/",
                });
              }}
              className="text-sm font-medium hover:text-brand-pink"
            >
              Sign out
            </Button>
          </div>
        </header>

        <main className="grid lg:grid-cols-12 gap-8">
          <aside className="lg:col-span-3 space-y-6">
            <UserProfile
              name={userQuery.data?.name || "unknown"}
              email={userQuery.data?.email || "unknown"}
              plan={userQuery.data?.proUser ? "Pro" : "Free"}
            />
            <UsageCard
              used={
                userQuery.data?.totalCredits && userQuery.data?.credits
                  ? userQuery.data?.totalCredits - userQuery.data?.credits
                  : 0
              }
              total={userQuery.data?.totalCredits}
            />
            <KeyboardShortcutsCard />
          </aside>

          <section className="lg:col-span-9">
            <Tabs defaultValue="Account" className="w-full">
              <TabsList className="bg-brand-purple rounded-full p-1 overflow-x-auto whitespace-nowrap no-scrollbar">
                {navItems.map((item) => (
                  <TabsTrigger
                    key={item}
                    value={item}
                    className="text-muted-foreground data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-full px-3 py-1.5 text-sm sm:px-4 sm:py-2"
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
                <AttachmentsTab />
              </TabsContent>

              <TabsContent value="API Keys" className="mt-8">
                <ApiKeysTab />
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
