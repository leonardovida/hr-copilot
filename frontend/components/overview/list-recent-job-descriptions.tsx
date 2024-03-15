import { Avatar, AvatarFallback } from "@/components/ui/avatar";

import { Button } from "../ui/button";
import Link from "next/link";

export async function RecentJobDescriptions() {
  const data: RecentJobDescription[] = await getRecentJobDescriptionsData();

  return (
    <div className="space-y-8">
      {data.map((job) => (
        <div key={job.id} className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarFallback>📕</AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">{job.name}</p>
            <p className="text-sm text-muted-foreground line-clamp-3">
              {job.description}
            </p>
          </div>
        </div>
      ))}

      <div className="flex items-center">
        <div className="ml-4 space-y-1"></div>
        <div className="ml-auto">
          <Link href="/jobs">
            <Button variant="outline"> See More</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

async function getRecentJobDescriptionsData(): Promise<RecentJobDescription[]> {
  const data: RecentJobDescription[] = [
    {
      id: 0,
      name: "Data Engineer at DBC",
      description:
        "You make data do valuable work. By creating a forecasting model which links the emission reduction potential of technologies to the financial costs of implementing them.",
    },
    {
      id: 1,
      name: "Senior Data Engineer at DBC",
      description:
        "Design, develop, and maintain scalable data pipelines to support the needs of the business. Collaborate with cross-functional teams to understand data requirements and provide data-driven solutions. Optimize and improve existing data infrastructure for performance and reliability. Implement best practices for data governance, security, and compliance. Mentor and guide junior members of the data engineering team. Stay updated on industry trends and technologies to ensure our data architecture remains cutting-edge.",
    },
    {
      id: 2,
      name: "ML Engineer at DBC",
      description:
        "At DBC, we value innovation, collaboration, and a commitment to excellence. As a Machine Learning Engineer, you will have the opportunity to work on cutting-edge projects, collaborate with talented professionals, and contribute to the success of our organization.",
    },
  ];
  return data;
}
