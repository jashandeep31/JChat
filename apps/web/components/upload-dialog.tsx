"use client";

import { useState, useCallback, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@repo/ui/components/dialog";
import { Button } from "@repo/ui/components/button";
import { Progress } from "@repo/ui/components/progress";
import {
  UploadCloud,
  FileIcon,
  X,
  ImageIcon,
  FileText,
  History,
  Terminal,
} from "lucide-react";
import { useDropzone } from "react-dropzone";
import { cn } from "@repo/ui/lib/utils";
import { BACKEND_URL } from "@/lib/constants";
import { toast } from "sonner";
import { AttachmentInfo } from "@/context/chat-input-box-context";
import { Attachment } from "@repo/db";
import { SelectAttachmentDialog } from "./select-attachment-dialog";
import { Alert, AlertDescription, AlertTitle } from "@repo/ui/components/alert";

interface UploadDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  attachmentInfo: AttachmentInfo;
  setAttachmentInfo: (attachmentInfo: AttachmentInfo) => void;
}

export function UploadDialog({
  isOpen,
  onOpenChange,
  setAttachmentInfo,
}: UploadDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isSelectDialogOpen, setIsSelectDialogOpen] = useState(false);

  const getPresignedUrl = async () => {
    const response = await fetch(
      `${BACKEND_URL}/api/v1/generate-presigned-url`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          name: file?.name,
          contentType: file?.type,
        }),
      }
    );
    if (!response.ok) {
      toast.error("Failed to generate upload url");
      return;
    }
    const data = await response.json();
    if (!data.result) {
      toast.error("Failed to generate upload url");
      return;
    }
    return data.result as {
      presignedUrl: string;
      uploadId: string;
    };
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    // We only want to handle a single file
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setUploadProgress(0);
      setIsUploading(false);
    }
  }, []);

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject,
  } = useDropzone({
    onDrop,
    multiple: false,
    accept: {
      "image/*": [".png", ".gif", ".jpeg", ".jpg", ".webp"],
      "application/pdf": [".pdf"],
    },
  });

  const handleUpload = async () => {
    if (!file) return;

    try {
      const result = await getPresignedUrl();
      if (!result) {
        toast.error("Failed to get upload URL");
        return;
      }

      setIsUploading(true);

      // Import axios dynamically to avoid SSR issues
      const axios = (await import("axios")).default;

      await axios.put(result.presignedUrl, file, {
        headers: {
          "Content-Type": file.type,
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(progress);
          }
        },
      });
      const res = await axios.post(
        `${BACKEND_URL}/api/v1/create/attachment`,
        {
          attachmentId: result.uploadId,
        },
        {
          withCredentials: true,
        }
      );

      if (!res.data.attachment) {
        toast.error("Failed to create attachment");
        return;
      }
      const attachment: Attachment = res.data.attachment;
      setAttachmentInfo({
        id: attachment.id,
        uploadId: attachment.uploadId,
        fileType: attachment.type,
        filename: attachment.filename,
      });

      toast.success("File uploaded successfully!");
      handleClose();
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload file");
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setUploadProgress(0);
    setIsUploading(false);
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset state after a short delay to allow for closing animation
    setTimeout(() => {
      handleRemoveFile();
    }, 300);
  };

  const handleOpenSelectDialog = () => {
    setIsSelectDialogOpen(true);
  };

  const handleAttachmentSelected = () => {
    handleClose();
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (
      Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
    );
  };

  const FileTypeIcon = useMemo(() => {
    if (!file) return FileIcon;
    const type = file.type;
    if (type.startsWith("image/")) return ImageIcon;
    if (type === "application/pdf") return FileText;
    return FileIcon;
  }, [file]);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[480px] rounded-xl shadow-2xl">
        <SelectAttachmentDialog
          isOpen={isSelectDialogOpen}
          onOpenChange={setIsSelectDialogOpen}
          setAttachmentInfo={setAttachmentInfo}
          onAttachmentSelected={handleAttachmentSelected}
        />
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">
            Upload a File
          </DialogTitle>
        </DialogHeader>
        <Alert variant="default">
          <Terminal />
          <AlertTitle>Heads up!</AlertTitle>
          <AlertDescription>
            Images and PDFs both are supported.
          </AlertDescription>
        </Alert>
        <div className="py-3">
          {!file ? (
            <div
              {...getRootProps()}
              className={cn(
                "relative block w-full rounded-lg border-2 border-dashed p-12 text-center hover:border-opacity-70 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors duration-200 ease-in-out",
                { "border-primary bg-primary/20": isDragActive },
                { "border-green-500 bg-green-50": isDragAccept },
                { "border-red-500 bg-red-50": isDragReject }
              )}
            >
              <input {...getInputProps()} />
              <UploadCloud className="mx-auto h-12 w-12 opacity-60" />
              <p className="mt-2 block text-sm font-medium">
                {isDragActive
                  ? "Drop the file here ..."
                  : "Drag & drop a file here, or click to select"}
              </p>
              <p className="mt-1 block text-xs text-muted-foreground">
                Supports images and PDFs.
              </p>
            </div>
          ) : (
            <div className="w-full rounded-lg border p-4 bg-muted/30">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <FileTypeIcon className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <div className="flex-grow">
                    <p className="text-sm font-medium break-all">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)}
                    </p>
                    {isUploading && (
                      <div className="mt-2 w-full">
                        <Progress value={uploadProgress} className="h-2" />
                        <p className="text-xs text-muted-foreground mt-1">
                          {uploadProgress}% complete
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 flex-shrink-0 text-muted-foreground hover:text-foreground"
                  onClick={handleRemoveFile}
                  disabled={isUploading}
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Remove file</span>
                </Button>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="sm:justify-end gap-2">
          <div className="flex items-center gap-2 justify-end">
            <Button variant={"outline"} onClick={handleOpenSelectDialog}>
              <History className="h-3.5 w-3.5 mr-1" />
              Previous Uploads
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!file || isUploading}
              className=" sm:w-auto"
            >
              {isUploading ? "Uploading..." : "Upload File"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
