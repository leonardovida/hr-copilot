import { getCurrentDate } from "@/app/utils";
import { getApiPath } from "@/app/settings";
import FormData from "form-data";

type HttpMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "PATCH"
  | "DELETE"
  | "OPTIONS"
  | "HEAD"
  | "CONNECT"
  | "TRACE";

interface ApiResponse {
  status: number;
  data: object;
}

export const fetcher = async (
  ...args: Parameters<typeof fetch>
): Promise<any> => {
  const response = await fetch(...args);
  return response.json();
};

export const apiPath: string = getApiPath();

/**
 * Sends an API request to the specified endpoint.
 * @param endpoint - The API endpoint.
 * @param method - The HTTP method (default: 'GET').
 * @param urlParams - Additional URL parameters (default: '').
 * @param bodyParams - Request body parameters (default: {}).
 * @param headers - Request headers (default: {'Content-Type': 'application/json'}).
 * @returns A promise that resolves to the API response.
 */
export async function apiRequest(
  endpoint: string,
  method: HttpMethod = "GET",
  urlParams: string = "",
  bodyParams: object = {},
  headers: Record<string, string> = { "Content-Type": "application/json" },
): Promise<ApiResponse> {
  try {
    const url = `${apiPath}${endpoint}${urlParams}`;
    const isFormData = bodyParams instanceof FormData;
    const requestOptions: RequestInit = {
      method,
      headers: isFormData
        ? headers
        : { ...headers, "Content-Type": "application/json" },
      body: isFormData ? bodyParams : JSON.stringify(bodyParams),
    };

    const response = await fetch(url, requestOptions);
    const status = response.status;
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message);
    }

    return { status, data };
  } catch (error) {
    console.error(`Failed to send a request: ${error}`);
    return {
      status: (error as any).statusCode || 500,
      data: {},
    };
  }
}

// Job Descriptions

/**
 * Creates a new job description.
 * @param name - The name of the job description.
 * @param description - The description of the job (default: null).
 * @param file - The PDF file of the job description (default: null).
 * @returns A promise that resolves to the API response.
 */
export async function createNewJobDescription(
  name: string,
  description: string | null,
  file: File | null,
): Promise<ApiResponse> {
  const endpoint = "job-descriptions/";
  const formData = new FormData();
  formData.append("title", name);

  // if both file and description are null, raise error
  if (!file && !description) {
    throw new Error("Both file and description cannot be null");
  }

  if (file) {
    formData.append("pdf_file", file);
  } else {
    formData.append("description", description);
  }
  const headers: Record<string, string> = {
    "Access-Control-Allow-Origin": "*",
    Accept: "application/json",
  };
  return await apiRequest(endpoint, "POST", "", formData, headers);
}

/**
 * Updates a job description.
 * @param id - The ID of the job description.
 * @param name - The updated name of the job description.
 * @param description - The updated description of the job.
 * @returns A promise that resolves to the API response.
 */
export async function updateJobDescription(
  id: number,
  name: string,
  description: string | null,
): Promise<ApiResponse> {
  const endpoint = `job-descriptions/${id}/`;
  const data = {
    title: name,
    description: description,
  };
  return await apiRequest(endpoint, "PUT", "", data);
}

/**
 * Processes a new job description.
 * @param jobDescriptionId - The ID of the job description to process.
 * @returns A promise that resolves to the API response.
 */
export async function processNewJobDescription(
  jobDescriptionId: number,
): Promise<ApiResponse> {
  const endpoint = `job-descriptions/${jobDescriptionId}/process/`;
  return await apiRequest(endpoint, "GET");
}

/**
 * Retrieves a list of job descriptions.
 * @param limit - The maximum number of job descriptions to retrieve (default: 100).
 * @param offset - The offset for pagination (default: 0).
 * @returns A promise that resolves to the API response.
 */
export async function listJobDescription(
  limit: number = 100,
  offset: number = 0,
): Promise<ApiResponse> {
  const endpoint = `job-descriptions/`;
  return await apiRequest(endpoint, "GET");
}

/**
 * Retrieves a specific job description.
 * @param id - The ID of the job description.
 * @returns A promise that resolves to the API response.
 */
export async function getJobDescription(id: number): Promise<ApiResponse> {
  const endpoint = `job-descriptions/${id}/`;
  return await apiRequest(endpoint, "GET");
}

/**
 * Deletes a job description.
 * @param id - The ID of the job description to delete.
 * @returns A promise that resolves to the API response.
 */
export async function deleteJobDescription(id: number): Promise<ApiResponse> {
  const endpoint = `job-descriptions/${id}/`;
  return await apiRequest(endpoint, "DELETE");
}

/**
 * Retrieves a parsed job description.
 * @param id - The ID of the parsed job description.
 * @returns A promise that resolves to the API response.
 */
export async function getParsedJobDescription(
  id: number,
): Promise<ApiResponse> {
  const endpoint = `parsed-job-descriptions/${id}/`;
  return await apiRequest(endpoint, "GET");
}

/**
 * Creates a new parsed job description.
 * @param id - The ID of the job description.
 * @param parsedSkills - The parsed skills object.
 * @returns A promise that resolves to the API response.
 */
export async function postParsedJobDescription(
  id: number,
  parsedSkills: object,
): Promise<ApiResponse> {
  const endpoint = "parsed-job-descriptions/";
  const data = {
    job_description_id: id,
    parsed_skills: parsedSkills,
  };
  return await apiRequest(endpoint, "POST", "", data);
}

// Talents

interface CandidateFile {
  candidateName: string;
  file: File;
}

interface CreateNewTalentResponse {
  candidate: string;
  status: boolean;
}

/**
 * Creates new talents.
 * @param candidateFiles - An array of candidate files.
 * @param jobId - The ID of the associated job.
 * @returns A promise that resolves to an array of create new talent responses.
 */
export async function createNewTalent(
  candidateFiles: CandidateFile[],
  jobId: number,
): Promise<CreateNewTalentResponse[]> {
  const endpoint = "resumes/";
  const headers: Record<string, string> = {
    "Access-Control-Allow-Origin": "*",
    Accept: "application/json",
  };

  const responses: CreateNewTalentResponse[] = [];

  for (const candidateFile of candidateFiles) {
    const formData = new FormData();
    formData.append("job_id", String(jobId));
    formData.append("candidate", candidateFile.candidateName);
    formData.append("resume", candidateFile.file);

    try {
      await apiRequest(endpoint, "POST", "", formData, headers);
      responses.push({ candidate: candidateFile.candidateName, status: true });
    } catch (error) {
      responses.push({ candidate: candidateFile.candidateName, status: false });
    }
  }

  return responses;
}

/**
 * Retrieves a list of talents.
 * @param jobId - The ID of the associated job.
 * @param limit - The maximum number of talents to retrieve (default: 100).
 * @param offset - The offset for pagination (default: 0).
 * @returns A promise that resolves to the API response.
 */
export async function listTalents(
  jobId: number,
  limit: number = 100,
  offset: number = 0,
): Promise<ApiResponse> {
  const endpoint = `resumes/`;
  const urlParams = `?job_id=${jobId}&limit=${limit}&offset=${offset}`;
  return await apiRequest(endpoint, "GET", urlParams);
}

/**
 * Processes a talent.
 * @param jobId - The ID of the associated job.
 * @param pdfId - The ID of the PDF resume.
 * @param readResumePdf - Flag indicating whether to read the resume PDF (default: false).
 * @returns A promise that resolves to the API response.
 */
export async function processTalent(
  jobId: number,
  pdfId: number,
  readResumePdf: boolean = false,
): Promise<ApiResponse> {
  const endpoint = `resumes/${pdfId}/process/`;
  const urlParams = readResumePdf
    ? `?resume_id=${pdfId}&job_id=${jobId}&read_resume_pdf=true`
    : `?resume_id=${pdfId}&job_id=${jobId}`;
  return await apiRequest(endpoint, "GET", urlParams);
}

/**
 * Retrieves the processed skills for a talent.
 * @param pdfId - The ID of the PDF resume.
 * @returns A promise that resolves to the API response.
 */
export async function getProcessedSkills(pdfId: number): Promise<ApiResponse> {
  const endpoint = `parsed-resumes/${pdfId}/`;
  return await apiRequest(endpoint, "GET");
}

/**
 * Deletes a talent.
 * @param id - The ID of the talent to delete.
 * @returns A promise that resolves to the API response.
 */
export async function deleteTalent(id: number): Promise<ApiResponse> {
  const endpoint = `resumes/${id}/`;
  return await apiRequest(endpoint, "DELETE");
}

/**
 * Retrieves the talent API status.
 * @param id - The ID of the talent.
 * @returns A promise that resolves to the API response.
 */
export async function getTalentApiStatus(id: number): Promise<ApiResponse> {
  const endpoint = `resumes/${id}/status/`;
  return await apiRequest(endpoint, "GET");
}

/**
 * Updates a talent.
 * @param id - The ID of the talent to update.
 * @param candidateName - The updated candidate name.
 * @returns A promise that resolves to the API response.
 */
export async function updateTalent(
  id: number,
  candidateName: string,
): Promise<ApiResponse> {
  const endpoint = `resumes/${id}/`;
  const formData = new FormData();
  const headers: Record<string, string> = {
    "Access-Control-Allow-Origin": "*",
    Accept: "application/json",
  };
  formData.append("candidate_name", candidateName);
  return await apiRequest(endpoint, "PUT", "", formData, headers);
}

// Scores

/**
 * Processes a new score.
 * @param jobId - The ID of the associated job.
 * @param pdfId - The ID of the PDF resume.
 * @returns A promise that resolves to the API response.
 */
export async function processNewScore(
  jobId: number,
  pdfId: number,
): Promise<ApiResponse> {
  const endpoint = `scores/process/${pdfId}/${jobId}/`;
  return await apiRequest(endpoint, "POST");
}

/**
 * Retrieves the last score for a talent.
 * @param jobId - The ID of the associated job.
 * @param pdfId - The ID of the PDF resume.
 * @returns A promise that resolves to the API response.
 */
export async function getLastScore(
  jobId: number,
  pdfId: number,
): Promise<ApiResponse> {
  const endpoint = `scores/${pdfId}/${jobId}/`;
  return await apiRequest(endpoint, "GET");
}

/**
 * Retrieves the ranking for a job.
 * @param jobId - The ID of the job.
 * @returns A promise that resolves to the API response.
 */
export async function getRanking(jobId: number): Promise<ApiResponse> {
  const endpoint = `scores/ranking/${jobId}/`;
  return await apiRequest(endpoint, "GET");
}

// Feedbacks

/**
 * Creates a new feedback.
 * @param feedbackFile - The feedback file (default: null).
 * @param title - The title of the feedback.
 * @param description - The description of the feedback.
 * @returns A promise that resolves to the API response.
 */
export async function createFeedback(
  feedbackFile: File | null,
  title: string,
  description: string,
): Promise<ApiResponse> {
  const endpoint = "feedbacks/";
  const formData = new FormData();
  if (feedbackFile) {
    formData.append("feedback_file", feedbackFile);
  } else {
    formData.append("feedback_file", "NO_FILE");
  }
  formData.append("title", title);
  formData.append("description", description);
  const headers: Record<string, string> = {
    "Access-Control-Allow-Origin": "*",
    Accept: "application/json",
  };
  return await apiRequest(endpoint, "POST", "", formData, headers);
}

// Statuses from Redis

/**
 * Retrieves the resume status from Redis.
 * @param jobId - The ID of the associated job.
 * @param pdfId - The ID of the PDF resume.
 * @returns A promise that resolves to the API response.
 */
export async function getResumeStatus(
  jobId: number,
  pdfId: number,
): Promise<ApiResponse> {
  const endpoint = `redis/resume/${jobId}/${pdfId}/evaluate_status`;
  return await apiRequest(endpoint, "GET");
}

/**
 * Retrieves the job status from Redis.
 * @param jobId - The ID of the job.
 * @returns A promise that resolves to the API response.
 */
export async function getJobStatus(jobId: number): Promise<ApiResponse> {
  const endpoint = `redis/job-descriptions/${jobId}/extract_status`;
  return await apiRequest(endpoint, "GET");
}
