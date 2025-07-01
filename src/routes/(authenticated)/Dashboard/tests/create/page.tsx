import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { toast } from "sonner";
import { TestService } from "@/service/TestService";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, BookOpen, Users, FileText, Sliders } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const formSchema = z.object({
  courseId: z.number(),
  chapterIds: z.array(z.number()).min(1, "Select at least one chapter"),
  examTypeId: z.number(),
  teacherId: z.number(),
  difficulty: z.enum(["easy", "medium", "hard"]).optional(),
  easyPercent: z.number().min(0).max(100),
  mediumPercent: z.number().min(0).max(100),
  hardPercent: z.number().min(0).max(100),
});

export type FormDataType = z.infer<typeof formSchema>;

export function CreateTestPage() {
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState<any[]>([]);
  const [chapters, setChapters] = useState<any[]>([]);
  const [selectedChapters, setSelectedChapters] = useState<number[]>([]);
  const [chaptersLoading, setChaptersLoading] = useState(false);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("");

  const { register, handleSubmit, control, setValue, watch, formState: { errors } } = useForm<FormDataType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      easyPercent: 0,
      mediumPercent: 0,
      hardPercent: 0,
      teacherId: 123,
    },
  });

  const totalPercent = watch("easyPercent") + watch("mediumPercent") + watch("hardPercent");

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

  // Handle overall difficulty selection
  const handleOverallDifficultyChange = (difficulty: string) => {
    setSelectedDifficulty(difficulty);
    setValue("difficulty", difficulty as "easy" | "medium" | "hard");

    // Set predefined percentages based on difficulty
    switch (difficulty) {
      case "easy":
        setValue("easyPercent", 70);
        setValue("mediumPercent", 25);
        setValue("hardPercent", 5);
        break;
      case "medium":
        setValue("easyPercent", 30);
        setValue("mediumPercent", 50);
        setValue("hardPercent", 20);
        break;
      case "hard":
        setValue("easyPercent", 15);
        setValue("mediumPercent", 35);
        setValue("hardPercent", 50);
        break;
    }
  };

  // Handle manual slider changes
  const handleSliderChange = (field: "easyPercent" | "mediumPercent" | "hardPercent", value: number) => {
    setValue(field, value);
    // Clear overall difficulty selection when manually adjusting sliders
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
      await TestService.createTest({
        ...data,
        chapterIds: selectedChapters
      });
      toast.success("Test created successfully!");

      // Reset form after successful creation
      setSelectedChapters([]);
      setChapters([]);
      setSelectedDifficulty("");
      setValue("easyPercent", 0);
      setValue("mediumPercent", 0);
      setValue("hardPercent", 0);
      setValue("difficulty", undefined);

    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create test");
      console.error("Error creating test:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Test</h1>
          <p className="text-gray-600">Configure your test parameters and difficulty distribution</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

          {/* Course Selection */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                Course Selection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="course" className="text-sm font-medium">
                    Select Course *
                  </Label>
                  <Select onValueChange={handleCourseChange} disabled={coursesLoading}>
                    <SelectTrigger className="mt-1">
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
                              <span className="text-xs text-gray-500">{course.description}</span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.courseId && (
                    <p className="text-red-500 text-sm mt-1">{errors.courseId.message}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Chapter Selection */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-green-600" />
                Chapter Selection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Select Chapters *</Label>
                  {selectedChapters.length > 0 && (
                    <Badge variant="secondary">
                      {selectedChapters.length} chapter(s) selected
                    </Badge>
                  )}
                </div>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full"
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
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Select Chapters</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3 max-h-[400px] overflow-y-auto">
                      {chapters.map((chapter) => (
                        <div key={chapter.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
                          <input
                            type="checkbox"
                            id={`chapter-${chapter.id}`}
                            checked={selectedChapters.includes(chapter.id)}
                            onChange={(e) => {
                              setSelectedChapters((prev) =>
                                e.target.checked
                                  ? [...prev, chapter.id]
                                  : prev.filter((id) => id !== chapter.id)
                              );
                            }}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                          <label htmlFor={`chapter-${chapter.id}`} className="text-sm cursor-pointer">
                            {chapter.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </DialogContent>
                </Dialog>
                {errors.chapterIds && (
                  <p className="text-red-500 text-sm">{errors.chapterIds.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Exam Type and Teacher ID */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-600" />
                Test Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="examType" className="text-sm font-medium">
                    Exam Type *
                  </Label>
                  <Select onValueChange={(val) => setValue("examTypeId", Number(val))}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select exam type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">MHTCET</SelectItem>
                      <SelectItem value="2">JEE</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.examTypeId && (
                    <p className="text-red-500 text-sm mt-1">{errors.examTypeId.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="teacherId" className="text-sm font-medium">
                    Teacher ID
                  </Label>
                  <Input
                    id="teacherId"
                    type="number"
                    {...register("teacherId", { valueAsNumber: true })}
                    readOnly
                    className="mt-1 bg-gray-50"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Combined Difficulty Settings */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-orange-600" />
                Difficulty Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">

              {/* Overall Difficulty Selection */}
              <div>
                <Label className="text-sm font-medium mb-3 block">
                  Quick Difficulty Preset
                  {selectedDifficulty && (
                    <Badge variant="outline" className="ml-2">
                      {selectedDifficulty.charAt(0).toUpperCase() + selectedDifficulty.slice(1)} Selected
                    </Badge>
                  )}
                </Label>
                <RadioGroup
                  value={selectedDifficulty}
                  onValueChange={handleOverallDifficultyChange}
                  className="flex flex-row space-x-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="easy" id="difficulty-easy" />
                    <label htmlFor="difficulty-easy" className="text-sm cursor-pointer">
                      Easy <span className="text-xs text-gray-500">(70-25-5%)</span>
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="medium" id="difficulty-medium" />
                    <label htmlFor="difficulty-medium" className="text-sm cursor-pointer">
                      Medium <span className="text-xs text-gray-500">(30-50-20%)</span>
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="hard" id="difficulty-hard" />
                    <label htmlFor="difficulty-hard" className="text-sm cursor-pointer">
                      Hard <span className="text-xs text-gray-500">(15-35-50%)</span>
                    </label>
                  </div>
                </RadioGroup>
                <p className="text-xs text-gray-500 mt-2">
                  Select a preset to automatically set the difficulty percentages, or manually adjust sliders below.
                </p>
              </div>

              {/* Separator with OR */}
              <div className="relative">
                <Separator />
                <div className="absolute inset-0 flex justify-center">
                  <span className="bg-white px-4 text-sm text-gray-500 font-medium">OR</span>
                </div>
              </div>

              {/* Difficulty Distribution */}
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
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <Label className="text-sm font-medium text-green-600">Easy Questions</Label>
                      <Badge variant="outline" className="border-green-600 text-green-600">
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
                          onValueChange={(val) => handleSliderChange("easyPercent", val[0])}
                          className="w-full"
                        />
                      )}
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <Label className="text-sm font-medium text-yellow-600">Medium Questions</Label>
                      <Badge variant="outline" className="border-yellow-600 text-yellow-600">
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
                          onValueChange={(val) => handleSliderChange("mediumPercent", val[0])}
                          className="w-full"
                        />
                      )}
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <Label className="text-sm font-medium text-red-600">Hard Questions</Label>
                      <Badge variant="outline" className="border-red-600 text-red-600">
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
                          onValueChange={(val) => handleSliderChange("hardPercent", val[0])}
                          className="w-full"
                        />
                      )}
                    />
                  </div>
                </div>

                <div className="pt-4 border-t bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Total Percentage</span>
                    <Badge
                      variant={totalPercent === 100 ? "default" : "destructive"}
                      className={totalPercent === 100 ? "bg-green-600" : ""}
                    >
                      {totalPercent}%
                    </Badge>
                  </div>
                  {totalPercent !== 100 && (
                    <p className="text-red-500 text-xs mt-1">
                      Must equal 100% to create test
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <Card className="shadow-lg">
            <CardContent className="pt-6">
              <Button
                type="submit"
                disabled={loading || totalPercent !== 100}
                className="w-full h-12 text-lg font-medium bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
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
      </div>
    </div>
  );
}