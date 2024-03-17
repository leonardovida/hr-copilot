"use client";
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MainNav } from "@/components/shared/nav-main";
import { JobDescriptionsList } from "@/components/jobs/list-job-descriptions";
import { NewJobDescriptionDialog } from "@/components/shared/dialog-new-job-description";
import { UserNav } from "@/components/shared/nav-user";
import { ModeToggle } from "@/components/shared/nav-theme-toogle";
import { FeedbackDialog } from "@/components/shared/dialog-feedback";
import { RefreshCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function JobDescriptionListPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const refreshChild = () => {
    setRefreshKey((oldKey) => oldKey + 1);
  };

  return (
    <>
      <div className="hidden flex-col md:flex">
        <div className="border-b">
          <div className="flex h-16 items-center px-4">
            <MainNav className="mx-6" />
            <div className="ml-auto mr-4 flex items-center space-x-2">
              <Badge className="bg-amber-500">Alpha Version</Badge>
              <FeedbackDialog />
              <ModeToggle />
              <UserNav />
            </div>
          </div>
        </div>

        <div className="flex-1 space-y-4 p-8 pt-6">
          <div className="flex items-center justify-between space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">
              Job Descriptions
            </h2>
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={refreshChild}>
                <RefreshCcw className="mr-2 h-4 w-4" /> Refresh Data
              </Button>
              <NewJobDescriptionDialog />
            </div>
          </div>
        </div>

        <div className="flex-1 space-y-4 p-8 pt-6">
          <div className="items-center justify-between space-y-4">
            <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-1">
              <Card>
                <CardContent className="mt-2">
                  <JobDescriptionsList key={refreshKey} />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
