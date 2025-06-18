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

export function LoginPromptCard() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl">Login Required</CardTitle>
        <CardDescription>Please sign in to use JChat</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className={cn(buttonVariants({ variant: "default" }))}
          >
            <LogIn className="mr-2 h-5 w-5" />
            Sign Up
          </Link>
        </div>
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground">
        <p>
          By signing in, you agree to our Terms of Service and Privacy Policy.
        </p>
      </CardFooter>
    </Card>
  );
}
