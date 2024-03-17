import { ExternalLink } from "lucide-react";
import { getEnv } from "@/app/settings";

export function OpenFile(data: any) {
  return (
    <a
      className="inline-flex items-center text-sm text-muted-foreground space-x-1"
      href={getFileUrl(data.fileUrl)}
      target="_blank"
      rel="noopener noreferrer"
    >
      <span>Open File</span>
      <ExternalLink className="h-4 w-4" />
    </a>
  );
}

function getFileUrl(url: string): string {
  if (getEnv() == "LOCAL") {
    const searchPattern = "host.docker.internal:4566";
    const replacement = "localhost:4566";

    if (url && url.includes(searchPattern)) {
      return url.replace(searchPattern, replacement);
    }
    return url;
  } else {
    return url;
  }
}
