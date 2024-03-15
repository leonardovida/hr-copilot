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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil } from "lucide-react";
import { validateStringLength } from "@/app/utils";
import { useToast } from "@/components/ui/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { useState } from "react";
import { updateJobDescription, processNewJobDescription } from "@/app/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getParsedJobDescription, postParsedJobDescription } from "@/app/api";
import React, { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Trash2, PlusIcon } from "lucide-react";

export function EditJobDescriptionDialog(data: any) {
  const { toast } = useToast();
  var jobId: number = data.data.jobId;
  var [name, setName] = useState<string>(data.data.jobName);
  var [description, setDescription] = useState<string | null>(
    data.data.jobDescription,
  );
  let [skills, setSkills] = useState<JobDescriptionSkills[]>([]);
  let [apiIsRequestError, setIsApiRequestError] = useState<boolean>(false);

  // New Skill aux vars
  var [newSkillName, setNewSkillName] = useState<string>("");
  var [newSkillDescription, setNewSkillDescription] = useState<string>("");
  var [newSkillLongDescription, setNewSkillLongDescription] =
    useState<string>("");
  var [newSkillCategories, setNewSkillCategories] = useState<string>("");
  var [newSkillType1, setNewSkillType1] = useState<string>("");
  var [newSkillType2, setNewSkillType2] = useState<string>("");

  useEffect(() => {
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
  }, []);

  const handleValueChange = (
    index: number,
    newValue: string,
    typeIndex: number = 0,
  ) => {
    setSkills((prevSkills) => {
      return prevSkills.map((skill) => {
        if (skill.id === index) {
          skill.type[typeIndex] = newValue;
        }
        return skill;
      });
    });
    return newValue;
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          onClick={() =>
            getJobDescriptionSkillsData(jobId).then((result) => {
              setSkills(result);
            })
          }
        >
          <Pencil className="mr-2 h-4 w-4" />
          <span>Edit</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[1400px]">
        <DialogHeader>
          <DialogTitle>Edit Job Description 📕</DialogTitle>
          <DialogDescription>
            Update the job description. Click update when you are done.
          </DialogDescription>
        </DialogHeader>

        <Tabs className="sm:max-w-[1400px]" defaultValue="job">
          <TabsList className="grid w-[600px] grid-cols-2">
            <TabsTrigger value="job">Job Description</TabsTrigger>
            <TabsTrigger value="parsed">Skills</TabsTrigger>
          </TabsList>

          <TabsContent value="job">
            <div className="grid gap-4 py-4">
              <Label htmlFor="name">Role Name</Label>
              <div className="grid grid-cols-1 items-center gap-4">
                <Input
                  id="name"
                  placeholder="Senior Software Engineer at DBC"
                  className="col-span-3"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <Label htmlFor="description">Description</Label>
              <div className="grid grid-cols-1 items-center gap-4 h-min-24">
                <Textarea
                  id="description"
                  placeholder="..."
                  className="h-72"
                  value={description ? description : ""}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="submit"
                onClick={async () => {
                  if (!validateStringLength(name)) {
                    toast({
                      variant: "destructive",
                      title: "Uh oh! Validation error.",
                      description:
                        "Your role name must to have between 5 and 255 chars.",
                    });
                  } else if (!validateStringLength(description, 10, 9999)) {
                    toast({
                      variant: "destructive",
                      title: "Uh oh! Validation error.",
                      description:
                        "Your description must to have between 10 and 9999 chars.",
                    });
                  } else {
                    let response = await updateJobDescription(
                      jobId,
                      name,
                      description,
                    );
                    if (response.status < 400) {
                      toast({
                        title: "A new Job Description has been created!",
                        description:
                          "We have started the evaluation process, and the job description will be processed in a few minutes.",
                      });
                      processNewJobDescription(jobId);
                      setTimeout(() => {
                        const url: string = `/jobs/job?jobId=${jobId}&jobName=${name}`;
                        window.location.href = url;
                      }, 1500);
                    } else {
                      toast({
                        variant: "destructive",
                        title: "Uh oh! Something went wrong.",
                        description: "There was a problem with your request.",
                      });
                    }
                  }
                }}
              >
                Save
              </Button>
            </DialogFooter>
          </TabsContent>

          <TabsContent value="parsed">
            <div className="grid grid-cols-3 space-x-2">
              <ScrollArea className="h-[500px] rounded-md border mt-3 col-span-2">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Skill</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {skills.length > 0 && apiIsRequestError == false
                      ? skills.map((skill) => (
                          <TableRow key={skill.id}>
                            <TableCell>{skill.skill}</TableCell>

                            <TableCell>
                              <Select
                                key={skill.id}
                                onValueChange={(newValue) =>
                                  handleValueChange(skill.id, newValue)
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue
                                    placeholder={skill.type[0]}
                                    defaultValue={skill.type[0]}
                                  />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectGroup>
                                    <SelectItem value="Required">
                                      Required
                                    </SelectItem>
                                    <SelectItem value="Nice to Have">
                                      Nice to Have
                                    </SelectItem>
                                  </SelectGroup>
                                </SelectContent>
                              </Select>
                            </TableCell>

                            <TableCell>
                              <Select
                                key={skill.id}
                                onValueChange={(newValue) =>
                                  handleValueChange(skill.id, newValue, 1)
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue
                                    placeholder={skill.type[1]}
                                    defaultValue={skill.type[1]}
                                  />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectGroup>
                                    <SelectItem value="Hard Skill">
                                      Hard Skill
                                    </SelectItem>
                                    <SelectItem value="Soft Skill">
                                      Soft Skill
                                    </SelectItem>
                                  </SelectGroup>
                                </SelectContent>
                              </Select>
                            </TableCell>

                            <TableCell>
                              <Button
                                variant="outline"
                                onClick={async () => {
                                  setSkills(
                                    deleteParsedSkill(skill.id, skills),
                                  );
                                  toast({
                                    title: "Parsed skill has been deleted!",
                                    description:
                                      "You're deleting '" + skill.skill + "'",
                                    action: (
                                      <ToastAction
                                        altText="Undo"
                                        onClick={async () => {
                                          // As this component creation happens before the delete execution
                                          // This current skills var has the previous data, and we can use
                                          // as the state of the setSkills
                                          setSkills(skills);
                                        }}
                                      >
                                        Undo
                                      </ToastAction>
                                    ),
                                  });
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      : [{ id: 0 }, { id: 1 }, { id: 2 }, { id: 3 }].map(
                          (e) => (
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
                            </TableRow>
                          ),
                        )}
                  </TableBody>
                </Table>
              </ScrollArea>

              <Card className="mt-3">
                <CardContent className="grid grid-cols-2 p-3 space-y-3">
                  <Label className="col-span-2">Add a new skill</Label>

                  <Input
                    className="col-span-2"
                    placeholder="Skill name"
                    value={newSkillName}
                    onChange={(e) => setNewSkillName(e.target.value)}
                  />

                  <Input
                    className="col-span-2"
                    placeholder="Description"
                    value={newSkillDescription}
                    onChange={(e) => setNewSkillDescription(e.target.value)}
                  />

                  <Textarea
                    id="description"
                    placeholder="Long Description"
                    className="h-44 col-span-2"
                    value={
                      newSkillLongDescription ? newSkillLongDescription : ""
                    }
                    onChange={(e) => setNewSkillLongDescription(e.target.value)}
                  />

                  <Input
                    className="col-span-2"
                    placeholder="Category, please split the categories using comma(,)"
                    value={newSkillCategories}
                    onChange={(e) => setNewSkillCategories(e.target.value)}
                  />

                  <Select
                    onValueChange={(newValue) => setNewSkillType1(newValue)}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder="Skill Priority"
                        defaultValue={newSkillType1}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="Required">Required</SelectItem>
                        <SelectItem value="Nice to Have">
                          Nice to Have
                        </SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>

                  <Select
                    onValueChange={(newValue) => setNewSkillType2(newValue)}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder="Skill Type"
                        defaultValue={newSkillType2}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="Hard Skill">Hard Skill</SelectItem>
                        <SelectItem value="Soft Skill">Soft Skill</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>

                  <Button
                    className="col-span-2"
                    onClick={async () => {
                      if (
                        !validateStringLength(
                          newSkillName.replace(/\s/g, ""),
                          2,
                          255,
                        )
                      ) {
                        toast({
                          variant: "destructive",
                          title: "Uh oh! Validation error.",
                          description:
                            "Your skill name must to have between 2 and 255 chars.",
                        });
                      } else if (
                        !validateStringLength(
                          newSkillDescription.replace(/\s/g, ""),
                          10,
                          255,
                        )
                      ) {
                        toast({
                          variant: "destructive",
                          title: "Uh oh! Validation error.",
                          description:
                            "Your description must to have between 10 and 255 chars.",
                        });
                      } else if (
                        !validateStringLength(
                          newSkillLongDescription.replace(/\s/g, ""),
                          10,
                          255,
                        )
                      ) {
                        toast({
                          variant: "destructive",
                          title: "Uh oh! Validation error.",
                          description:
                            "Your long description must to have between 10 and 1024 chars.",
                        });
                      } else if (
                        !validateStringLength(
                          newSkillCategories.replace(/\s/g, ""),
                          1,
                          999,
                        )
                      ) {
                        toast({
                          variant: "destructive",
                          title: "Uh oh! Validation error.",
                          description: "You must to have at least 1 category",
                        });
                      } else if (
                        !validateStringLength(
                          newSkillType1.replace(/\s/g, ""),
                          1,
                          999,
                        )
                      ) {
                        toast({
                          variant: "destructive",
                          title: "Uh oh! Validation error.",
                          description: "Your must to have the skill type",
                        });
                      } else if (
                        !validateStringLength(
                          newSkillType2.replace(/\s/g, ""),
                          1,
                          999,
                        )
                      ) {
                        toast({
                          variant: "destructive",
                          title: "Uh oh! Validation error.",
                          description: "Your must to have the skill type",
                        });
                      } else {
                        let newSkill: JobDescriptionSkills = {
                          id: skills.length * 2 + 1,
                          skill: newSkillName,
                          description: newSkillDescription,
                          longDescription: newSkillLongDescription,
                          categories: newSkillCategories.split(","),
                          type: [newSkillType1, newSkillType2],
                        };

                        setSkills(addParsedSkill(newSkill, skills));
                        toast({
                          title: "Parsed skill has been added 🚀",
                          description: "You've added '" + newSkillName + "'",
                        });

                        setNewSkillName("");
                        setNewSkillDescription("");
                        setNewSkillLongDescription("");
                        setNewSkillCategories("");
                      }
                    }}
                  >
                    <PlusIcon /> Add
                  </Button>
                </CardContent>
              </Card>
            </div>
            <DialogFooter className="mt-3">
              {/* <Button variant="secondary"> Add new skill</Button> */}
              <Button
                type="submit"
                onClick={async () => {
                  let response = await postJobDescriptionParsedSkills(
                    jobId,
                    formatParsedJobDescriptionSkill(skills),
                  );
                  if (response.status < 400) {
                    toast({
                      title: "The Parsed Job Description has been updated!",
                      description: "Please, re-evaluate all CVs ⚠️",
                    });
                    setTimeout(() => {
                      const url: string = `/jobs/job?jobId=${jobId}&jobName=${name}`;
                      window.location.href = url;
                    }, 2000);
                  } else {
                    toast({
                      variant: "destructive",
                      title: "Uh oh! Something went wrong.",
                      description: "There was a problem with your request.",
                    });
                  }
                }}
              >
                Update Parsed Skills
              </Button>
            </DialogFooter>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
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

function formatParsedJobDescriptionSkill(
  skills: JobDescriptionSkills[],
): ParsedSkillsApiResponse {
  const parsedJobDescriptionSkill: ParsedSkillsApiResponse = {
    required_skills: { hard_skills: {}, soft_skills: {} },
    nice_to_have_skills: { hard_skills: {}, soft_skills: {} },
  };

  let indexCounts: number[] = [1, 1, 1, 1];

  skills.forEach((skill) => {
    const skillObject = {
      name: skill.skill,
      description: skill.description,
      long_description: skill.longDescription,
      skill_categories: skill.categories,
    };

    if (skill.type[0] === "Required") {
      if (skill.type[1] === "Hard Skill") {
        parsedJobDescriptionSkill.required_skills.hard_skills[
          `skill_${indexCounts[0]++}`
        ] = skillObject;
      } else {
        parsedJobDescriptionSkill.required_skills.soft_skills[
          `skill_${indexCounts[1]++}`
        ] = skillObject;
      }
    } else {
      if (skill.type[1] === "Hard Skill") {
        parsedJobDescriptionSkill.nice_to_have_skills.hard_skills[
          `skill_${indexCounts[2]++}`
        ] = skillObject;
      } else {
        parsedJobDescriptionSkill.nice_to_have_skills.soft_skills[
          `skill_${indexCounts[3]++}`
        ] = skillObject;
      }
    }
  });

  return parsedJobDescriptionSkill;
}

function postJobDescriptionParsedSkills(
  id: number,
  skills: ParsedSkillsApiResponse,
): Promise<ApiResponse> {
  return postParsedJobDescription(id, skills)
    .then((data) => {
      return { data: data, status: 200 };
    })
    .catch((e) => {
      console.warn(e);
      return { data: {}, status: 400 };
    });
}

function deleteParsedSkill(
  id: number,
  skills: JobDescriptionSkills[],
): JobDescriptionSkills[] {
  return skills.filter((skill) => skill.id !== id);
}

function addParsedSkill(
  newSkill: JobDescriptionSkills,
  currentSkills: JobDescriptionSkills[],
): JobDescriptionSkills[] {
  currentSkills.push(newSkill);
  return currentSkills;
}
