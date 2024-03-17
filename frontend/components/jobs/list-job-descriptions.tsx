"use client";
import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "../ui/button";
import { listJobDescription } from "@/app/api";
import { convertDateFormat } from "@/app/utils";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

export function JobDescriptionsList() {
  const [jobDescriptions, setJobDescriptions] = useState<
    JobDescription[] | null
  >(null);

  useEffect(() => {
    const fetchData = () => {
      getRecentJobDescriptionsData()
        .then((jobs) => {
          setJobDescriptions(jobs);
        })
        .catch((error) => {
          console.error("Error fetching job descriptions:", error);
          setJobDescriptions([]);
        });
    };

    fetchData();
  }, []);

  return (
    <Table>
      {jobDescriptions ? (
        <TableCaption>A list of job descriptions.</TableCaption>
      ) : (
        <TableCaption>Loading...</TableCaption>
      )}
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">Job ID</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Created at</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {jobDescriptions
          ? jobDescriptions.map((jobDescription) => (
              <TableRow
                key={jobDescription.id}
                onClickCapture={() =>
                  (window.location.href = `/jobs/job?jobId=${jobDescription.id}&jobName=${jobDescription.name}&jobUrl=${jobDescription.s3_url}`)
                }
                className="cursor-pointer"
              >
                <TableCell className="font-medium">
                  {jobDescription.id}
                </TableCell>
                <TableCell>{jobDescription.name}</TableCell>
                {jobDescription.description != "" ? (
                  <TableCell>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {jobDescription.description}
                    </p>
                  </TableCell>
                ) : (
                  <TableCell className="font-medium">
                    <Skeleton className="h-4 w-[1000px]" />
                  </TableCell>
                )}
                <TableCell>{jobDescription.createdAt}</TableCell>
                <TableCell>
                  <Link
                    href={`/jobs/job?jobId=${jobDescription.id}&jobName=${jobDescription.name}&jobUrl=${jobDescription.s3_url}`}
                  >
                    <Button variant="ghost">Open</Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))
          : [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }].map((e) => (
              <TableRow key={e.id}>
                <TableCell className="font-medium">
                  <Skeleton className="h-4 w-[30px]" />
                </TableCell>
                <TableCell className="font-medium">
                  <Skeleton className="h-4 w-[100px]" />
                </TableCell>
                <TableCell className="font-medium">
                  <Skeleton className="h-4 w-[1000px]" />
                </TableCell>
                <TableCell className="font-medium">
                  <Skeleton className="h-4 w-[100px]" />
                </TableCell>
                <TableCell className="font-medium"></TableCell>
              </TableRow>
            ))}
      </TableBody>
      <TableFooter>
        <TableRow> </TableRow>
      </TableFooter>
    </Table>
  );
}

function getRecentJobDescriptionsData(): Promise<JobDescription[]> {
  let jobsDescriptionsResult: Promise<JobDescription[]> = listJobDescription()
    .then((jobs) => {
      let jobsDescriptions: JobDescription[] = [];
      let jobData = jobs.data as JobDescriptionApiResponse[];

      jobData.forEach((job: JobDescriptionApiResponse) => {
        jobsDescriptions.push({
          id: job.id,
          name: job.title,
          description: job.description,
          s3_url: job.s3_url,
          createdAt: convertDateFormat(job.created_date),
          updatedAt: job.updated_date
            ? convertDateFormat(job.updated_date)
            : null,
        });
      });

      return jobsDescriptions;
    })
    .catch((error) => {
      console.error("Error fetching job descriptions:", error);
      return [];
    });

  return jobsDescriptionsResult;
}
