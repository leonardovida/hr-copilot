// TALENT
interface CandidateSkill {
  id: number;
  skill: string;
  cvMatchDescription: string;
  contentMatchDescription: string;
  reasoning: string;
  type: string[];
}

interface Candidate {
  id: number;
  name: string;
  skills: CandidateSkill[];
  score: number;
  url: string;
  createdAt: string;
}

interface CandidateRanked {
  id: number;
  talentId: number;
  jobId: number;
  name: string;
  url: string | null;
  score: number;
  createdAt: string;
}

interface TalentApiResponse {
  id: number;
  name: string;
  job_id: number;
  s3_url: string | null;
  created_date: string;
}

interface TalentApiStatus {
  id: number;
  loading: boolean;
}

interface candidateFile {
  id: number;
  candidateName: string;
  file: File;
}

// TALENT PROCESS API RESPONSE
interface ParsedSkills {
  required_skills: {
    hard_skills: Record<string, TalentParsedSkill>;
    soft_skills: Record<string, TalentParsedSkill>;
  };
  nice_to_have_skills: {
    hard_skills: Record<string, TalentParsedSkill>;
    soft_skills: Record<string, TalentParsedSkill>;
  };
}

interface TalentParsedSkill {
  name: string;
  match: "YES" | "NO" | "PARTIAL";
  reasoning: string;
  content_match: string;
}
interface TalentEvaluationApiResponse {
  id: number;
  job_description_id: number;
  parsed_skills: ParsedSkills;
}

// Score
interface ScoreApiResponse {
  id: number;
  pdf_id: number;
  job_description_id: number;
  parsed_job_description_id: number;
  score: number;
  created_date: string;
}

// JOB DESCRIPTION
interface JobDescriptionSkills {
  id: number;
  skill: string;
  description: string;
  longDescription: string;
  categories: string[];
  type: string[];
}

// JOB DESCRIPTION API INTERFACE
interface Skill {
  name: string;
  description: string;
  long_description: string;
  skill_categories: string[];
}

interface HardSkills {
  [key: string]: Skill;
}

interface SoftSkills {
  [key: string]: Skill;
}

interface ParsedSkills {
  hard_skills: HardSkills;
  soft_skills: SoftSkills;
}

interface RequiredSkills {
  hard_skills: HardSkills;
  soft_skills: SoftSkills;
}

interface NiceToHaveSkills {
  hard_skills: HardSkills;
  soft_skills: SoftSkills;
}

interface ParsedSkillsApiResponse {
  required_skills: RequiredSkills;
  nice_to_have_skills: NiceToHaveSkills;
}

interface JobDescriptionApiResponse {
  id: number;
  job_description_id: number;
  parsed_skills: ParsedSkillsApiResponse;
  s3_url: string | null;
  created_date: string;
}
