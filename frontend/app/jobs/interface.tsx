interface JobDescription {
  id: number;
  name: string;
  description: string;
  s3_url: string | null;
  createdAt: string;
  updatedAt: string | null;
}

interface JobDescriptionApiResponse {
  id: number;
  title: string;
  description: string;
  s3_url: string | null;
  created_date: string;
  updated_date: string | null;
}
