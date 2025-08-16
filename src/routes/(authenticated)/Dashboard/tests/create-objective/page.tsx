"use client";
import React from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { toast } from "sonner";
import { TestService } from "@/service/TestService";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  BookOpen,
  Users,
  FileText,
  Sliders,
  Filter,
  Check,
  X,
  Settings,
  Target,
  Clock,
  GraduationCap,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "@tanstack/react-router";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useUser } from "@/hooks/useUser";
import { Textarea } from "@/components/ui/textarea";
import { queryClient } from "@/lib/queryClient";

interface Chapter {
  id: number;
  originalId: number;
  name: string;
  standard: string;
  subject: string;
  examTypeId: number;
  createdAt: string;
  updatedAt: string;
}

interface Course {
  id: number;
  name: string;
  description?: string;
}

const formSchema = z.object({
  courseId: z.number(),
  chapterIds: z.array(z.number()).min(1, "Select at least one chapter"),
  examTypeId: z.number(),
  teacherId: z.number(),
  numberOfQuestions: z
    .number()
    .min(1, "Must have at least 1 question")
    .max(50, "Maximum 50 questions allowed"),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  totalMarks: z.number().min(1, "Total marks must be at least 1"),
  passingMarks: z.number().min(1, "Passing marks must be at least 1"),
  timeLimit: z.number().min(1, "Time limit must be at least 1 minute"),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]).optional(),
  easyPercent: z.number().min(0).max(100),
  mediumPercent: z.number().min(0).max(100),
  hardPercent: z.number().min(0).max(100),
  publishImmediately: z.boolean().optional(),
});

export type FormDataType = z.infer<typeof formSchema>;

export function CreateTestPage() {
  const navigate = useNavigate();
  const [selectedChapters, setSelectedChapters] = useState<number[]>([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("");
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [selectedStandard, setSelectedStandard] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: user, isLoading: userLoading } = useUser();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<FormDataType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      easyPercent: 0,
      mediumPercent: 0,
      hardPercent: 0,
      teacherId: 1,
      numberOfQuestions: 20,
      totalMarks: 20,
      passingMarks: 7,
      timeLimit: 30,
      publishImmediately: false,
      chapterIds: [],
    },
  });

  const {
    data: courses = [],
    isLoading: coursesLoading,
    error: coursesError,
  } = useQuery<Course[]>({
    queryKey: ["courses"],
    queryFn: TestService.getCourses,
    retry: 1,
  });

  const { data: chapters = [], isLoading: chaptersLoading } = useQuery<
    Chapter[]
  >({
    queryKey: ["chapters"],
    queryFn: TestService.getChapters,
    enabled: !!watch("courseId"),
    retry: 1,
  });

  const createTestMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await TestService.createTest(data);
      return response;
    },
    onSuccess: async (response, variables) => {
      const testId = response.testId;

      if (variables.publishImmediately && testId) {
        try {
          await TestService.publishTest(testId, variables.teacherId);
          toast.success("Test created and published successfully!");
        } catch (publishError) {
          toast.success(
            "Test created successfully, but failed to publish automatically"
          );
          console.error("Error publishing test:", publishError);
        }
      } else {
        toast.success("Test created successfully!");
      }

      queryClient.invalidateQueries({ queryKey: ["tests"] });
      reset();
      setSelectedChapters([]);
      setSelectedDifficulty("");
      setSelectedSubject("all");
      setSelectedStandard("all");
      navigate({ to: "/Dashboard/tests" });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to create test");
      console.error("Error creating test:", err);
    },
  });

  const totalPercent =
    watch("easyPercent") + watch("mediumPercent") + watch("hardPercent");

  React.useEffect(() => {
    if (user?.id) {
      setValue("teacherId", Number(user.id));
    }
  }, [user, setValue]);

  React.useEffect(() => {
    setValue("chapterIds", selectedChapters);
  }, [selectedChapters, setValue]);

  const uniqueSubjects = Array.from(
    new Set(chapters.map((chapter: Chapter) => chapter.subject))
  ).sort();
  const uniqueStandards = Array.from(
    new Set(chapters.map((chapter: Chapter) => chapter.standard))
  ).sort();

  const filteredChapters = chapters.filter((chapter: Chapter) => {
    const subjectMatch =
      selectedSubject === "all" || chapter.subject === selectedSubject;
    const standardMatch =
      selectedStandard === "all" || chapter.standard === selectedStandard;
    return subjectMatch && standardMatch;
  });

  const groupedChapters = filteredChapters.reduce(
    (acc: Record<string, Chapter[]>, chapter: Chapter) => {
      const key = `${chapter.subject} - Standard ${chapter.standard}`;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(chapter);
      return acc;
    },
    {} as Record<string, Chapter[]>
  );

  const handleCourseChange = (id: string) => {
    setValue("courseId", Number(id));
    setSelectedChapters([]);
    setValue("chapterIds", []);
  };

  const handleSelectAllFiltered = () => {
    const filteredIds = filteredChapters.map((chapter: Chapter) => chapter.id);
    const allSelected = filteredIds.every((id: number) =>
      selectedChapters.includes(id)
    );

    if (allSelected) {
      setSelectedChapters((prev) =>
        prev.filter((id) => !filteredIds.includes(id))
      );
    } else {
      setSelectedChapters((prev) => {
        const newSelection = [...prev];
        filteredIds.forEach((id: number) => {
          if (!newSelection.includes(id)) {
            newSelection.push(id);
          }
        });
        return newSelection;
      });
    }
  };

  const handleSelectGroup = (groupChapters: Chapter[]) => {
    const groupIds = groupChapters.map((chapter) => chapter.id);
    const allSelected = groupIds.every((id) => selectedChapters.includes(id));

    if (allSelected) {
      setSelectedChapters((prev) =>
        prev.filter((id) => !groupIds.includes(id))
      );
    } else {
      setSelectedChapters((prev) => {
        const newSelection = [...prev];
        groupIds.forEach((id) => {
          if (!newSelection.includes(id)) {
            newSelection.push(id);
          }
        });
        return newSelection;
      });
    }
  };

  const handleOverallDifficultyChange = (difficulty: string) => {
    setSelectedDifficulty(difficulty);
    setValue("difficulty", difficulty as "EASY" | "MEDIUM" | "HARD");

    switch (difficulty) {
      case "EASY":
        setValue("easyPercent", 70);
        setValue("mediumPercent", 25);
        setValue("hardPercent", 5);
        break;
      case "MEDIUM":
        setValue("easyPercent", 30);
        setValue("mediumPercent", 50);
        setValue("hardPercent", 20);
        break;
      case "HARD":
        setValue("easyPercent", 15);
        setValue("mediumPercent", 35);
        setValue("hardPercent", 50);
        break;
    }
  };

  const handleSliderChange = (
    field: "easyPercent" | "mediumPercent" | "hardPercent",
    value: number
  ) => {
    setValue(field, value);
    setSelectedDifficulty("");
    setValue("difficulty", undefined);
  };

  const onSubmit = async (data: FormDataType) => {
    if (totalPercent !== 100) {
      toast.error("Difficulty percentages must add up to 100%");
      return;
    }

    if (selectedChapters.length === 0) {
      toast.error("Please select at least one chapter");
      return;
    }

    const testData = {
      courseId: data.courseId,
      chapterIds: selectedChapters,
      examTypeId: data.examTypeId,
      teacherId: data.teacherId,
      numberOfQuestions: data.numberOfQuestions,
      title: data.title,
      description: data.description,
      totalMarks: data.totalMarks,
      passingMarks: data.passingMarks,
      timeLimit: data.timeLimit,
      difficulty: data.difficulty,
      difficultyDistribution: {
        easy: data.easyPercent,
        medium: data.mediumPercent,
        hard: data.hardPercent,
      },
      publishImmediately: data.publishImmediately,
    };

    createTestMutation.mutate(testData);
  };

  if (userLoading || coursesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="text-lg font-medium text-muted-foreground">
            Loading...
          </span>
        </div>
      </div>
    );
  }

  if (coursesError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <GraduationCap className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Failed to load data</h3>
            <p className="text-muted-foreground">Please try again later.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight mb-2">
            Create New Test
          </h1>
          <p className="text-muted-foreground text-lg">
            Configure your test parameters and difficulty distribution
          </p>
        </div>

        <ScrollArea className="h-[calc(100vh-200px)]">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pr-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Test Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Test Title *</Label>
                    <Input
                      id="title"
                      {...register("title")}
                      placeholder="Enter test title"
                    />
                    {errors.title && (
                      <p className="text-destructive text-sm">
                        {errors.title.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="numberOfQuestions">
                      Number of Questions *
                    </Label>
                    <Input
                      id="numberOfQuestions"
                      type="number"
                      {...register("numberOfQuestions", {
                        valueAsNumber: true,
                      })}
                      min="1"
                      max="50"
                    />
                    {errors.numberOfQuestions && (
                      <p className="text-destructive text-sm">
                        {errors.numberOfQuestions.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    {...register("description")}
                    placeholder="Enter test description (optional)"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="totalMarks">
                      <Target className="w-4 h-4 inline mr-1" />
                      Total Marks *
                    </Label>
                    <Input
                      id="totalMarks"
                      type="number"
                      {...register("totalMarks", { valueAsNumber: true })}
                      min="1"
                    />
                    {errors.totalMarks && (
                      <p className="text-destructive text-sm">
                        {errors.totalMarks.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="passingMarks">
                      <Check className="w-4 h-4 inline mr-1" />
                      Passing Marks *
                    </Label>
                    <Input
                      id="passingMarks"
                      type="number"
                      {...register("passingMarks", { valueAsNumber: true })}
                      min="1"
                    />
                    {errors.passingMarks && (
                      <p className="text-destructive text-sm">
                        {errors.passingMarks.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="timeLimit">
                      <Clock className="w-4 h-4 inline mr-1" />
                      Time Limit (minutes) *
                    </Label>
                    <Input
                      id="timeLimit"
                      type="number"
                      {...register("timeLimit", { valueAsNumber: true })}
                      min="1"
                    />
                    {errors.timeLimit && (
                      <p className="text-destructive text-sm">
                        {errors.timeLimit.message}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Course Selection
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="course">Select Course *</Label>
                  <Select
                    onValueChange={handleCourseChange}
                    disabled={coursesLoading}
                  >
                    <SelectTrigger>
                      {coursesLoading ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Loading courses...
                        </div>
                      ) : (
                        <SelectValue placeholder="Choose a course" />
                      )}
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map((course: Course) => (
                        <SelectItem key={course.id} value={String(course.id)}>
                          <div className="flex flex-col">
                            <span className="font-medium">{course.name}</span>
                            {course.description && (
                              <span className="text-xs text-muted-foreground">
                                {course.description}
                              </span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.courseId && (
                    <p className="text-destructive text-sm">
                      {errors.courseId.message}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Chapter Selection
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Select Chapters *</Label>
                    {selectedChapters.length > 0 && (
                      <Badge variant="secondary">
                        {selectedChapters.length} chapter(s) selected
                      </Badge>
                    )}
                  </div>

                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full h-12 border-dashed"
                        disabled={chaptersLoading || chapters.length === 0}
                        type="button"
                      >
                        {chaptersLoading ? (
                          <div className="flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Loading chapters...
                          </div>
                        ) : chapters.length === 0 ? (
                          "Select a course first"
                        ) : (
                          `Select Chapters (${selectedChapters.length} selected)`
                        )}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
                      <DialogHeader>
                        <DialogTitle>Select Chapters</DialogTitle>
                      </DialogHeader>

                      <div className="space-y-4 border-b pb-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Filter className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Filters:</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <Label className="text-sm">Subject</Label>
                            <Select
                              value={selectedSubject}
                              onValueChange={setSelectedSubject}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">
                                  All Subjects
                                </SelectItem>
                                {uniqueSubjects.map((subject: string) => (
                                  <SelectItem key={subject} value={subject}>
                                    {subject}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label className="text-sm">Standard</Label>
                            <Select
                              value={selectedStandard}
                              onValueChange={setSelectedStandard}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">
                                  All Standards
                                </SelectItem>
                                {uniqueStandards.map((standard: string) => (
                                  <SelectItem key={standard} value={standard}>
                                    Standard {standard}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="flex items-end">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={handleSelectAllFiltered}
                              className="w-full"
                            >
                              {filteredChapters.length > 0 &&
                              filteredChapters.every((chapter: Chapter) =>
                                selectedChapters.includes(chapter.id)
                              ) ? (
                                <>
                                  <X className="w-3 h-3 mr-1" />
                                  Deselect All
                                </>
                              ) : (
                                <>
                                  <Check className="w-3 h-3 mr-1" />
                                  Select All
                                </>
                              )}
                            </Button>
                          </div>
                        </div>

                        <div className="text-sm text-muted-foreground">
                          Showing {filteredChapters.length} of {chapters.length}{" "}
                          chapters
                        </div>
                      </div>

                      <ScrollArea className="h-96">
                        <div className="space-y-6">
                          {Object.entries(groupedChapters).map(
                            ([groupName, groupChapters]) => (
                              <div key={groupName} className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <h4 className="font-semibold text-sm bg-muted px-3 py-1 rounded-full">
                                    {groupName}
                                  </h4>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      handleSelectGroup(
                                        groupChapters as Chapter[]
                                      )
                                    }
                                    className="h-6 text-xs"
                                  >
                                    {(groupChapters as Chapter[]).every(
                                      (chapter: Chapter) =>
                                        selectedChapters.includes(chapter.id)
                                    ) ? (
                                      <>
                                        <X className="w-3 h-3 mr-1" />
                                        Deselect Group
                                      </>
                                    ) : (
                                      <>
                                        <Check className="w-3 h-3 mr-1" />
                                        Select Group
                                      </>
                                    )}
                                  </Button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 ml-4">
                                  {(groupChapters as Chapter[]).map(
                                    (chapter: Chapter) => (
                                      <div
                                        key={chapter.id}
                                        className="flex items-center space-x-3 p-3 hover:bg-muted/50 rounded-lg border"
                                      >
                                        <Checkbox
                                          id={`chapter-${chapter.id}`}
                                          checked={selectedChapters.includes(
                                            chapter.id
                                          )}
                                          onCheckedChange={(checked) => {
                                            if (checked) {
                                              setSelectedChapters((prev) => [
                                                ...prev,
                                                chapter.id,
                                              ]);
                                            } else {
                                              setSelectedChapters((prev) =>
                                                prev.filter(
                                                  (id) => id !== chapter.id
                                                )
                                              );
                                            }
                                          }}
                                        />
                                        <label
                                          htmlFor={`chapter-${chapter.id}`}
                                          className="text-sm cursor-pointer flex-1"
                                        >
                                          {chapter.name}
                                        </label>
                                      </div>
                                    )
                                  )}
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </ScrollArea>

                      <div className="flex justify-between items-center pt-4 border-t">
                        <span className="text-sm text-muted-foreground">
                          {selectedChapters.length} chapters selected
                        </span>
                        <Button onClick={() => setIsDialogOpen(false)}>
                          Done
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>

                  {errors.chapterIds && (
                    <p className="text-destructive text-sm">
                      {errors.chapterIds.message}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Test Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="examType">Exam Type *</Label>
                    <Select
                      onValueChange={(val) =>
                        setValue("examTypeId", Number(val))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select exam type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">MHTCET</SelectItem>
                        <SelectItem value="2">JEE</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.examTypeId && (
                      <p className="text-destructive text-sm">
                        {errors.examTypeId.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="teacherId">Teacher ID</Label>
                    <Input
                      id="teacherId"
                      type="number"
                      {...register("teacherId", { valueAsNumber: true })}
                      readOnly
                      className="bg-muted"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sliders className="w-5 h-5" />
                  Difficulty Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="text-sm font-medium mb-3 block">
                    Quick Difficulty Preset
                    {selectedDifficulty && (
                      <Badge variant="outline" className="ml-2">
                        {selectedDifficulty.charAt(0).toUpperCase() +
                          selectedDifficulty.slice(1)}{" "}
                        Selected
                      </Badge>
                    )}
                  </Label>
                  <RadioGroup
                    value={selectedDifficulty}
                    onValueChange={handleOverallDifficultyChange}
                    className="grid grid-cols-1 md:grid-cols-3 gap-4"
                  >
                    <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50">
                      <RadioGroupItem value="EASY" id="difficulty-easy" />
                      <label
                        htmlFor="difficulty-easy"
                        className="text-sm cursor-pointer flex-1"
                      >
                        <div className="font-medium">Easy</div>
                        <div className="text-xs text-muted-foreground">
                          70% Easy, 25% Medium, 5% Hard
                        </div>
                      </label>
                    </div>
                    <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50">
                      <RadioGroupItem value="MEDIUM" id="difficulty-medium" />
                      <label
                        htmlFor="difficulty-medium"
                        className="text-sm cursor-pointer flex-1"
                      >
                        <div className="font-medium">Medium</div>
                        <div className="text-xs text-muted-foreground">
                          30% Easy, 50% Medium, 20% Hard
                        </div>
                      </label>
                    </div>
                    <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50">
                      <RadioGroupItem value="HARD" id="difficulty-hard" />
                      <label
                        htmlFor="difficulty-hard"
                        className="text-sm cursor-pointer flex-1"
                      >
                        <div className="font-medium">Hard</div>
                        <div className="text-xs text-muted-foreground">
                          15% Easy, 35% Medium, 50% Hard
                        </div>
                      </label>
                    </div>
                  </RadioGroup>
                  <p className="text-xs text-muted-foreground mt-3">
                    Select a preset to automatically set the difficulty
                    percentages, or manually adjust sliders below.
                  </p>
                </div>

                <div className="relative">
                  <Separator />
                  <div className="absolute inset-0 flex justify-center">
                    <span className="bg-background px-4 text-sm text-muted-foreground font-medium">
                      OR
                    </span>
                  </div>
                </div>

                <div className="space-y-6">
                  <Label className="text-sm font-medium">
                    Custom Difficulty Distribution
                    {!selectedDifficulty && totalPercent > 0 && (
                      <Badge variant="outline" className="ml-2">
                        Custom Settings Active
                      </Badge>
                    )}
                  </Label>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <Label className="text-sm font-medium text-green-600">
                          Easy Questions
                        </Label>
                        <Badge
                          variant="outline"
                          className="border-green-600 text-green-600 font-semibold"
                        >
                          {watch("easyPercent")}%
                        </Badge>
                      </div>
                      <Controller
                        control={control}
                        name="easyPercent"
                        render={({ field }) => (
                          <Slider
                            min={0}
                            max={100}
                            step={5}
                            value={[field.value]}
                            onValueChange={(val) =>
                              handleSliderChange("easyPercent", val[0])
                            }
                            className="w-full"
                          />
                        )}
                      />
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <Label className="text-sm font-medium text-yellow-600">
                          Medium Questions
                        </Label>
                        <Badge
                          variant="outline"
                          className="border-yellow-600 text-yellow-600 font-semibold"
                        >
                          {watch("mediumPercent")}%
                        </Badge>
                      </div>
                      <Controller
                        control={control}
                        name="mediumPercent"
                        render={({ field }) => (
                          <Slider
                            min={0}
                            max={100}
                            step={5}
                            value={[field.value]}
                            onValueChange={(val) =>
                              handleSliderChange("mediumPercent", val[0])
                            }
                            className="w-full"
                          />
                        )}
                      />
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <Label className="text-sm font-medium text-red-600">
                          Hard Questions
                        </Label>
                        <Badge
                          variant="outline"
                          className="border-red-600 text-red-600 font-semibold"
                        >
                          {watch("hardPercent")}%
                        </Badge>
                      </div>
                      <Controller
                        control={control}
                        name="hardPercent"
                        render={({ field }) => (
                          <Slider
                            min={0}
                            max={100}
                            step={5}
                            value={[field.value]}
                            onValueChange={(val) =>
                              handleSliderChange("hardPercent", val[0])
                            }
                            className="w-full"
                          />
                        )}
                      />
                    </div>
                  </div>

                  <div className="p-4 bg-muted rounded-lg border">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">
                        Total Percentage
                      </span>
                      <Badge
                        variant={
                          totalPercent === 100 ? "default" : "destructive"
                        }
                        className="font-bold"
                      >
                        {totalPercent}%
                      </Badge>
                    </div>
                    {totalPercent !== 100 && (
                      <p className="text-destructive text-xs mt-2 font-medium">
                        Must equal 100% to create test
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Publishing Options
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-3 p-4 bg-muted/50 rounded-lg border">
                  <Controller
                    control={control}
                    name="publishImmediately"
                    render={({ field }) => (
                      <Checkbox
                        id="publishImmediately"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                  <div className="flex-1">
                    <Label
                      htmlFor="publishImmediately"
                      className="text-sm font-medium cursor-pointer"
                    >
                      Publish test immediately after creation
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      If unchecked, the test will be saved as a draft and can be
                      published later.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <Button
                  type="submit"
                  disabled={
                    createTestMutation.isPending ||
                    totalPercent !== 100 ||
                    selectedChapters.length === 0
                  }
                  className="w-full h-12 text-lg font-medium"
                >
                  {createTestMutation.isPending ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Creating Test...
                    </div>
                  ) : (
                    "Create Test"
                  )}
                </Button>
              </CardContent>
            </Card>
          </form>
        </ScrollArea>
      </div>
    </div>
  );
}
