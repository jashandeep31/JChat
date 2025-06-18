"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose, // To manually close the dialog
} from "@repo/ui/components/dialog"; // Using Dialog for more form flexibility
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface CredentialsLoginDialogProps {
  triggerButtonText?: string;
  triggerButtonVariant?:
    | "link"
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | null
    | undefined;
}

export function CredentialsLoginDialog({
  triggerButtonText = "Login",
  triggerButtonVariant = "secondary",
}: CredentialsLoginDialogProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formErrors, setFormErrors] = useState<{
    email?: string;
    password?: string;
    general?: string;
  }>({});
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      // Reset state when dialog is closed
      setEmail("");
      setPassword("");
      setFormErrors({});
      setIsLoggingIn(false);
    }
  };

  const validateForm = () => {
    const errors: { email?: string; password?: string } = {};
    if (!email.trim()) {
      errors.email = "Email is required.";
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      errors.email = "Please enter a valid email address.";
    }
    if (!password.trim()) {
      errors.password = "Password is required.";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    // Simply console log the values as requested
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    if (res.error === null || res.error === undefined) {
      router.push("/");
    } else {
      toast.error("Failed to make login ");
    }

    setIsLoggingIn(true);

    // Simulate a short delay before closing dialog
    setTimeout(() => {
      setIsLoggingIn(false);
      setIsOpen(false); // Close dialog after logging values
    }, 500);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant={triggerButtonVariant} className="w-full">
          {triggerButtonText}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Login</DialogTitle>
          <DialogDescription>
            Enter your email and password to log in.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {formErrors.general && (
            <p className="text-sm text-red-500 text-center">
              {formErrors.general}
            </p>
          )}
          <div className="space-y-2">
            <Label htmlFor="email-creds">Email</Label>
            <Input
              id="email-creds"
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={!!formErrors.email}
              aria-describedby="email-creds-error"
            />
            {formErrors.email && (
              <p id="email-creds-error" className="text-sm text-red-500">
                {formErrors.email}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password-creds">Password</Label>
            <Input
              id="password-creds"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={!!formErrors.password}
              aria-describedby="password-creds-error"
            />
            {formErrors.password && (
              <p id="password-creds-error" className="text-sm text-red-500">
                {formErrors.password}
              </p>
            )}
          </div>
        </div>
        <p>
          We had already the credentials for you at twitter of theo-t3.gg from
          @jashandeep31
        </p>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button type="submit" onClick={handleSubmit} disabled={isLoggingIn}>
            {isLoggingIn ? "Logging in..." : "Login"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
