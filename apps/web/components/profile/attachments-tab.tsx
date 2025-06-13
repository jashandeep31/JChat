import { Attachment } from "./types";
import { Card, CardContent } from "@repo/ui/components/card";
import { Button } from "@repo/ui/components/button";
import { toast } from "sonner";
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
import {
  Trash2,
  FileText,
  ImageIcon,
  VideoIcon,
  FileArchive,
  FileQuestion,
  Paperclip,
} from "lucide-react";

const getFileIcon = (fileType: string) => {
  if (fileType.startsWith("image/"))
    return <ImageIcon className="w-6 h-6 text-slate-500" />;
  if (fileType.startsWith("video/"))
    return <VideoIcon className="w-6 h-6 text-slate-500" />;
  if (fileType === "application/pdf")
    return <FileText className="w-6 h-6 text-slate-500" />;
  if (
    fileType === "application/zip" ||
    fileType === "application/x-rar-compressed"
  ) {
    return <FileArchive className="w-6 h-6 text-slate-500" />;
  }
  return <FileQuestion className="w-6 h-6 text-slate-500" />;
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

interface AttachmentsTabProps {
  attachments: Attachment[];
  onDeleteAttachment: (id: string) => void;
}

export const AttachmentsTab = ({
  attachments,
  onDeleteAttachment,
}: AttachmentsTabProps) => {
  if (attachments.length === 0) {
    return (
      <div className="text-center py-10 text-slate-500">
        <Paperclip className="mx-auto h-12 w-12 mb-4 text-slate-400" />
        <p className="text-lg">No attachments found.</p>
        <p className="text-sm">
          Upload files through the chat or other relevant sections.
        </p>
      </div>
    );
  }

  const handleDelete = (id: string, name: string) => {
    onDeleteAttachment(id);
    toast.success("Attachment deleted", {
      description: `The file "${name}" has been removed.`,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-slate-800 mb-1">
          Manage Attachments
        </h3>
        <p className="text-sm text-slate-500">
          Review and delete your uploaded files.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {attachments.map((attachment) => (
          <Card
            key={attachment.id}
            className="bg-white/80 backdrop-blur-sm border-none shadow-sm"
          >
            <CardContent className="p-4 flex items-center space-x-3">
              {getFileIcon(attachment.type)}
              <div className="flex-grow overflow-hidden">
                <p
                  className="text-sm font-medium text-slate-700 truncate"
                  title={attachment.name}
                >
                  {attachment.name}
                </p>
                <p className="text-xs text-slate-500">
                  {attachment.size} • Uploaded:{" "}
                  {formatDate(attachment.uploadedAt)}
                </p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-slate-500 hover:text-red-600 flex-shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Attachment?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete &quot;{attachment.name}
                      &quot;? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() =>
                        handleDelete(attachment.id, attachment.name)
                      }
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
