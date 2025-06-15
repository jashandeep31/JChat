"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@repo/ui/components/dialog";
import { Button } from "@repo/ui/components/button";
import { FileIcon, ImageIcon, FileText, CheckCircle2 } from "lucide-react";
import { cn } from "@repo/ui/lib/utils";
import useAttachmentQuery from "@/lib/react-query/use-attachment-query";
import { AttachmentInfo } from "@/context/chat-input-box-context";
import { Attachment } from "@repo/db";
import { Skeleton } from "@repo/ui/components/skeleton";

interface SelectAttachmentDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  setAttachmentInfo: (attachmentInfo: AttachmentInfo) => void;
  onAttachmentSelected: () => void;
}

export function SelectAttachmentDialog({
  isOpen,
  onOpenChange,
  setAttachmentInfo,
  onAttachmentSelected,
}: SelectAttachmentDialogProps) {
  const { getAttachmentsQuery } = useAttachmentQuery();
  const [selectedAttachment, setSelectedAttachment] =
    useState<Attachment | null>(null);

  const handleSelectAttachment = (attachment: Attachment) => {
    setSelectedAttachment(attachment);
  };

  const handleConfirmSelection = () => {
    if (selectedAttachment) {
      setAttachmentInfo({
        id: selectedAttachment.id,
        uploadId: selectedAttachment.uploadId,
        fileType: selectedAttachment.type,
        filename: selectedAttachment.filename,
      });

      onAttachmentSelected();
      onOpenChange(false);
    }
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return <ImageIcon className="h-6 w-6" />;
    if (type === "application/pdf") return <FileText className="h-6 w-6" />;
    return <FileIcon className="h-6 w-6" />;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return (
      date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      }) +
      " " +
      date.toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
      })
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-white rounded-xl shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-slate-800">
            Select Existing Attachment
          </DialogTitle>
        </DialogHeader>
        <div className="py-4 max-h-[400px] overflow-y-auto">
          {getAttachmentsQuery.isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="mb-3 p-3 border border-slate-200 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[200px]" />
                    <Skeleton className="h-3 w-[150px]" />
                  </div>
                </div>
              </div>
            ))
          ) : getAttachmentsQuery.data?.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              No attachments found. Upload some files first.
            </div>
          ) : (
            getAttachmentsQuery.data?.map((attachment) => (
              <div
                key={attachment.id}
                className={cn(
                  "mb-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors duration-200 relative",
                  selectedAttachment?.id === attachment.id
                    ? "border-primary bg-primary/5"
                    : ""
                )}
                onClick={() => handleSelectAttachment(attachment)}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 p-2 bg-slate-100 rounded text-slate-600">
                    {getFileIcon(attachment.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-800 truncate">
                      {attachment.filename}
                    </p>
                    <p className="text-xs text-slate-500">
                      Uploaded: {formatDate(attachment.createdAt.toString())}
                    </p>
                  </div>
                  {selectedAttachment?.id === attachment.id && (
                    <CheckCircle2 className="h-5 w-5 text-primary absolute right-3 top-3" />
                  )}
                </div>
              </div>
            ))
          )}
          {getAttachmentsQuery.isError && (
            <div className="text-center py-8 text-red-500">
              Failed to load attachments. Please try again.
            </div>
          )}
        </div>
        <DialogFooter className="sm:justify-between gap-2">
          <DialogClose asChild>
            <Button variant="outline" className="w-full sm:w-auto">
              Cancel
            </Button>
          </DialogClose>
          <Button
            onClick={handleConfirmSelection}
            disabled={!selectedAttachment || getAttachmentsQuery.isLoading}
            className="w-full sm:w-auto bg-primary hover:bg-primary/80"
          >
            Select Attachment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
