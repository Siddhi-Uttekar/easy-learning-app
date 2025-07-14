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
import { useEffect, useState } from "react";
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
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "@tanstack/react-router";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { authService } from "@/service/authService";

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
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState<any[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [selectedChapters, setSelectedChapters] = useState<number[]>([]);
  const [chaptersLoading, setChaptersLoading] = useState(false);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("");

  // Filter states
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [selectedStandard, setSelectedStandard] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

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

  const totalPercent =
    watch("easyPercent") + watch("mediumPercent") + watch("hardPercent");
  const watchedChapterIds = watch("chapterIds");

  // Update form value when selectedChapters changes
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await authService.getUser();
        setUser(res);
        setValue("teacherId", res.id);
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };
    setValue("chapterIds", selectedChapters);
  }, [selectedChapters, setValue]);

  // Get unique subjects and standards
  const uniqueSubjects = Array.from(
    new Set(chapters.map((chapter) => chapter.subject))
  ).sort();
  const uniqueStandards = Array.from(
    new Set(chapters.map((chapter) => chapter.standard))
  ).sort();

  // Filter chapters based on selected filters
  const filteredChapters = chapters.filter((chapter) => {
    const subjectMatch =
      selectedSubject === "all" || chapter.subject === selectedSubject;
    const standardMatch =
      selectedStandard === "all" || chapter.standard === selectedStandard;
    return subjectMatch && standardMatch;
  });

  // Group chapters by subject and standard for better organization
  const groupedChapters = filteredChapters.reduce((acc, chapter) => {
    const key = `${chapter.subject} - Standard ${chapter.standard}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(chapter);
    return acc;
  }, {} as Record<string, Chapter[]>);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setCoursesLoading(true);
        const res = await TestService.getCourses();
        setCourses(res);
      } catch (error) {
        toast.error("Failed to load courses");
        console.error("Error fetching courses:", error);
      } finally {
        setCoursesLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const handleCourseChange = async (id: string) => {
    setValue("courseId", Number(id));
    setChapters([]);
    setSelectedChapters([]);
    setValue("chapterIds", []);
    setChaptersLoading(true);

    try {
      const res = await TestService.getChapters();
      setChapters(res);
    } catch (error) {
      toast.error("Failed to load chapters");
      console.error("Error fetching chapters:", error);
    } finally {
      setChaptersLoading(false);
    }
  };

  // Handle select all for current filtered chapters
  const handleSelectAllFiltered = () => {
    const filteredIds = filteredChapters.map((chapter) => chapter.id);
    const allSelected = filteredIds.every((id) =>
      selectedChapters.includes(id)
    );

    if (allSelected) {
      // Deselect all filtered chapters
      setSelectedChapters((prev) =>
        prev.filter((id) => !filteredIds.includes(id))
      );
    } else {
      // Select all filtered chapters
      setSelectedChapters((prev) => {
        const newSelection = [...prev];
        filteredIds.forEach((id) => {
          if (!newSelection.includes(id)) {
            newSelection.push(id);
          }
        });
        return newSelection;
      });
    }
  };

  // Handle select all for a specific group
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

    setLoading(true);
    try {
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
      };

      const response = await TestService.createTest(testData);
      const testId = response.testId;

      if (data.publishImmediately && testId) {
        try {
          await TestService.publishTest(testId, data.teacherId);
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

      reset();
      setSelectedChapters([]);
      setChapters([]);
      setSelectedDifficulty("");
      setSelectedSubject("all");
      setSelectedStandard("all");

      navigate({ to: "/Dashboard" });
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create test");
      console.error("Error creating test:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Create New Test
          </h1>
          <p className="text-gray-600 text-lg">
            Configure your test parameters and difficulty distribution
          </p>
        </div>

        <ScrollArea className="h-[calc(100vh-200px)]">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pr-4">
            {/* Test Information */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <FileText className="w-6 h-6" />
                  Test Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label
                      htmlFor="title"
                      className="text-sm font-semibold text-gray-700"
                    >
                      Test Title *
                    </Label>
                    <Input
                      id="title"
                      {...register("title")}
                      placeholder="Enter test title"
                      className="h-11"
                    />
                    {errors.title && (
                      <p className="text-red-500 text-sm">
                        {errors.title.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="numberOfQuestions"
                      className="text-sm font-semibold text-gray-700"
                    >
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
                      className="h-11"
                    />
                    {errors.numberOfQuestions && (
                      <p className="text-red-500 text-sm">
                        {errors.numberOfQuestions.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="description"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Description
                  </Label>
                  <Input
                    id="description"
                    {...register("description")}
                    placeholder="Enter test description (optional)"
                    className="h-11"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label
                      htmlFor="totalMarks"
                      className="text-sm font-semibold text-gray-700"
                    >
                      Total Marks *
                    </Label>
                    <Input
                      id="totalMarks"
                      type="number"
                      {...register("totalMarks", { valueAsNumber: true })}
                      min="1"
                      className="h-11"
                    />
                    {errors.totalMarks && (
                      <p className="text-red-500 text-sm">
                        {errors.totalMarks.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="passingMarks"
                      className="text-sm font-semibold text-gray-700"
                    >
                      Passing Marks *
                    </Label>
                    <Input
                      id="passingMarks"
                      type="number"
                      {...register("passingMarks", { valueAsNumber: true })}
                      min="1"
                      className="h-11"
                    />
                    {errors.passingMarks && (
                      <p className="text-red-500 text-sm">
                        {errors.passingMarks.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="timeLimit"
                      className="text-sm font-semibold text-gray-700"
                    >
                      Time Limit (minutes) *
                    </Label>
                    <Input
                      id="timeLimit"
                      type="number"
                      {...register("timeLimit", { valueAsNumber: true })}
                      min="1"
                      className="h-11"
                    />
                    {errors.timeLimit && (
                      <p className="text-red-500 text-sm">
                        {errors.timeLimit.message}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Course Selection */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <BookOpen className="w-6 h-6" />
                  Course Selection
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="course"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Select Course *
                  </Label>
                  <Select
                    onValueChange={handleCourseChange}
                    disabled={coursesLoading}
                  >
                    <SelectTrigger className="h-11">
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
                      {courses.map((course) => (
                        <SelectItem key={course.id} value={String(course.id)}>
                          <div className="flex flex-col">
                            <span className="font-medium">{course.name}</span>
                            {course.description && (
                              <span className="text-xs text-gray-500">
                                {course.description}
                              </span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.courseId && (
                    <p className="text-red-500 text-sm">
                      {errors.courseId.message}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Chapter Selection */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <FileText className="w-6 h-6" />
                  Chapter Selection
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-semibold text-gray-700">
                      Select Chapters *
                    </Label>
                    {selectedChapters.length > 0 && (
                      <Badge
                        variant="secondary"
                        className="bg-purple-100 text-purple-700"
                      >
                        {selectedChapters.length} chapter(s) selected
                      </Badge>
                    )}
                  </div>

                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full h-12 border-2 border-purple-200 hover:border-purple-300"
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
                        <DialogTitle className="text-xl">
                          Select Chapters
                        </DialogTitle>
                      </DialogHeader>

                      {/* Filters */}
                      <div className="space-y-4 border-b pb-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Filter className="w-4 h-4 text-gray-500" />
                          <span className="text-sm font-medium">Filters:</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <Label className="text-xs font-medium text-gray-600">
                              Subject
                            </Label>
                            <Select
                              value={selectedSubject}
                              onValueChange={setSelectedSubject}
                            >
                              <SelectTrigger className="h-9">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">
                                  All Subjects
                                </SelectItem>
                                {uniqueSubjects.map((subject) => (
                                  <SelectItem key={subject} value={subject}>
                                    {subject}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label className="text-xs font-medium text-gray-600">
                              Standard
                            </Label>
                            <Select
                              value={selectedStandard}
                              onValueChange={setSelectedStandard}
                            >
                              <SelectTrigger className="h-9">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">
                                  All Standards
                                </SelectItem>
                                {uniqueStandards.map((standard) => (
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
                              className="h-9 w-full"
                            >
                              {filteredChapters.length > 0 &&
                              filteredChapters.every((chapter) =>
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

                        <div className="text-xs text-gray-500">
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
                                  <h4 className="font-semibold text-sm text-gray-700 bg-gray-100 px-3 py-1 rounded-full">
                                    {groupName}
                                  </h4>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      handleSelectGroup(groupChapters)
                                    }
                                    className="h-6 text-xs"
                                  >
                                    {groupChapters.every((chapter) =>
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
                                  {groupChapters.map((chapter) => (
                                    <div
                                      key={chapter.id}
                                      className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg border border-gray-100"
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
                                  ))}
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </ScrollArea>

                      <div className="flex justify-between items-center pt-4 border-t">
                        <span className="text-sm text-gray-600">
                          {selectedChapters.length} chapters selected
                        </span>
                        <Button
                          onClick={() => setIsDialogOpen(false)}
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          Done
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>

                  {errors.chapterIds && (
                    <p className="text-red-500 text-sm">
                      {errors.chapterIds.message}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Exam Type and Teacher ID */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Users className="w-6 h-6" />
                  Test Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label
                      htmlFor="examType"
                      className="text-sm font-semibold text-gray-700"
                    >
                      Exam Type *
                    </Label>
                    <Select
                      onValueChange={(val) =>
                        setValue("examTypeId", Number(val))
                      }
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select exam type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">MHTCET</SelectItem>
                        <SelectItem value="2">JEE</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.examTypeId && (
                      <p className="text-red-500 text-sm">
                        {errors.examTypeId.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="teacherId"
                      className="text-sm font-semibold text-gray-700"
                    >
                      Teacher ID
                    </Label>
                    <Input
                      id="teacherId"
                      type="number"
                      {...register("teacherId", { valueAsNumber: true })}
                      readOnly
                      className="h-11 bg-gray-50"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Difficulty Configuration */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Sliders className="w-6 h-6" />
                  Difficulty Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 p-6">
                {/* Overall Difficulty Selection */}
                <div>
                  <Label className="text-sm font-semibold text-gray-700 mb-3 block">
                    Quick Difficulty Preset
                    {selectedDifficulty && (
                      <Badge
                        variant="outline"
                        className="ml-2 border-indigo-300 text-indigo-700"
                      >
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
                    <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                      <RadioGroupItem value="EASY" id="difficulty-easy" />
                      <label
                        htmlFor="difficulty-easy"
                        className="text-sm cursor-pointer flex-1"
                      >
                        <div className="font-medium">Easy</div>
                        <div className="text-xs text-gray-500">
                          70% Easy, 25% Medium, 5% Hard
                        </div>
                      </label>
                    </div>
                    <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                      <RadioGroupItem value="MEDIUM" id="difficulty-medium" />
                      <label
                        htmlFor="difficulty-medium"
                        className="text-sm cursor-pointer flex-1"
                      >
                        <div className="font-medium">Medium</div>
                        <div className="text-xs text-gray-500">
                          30% Easy, 50% Medium, 20% Hard
                        </div>
                      </label>
                    </div>
                    <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                      <RadioGroupItem value="HARD" id="difficulty-hard" />
                      <label
                        htmlFor="difficulty-hard"
                        className="text-sm cursor-pointer flex-1"
                      >
                        <div className="font-medium">Hard</div>
                        <div className="text-xs text-gray-500">
                          15% Easy, 35% Medium, 50% Hard
                        </div>
                      </label>
                    </div>
                  </RadioGroup>
                  <p className="text-xs text-gray-500 mt-3">
                    Select a preset to automatically set the difficulty
                    percentages, or manually adjust sliders below.
                  </p>
                </div>

                {/* Separator with OR */}
                <div className="relative">
                  <Separator />
                  <div className="absolute inset-0 flex justify-center">
                    <span className="bg-white px-4 text-sm text-gray-500 font-medium">
                      OR
                    </span>
                  </div>
                </div>

                {/* Difficulty Distribution */}
                <div className="space-y-6">
                  <Label className="text-sm font-semibold text-gray-700">
                    Custom Difficulty Distribution
                    {!selectedDifficulty && totalPercent > 0 && (
                      <Badge
                        variant="outline"
                        className="ml-2 border-indigo-300 text-indigo-700"
                      >
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

                  <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold text-gray-700">
                        Total Percentage
                      </span>
                      <Badge
                        variant={
                          totalPercent === 100 ? "default" : "destructive"
                        }
                        className={`font-bold ${
                          totalPercent === 100
                            ? "bg-green-600 hover:bg-green-700"
                            : ""
                        }`}
                      >
                        {totalPercent}%
                      </Badge>
                    </div>
                    {totalPercent !== 100 && (
                      <p className="text-red-500 text-xs mt-2 font-medium">
                        Must equal 100% to create test
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Publishing Options */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <FileText className="w-6 h-6" />
                  Publishing Options
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 p-4 bg-teal-50 rounded-lg border border-teal-200">
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
                      className="text-sm font-semibold text-gray-700 cursor-pointer"
                    >
                      Publish test immediately after creation
                    </Label>
                    <p className="text-xs text-gray-600 mt-1">
                      If unchecked, the test will be saved as a draft and can be
                      published later from the tests management page.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <Button
                  type="submit"
                  disabled={
                    loading ||
                    totalPercent !== 100 ||
                    selectedChapters.length === 0
                  }
                  className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500"
                >
                  {loading ? (
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
