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
import { deleteJobDescription } from "@/app/api";
import { useToast } from "@/components/ui/use-toast";

export function DeleteJobDescriptionDialog(data: any) {
  const { toast } = useToast();
  var jobId: number = data.data.jobId;

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
          <DialogTitle>Delete Job Description</DialogTitle>
          <DialogDescription>
            Are you sure that you want to delete this Job Description? This
            change is irreversible!
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="submit"
            variant="destructive"
            className="min-w-[380px]"
            onClick={async () => {
              let response = await deleteJobDescription(jobId);
              if (response.status < 400) {
                toast({
                  title: "The Job Description has been deleted!",
                  description: "Redirecting to the Job List page.",
                });
                setTimeout(() => {
                  window.location.href = "/jobs";
                }, 1500);
              } else {
                toast({
                  variant: "destructive",
                  title: "Uh oh! Something went wrong.",
                  description: "There was a problem with your request.",
                });
              }
            }}
          >
            Yes, I want to delete this Job Description!
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
