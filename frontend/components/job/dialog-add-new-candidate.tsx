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
import { createNewTalent } from "@/app/api";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";
import { InputCandidateFile } from "@/components/shared/input-candidate-file";
import { Loader2 } from "lucide-react";

export function AddNewCandidateDialog(data: any) {
  const { toast } = useToast();

  var [open, setOpen] = useState<boolean>(false);
  var [newCandidateList, setNewCandidateList] = useState<Array<candidateFile>>(
    [],
  );
  var [isLoading, setIsLoading] = useState<boolean>(false);

  var disabled: boolean = data.data.disabled;
  var jobId: number = data.data.jobId;

  const handleFileChange = (files: any) => {
    setNewCandidateList(files);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button disabled={disabled}>New Candidates </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[950px] ">
        <DialogHeader>
          <DialogTitle>New Candidates 📕</DialogTitle>
          <DialogDescription>
            Add new candidates and Click create when you are done.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <InputCandidateFile
            onInputData={handleFileChange}
            multiple={true}
          ></InputCandidateFile>
        </div>

        <DialogFooter>
          {!isLoading ? (
            <Button
              onClick={async () => {
                if (newCandidateList.length == 0) {
                  toast({
                    variant: "destructive",
                    title: "Uh oh! Validation error.",
                    description: "You must to send at least one candidate.",
                  });
                } else {
                  setIsLoading(true);
                  let candidatesResponse = await addNewCandidate(
                    jobId,
                    newCandidateList,
                  );
                  let hasResponseError = false;

                  candidatesResponse.forEach((candidate) => {
                    if (candidate.status == false) {
                      toast({
                        variant: "destructive",
                        title: "Uh oh! Something went wrong.",
                        description: `There was a problem to add ${candidate.candidate}.`,
                      });
                      setIsLoading(false);
                      hasResponseError = true;
                    }
                  });

                  if (hasResponseError == false) {
                    toast({
                      title: "New Candidate has been created!",
                      description:
                        "If you want evaluate the skills and score, please, click in Evaluate.",
                    });
                    setTimeout(() => {
                      setIsLoading(false),
                        (window.location.href =
                          window.location.href + "&tab=cv");
                    }, 1000);
                  }
                }
              }}
            >
              Create
            </Button>
          ) : (
            <Button disabled>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function addNewCandidate(
  jobId: number,
  newCandidateList: Array<candidateFile>,
): Promise<Array<createNewTalentResponse>> {
  return createNewTalent(newCandidateList, jobId).then((response) => {
    return response;
  });
}
