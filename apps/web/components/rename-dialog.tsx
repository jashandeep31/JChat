import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/dialog";
import { Input } from "@repo/ui/components/input";
import { Button } from "@repo/ui/components/button";

export interface RenameDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chatName: string;
  onChatNameChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const RenameDialog = ({
  open,
  onOpenChange,
  chatName,
  onChatNameChange,
  onSubmit,
}: RenameDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle>Rename Chat</DialogTitle>
            <DialogDescription>
              Enter a new name for this chat.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={chatName}
              onChange={(e) => onChatNameChange(e.target.value)}
              placeholder="Chat name"
              className="w-full"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RenameDialog;
