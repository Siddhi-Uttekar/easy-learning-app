"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useFieldArray, useForm } from "react-hook-form"
import { z } from "zod"
import axios from "@/lib/axios"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
            <GraduationCap className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">Create Subjective Test</h1>
          <p className="text-muted-foreground text-lg">Design a comprehensive test with custom questions and scoring</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Test Information Card */}
          <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl">
                <FileText className="h-5 w-5 text-primary" />
                Test Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Test Title
                </Label>
                <Input
                  id="title"
                  {...register("title")}
                  className="h-11 text-base"
                  placeholder="Enter a descriptive title for your test"
                />
                {errors.title && (
                  <p className="text-sm text-destructive flex items-center gap-1 mt-1">{errors.title.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium">
                  Description (optional)
                </Label>
                <Textarea
                  id="description"
                  {...register("description")}
                  placeholder="Provide instructions or context for students taking this test"
                  rows={4}
                  className="resize-none"
                />
                {errors.description && <p className="text-sm text-destructive mt-1">{errors.description.message}</p>}
              </div>
            </CardContent>
          </Card>

          {/* Test Configuration Card */}
          <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Target className="h-5 w-5 text-primary" />
                Test Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="duration" className="text-sm font-medium flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Duration (minutes)
                  </Label>
                  <Input id="duration" type="number" {...register("duration")} className="h-11" min="1" max="180" />
                  {errors.duration && <p className="text-sm text-destructive mt-1">{errors.duration.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="courseId" className="text-sm font-medium flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    Course ID
                  </Label>
                  <Input id="courseId" type="number" {...register("courseId")} className="h-11" min="1" />
                  {errors.courseId && <p className="text-sm text-destructive mt-1">{errors.courseId.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="teacherId" className="text-sm font-medium flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Teacher ID
                  </Label>
                  <Input id="teacherId" type="number" {...register("teacherId")} className="h-11" min="1" />
                  {errors.teacherId && <p className="text-sm text-destructive mt-1">{errors.teacherId.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="totalMarks" className="text-sm font-medium flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Total Marks
                  </Label>
                  <Input id="totalMarks" type="number" {...register("totalMarks")} className="h-11" min="1" />
                  {errors.totalMarks && <p className="text-sm text-destructive mt-1">{errors.totalMarks.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="passingMarks" className="text-sm font-medium flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Passing Marks
                  </Label>
                  <Input id="passingMarks" type="number" {...register("passingMarks")} className="h-11" min="0" />
                  {errors.passingMarks && (
                    <p className="text-sm text-destructive mt-1">{errors.passingMarks.message}</p>
                  )}
                </div>

                <div className="flex items-end">
                  <div className="space-y-2 w-full">
                    <Label className="text-sm font-medium">Question Marks Total</Label>
                    <div className="h-11 px-3 py-2 bg-muted rounded-md flex items-center">
                      <Badge variant="secondary" className="text-base font-medium">
                        {totalQuestionMarks} marks
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Questions Card */}
          <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <FileText className="h-5 w-5 text-primary" />
                  Questions
                  <Badge variant="outline" className="ml-2">
                    {fields.length} {fields.length === 1 ? "question" : "questions"}
                  </Badge>
                </CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ text: "", marks: 5 })}
                  className="shadow-sm hover:shadow-md transition-shadow"
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Question
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {fields.map((field, idx) => (
                  <Card
                    key={field.id}
                    className="border-2 border-dashed border-muted-foreground/20 hover:border-muted-foreground/40 transition-colors bg-slate-50/50 dark:bg-slate-800/50"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <span className="text-sm font-semibold text-primary">{idx + 1}</span>
                          </div>
                          <Label className="text-base font-medium">Question {idx + 1}</Label>
                        </div>
                        {fields.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => remove(idx)}
                            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Remove
                          </Button>
                        )}
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Textarea
                            {...register(`questions.${idx}.text`)}
                            placeholder="Enter your question here. Be clear and specific about what you're asking."
                            rows={4}
                            className="resize-none text-base"
                          />
                          {errors.questions?.[idx]?.text && (
                            <p className="text-sm text-destructive">{errors.questions[idx]?.text?.message}</p>
                          )}
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Marks</Label>
                            <Input
                              type="number"
                              {...register(`questions.${idx}.marks`)}
                              className="w-24 h-10"
                              min="1"
                            />
                            {errors.questions?.[idx]?.marks && (
                              <p className="text-sm text-destructive">{errors.questions[idx]?.marks?.message}</p>
                            )}
                          </div>
                          <div className="flex-1 flex items-end pb-2">
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

          {/* Submit Button */}
          <div className="flex justify-center pt-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              size="lg"
              className="w-full max-w-md h-12 text-base font-medium shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Creating Test...
                </>
              ) : (
                <>
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Create Test
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
