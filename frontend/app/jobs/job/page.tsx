"use client";

import { MainNav } from "@/components/shared/nav-main";
import { UserNav } from "@/components/shared/nav-user";
import { FeedbackDialog } from "@/components/shared/dialog-feedback";
import { ModeToggle } from "@/components/shared/nav-theme-toogle";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RankingDataTable } from "@/components/job/tab-ranking-data-table";
import { EditJobDescriptionDialog } from "@/components/job/dialog-edit-job-description";
import { DeleteJobDescriptionDialog } from "@/components/job/dialog-delete-job-description";
import { JobDetailsTab } from "@/components/job/tab-job-details";
import { CandidateTab } from "@/components/job/tab-candidate";
import { useSearchParams } from "next/navigation";
import { getJobDescription } from "@/app/api";
import React, { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export default function JobPage() {
  const searchParams = useSearchParams();
  let jobId = searchParams.get("jobId") as string;
  let jobName = searchParams.get("jobName") as string;
  let jobUrl = searchParams.get("jobUrl") as string;
  let [jobDescription, setJobDescription] = useState<string | null>(null);
  let defaultTabValue = (searchParams.get("tab") as string)
    ? (searchParams.get("tab") as string)
    : "job";

  useEffect(() => {
    const fetchData = () => {
      getJobDescriptionsData(Number(jobId))
        .then((job) => {
          setJobDescription(job);
        })
        .catch((error) => {
          console.error("Error fetching job descriptions:", error);
          setJobDescription(null);
        });
    };

    fetchData();
  }, []);

  return (
    <>
      <div className="hidden flex-col md:flex">
        <div className="border-b">
          <div className="flex h-16 items-center px-4">
            <MainNav className="mx-6" />
            <div className="ml-auto mr-4 flex items-center space-x-3">
              <Badge className="bg-amber-500">Alpha Version</Badge>
              <FeedbackDialog />
              <ModeToggle />
              <UserNav />
            </div>
          </div>
        </div>
        <div className="flex-1 space-y-4 p-8 pt-6">
          <div className="flex items-center justify-between space-y-2">
            <h2 className="text-3xl font-bold tracking-tight"> {jobName} </h2>
            <div className="flex items-center space-x-2">
              {jobDescription ? (
                <EditJobDescriptionDialog
                  data={{
                    jobId: jobId,
                    jobName: jobName,
                    jobDescription: jobDescription,
                  }}
                />
              ) : (
                <div className="space-y-1">
                  <Skeleton className="h-4" />
                </div>
              )}
              <DeleteJobDescriptionDialog data={{ jobId: jobId }} />
            </div>
          </div>
        </div>
        <Tabs
          className="flex-1 space-y-4 p-8 pt-6"
          defaultValue={defaultTabValue}
        >
          <TabsList className="grid w-[600px] grid-cols-3">
            <TabsTrigger value="job">Job Details</TabsTrigger>
            <TabsTrigger value="cv">Candidates</TabsTrigger>
            <TabsTrigger value="rank">Ranking</TabsTrigger>
          </TabsList>
          <TabsContent value="job">
            <JobDetailsTab
              data={{
                jobId: jobId,
                jobDescription: jobDescription,
                jobUrl: jobUrl,
              }}
            />
          </TabsContent>
          <TabsContent value="cv">
            <CandidateTab data={{ jobId: jobId }} />
          </TabsContent>
          <TabsContent value="rank">
            <RankingDataTable data={{ jobId: jobId }} />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}

function getJobDescriptionsData(id: number): Promise<string | null> {
  let jobDescriptionResult: Promise<string | null> = getJobDescription(id)
    .then((job) => {
      let jobsDescription = job.data as JobDescription;
      return jobsDescription.description;
    })
    .catch((error) => {
      console.error("Error fetching job description:", error);
      return null;
    });

  return jobDescriptionResult;
}
