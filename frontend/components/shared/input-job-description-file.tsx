import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Trash2, XCircle } from "lucide-react";

interface inputFileProps {
  onInputData: (data: Array<File> | null) => void;
}

export function InputFiles({ onInputData }: inputFileProps) {
  const [preview, setPreview] = useState<Array<File> | null>(null);
  const { acceptedFiles, getRootProps, getInputProps, isDragActive } =
    useDropzone({
      accept: {
        "application/pdf": [".pdf"],
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
          <p>Drop the files here ...</p>
        ) : (
          <p>📁 Drag and drop your pdf files here, or click to select files</p>
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
