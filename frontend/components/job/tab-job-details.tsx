"use client";
import { Badge } from "@/components/ui/badge";
import { getVariantBySkillType } from "@/components/job/utils";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import React, { useEffect, useState } from "react";
import { getParsedJobDescription, fetcher, apiPath } from "@/app/api";
import useSWR from "swr";

export function useGetJobDescriptionStatus(
  jobId: number,
  refreshStatusApiInterval: number | null,
) {
  // TODO: resolve the ts-ignore issue
  // @ts-ignore
  const { data, error } = useSWR(
    `${apiPath}redis/job-descriptions/${jobId}/extract_status`,
    fetcher,
    { refreshInterval: refreshStatusApiInterval },
  );
  const isLoading = !data && !error;
  return {
    apiStatusData: data,
    apiStatusError: error,
    apiStatusIsLoading: isLoading,
  };
}

export function JobDetailsTab(data: any) {
  var jobDescription: string | null = data.data.jobDescription;
  var jobId: number = data.data.jobId;
  var jobUrl: string | null = data.data.jobUrl;

  let [skills, setSkills] = useState<JobDescriptionSkills[]>([]);
  let [apiIsRequestError, setIsApiRequestError] = useState<boolean>(false);

  const [refreshStatusApiInterval, setRefreshStatusApiInterval] = useState<
    number | null
  >(10000);
  const { apiStatusData, apiStatusError, apiStatusIsLoading } =
    useGetJobDescriptionStatus(jobId, refreshStatusApiInterval);

  useEffect(() => {
    if (apiStatusData && apiStatusData.status === "Done") {
      setRefreshStatusApiInterval(null);
    }

    const fetchData = () => {
      getJobDescriptionSkillsData(jobId)
        .then((result) => {
          setSkills(result);
        })
        .catch((error) => {
          setSkills([]);
          setIsApiRequestError(true);
          console.error("Error fetching job descriptions:", error);
        });
    };

    fetchData();
  }, [apiStatusData, apiStatusError, apiStatusIsLoading]);

  return (
    <ResizablePanelGroup direction="horizontal" className="rounded-lg border">
      <ResizablePanel defaultSize={20} className="p-5">
        <p className="text-lg font-semibold">Job Description</p>
        {/* { jobUrl && jobUrl != 'undefined' && jobUrl != 'null' && (
        <OpenFile fileUrl={jobUrl} />
    )} */}

        {jobDescription ? (
          <ReactMarkdown className="text-sm mt-3">
            {jobDescription}
          </ReactMarkdown>
        ) : (
          <div className="space-y-6 mt-3">
            <Skeleton className="h-4" />
            <Skeleton className="h-4" />
            <Skeleton className="h-4" />
            <Skeleton className="h-4" />
            <Skeleton className="h-4" />
            <Skeleton className="h-4" />
          </div>
        )}
      </ResizablePanel>

      <ResizableHandle />

      <ResizablePanel defaultSize={50}>
        {apiStatusData && apiStatusData.status == "Processing" && (
          <Alert>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            <AlertTitle>Processing...</AlertTitle>
            <AlertDescription>
              The Job Description skill extraction is currently running in the
              background and may take a few minutes. Once finished, the results
              will be displayed on this page.
            </AlertDescription>
          </Alert>
        )}
        <Table>
          {apiIsRequestError ? (
            <TableCaption>
              No parsed job description found. May you have to re-evaluate the
              Job Description
            </TableCaption>
          ) : (
            <TableCaption></TableCaption>
          )}
          <TableHeader>
            <TableRow>
              <TableHead></TableHead>
              <TableHead>Skill</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Long Description</TableHead>
              <TableHead>Categories</TableHead>
              <TableHead>Type</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {skills.length > 0 && apiIsRequestError == false
              ? skills.map((skill) => (
                  <TableRow key={skill.id}>
                    <TableCell className="font-medium">{skill.id}</TableCell>
                    <TableCell>{skill.skill}</TableCell>
                    <TableCell className="break-inside-avoid-column">
                      {skill.description}
                    </TableCell>
                    <TableCell>{skill.longDescription}</TableCell>
                    <TableCell>{skill.categories.join(", ")}</TableCell>
                    <TableCell>
                      <Badge
                        className="m-1 w-[100px] justify-center"
                        variant={getVariantBySkillType(skill.type[0])}
                      >
                        {skill.type[0]}
                      </Badge>
                      <Badge
                        className="m-1 w-[100px] justify-center"
                        variant={getVariantBySkillType(skill.type[1])}
                      >
                        {skill.type[1]}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              : [{ id: 0 }, { id: 1 }, { id: 2 }, { id: 3 }].map((e) => (
                  <TableRow key={e.id}>
                    <TableCell>
                      <Skeleton className="h-4" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4" />
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}

function getJobDescriptionSkillsData(
  id: number,
): Promise<JobDescriptionSkills[]> {
  let jobsDescriptionSkills: Promise<JobDescriptionSkills[]> =
    getParsedJobDescription(id)
      .then((skills) => {
        let jobsDescriptionSkills: JobDescriptionSkills[] = [];
        let skillsApiResponse = skills.data as JobDescriptionApiResponse;
        jobsDescriptionSkills = formatJobDescriptionSkills(skillsApiResponse);
        return jobsDescriptionSkills;
      })
      .catch((error) => {
        console.error("Error fetching job descriptions:", error);
        return [];
      });
  return jobsDescriptionSkills;
}

function formatJobDescriptionSkills(
  skills: JobDescriptionApiResponse,
): JobDescriptionSkills[] {
  let jobsDescriptionSkills: JobDescriptionSkills[] = [];
  let index: number = 0;

  const requiredAndHardSkills: Skill[] | null = skills.parsed_skills
    .required_skills.hard_skills
    ? Object.values(skills.parsed_skills.required_skills.hard_skills)
    : null;
  const requiredAndSoftSkills: Skill[] | null = skills.parsed_skills
    .required_skills.soft_skills
    ? Object.values(skills.parsed_skills.required_skills.soft_skills)
    : null;
  const niceToHaveAndHardSkills: Skill[] | null = skills.parsed_skills
    .nice_to_have_skills.hard_skills
    ? Object.values(skills.parsed_skills.nice_to_have_skills.hard_skills)
    : null;
  const niceToHaveAndSoftSkills: Skill[] | null = skills.parsed_skills
    .nice_to_have_skills.soft_skills
    ? Object.values(skills.parsed_skills.nice_to_have_skills.soft_skills)
    : null;

  if (requiredAndHardSkills) {
    requiredAndHardSkills.map((skill) => {
      jobsDescriptionSkills.push({
        id: index,
        skill: skill.name,
        description: skill.description,
        longDescription: skill.long_description,
        categories: skill.skill_categories,
        type: ["Required", "Hard Skill"],
      });
      index++;
    });
  }

  if (requiredAndSoftSkills) {
    requiredAndSoftSkills.map((skill) => {
      jobsDescriptionSkills.push({
        id: index,
        skill: skill.name,
        description: skill.description,
        longDescription: skill.long_description,
        categories: skill.skill_categories,
        type: ["Required", "Soft Skill"],
      });
      index++;
    });
  }

  if (niceToHaveAndHardSkills) {
    niceToHaveAndHardSkills.map((skill) => {
      jobsDescriptionSkills.push({
        id: index,
        skill: skill.name,
        description: skill.description,
        longDescription: skill.long_description,
        categories: skill.skill_categories,
        type: ["Nice to Have", "Hard Skill"],
      });
      index++;
    });
  }

  if (niceToHaveAndSoftSkills) {
    niceToHaveAndSoftSkills.map((skill) => {
      jobsDescriptionSkills.push({
        id: index,
        skill: skill.name,
        description: skill.description,
        longDescription: skill.long_description,
        categories: skill.skill_categories,
        type: ["Nice to Have", "Soft Skill"],
      });
      index++;
    });
  }

  return jobsDescriptionSkills;
}
