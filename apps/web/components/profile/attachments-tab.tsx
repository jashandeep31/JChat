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
  ImageIcon,
  VideoIcon,
  FileQuestion,
  Paperclip,
  Eye,
} from "lucide-react";
import useAttachmentQuery from "@/lib/react-query/use-attachment-query";
import { AttachmentType } from "@repo/db";
import Link from "next/link";

const getFileIcon = (fileType: AttachmentType) => {
  if (fileType === "IMAGE")
    return <ImageIcon className="w-6 h-6 text-muted-foreground" />;
  if (fileType === "PDF")
    return <VideoIcon className="w-6 h-6 text-muted-foreground" />;
  return <FileQuestion className="w-6 h-6 text-muted-foreground" />;
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const AttachmentsTab = () => {
  const { deleteAttachmentMutation, getAttachmentsQuery } =
    useAttachmentQuery();
  if (getAttachmentsQuery.data?.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        <Paperclip className="mx-auto h-12 w-12 mb-4 text-muted-foreground/70" />
        <p className="text-lg">No attachments found.</p>
        <p className="text-sm">
          Upload files through the chat or other relevant sections.
        </p>
      </div>
    );
  }

  const handleDelete = (id: string, name: string) => {
    const toastId = toast.loading("Deleting attachment...");
    deleteAttachmentMutation.mutate(id, {
      onSuccess: () => {
        toast.success("Attachment deleted", {
          description: `The file "${name}" has been removed.`,
          id: toastId,
        });
      },
      onError: () => {
        toast.error("Attachment deletion failed", {
          description: `The file "${name}" could not be removed.`,
          id: toastId,
        });
      },
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-foreground mb-1">
          Manage Attachments
        </h3>
        <p className="text-sm text-muted-foreground">
          Review and delete your uploaded files.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {getAttachmentsQuery.data?.map((attachment) => (
          <Card
            key={attachment.id}
            className="bg-background/80 backdrop-blur-sm border shadow-sm"
          >
            <CardContent className="p-4 flex items-center space-x-3">
              {getFileIcon(attachment.type)}
              <div className="flex-grow overflow-hidden">
                <p
                  className="text-sm font-medium text-foreground truncate"
                  title={attachment.filename}
                >
                  {attachment.filename}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(attachment.createdAt.toISOString())}
                </p>
              </div>
              <Link href={attachment.publicUrl} target="_blank">
                <Button variant="ghost" size="icon">
                  <Eye className="w-4 h-4" />
                </Button>
              </Link>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-red-600 flex-shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Attachment?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete &quot;
                      {attachment.filename}
                      &quot;? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() =>
                        handleDelete(attachment.id, attachment.filename)
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
