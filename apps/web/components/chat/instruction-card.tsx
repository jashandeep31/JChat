"use client";

import React, { useState } from "react";
import { Loader2, SlidersHorizontal } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";
import { Label } from "@repo/ui/components/label";
import { Textarea } from "@repo/ui/components/textarea";
import useChatQuery from "@/lib/react-query/use-chat-query";
import { toast } from "sonner";

interface InstructionCardProps {
  chatId: string;
}

const InstructionCard: React.FC<InstructionCardProps> = ({ chatId }) => {
  const [instruction, setInstruction] = useState("");
  const { addChatIntructionMutation } = useChatQuery();

  const handleSave = () => {
    const toastId = toast.loading("Saving instruction...");
    addChatIntructionMutation.mutate(
      {
        chatId,
        instruction,
      },
      {
        onSuccess: () => {
          toast.success("Instruction saved", { id: toastId });
        },
        onError: () => {
          toast.error("Failed to save instruction", {
            id: toastId,
          });
        },
      }
    );
  };

  const handleCancel = () => {
    setInstruction("");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="p-2 rounded hover:bg-accent transition-colors duration-200"
          aria-label="Instructions"
        >
          <SlidersHorizontal className="w-4 h-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="mx-4 bg-background">
        <div className="lg:w-[600px]">
          <div className="p-2">
            <Label className="mb-2 text-base">Instruction </Label>
            <Textarea
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              className="resize-none h-24"
              placeholder="Example: Answer the question in 2 sentences"
            />
            <div className="mt-3 flex justify-end gap-2">
              <Button size={"sm"} variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button
                disabled={addChatIntructionMutation.isPending}
                size={"sm"}
                onClick={handleSave}
              >
                {addChatIntructionMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Save
              </Button>
            </div>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default InstructionCard;
