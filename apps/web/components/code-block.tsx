"use client ";
import { cn } from "@repo/ui/lib/utils";
import { ClipboardCheck, Clipboard } from "lucide-react";
import React, { useState } from "react";

const CodeBlock = ({
  rawCode,
  className,
  ...props
}: React.HTMLAttributes<HTMLPreElement> & { rawCode: string }) => {
  const [copied, setCopied] = useState(false);
  const copyToClipboard = () => {
    navigator.clipboard.writeText(rawCode);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <div className="my-2">
      <div className="flex justify-end bg-accent px-2 py-1">
        <button
          onClick={copyToClipboard}
          className="text-primary p-1 hover:bg-primary/10 "
        >
          {copied ? (
            <ClipboardCheck className="w-4 h-4" />
          ) : (
            <Clipboard className="w-4 h-4" />
          )}
        </button>
      </div>
      <pre
        className={cn("bg-accent/50 overflow-x-auto ", className)}
        {...props}
      ></pre>
    </div>
  );
};

export default CodeBlock;
