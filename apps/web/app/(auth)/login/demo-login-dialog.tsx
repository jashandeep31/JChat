"use client";

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
import { Button } from "@repo/ui/components/button";
import { AlertTriangle } from "lucide-react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function DemoLoginDialog() {
  const router = useRouter();
  const handleDemoLogin = async () => {
    // Dialog will close automatically on AlertDialogAction click if not prevented
    const res = await signIn("credentials", {
      email: "demo@demo.com",
      password: "5",
      redirect: false,
    });
    if (res.error === null || res.error === undefined) {
      router.push("/");
    } else {
      toast.error("Failed to make login ");
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" className="w-full">
          Demo Login
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center">
            <AlertTriangle className="mr-2 h-5 w-5 text-yellow-500" />
            Demo Login Warning
          </AlertDialogTitle>
          <AlertDialogDescription>
            You are about to enter a demo session. In this mode:
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>You will get 0 credits.</li>
              <li>You can go through the demo session. </li>
              <li>You can only explore the demo session.</li>
            </ul>
            This is for demonstration purposes only.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDemoLogin}>
            Proceed with Demo
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
