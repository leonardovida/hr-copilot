import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { Label } from "@/components/ui/label";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Edit, XCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface inputFileProps {
  onInputData: (data: Array<candidateFile> | null) => void;
  multiple: boolean;
}

export function InputCandidateFile({
  onInputData,
  multiple = false,
}: inputFileProps) {
  const { toast } = useToast();

  // EDIT FILE NAME
  const [editNameList, setEditNameList] = useState<Array<number>>([]);
  const [auxEditName, setAuxEditName] = useState<string>("");

  // FILES
  const [preview, setPreview] = useState<Array<candidateFile>>([]);
  const { acceptedFiles, getRootProps, getInputProps, isDragActive } =
    useDropzone({
      accept: {
        "application/pdf": [".pdf"],
      },
      multiple: multiple,
      onDrop: (acceptedFiles) => {
        var candidateFiles: Array<candidateFile> = [];
        var index: number = 0;

        acceptedFiles.forEach((file) => {
          candidateFiles.push({
            id: index++,
            candidateName: file.name.slice(0, -4),
            file: file,
          });
        });

        setPreview(candidateFiles);
        onInputData(candidateFiles);
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
          <p>Drop the files here ...</p>
        ) : (
          <p>📁 Drag and drop your pdf files here, or click to select files</p>
        )}
      </div>

      {preview.length > 0 && (
        <ScrollArea className="mt-2 h-[350px] rounded-md border">
          {preview.map((e) => (
            <div key={e.id}>
              <div className="grid grid-cols-10 gap-4 mt-3 mb-3 ml-2">
                {/* CANDIDATE NAME */}
                <div className="col-span-4">
                  <Label htmlFor="candidateFile">Candidate Name:</Label>
                  {editNameList.includes(e.id) ? (
                    <Input
                      className="text-sm"
                      value={auxEditName}
                      onChange={(e) => setAuxEditName(e.target.value)}
                    ></Input>
                  ) : (
                    <p
                      className="text-sm mt-2 text-ellipsis overflow-hidden"
                      id="candidateFile"
                    >
                      {" "}
                      {e.candidateName}{" "}
                    </p>
                  )}
                </div>

                {/* FILE NAME */}
                <div className="col-span-4">
                  <Label htmlFor="candidateFile">File: </Label>
                  <p
                    className="text-sm mt-2 text-ellipsis overflow-hidden"
                    id="candidateFile"
                  >
                    {" "}
                    {e.file.name}{" "}
                  </p>
                </div>

                {/* EDIT / CHECK BTN */}
                {editNameList.includes(e.id) ? (
                  <Button
                    variant="ghost"
                    onClick={() => {
                      if (auxEditName.replace(/\s/g, "").length == 0) {
                        toast({
                          variant: "destructive",
                          title: "Uh oh! Something went wrong.",
                          description:
                            "The candidate name must to have at least 2 letters",
                        });
                      } else {
                        // UPDATE FILES
                        preview.filter((el) => el.id == e.id)[0].candidateName =
                          auxEditName;
                        setPreview(preview);
                        onInputData(preview);

                        // CLEAN UP AUX VARS
                        setEditNameList([]);
                        setAuxEditName("");
                      }
                    }}
                  >
                    <Check />
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    onClick={() => {
                      if (editNameList.length == 0) {
                        setEditNameList([e.id]);
                        setAuxEditName(e.candidateName);
                      }
                    }}
                  >
                    <Edit />
                  </Button>
                )}

                {/* DELETE BTN */}
                <Button
                  variant="ghost"
                  onClick={() => {
                    setPreview(
                      preview.filter((preview) => preview.id !== e.id),
                    );
                  }}
                >
                  <XCircle />
                </Button>
              </div>
              <Separator />
            </div>
          ))}
          <ScrollBar orientation="vertical" />
        </ScrollArea>
      )}
    </div>
  );
}

export default InputCandidateFile;
