type ENV = "LOCAL" | "PROD";

// HERE IS THE ENV DEFINITION
export const env: ENV = "PROD";

export const localApiPath: string = "http://localhost:8000/api/";

export function getApiPath(): string {
  return env == "PROD"
    ? process.env.NEXT_PUBLIC_TALENT_COPILOT_API_URL ??
        "http://localhost:8000/api/"
    : localApiPath;
}

export function getEnv(): ENV {
  return env;
}
