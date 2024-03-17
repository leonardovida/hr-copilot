interface ApiResponse {
  status: number;
  data: object;
}

interface RecentCandidate {
  id: number;
  candidateName: string;
  JobDescription: string;
  score: number;
}

interface RecentJobDescription {
  id: number;
  name: string;
  description: string;
}

interface Totals {
  total: number;
  diffLastWeek: string;
}

interface createNewTalentResponse {
  candidate: string;
  status: boolean;
}

// Statuses of tasks from Redis
interface BackgroundTasksStatusResponse {
  tasks: Record<number, string>;
}
