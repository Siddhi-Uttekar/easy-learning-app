"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import axios from "@/lib/axios";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { PlusCircle, Trash2 } from "lucide-react";

/* -------------------------------------------------
 * 1. Schema – 100 % aligned with the backend contract
 * ------------------------------------------------- */
const subjectiveTestSchema = z.object({
  title: z.string().min(1, "Title is required"),
  duration: z.coerce
    .number()
    .min(1, "Duration must be at least 1 minute")
    .max(180, "Duration cannot exceed 180 minutes"),
  courseId: z.coerce.number().positive("Course ID is required"),
  teacherId: z.coerce.number().positive("Teacher ID is required"),
  questions: z.array(
    z.object({
      text: z.string().min(1, "Question text is required"),
      marks: z.coerce.number().min(1, "Marks must be at least 1"),
    })
  ),
});

type SubjectiveTestForm = z.infer<typeof subjectiveTestSchema>;

/* -------------------------------------------------
 * 2. Component
 * ------------------------------------------------- */
export default function CreateSubjectiveTest() {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<SubjectiveTestForm>({
    resolver: zodResolver(subjectiveTestSchema),
    defaultValues: {
      title: "",
      duration: 60,
      courseId: undefined,
      teacherId: undefined,
      questions: [{ text: "", marks: 5 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "questions",
  });

  /* ----------------------------------------------
   * Submit
   * ---------------------------------------------- */
  const onSubmit = async (values: SubjectiveTestForm) => {
    try {
      await axios.post("/tests/subjective", {
        ...values,
        questions: values.questions.map((q, idx) => ({
          text: q.text.trim(),
          order: idx + 1,
          marks: q.marks,
        })),
      });
      toast.success("Test created successfully");
    } catch (err: any) {
      console.error(err);
      toast.error(
        err?.response?.data?.message || "Something went wrong!"
      );
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold tracking-tight mb-6">
        Create Subjective Test
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* --- Meta --- */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="title">Test Title</Label>
            <Input id="title" {...register("title")} />
            {errors.title && (
              <p className="text-sm text-destructive mt-1">{errors.title.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="duration">Duration (minutes)</Label>
            <Input
              id="duration"
              type="number"
              {...register("duration")}
            />
            {errors.duration && (
              <p className="text-sm text-destructive mt-1">{errors.duration.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="courseId">Course ID</Label>
            <Input
              id="courseId"
              type="number"
              {...register("courseId")}
            />
            {errors.courseId && (
              <p className="text-sm text-destructive mt-1">{errors.courseId.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="teacherId">Teacher ID</Label>
            <Input
              id="teacherId"
              type="number"
              {...register("teacherId")}
            />
            {errors.teacherId && (
              <p className="text-sm text-destructive mt-1">{errors.teacherId.message}</p>
            )}
          </div>
        </div>

        <Separator />

        {/* --- Questions --- */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Questions</h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ text: "", marks: 5 })}
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Question
            </Button>
          </div>

          <div className="space-y-5">
            {fields.map((field, idx) => (
              <div
                key={field.id}
                className="border rounded-lg p-4 space-y-4 bg-muted/20"
              >
                <div>
                  <Label>Question {idx + 1}</Label>
                  <Textarea
                    {...register(`questions.${idx}.text`)}
                    placeholder="Type the question here"
                    rows={3}
                  />
                  {errors.questions?.[idx]?.text && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.questions[idx]?.text?.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label>Marks</Label>
                  <Input
                    type="number"
                    {...register(`questions.${idx}.marks`)}
                    className="w-32"
                  />
                  {errors.questions?.[idx]?.marks && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.questions[idx]?.marks?.message}
                    </p>
                  )}
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => remove(idx)}
                  className="text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remove
                </Button>
              </div>
            ))}
          </div>
        </div>

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Creating..." : "Create Test"}
        </Button>
      </form>
    </div>
  );
}