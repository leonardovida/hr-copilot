import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { getVariantBySkillType } from "@/components/job/utils";
import { Dispatch, SetStateAction, useState, useEffect } from "react";
import { Trash2, RefreshCcw, SigmaSquare, Repeat2, Pencil } from "lucide-react";
import {
  listTalents,
  processTalent,
  processNewScore,
  getLastScore,
  getProcessedSkills,
  deleteTalent,
  getResumeStatus,
  updateTalent,
} from "@/app/api";
import { convertDateFormat, getScoreColor } from "@/app/utils";
import { useToast } from "@/components/ui/use-toast";
import { AddNewCandidateDialog } from "@/components/job/dialog-add-new-candidate";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function CandidateTab(data: any) {
  const { toast } = useToast();
  var jobId: number = data.data.jobId;
  var pdfId: number = data.data.pdfId;
  var [evaluateTalentDialogOpen, setEvaluateTalentDialogOpen] =
    useState<boolean>(false);
  var [deleteTalentDialogOpen, setDeleteTalentDialogOpen] =
    useState<boolean>(false);
  var [editTalentNameDialogOpen, setEditTalentNameDialogOpen] =
    useState<boolean>(false);
  var [candidates, setCandidates] = useState<Candidate[] | null>(null);
  var [candidateSelected, setCandidateSelected] = useState<Candidate | null>(
    null,
  );
  var [backgroundTasksStatus, setBackgroundTasksStatus] =
    useState<BackgroundTasksStatusResponse | null>(null);
  var [editedTalentName, setEditedTalentName] = useState<string>("");

  useEffect(() => {
    const fetchData = () => {
      // GET STATUS RESUME
      getBackgroundTasksStatus(jobId, pdfId, setBackgroundTasksStatus);

      // GET CANDIDATE DATA
      getJobCandidateData(jobId)
        .then(async (talents) => {
          setCandidates(talents);
        })
        .catch((error) => {
          console.error("Error fetching job descriptions:", error);
          setCandidates([]);
        });
    };
    fetchData();
  }, []);

  return (
    <div className="items-center justify-between space-y-2">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-8">
        {/* LIST CANDIDATES CARD */}
        <Card className="col-span-3">
          <CardHeader>
            <AddNewCandidateDialog data={{ jobId: jobId, disabled: false }} />
          </CardHeader>

          {!hasCandidates(candidates) && (
            <center>
              No talents has been found, please add a new candidate!
            </center>
          )}

          <CardContent className="pt-8">
            <ul role="list" className="space-y-8">
              {candidates ? (
                candidates.map((candidate) => (
                  <li key={candidate.id} className="flex items-center p-2">
                    <Avatar className="h-16 w-16">
                      <AvatarFallback className="font-bold">
                        {candidate.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="ml-4 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {candidate?.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Score{" "}
                        <b>
                          {" "}
                          {candidate?.score >= 0
                            ? (candidate?.score * 100).toFixed(1) + "%"
                            : "not evaluated yet!"}{" "}
                        </b>
                      </p>
                      {/* <OpenFile fileUrl={candidate.url}/> */}
                    </div>
                    <Button
                      className="ml-auto font-medium"
                      variant={
                        candidate.id == candidateSelected?.id
                          ? "secondary"
                          : "outline"
                      }
                      onClick={async () => {
                        setCandidateSelected(
                          await getTalentWithProcessedSkillsData(
                            candidate,
                            jobId,
                          ),
                        );
                      }}
                    >
                      {" "}
                      Details
                    </Button>
                  </li>
                ))
              ) : (
                <div className="space-y-6">
                  <Skeleton className="h-4" />
                  <Skeleton className="h-4" />
                  <Skeleton className="h-4" />
                  <Skeleton className="h-4" />
                  <Skeleton className="h-4" />
                  <Skeleton className="h-4" />
                </div>
              )}
            </ul>
          </CardContent>
        </Card>

        {/* SKILLS CARD */}
        {candidateSelected && (
          <Card className="col-span-5">
            {
              // @ts-ignore
              backgroundTasksStatus &&
                candidateSelected &&
                backgroundTasksStatus[candidateSelected.id] == "Processing" && (
                  <Alert>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    <AlertTitle>Processing...</AlertTitle>
                    <AlertDescription>
                      The skill extraction is currently running in the
                      background and may take a few minutes. Once finished, the
                      results will be displayed on this candidate page.
                    </AlertDescription>
                  </Alert>
                )
            }

            <CardHeader>
              <div className="flex items-center p-6">
                {/* SCORE LABEL */}
                {candidateSelected ? (
                  <Badge
                    className={`${getScoreColor(candidateSelected.score)} h-12 w-12 font-medium text-sm justify-center`}
                  >
                    {hasValidCandidateSelected(candidateSelected) &&
                    hasValidScore(candidateSelected) ? (
                      (candidateSelected.score * 100).toFixed(1) + "%"
                    ) : (
                      <b>?</b>
                    )}
                  </Badge>
                ) : (
                  <div className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                  </div>
                )}

                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {candidateSelected?.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Created at <b>{candidateSelected?.createdAt}</b>
                  </p>
                </div>
                <div className="ml-auto space-x-2">
                  {/* EVALUATE DIALOG */}
                  <Dialog
                    open={evaluateTalentDialogOpen}
                    onOpenChange={setEvaluateTalentDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button variant="outline">
                        <RefreshCcw className="mr-2 h-4 w-4" />
                        {hasValidSkills(candidateSelected) ? (
                          <span>Re-evaluate Talent</span>
                        ) : (
                          <span>Evaluate Talent</span>
                        )}
                      </Button>
                    </DialogTrigger>

                    <DialogContent className="sm:max-w-[425px]">
                      {hasValidSkills(candidateSelected) ? (
                        <DialogHeader>
                          <DialogTitle>Re-evaluate Talent</DialogTitle>
                          <DialogDescription>
                            Are you sure that you want to re-evaluate this
                            talent?
                          </DialogDescription>
                        </DialogHeader>
                      ) : (
                        <DialogHeader>
                          <DialogTitle>Evaluate Talent</DialogTitle>
                          <DialogDescription>
                            Do you want to evaluate this new talent?
                          </DialogDescription>
                        </DialogHeader>
                      )}

                      <DialogFooter>
                        <Button
                          type="submit"
                          className="min-w-[380px]"
                          onClick={async () => {
                            setEvaluateTalentDialogOpen(false);

                            //@ts-ignore
                            processTalent(jobId, candidateSelected?.id, true)
                              .then(async () => {
                                let auxBackgroundProcessTask =
                                  backgroundTasksStatus;
                                if (auxBackgroundProcessTask) {
                                  //@ts-ignore
                                  auxBackgroundProcessTask[
                                    candidateSelected?.id
                                  ] = "Processing";
                                  setBackgroundTasksStatus(
                                    auxBackgroundProcessTask,
                                  );
                                }

                                toast({
                                  title: `Evaluating ${candidateSelected?.name} 🚀`,
                                  description:
                                    "This process may take some time. Please be patient until the response is fully completed.",
                                });
                              })
                              .catch(() => {
                                toast({
                                  variant: "destructive",
                                  title: "Uh oh! Evaluating error.",
                                  description: `Error on ${candidateSelected?.name} evaluation`,
                                });
                              });
                          }}
                        >
                          Yes, evaluate talent!
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  {/* CALCULATE SCORE */}
                  <Button
                    variant="outline"
                    //@ts-ignore
                    onClick={() =>
                      processNewScore(jobId, candidateSelected?.id).then(
                        async (result) => {
                          if (result.status == 200) {
                            toast({
                              title: `The ${candidateSelected?.name} score was generated 🚀`,
                            });
                            //@ts-ignore
                            candidateSelected.score = result.data.score;
                            getJobCandidateData(jobId);
                          } else {
                            toast({
                              variant: "destructive",
                              title: "Uh oh! Error to calculate the score.",
                            });
                          }
                        },
                      )
                    }
                  >
                    <SigmaSquare className="mr-2 h-4 w-4" />
                    <span>Calculate Score</span>
                  </Button>

                  <Dialog
                    open={editTalentNameDialogOpen}
                    onOpenChange={setEditTalentNameDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button variant="outline" className="font-medium ml-auto">
                        <Pencil className="mr-2 h-4 w-4" />
                        <span>Edit</span>
                      </Button>
                    </DialogTrigger>

                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Update Candidate Name</DialogTitle>
                      </DialogHeader>

                      <Label htmlFor="name">Candidate Name</Label>
                      <div className="grid grid-cols-1 items-center gap-4">
                        <Input
                          id="name"
                          placeholder={candidateSelected?.name}
                          className="col-span-3"
                          value={editedTalentName}
                          onChange={(e) => setEditedTalentName(e.target.value)}
                        />
                      </div>

                      <DialogFooter>
                        {true ? (
                          <Button
                            type="submit"
                            className="min-w-[380px]"
                            onClick={async () => {
                              //@ts-ignore
                              updateTalent(
                                candidateSelected?.id,
                                editedTalentName,
                              )
                                .then(() => {
                                  setEditedTalentName("");
                                  // FRONT END UPDATES
                                  let auxCandidate: Candidate =
                                    candidateSelected as Candidate;
                                  auxCandidate.name = editedTalentName;
                                  setCandidateSelected(auxCandidate);
                                  let auxCandidates: Candidate[] =
                                    candidates as Candidate[];
                                  auxCandidates.map((e) =>
                                    e.id === candidateSelected?.id
                                      ? (e.name = editedTalentName)
                                      : e,
                                  );
                                  setCandidates(auxCandidates);
                                  setEditTalentNameDialogOpen(false);
                                })
                                .catch(() => {
                                  toast({
                                    variant: "destructive",
                                    title: "Uh oh! Evaluating error.",
                                    description: `Error on ${candidateSelected?.name} Update Name`,
                                  });
                                });
                            }}
                          >
                            Update the candidate name!
                          </Button>
                        ) : (
                          <Button
                            type="submit"
                            className="min-w-[380px]"
                            disabled={true}
                          >
                            Update the candidate name!
                          </Button>
                        )}
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  {/* DELETE DIALOG */}
                  <Dialog
                    open={deleteTalentDialogOpen}
                    onOpenChange={setDeleteTalentDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button variant="destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        <span>Delete</span>
                      </Button>
                    </DialogTrigger>

                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Delete Candidate</DialogTitle>
                        <DialogDescription>
                          Are you sure that you want to delete this candidate ?
                          This change is irreversible!
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        {candidates != null ? (
                          <Button
                            type="submit"
                            variant="destructive"
                            className="min-w-[380px]"
                            onClick={async () => {
                              await deleteNewCandidate(
                                candidateSelected,
                                setCandidates,
                                setDeleteTalentDialogOpen,
                                setCandidateSelected,
                              );
                              getJobCandidateData(jobId)
                                .then(async (talents) => {
                                  setCandidates(talents);
                                })
                                .catch((error) => {
                                  console.error(
                                    "Error fetching job descriptions:",
                                    error,
                                  );
                                  setCandidates([]);
                                });
                            }}
                          >
                            Yes, I want to delete this Candidate!
                          </Button>
                        ) : (
                          <Button
                            type="submit"
                            variant="destructive"
                            className="min-w-[380px]"
                            disabled={true}
                          >
                            Yes, I want to delete this Candidate!
                          </Button>
                        )}
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              {true && (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead></TableHead>
                      <TableHead>Skill</TableHead>
                      <TableHead>CV Match</TableHead>
                      <TableHead>Content Match</TableHead>
                      <TableHead>Reasoning</TableHead>
                      <TableHead>Categories</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {
                      // @ts-ignore
                      backgroundTasksStatus[candidateSelected?.id] !=
                        "Processing" &&
                        candidateSelected?.skills.map((skill) => (
                          <TableRow key={skill.id}>
                            <TableCell className="font-medium">
                              {skill.id}
                            </TableCell>
                            <TableCell>{skill.skill}</TableCell>
                            <TableCell className="break-inside-avoid-column">
                              {skill.cvMatchDescription}
                            </TableCell>
                            <TableCell>
                              {skill.contentMatchDescription}
                            </TableCell>
                            <TableCell>{skill.reasoning}</TableCell>
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
                    }
                    {
                      // @ts-ignore
                      backgroundTasksStatus[candidateSelected?.id] ==
                        "Processing" &&
                        [
                          { id: 1 },
                          { id: 2 },
                          { id: 3 },
                          { id: 4 },
                          { id: 5 },
                        ].map((e) => (
                          <TableRow key={e.id}>
                            <TableCell className="font-medium">
                              <Skeleton className="h-4" />
                            </TableCell>
                            <TableCell className="font-medium">
                              <Skeleton className="h-4" />
                            </TableCell>
                            <TableCell className="font-medium">
                              <Skeleton className="h-4" />
                            </TableCell>
                            <TableCell className="font-medium">
                              <Skeleton className="h-4" />
                            </TableCell>
                            <TableCell className="font-medium">
                              <Skeleton className="h-4" />
                            </TableCell>
                            <TableCell className="font-medium">
                              <Skeleton className="h-4" />
                            </TableCell>
                            <TableCell className="font-medium"></TableCell>
                          </TableRow>
                        ))
                    }
                  </TableBody>
                  <TableFooter>
                    <TableRow> </TableRow>
                  </TableFooter>
                </Table>
              )}

              {
                // @ts-ignore
                backgroundTasksStatus[candidateSelected?.id] != "Processing" &&
                  candidateSelected?.skills.length == 0 && (
                    <label className="flex items-center justify-center m-6">
                      <Button
                        className="font-medium"
                        variant={"secondary"}
                        // @ts-ignore
                        onClick={async () => {
                          setCandidateSelected(
                            await getTalentWithProcessedSkillsData(
                              candidateSelected,
                              jobId,
                            ),
                          );
                        }}
                      >
                        Check the results <Repeat2 className="ml-1" />
                      </Button>
                    </label>
                  )
              }
            </CardContent>
          </Card>
        )}

        {!candidateSelected && (
          <Card className="col-span-5 bg-current opacity-[.05]"></Card>
        )}
      </div>
    </div>
  );
}

async function getBackgroundTasksStatus(
  jobId: number,
  pdfId: number,
  setBackgroundTasksStatus: Dispatch<
    SetStateAction<BackgroundTasksStatusResponse | null>
  >,
) {
  // FIRST CHECK
  const backgroundTasksStatus: BackgroundTasksStatusResponse | null =
    await getResumeStatus(jobId, pdfId).then((result) => {
      // @ts-ignore
      return result.data.tasks;
    });
  setBackgroundTasksStatus(backgroundTasksStatus);

  // LOOP CHECK
  setInterval(async () => {
    const backgroundTasksStatus: BackgroundTasksStatusResponse | null =
      await getResumeStatus(jobId, pdfId).then((result) => {
        // @ts-ignore
        return result.data.tasks;
      });

    console.log(backgroundTasksStatus);
    setBackgroundTasksStatus(backgroundTasksStatus);
  }, 20000);
}

async function getJobCandidateData(jobId: number): Promise<Candidate[]> {
  try {
    const talents = (await listTalents(jobId)).data as TalentApiResponse[];
    const candidatesPromises: Promise<Candidate>[] = talents.map(
      async (talent: TalentApiResponse) => {
        try {
          const response = await getLastScore(jobId, talent.id);
          const scoreResponse: ScoreApiResponse =
            response.data as ScoreApiResponse;
          const score = scoreResponse.score;

          return {
            id: talent.id,
            name: talent.name,
            skills: [],
            score: score,
            url: talent.s3_url,
            createdAt: convertDateFormat(talent.created_date),
          } as Candidate;
        } catch (error) {
          return {
            id: talent.id,
            name: talent.name,
            skills: [],
            score: -1,
            url: talent.s3_url,
            createdAt: convertDateFormat(talent.created_date),
          } as Candidate;
        }
      },
    );
    const candidates = await Promise.all(candidatesPromises);
    return candidates;
  } catch (error) {
    return [];
  }
}

async function getTalentWithProcessedSkillsData(
  talent: Candidate,
  jobId: number,
): Promise<Candidate> {
  try {
    // GET SKILLS
    let skillsApiResponse: TalentEvaluationApiResponse = (
      await getProcessedSkills(talent.id)
    ).data as TalentEvaluationApiResponse;

    // GET LAST SCORE
    const response = await getLastScore(jobId, talent.id);
    const scoreResponse: ScoreApiResponse = response.data as ScoreApiResponse;
    talent.score = scoreResponse.score;

    let talentWithSkills: Candidate = formatEvaluationSkills(
      talent,
      skillsApiResponse,
    );
    return talentWithSkills;
  } catch {
    return talent;
  }
}

function formatEvaluationSkills(
  candidate: Candidate,
  talentApiResponse: TalentEvaluationApiResponse,
): Candidate {
  let index: number = 0;
  let talent: Candidate = {
    id: candidate.id,
    name: candidate.name,
    skills: [],
    score: candidate.score,
    url: candidate.url,
    createdAt: candidate.createdAt,
  };

  const requiredAndHardSkills: TalentParsedSkill[] = talentApiResponse
    .parsed_skills.required_skills.hard_skills
    ? Object.values(talentApiResponse.parsed_skills.required_skills.hard_skills)
    : [];
  const requiredAndSoftSkills: TalentParsedSkill[] = talentApiResponse
    .parsed_skills.required_skills.soft_skills
    ? Object.values(talentApiResponse.parsed_skills.required_skills.soft_skills)
    : [];
  const niceToHaveAndHardSkills: TalentParsedSkill[] = talentApiResponse
    .parsed_skills.nice_to_have_skills.hard_skills
    ? Object.values(
        talentApiResponse.parsed_skills.nice_to_have_skills.hard_skills,
      )
    : [];
  const niceToHaveAndSoftSkills: TalentParsedSkill[] = talentApiResponse
    .parsed_skills.nice_to_have_skills.soft_skills
    ? Object.values(
        talentApiResponse.parsed_skills.nice_to_have_skills.soft_skills,
      )
    : [];

  // Adjust skills to UI data structure
  requiredAndHardSkills.map((skill) => {
    talent.skills.push({
      id: index,
      skill: skill.name,
      cvMatchDescription: skill.match,
      contentMatchDescription: skill.content_match,
      reasoning: skill.reasoning,
      type: ["Required", "Hard Skill"],
    });
    index++;
  });

  requiredAndSoftSkills.map((skill) => {
    talent.skills.push({
      id: index,
      skill: skill.name,
      cvMatchDescription: skill.match,
      contentMatchDescription: skill.content_match,
      reasoning: skill.reasoning,
      type: ["Required", "Soft Skill"],
    });
    index++;
  });

  niceToHaveAndHardSkills.map((skill) => {
    talent.skills.push({
      id: index,
      skill: skill.name,
      cvMatchDescription: skill.match,
      contentMatchDescription: skill.content_match,
      reasoning: skill.reasoning,
      type: ["Nice to Have", "Hard Skill"],
    });
    index++;
  });

  niceToHaveAndSoftSkills.map((skill) => {
    talent.skills.push({
      id: index,
      skill: skill.name,
      cvMatchDescription: skill.match,
      contentMatchDescription: skill.content_match,
      reasoning: skill.reasoning,
      type: ["Nice to Have", "Soft Skill"],
    });
    index++;
  });

  return talent;
}

async function deleteNewCandidate(
  candidate: Candidate | null,
  setCandidates: Dispatch<SetStateAction<Candidate[] | null>>,
  setDeleteTalentDialogOpen: Dispatch<SetStateAction<boolean>>,
  setCandidateSelected: Dispatch<SetStateAction<Candidate | null>>,
): // @ts-ignore
boolean {
  if (candidate) {
    try {
      let response: ApiResponse = await deleteTalent(candidate.id);
      if (response.status < 400) {
        setCandidates((prevCandidates) =>
          prevCandidates
            ? prevCandidates.filter((c) => c.id !== candidate.id)
            : prevCandidates,
        );
        setDeleteTalentDialogOpen(false);
        setCandidateSelected(null);
        return true;
      } else {
        setDeleteTalentDialogOpen(false);
        console.warn(`Error to deleted pdf ${candidate.id}`);
        return false;
      }
    } catch {
      setDeleteTalentDialogOpen(false);
      console.warn(`Error to deleted pdf ${candidate.id}`);
      return false;
    }
  } else {
    return false;
  }
}

function hasCandidates(candidates: Candidate[] | null): boolean {
  return candidates != null && candidates && candidates.length > 0;
}

function hasValidCandidateSelected(candidate: Candidate | null): boolean {
  return candidate != null;
}

function hasValidScore(candidate: Candidate | null): boolean {
  return candidate != null && candidate.score != null && candidate.score >= 0;
}

function hasValidSkills(candidate: Candidate | null): boolean {
  return candidate != null && candidate.skills && candidate.skills.length > 0;
}
