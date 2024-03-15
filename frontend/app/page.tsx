import { Metadata } from "next";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { MainNav } from "@/components/shared/nav-main";
import { UserNav } from "@/components/shared/nav-user";
import { ModeToggle } from "@/components/shared/nav-theme-toogle";
import { NewJobDescriptionDialog } from "@/components/shared/dialog-new-job-description";
import { Button } from "@/components/ui/button";
import { FeedbackDialog } from "@/components/shared/dialog-feedback";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Talent Agent",
  description: "by Data Build Company.",
};

export default async function DashboardPage() {
  const totalJobDescription = await getTotalJobDescriptionData();
  const totalCVs = await getTotalCVsData();
  const totalMatchesData = await getTotalMatchesData();

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

        <div className="flex items-center justify-center space-y-2 mt-10 h74">
          <Card>
            <CardHeader className="flex items-center justify-between space-y-10 pb-2">
              <h4 className="text-3xl font-bold tracking-tight">
                Talent Agent 💡{" "}
              </h4>
            </CardHeader>

            <CardContent className="m-20 ">
              {/* Content goes here */}
              <NewJobDescriptionDialog />
              <br />
              <a href="/jobs">
                <Button color="primary" className="mt-3 w-44">
                  {" "}
                  See Job Descriptions 🔍{" "}
                </Button>
              </a>
            </CardContent>
          </Card>
        </div>

        {/* <div className="flex-1 space-y-4 p-8 pt-6">
          <div className="flex items-center justify-between space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">CV Copilot</h2>
            <div className="flex items-center space-x-2">
              <NewJobDescriptionDialog />
            </div>
          </div>

          <br/>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Job Descriptions
                </CardTitle>
                <Activity/>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalJobDescription.total}</div>
                <p className="text-xs text-muted-foreground">
                  {totalJobDescription.diffLastWeek} since last week
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total CVs
                </CardTitle>
                <Users />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalCVs.total}</div>
                <p className="text-xs text-muted-foreground">
                  {totalCVs.diffLastWeek} from last week
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Matches
                </CardTitle>
                <Sparkles />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalMatchesData.total}</div>
                <p className="text-xs text-muted-foreground">
                  {totalMatchesData.diffLastWeek} from last week
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Recent Matches</CardTitle>
                <CardDescription>
                  These are the last CV matches
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RecentMatches />
              </CardContent>
            </Card>

            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Recent Job Descriptions</CardTitle>
                <CardDescription>
                  These are the last job descriptions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RecentJobDescriptions />
              </CardContent>
            </Card>
          </div>

        </div> */}
      </div>
    </>
  );
}

async function getTotalJobDescriptionData(): Promise<Totals> {
  var total: number = 503;
  var diffLastWeek: number = 203;
  var diffLastWeekResult: string =
    diffLastWeek < 0 ? "-" + diffLastWeek : "+" + diffLastWeek;
  return { total: total, diffLastWeek: diffLastWeekResult };
}

async function getTotalCVsData(): Promise<Totals> {
  var total: number = 2350;
  var diffLastWeek: number = 180;
  var diffLastWeekResult: string =
    diffLastWeek < 0 ? "-" + diffLastWeek : "+" + diffLastWeek;
  return { total: total, diffLastWeek: diffLastWeekResult };
}

async function getTotalMatchesData(): Promise<Totals> {
  var total: number = 403;
  var diffLastWeek: number = 20;
  var diffLastWeekResult: string =
    diffLastWeek < 0 ? "-" + diffLastWeek : "+" + diffLastWeek;
  return { total: total, diffLastWeek: diffLastWeekResult };
}
