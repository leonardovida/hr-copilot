"use client";

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
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { validateStringLength } from "@/app/utils";
import { Loader2, MessageSquarePlusIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useDropzone } from "react-dropzone";
import { ScrollArea } from "@/components/ui/scroll-area";
import { XCircle } from "lucide-react";

import { createFeedback } from "@/app/api";

interface inputFileProps {
  onInputData: (data: Array<File> | null) => void;
}

export function FeedbackDialog() {
  const { toast } = useToast();
  var [name, setName] = useState<string>("");
  var [description, setDescription] = useState<string>("");
  var [file, setFile] = useState<File | null>(null);
  var [loading, setLoading] = useState<boolean>(false);
  var [open, setOpen] = useState<boolean>(false);

  const handleFileChange = (files: any) => {
    setFile(files[0]);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon">
              <MessageSquarePlusIcon className="h-[1.2rem] w-[1.2rem]" />
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-[1200px] ">
            <DialogHeader>
              <DialogTitle>Send a feedback 📕</DialogTitle>
              <DialogDescription>
                Send a new feedback. Click send when you are done.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <Label htmlFor="name">Title</Label>

              <div className="grid grid-cols-1 items-center gap-4">
                <Input
                  id="name"
                  placeholder="Add here your feedback title"
                  className="col-span-3"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <Label htmlFor="description" className="pt-2">
                Description
              </Label>

              <div className="text grid-cols-1 items-center gap-4 h-min-24">
                <Textarea
                  id="description"
                  placeholder="Add here a description of your feedback"
                  className="h-52"
                  value={description ? description : ""}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <Label htmlFor="description" className="pt-2">
                Screenshot
              </Label>

              <div className="text grid-cols-1 items-center gap-4 h-min-24">
                <InputFiles onInputData={handleFileChange}></InputFiles>
              </div>
            </div>

            <DialogFooter>
              {!loading ? (
                <Button
                  type="submit"
                  onClick={async () => {
                    if (!validateStringLength(name)) {
                      toast({
                        variant: "destructive",
                        title: "Uh oh! Validation error.",
                        description:
                          "Your role name must to have between 5 and 255 chars.",
                      });
                    }
                    if (!validateStringLength(description, 5, 2048)) {
                      toast({
                        variant: "destructive",
                        title: "Uh oh! Validation error.",
                        description:
                          "Your role name must to have between 5 and 2048 chars.",
                      });
                    } else {
                      setLoading(true);
                      let response = await createFeedback(
                        file,
                        name,
                        description,
                      );
                      if (response.status < 400) {
                        toast({
                          title: "A new Feedback has been sent 🚀",
                          description:
                            "Thanks for sharing your experience with us!",
                        });
                        setLoading(false);
                        setDescription("");
                        setName("");
                        setOpen(false);
                      } else {
                        toast({
                          variant: "destructive",
                          title: "Uh oh! Something went wrong.",
                          description: "There was a problem with your request.",
                        });
                        setLoading(false);
                      }
                    }
                  }}
                >
                  Send
                </Button>
              ) : (
                <Button disabled>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </DropdownMenuTrigger>
    </DropdownMenu>
  );
}

export function InputFiles({ onInputData }: inputFileProps) {
  const [preview, setPreview] = useState<Array<File> | null>(null);
  const { acceptedFiles, getRootProps, getInputProps, isDragActive } =
    useDropzone({
      accept: {
        "application/image": [".jpeg", ".jpg", ".png"],
      },
      multiple: false,
      onDrop: (acceptedFiles) => {
        setPreview(acceptedFiles);
        onInputData(acceptedFiles);
      },
    });

  return (
    <div>
      <div
        {...getRootProps()}
        className="rounded-md border border-dashed p-3 cursor-pointer"
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drop the file here ...</p>
        ) : (
          <p>📁 Drag and drop your image here, or click to select a file</p>
        )}
      </div>
      {preview && (
        <ScrollArea className="mt-2 rounded-md border">
          <div>
            {preview.map((e) => (
              <div key={e.name} className="flex items-center text-sm">
                <Button
                  variant="outline"
                  onClick={() => {
                    setPreview(null);
                  }}
                >
                  <XCircle />
                </Button>
                <p className="ml-2">File: {e.name}</p>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}

export default InputFiles;
