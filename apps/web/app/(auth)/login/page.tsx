import { Button } from "@repo/ui/components/button";
import React from "react";
import { auth, signIn } from "@/lib/auth";
import { redirect } from "next/navigation";

const login = async () => {
  const session = await auth();
  if (session?.user) {
    // console.log(session);
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
        <div className="mt-6">
          <p className="">
            By logging in, you agree to our{" "}
            <span className="text-primary">Terms of Service</span> and{" "}
            <span className="text-primary">Privacy Policy</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default login;
