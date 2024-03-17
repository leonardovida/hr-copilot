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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { createNewJobDescription, processNewJobDescription } from "@/app/api";
import { validateStringLength } from "@/app/utils";
import { InputFiles } from "@/components/shared/input-job-description-file";
import { Loader2 } from "lucide-react";

export function NewJobDescriptionDialog() {
  const { toast } = useToast();
  var [name, setName] = useState<string>("");
  var [description, setDescription] = useState<string | null>(null);
  var [file, setFile] = useState<File | null>(null);
  var [loading, setLoading] = useState<boolean>(false);

  const handleFileChange = (files: any) => {
    setFile(files[0]);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="w-44"> New Job Description 📕 </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[1200px] ">
        <DialogHeader>
          <DialogTitle>New Job Description 📕</DialogTitle>
          <DialogDescription>
            Create a new job description. Click create when you are done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Label htmlFor="name">Role Name</Label>
          <div className="grid grid-cols-1 items-center gap-4">
            <Input
              id="name"
              placeholder="Senior Software Engineer at DBC"
              className="col-span-3"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <Label htmlFor="description" className="pt-2">
            Description
          </Label>

          <Tabs className="flex-1 space-y-4" defaultValue="text">
            <TabsList className="grid w-[600px] grid-cols-2">
              <TabsTrigger value="text">Add description via text</TabsTrigger>
              <TabsTrigger value="file">
                Add description via pdf file
              </TabsTrigger>
            </TabsList>
            <TabsContent value="text">
              <div className="text grid-cols-1 items-center gap-4 h-min-24">
                <Textarea
                  id="description"
                  placeholder="..."
                  className="h-52"
                  value={description ? description : ""}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </TabsContent>
            <TabsContent value="file">
              <div className="text grid-cols-1 items-center gap-4 h-min-24 h-52">
                <InputFiles onInputData={handleFileChange}></InputFiles>
              </div>
            </TabsContent>
          </Tabs>
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
                } else {
                  setLoading(true);
                  let response = await createNewJobDescription(
                    name,
                    description,
                    file,
                  );
                  if (response.status < 400) {
                    toast({
                      title: "A new Job Description has been created 🚀",
                      description:
                        "This process may take some time. Please be patient until the response is fully completed.",
                    });
                    // TODO: resolve the ts-ignore issue
                    // @ts-ignore
                    processNewJobDescription(response.data.id);
                    setTimeout(() => {
                      setLoading(false), (window.location.href = "/jobs");
                    }, 1000);
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
