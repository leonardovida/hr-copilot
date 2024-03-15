import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Trash2 } from "lucide-react";

export function DeleteCandidateDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="destructive">
          <Trash2 className="mr-2 h-4 w-4" />
          <span>Delete</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete Candidate</DialogTitle>
          <DialogDescription>
            Are you sure that you want to delete this Candidate? This change is
            irreversible!
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="submit" variant="destructive" className="min-w-[380px]">
            Yes, I want to delete this Candidate!
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
