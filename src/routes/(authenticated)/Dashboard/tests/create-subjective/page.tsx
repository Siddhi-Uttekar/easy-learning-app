"use client";

import { zodResolver } from "@hookform/resolvers/zod"
import { useFieldArray, useForm } from "react-hook-form"
import { z } from "zod"
import { useRef, useEffect } from "react"
import axios from "@/lib/axios"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "sonner"
import { PlusCircle, Trash2, Clock, BookOpen, User, Target, CheckCircle, FileText, GraduationCap } from "lucide-react"

/* -------------------------------------------------
 * 1. Schema – now includes totalMarks, passingMarks, description
 * ------------------------------------------------- */
const subjectiveTestSchema = z
  .object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    duration: z.coerce
      .number()
      .min(1, "Duration must be at least 1 minute")
      .max(180, "Duration cannot exceed 180 minutes"),
    courseId: z.coerce.number().positive("Course ID is required"),
    teacherId: z.coerce.number().positive("Teacher ID is required"),
    totalMarks: z.coerce.number().min(1, "Total marks must be at least 1"),
    passingMarks: z.coerce.number().min(0, "Passing marks must be 0 or more"),
    questions: z.array(
      z.object({
        text: z.string().min(1, "Question text is required"),
        marks: z.coerce.number().min(1, "Marks must be at least 1"),
      })
    ),
    pdf: z.any().optional(),
    inputMode: z.enum(["pdf", "manual"]),
  })
  .superRefine((data, ctx) => {
    if (data.passingMarks > data.totalMarks) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Passing marks cannot exceed total marks",
        path: ["passingMarks"],
      });
    }
    if (data.inputMode === "pdf" && !data.pdf) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "PDF file is required",
        path: ["pdf"],
      });
    }
    if (
      data.inputMode === "manual" &&
      (!data.questions || data.questions.length === 0)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "At least one question is required",
        path: ["questions"],
      });
    }
  });

type SubjectiveTestForm = z.infer<typeof subjectiveTestSchema>;

export default function CreateSubjectiveTest() {
  const questionsScrollRef = useRef<HTMLDivElement>(null);
  const lastQuestionRef = useRef<HTMLDivElement>(null);

  const [inputMode, setInputMode] = useState<"manual" | "pdf">("manual");
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    resetField,
    formState: { errors, isSubmitting },
  } = useForm<SubjectiveTestForm>({
    resolver: zodResolver(subjectiveTestSchema),
    defaultValues: {
      title: "",
      description: "",
      duration: 60,
      courseId: undefined,
      teacherId: undefined,
      totalMarks: 0,
      passingMarks: 0,
      questions: [{ text: "", marks: 5 }],
      inputMode: "manual",
      pdf: undefined,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "questions",
  });

  const watchedQuestions = watch("questions");
  const totalQuestionMarks =
    watchedQuestions?.reduce((sum, q) => sum + (q.marks || 0), 0) || 0;

  useEffect(() => {
    if (lastQuestionRef.current) {
      lastQuestionRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [fields.length]);

  const handleAddQuestion = () => {
    append({ text: "", marks: 5 });
  };

  const handleModeChange = (mode: "manual" | "pdf") => {
    setInputMode(mode);
    setValue("inputMode", mode);
    if (mode === "manual") {
      setValue("pdf", undefined);
      setPdfFile(null);
    }
    if (mode === "pdf") {
      resetField("questions");
      setValue("questions", [{ text: "", marks: 5 }]);
    }
  };

  const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPdfFile(file);
      setValue("pdf", file);
    }
  };

  const onSubmit = async (values: SubjectiveTestForm) => {
    try {
      if (values.inputMode === "pdf" && pdfFile) {
        const formData = new FormData();
        formData.append("title", values.title);
        formData.append("description", values.description || "");
        formData.append("duration", String(values.duration));
        formData.append("courseId", String(values.courseId));
        formData.append("teacherId", String(values.teacherId));
        formData.append("totalMarks", String(values.totalMarks));
        formData.append("passingMarks", String(values.passingMarks));
        formData.append("pdf", pdfFile);
        await axios.post("/tests/subjective/pdf", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await axios.post("/tests/subjective", {
          ...values,
          questions: values.questions.map((q, idx) => ({
            text: q.text.trim(),
            order: idx + 1,
            marks: q.marks,
          })),
        });
      }
      toast.success("Test created successfully");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Something went wrong!");
    }
  };

  return (
    <div className="w-full ">
      <div className="mb-6 border-b p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-xl bg-primary/10">
            <GraduationCap className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            Create Subjective Test
          </h1>
        </div>
        <p className="text-muted-foreground text-sm">
          Design comprehensive subjective assessments by uploading PDF question
          papers or creating questions manually.
        </p>
      </div>

      <ScrollArea className="h-[80vh] p-6 ">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pb-6">
          <Card className="border-2">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="p-1.5 rounded-lg bg-primary/10">
                  <FileText className="h-4 w-4 text-primary" />
                </div>
                Input Method
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Choose how you'd like to create your test questions
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <Button
                  type="button"
                  variant={inputMode === "manual" ? "default" : "outline"}
                  className="h-20 flex-col gap-2 relative border-2"
                  onClick={() => handleModeChange("manual")}
                >
                  <PenSquare className="h-5 w-5" />
                  <span className="font-medium">Manual Entry</span>
                  <span className="text-xs opacity-70">
                    Create questions step by step
                  </span>
                  {inputMode === "manual" && (
                    <div className="absolute top-2 right-2">
                      <CheckCircle className="h-4 w-4" />
                    </div>
                  )}
                </Button>
                <Button
                  type="button"
                  variant={inputMode === "pdf" ? "default" : "outline"}
                  className="h-20 flex-col gap-2 relative border-2"
                  onClick={() => handleModeChange("pdf")}
                >
                  <UploadCloud className="h-5 w-5" />
                  <span className="font-medium">PDF Upload</span>
                  <span className="text-xs opacity-70">
                    Upload existing question paper
                  </span>
                  {inputMode === "pdf" && (
                    <div className="absolute top-2 right-2">
                      <CheckCircle className="h-4 w-4" />
                    </div>
                  )}
                </Button>
              </div>

              <input
                type="hidden"
                {...register("inputMode")}
                value={inputMode}
              />

              {inputMode === "pdf" && (
                <div className="space-y-3 p-4 border-2 border-dashed rounded-lg bg-muted/30">
                  <Label
                    htmlFor="pdf"
                    className="flex items-center gap-2 text-sm font-medium"
                  >
                    <File className="h-4 w-4" />
                    Question Paper (PDF)
                  </Label>
                  <Input
                    id="pdf"
                    type="file"
                    accept="application/pdf"
                    className="cursor-pointer file:cursor-pointer h-11"
                    onChange={handlePdfChange}
                  />
                  {pdfFile && (
                    <div className="flex items-center gap-2 p-3 bg-background rounded-lg border">
                      <File className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium flex-1">
                        {pdfFile.name}
                      </span>
                      <Badge variant="secondary">
                        {(pdfFile.size / 1024 / 1024).toFixed(2)} MB
                      </Badge>
                    </div>
                  )}
                  {errors.pdf && (
                    <div className="flex items-center gap-2 text-sm text-destructive">
                      <AlertCircle className="h-4 w-4" />
                      {errors.pdf.message as string}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="p-1.5 rounded-lg bg-primary/10">
                  <BookOpen className="h-4 w-4 text-primary" />
                </div>
                Test Information
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Basic details about your test
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium">
                  Test Title
                </Label>
                <Input
                  id="title"
                  {...register("title")}
                  placeholder="e.g., Mathematics Final Examination 2024"
                  className="h-11"
                />
                {errors.title && (
                  <div className="flex items-center gap-2 text-sm text-destructive">
                    <AlertCircle className="h-3 w-3" />
                    {errors.title.message}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium">
                  Description
                  <span className="text-muted-foreground font-normal ml-1">
                    (optional)
                  </span>
                </Label>
                <Textarea
                  id="description"
                  {...register("description")}
                  placeholder="Provide instructions, guidelines, or additional context for students..."
                  className="min-h-[100px] resize-none"
                />
                {errors.description && (
                  <div className="flex items-center gap-2 text-sm text-destructive">
                    <AlertCircle className="h-3 w-3" />
                    {errors.description.message}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="p-1.5 rounded-lg bg-primary/10">
                  <Target className="h-4 w-4 text-primary" />
                </div>
                Test Configuration
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Set up duration, scoring, and assignment details
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="duration"
                    className="text-sm font-medium flex items-center gap-2"
                  >
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    Duration (minutes)
                  </Label>
                  <Input
                    id="duration"
                    type="number"
                    {...register("duration")}
                    className="h-11"
                    min="1"
                    max="180"
                    placeholder="60"
                  />
                  {errors.duration && (
                    <div className="flex items-center gap-2 text-sm text-destructive">
                      <AlertCircle className="h-3 w-3" />
                      {errors.duration.message}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="courseId"
                    className="text-sm font-medium flex items-center gap-2"
                  >
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                    Course ID
                  </Label>
                  <Input
                    id="courseId"
                    type="number"
                    {...register("courseId")}
                    className="h-11"
                    min="1"
                    placeholder="101"
                  />
                  {errors.courseId && (
                    <div className="flex items-center gap-2 text-sm text-destructive">
                      <AlertCircle className="h-3 w-3" />
                      {errors.courseId.message}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="teacherId"
                    className="text-sm font-medium flex items-center gap-2"
                  >
                    <User className="h-4 w-4 text-muted-foreground" />
                    Teacher ID
                  </Label>
                  <Input
                    id="teacherId"
                    type="number"
                    {...register("teacherId")}
                    className="h-11"
                    min="1"
                    placeholder="201"
                  />
                  {errors.teacherId && (
                    <div className="flex items-center gap-2 text-sm text-destructive">
                      <AlertCircle className="h-3 w-3" />
                      {errors.teacherId.message}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="totalMarks"
                    className="text-sm font-medium flex items-center gap-2"
                  >
                    <Award className="h-4 w-4 text-muted-foreground" />
                    Total Marks
                  </Label>
                  <Input
                    id="totalMarks"
                    type="number"
                    {...register("totalMarks")}
                    className="h-11"
                    min="1"
                    placeholder="100"
                  />
                  {errors.totalMarks && (
                    <div className="flex items-center gap-2 text-sm text-destructive">
                      <AlertCircle className="h-3 w-3" />
                      {errors.totalMarks.message}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="passingMarks"
                    className="text-sm font-medium flex items-center gap-2"
                  >
                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    Passing Marks
                  </Label>
                  <Input
                    id="passingMarks"
                    type="number"
                    {...register("passingMarks")}
                    className="h-11"
                    min="0"
                    placeholder="40"
                  />
                  {errors.passingMarks && (
                    <div className="flex items-center gap-2 text-sm text-destructive">
                      <AlertCircle className="h-3 w-3" />
                      {errors.passingMarks.message}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Hash className="h-4 w-4 text-muted-foreground" />
                    Questions Total
                  </Label>
                  <div className="h-11 px-3 bg-muted/50 rounded-lg border flex items-center">
                    <Badge variant="secondary" className="font-medium">
                      {totalQuestionMarks} marks
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {inputMode === "manual" && (
            <Card className="border-2">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <div className="p-1.5 rounded-lg bg-primary/10">
                        <FileText className="h-4 w-4 text-primary" />
                      </div>
                      Questions
                      <Badge variant="outline" className="ml-2">
                        {fields.length}{" "}
                        {fields.length === 1 ? "question" : "questions"}
                      </Badge>
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Add and manage your test questions
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddQuestion}
                    className="gap-2 border-2"
                  >
                    <PlusCircle className="h-4 w-4" />
                    Add Question
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div
                  ref={questionsScrollRef}
                  className="space-y-6 max-h-[500px] overflow-y-auto pr-2"
                >
                  {fields.map((field, idx) => (
                    <Card
                      key={field.id}
                      ref={idx === fields.length - 1 ? lastQuestionRef : null}
                      className="border-2 border-dashed border-muted-foreground/20 hover:border-muted-foreground/40 transition-colors"
                    >
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                              <span className="text-sm font-bold text-primary-foreground">
                                {idx + 1}
                              </span>
                            </div>
                            <div>
                              <h4 className="font-medium">
                                Question {idx + 1}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                Worth {watchedQuestions[idx]?.marks || 0} marks
                              </p>
                            </div>
                          </div>
                          {fields.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => remove(idx)}
                              className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8 p-0"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>

                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">
                              Question Text
                            </Label>
                            <Textarea
                              {...register(`questions.${idx}.text`)}
                              placeholder="Enter your question here..."
                              className="min-h-[120px] resize-none"
                            />
                            {errors.questions?.[idx]?.text && (
                              <div className="flex items-center gap-2 text-sm text-destructive">
                                <AlertCircle className="h-3 w-3" />
                                {errors.questions[idx]?.text?.message}
                              </div>
                            )}
                          </div>

                          <Separator />

                          <div className="flex items-center gap-4">
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">
                                Marks
                              </Label>
                              <Input
                                type="number"
                                {...register(`questions.${idx}.marks`)}
                                className="w-24 h-10"
                                min="1"
                                placeholder="5"
                              />
                              {errors.questions?.[idx]?.marks && (
                                <div className="flex items-center gap-2 text-sm text-destructive">
                                  <AlertCircle className="h-3 w-3" />
                                  {errors.questions[idx]?.marks?.message}
                                </div>
                              )}
                            </div>
                            <div className="flex-1 flex justify-end">
                              <Badge variant="secondary" className="gap-1">
                                <Award className="h-3 w-3" />
                                {watchedQuestions[idx]?.marks || 0} points
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="pt-4 border-t">
            <Button
              type="submit"
              disabled={isSubmitting}
              size="lg"
              className="w-full h-12 text-base font-medium"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                  Creating Test...
                </>
              ) : (
                <>
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Create Subjective Test
                </>
              )}
            </Button>
          </div>
        </form>
      </ScrollArea>
    </div>
  );
}
