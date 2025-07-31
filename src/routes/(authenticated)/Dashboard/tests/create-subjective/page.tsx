"use client"

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
      }),
    ),
  })
  .superRefine((data, ctx) => {
    if (data.passingMarks > data.totalMarks) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Passing marks cannot exceed total marks",
        path: ["passingMarks"],
      })
    }
  })

type SubjectiveTestForm = z.infer<typeof subjectiveTestSchema>

/* -------------------------------------------------
 * 2. Component
 * ------------------------------------------------- */
export default function CreateSubjectiveTest() {
  const questionsScrollRef = useRef<HTMLDivElement>(null)
  const lastQuestionRef = useRef<HTMLDivElement>(null)

  const {
    register,
    handleSubmit,
    control,
    watch,
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
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: "questions",
  })

  const watchedQuestions = watch("questions")
  const totalQuestionMarks = watchedQuestions?.reduce((sum, q) => sum + (q.marks || 0), 0) || 0

  // Auto-scroll to the last question when a new one is added
  useEffect(() => {
    if (lastQuestionRef.current) {
      lastQuestionRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      })
    }
  }, [fields.length])

  const handleAddQuestion = () => {
    append({ text: "", marks: 5 })
  }

  const onSubmit = async (values: SubjectiveTestForm) => {
    try {
      await axios.post("/tests/subjective", {
        ...values,
        questions: values.questions.map((q, idx) => ({
          text: q.text.trim(),
          order: idx + 1,
          marks: q.marks,
        })),
      })
      toast.success("Test created successfully")
    } catch (err: any) {
      console.error(err)
      toast.error(err?.response?.data?.message || "Something went wrong!")
    }
  }

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 overflow-hidden">
      <div className="h-full flex flex-col max-w-4xl mx-auto">
        {/* Fixed Header */}
        <div className="flex-shrink-0 text-center py-6 px-4">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Create Subjective Test</h1>
          <p className="text-muted-foreground">Design a comprehensive test with custom questions and scoring</p>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-hidden px-4 pb-4">
          <ScrollArea className="h-full">
            <div className="space-y-6 pr-4">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Test Information Card */}
                <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <FileText className="h-4 w-4 text-primary" />
                      Test Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title" className="text-sm font-medium flex items-center gap-2">
                        <BookOpen className="h-3 w-3" />
                        Test Title
                      </Label>
                      <Input
                        id="title"
                        {...register("title")}
                        className="h-10"
                        placeholder="Enter a descriptive title for your test"
                      />
                      {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description" className="text-sm font-medium">
                        Description (optional)
                      </Label>
                      <Textarea
                        id="description"
                        {...register("description")}
                        placeholder="Provide instructions or context for students"
                        rows={3}
                        className="resize-none"
                      />
                      {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
                    </div>
                  </CardContent>
                </Card>

                {/* Test Configuration Card */}
                <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Target className="h-4 w-4 text-primary" />
                      Test Configuration
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="duration" className="text-sm font-medium flex items-center gap-2">
                          <Clock className="h-3 w-3" />
                          Duration (min)
                        </Label>
                        <Input
                          id="duration"
                          type="number"
                          {...register("duration")}
                          className="h-10"
                          min="1"
                          max="180"
                        />
                        {errors.duration && <p className="text-xs text-destructive">{errors.duration.message}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="courseId" className="text-sm font-medium flex items-center gap-2">
                          <BookOpen className="h-3 w-3" />
                          Course ID
                        </Label>
                        <Input id="courseId" type="number" {...register("courseId")} className="h-10" min="1" />
                        {errors.courseId && <p className="text-xs text-destructive">{errors.courseId.message}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="teacherId" className="text-sm font-medium flex items-center gap-2">
                          <User className="h-3 w-3" />
                          Teacher ID
                        </Label>
                        <Input id="teacherId" type="number" {...register("teacherId")} className="h-10" min="1" />
                        {errors.teacherId && <p className="text-xs text-destructive">{errors.teacherId.message}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="totalMarks" className="text-sm font-medium flex items-center gap-2">
                          <Target className="h-3 w-3" />
                          Total Marks
                        </Label>
                        <Input id="totalMarks" type="number" {...register("totalMarks")} className="h-10" min="1" />
                        {errors.totalMarks && <p className="text-xs text-destructive">{errors.totalMarks.message}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="passingMarks" className="text-sm font-medium flex items-center gap-2">
                          <CheckCircle className="h-3 w-3" />
                          Passing Marks
                        </Label>
                        <Input id="passingMarks" type="number" {...register("passingMarks")} className="h-10" min="0" />
                        {errors.passingMarks && (
                          <p className="text-xs text-destructive">{errors.passingMarks.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Question Total</Label>
                        <div className="h-10 px-3 py-2 bg-muted rounded-md flex items-center">
                          <Badge variant="secondary" className="text-sm">
                            {totalQuestionMarks} marks
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Questions Card with Scrollable Content */}
                <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                  <CardHeader className="pb-3 flex-shrink-0">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <FileText className="h-4 w-4 text-primary" />
                        Questions
                        <Badge variant="outline" className="ml-2 text-xs">
                          {fields.length} {fields.length === 1 ? "question" : "questions"}
                        </Badge>
                      </CardTitle>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleAddQuestion}
                        className="shadow-sm hover:shadow-md transition-shadow bg-transparent"
                      >
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Add Question
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-4">
                    <div ref={questionsScrollRef} className="space-y-4 max-h-96 overflow-y-auto pr-2">
                      {fields.map((field, idx) => (
                        <Card
                          key={field.id}
                          ref={idx === fields.length - 1 ? lastQuestionRef : null}
                          className="border-2 border-dashed border-muted-foreground/20 hover:border-muted-foreground/40 transition-colors bg-slate-50/50 dark:bg-slate-800/50"
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                                  <span className="text-xs font-semibold text-primary">{idx + 1}</span>
                                </div>
                                <Label className="text-sm font-medium">Question {idx + 1}</Label>
                              </div>
                              {fields.length > 1 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => remove(idx)}
                                  className="text-destructive hover:bg-destructive/10 hover:text-destructive h-8 w-8 p-0"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              )}
                            </div>

                            <div className="space-y-3">
                              <div className="space-y-1">
                                <Textarea
                                  {...register(`questions.${idx}.text`)}
                                  placeholder="Enter your question here..."
                                  rows={3}
                                  className="resize-none text-sm"
                                />
                                {errors.questions?.[idx]?.text && (
                                  <p className="text-xs text-destructive">{errors.questions[idx]?.text?.message}</p>
                                )}
                              </div>

                              <div className="flex items-center gap-4">
                                <div className="space-y-1">
                                  <Label className="text-xs font-medium">Marks</Label>
                                  <Input
                                    type="number"
                                    {...register(`questions.${idx}.marks`)}
                                    className="w-20 h-8 text-sm"
                                    min="1"
                                  />
                                  {errors.questions?.[idx]?.marks && (
                                    <p className="text-xs text-destructive">{errors.questions[idx]?.marks?.message}</p>
                                  )}
                                </div>
                                <div className="flex-1 flex items-end pb-1">
                                  <Badge variant="secondary" className="text-xs">
                                    Worth {watchedQuestions[idx]?.marks || 0} marks
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

                {/* Fixed Submit Button */}
                <div className="sticky bottom-0 bg-gradient-to-t from-slate-50 to-transparent dark:from-slate-900 pt-4">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    size="lg"
                    className="w-full h-11 text-base font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                        Creating Test...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Create Test
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  )
}
