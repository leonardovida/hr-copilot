import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export async function RecentMatches() {
  const candidateData: RecentCandidate[] = await getRecentCandidatesData();

  return (
    <div className="space-y-8">
      {candidateData.map((candidate) => (
        <div key={candidate.id} className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarFallback>
              {" "}
              {candidate.candidateName.slice(0, 2).toUpperCase()}{" "}
            </AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">
              {" "}
              {candidate.candidateName}{" "}
            </p>
            <p className="text-sm text-muted-foreground">
              {" "}
              {candidate.JobDescription}{" "}
            </p>
          </div>
          <div className="ml-auto font-medium">
            Score: {(candidate.score * 100).toFixed(1) + "%"}
          </div>
        </div>
      ))}
    </div>
  );
}

async function getRecentCandidatesData(): Promise<RecentCandidate[]> {
  const data: RecentCandidate[] = [
    {
      id: 0,
      candidateName: "Samuel Favarin",
      JobDescription: "Data Engineer at DBC",
      score: 0.99,
    },
    {
      id: 1,
      candidateName: "Leonardo Vida",
      JobDescription: "Senior Data Engineer at DBC",
      score: 0.99,
    },
    {
      id: 2,
      candidateName: "Natalia Pipas",
      JobDescription: "Senior Data Engineer at DBC",
      score: 0.99,
    },
    {
      id: 3,
      candidateName: "Angeliki Kalamara",
      JobDescription: "ML Engineer at DBC",
      score: 0.99,
    },
  ];

  return data;
}
