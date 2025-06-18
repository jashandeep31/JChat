import { Button } from "@repo/ui/components/button";
import React from "react";
import { auth, signIn } from "@/lib/auth";
import { redirect } from "next/navigation";
import { CredentialsLoginDialog } from "./creds-login-dialog";

const login = async () => {
  const session = await auth();
  if (session?.user) {
    redirect("/");
  }
  return (
    <div className="min-h-screen flex items-center justify-center flex-col">
      <div className="text-center min-w-[400px]">
        <h1 className="text-xl font-bold">
          welcome to <span className="text-primary text-3xl">JChat</span>
        </h1>
        <p className="text-muted-foreground text-sm mt-2">
          Login to continue to JChat and get benefits of AI.
        </p>
        <div className="mt-6">
          <form
            action={async () => {
              "use server";
              await signIn("google");
            }}
          >
            <Button className="block w-full ">Continue with Google</Button>
          </form>
        </div>
        <div className="mt-4 space-y-4">
          <CredentialsLoginDialog triggerButtonText="Theo only Login" />
        </div>

        <div className="mt-6">
          <p className="">
            To get Pro Account access login with credentials sent to X account
            of Theo from @jashandeep31
          </p>
        </div>
      </div>
    </div>
  );
};

export default login;
