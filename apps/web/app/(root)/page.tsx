import ChatInputBox from "@/components/chat-input-box";
import DummyQuestions from "@/components/chat/dummy-questions";
import { auth } from "@/lib/auth";
import { buttonVariants } from "@repo/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { cn } from "@repo/ui/lib/utils";
import { LogIn } from "lucide-react";
import Link from "next/link";
import React from "react";

const page = async () => {
  const session = await auth();
  return (
    <div className="flex flex-col min-h-screen md:p-0 p-4">
      <div className="flex-1 justify-center flex ">
        <div className="lg:max-w-800px lg:pt-24 md:pt-16 py-6">
          <DummyQuestions />
        </div>
      </div>
      <div className="flex justify-center  ">
        <div className="lg:max-w-[800px] flex-1 w-full">
          {session?.user ? <ChatInputBox /> : <LoginPromptCard />}
        </div>
      </div>
    </div>
  );
};

export default page;

function LoginPromptCard() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl">Login Required</CardTitle>
        <CardDescription>Please sign in to use JChat</CardDescription>
      </CardHeader>
      <CardContent>
        <Link
          href="/login"
          className={cn(buttonVariants({ variant: "default" }))}
        >
          <LogIn className="mr-2 h-5 w-5" />
          Sign In
        </Link>
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground">
        <p>
          By signing in, you agree to our Terms of Service and Privacy Policy.
        </p>
      </CardFooter>
    </Card>
  );
}
