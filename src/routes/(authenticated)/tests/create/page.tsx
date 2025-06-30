import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { TestService } from "@/service/TestService";
import { useState } from "react";

const formSchema = z.object({
  courseId: z.number(),
  chapterIds: z.array(z.number()).min(1),
  examTypeId: z.number(),
  teacherId: z.number(),
  difficulty: z.enum(["easy", "medium", "hard"]).optional(),
  numberOfQuestions: z.number().min(1).max(50),
  title: z.string().optional(),
  description: z.string().optional(),
  totalMarks: z.number().optional(),
  passingMarks: z.number().optional(),
  timeLimit: z.number().optional(),
});

export type FormDataType = z.infer<typeof formSchema>;

export function CreateTestPage() {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit } = useForm<FormDataType>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: FormDataType) => {
    setLoading(true);
    try {
      await TestService.createTest(data);
      toast.success("Test created successfully!");
      // Optionally redirect to tests list
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create test");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-xl mx-auto mt-10">
      <Input placeholder="Course ID" type="number" {...register("courseId", { valueAsNumber: true })} />
      <Input placeholder="Chapter IDs (comma separated)"
        onChange={(e) => {
          const values = e.target.value.split(",").map(Number);
          (e.target as any).value = e.target.value; // maintain raw input for display
          register("chapterIds").onChange({ target: { name: "chapterIds", value: values } });
        }}
      />
      <Input placeholder="Exam Type ID" type="number" {...register("examTypeId", { valueAsNumber: true })} />
      <Input placeholder="Teacher ID" type="number" {...register("teacherId", { valueAsNumber: true })} />
      <Input placeholder="Difficulty (easy/medium/hard)" {...register("difficulty")} />
      <Input placeholder="Number of Questions" type="number" {...register("numberOfQuestions", { valueAsNumber: true })} />
      <Input placeholder="Title" {...register("title")} />
      <Input placeholder="Description" {...register("description")} />
      <Input placeholder="Total Marks" type="number" {...register("totalMarks", { valueAsNumber: true })} />
      <Input placeholder="Passing Marks" type="number" {...register("passingMarks", { valueAsNumber: true })} />
      <Input placeholder="Time Limit (minutes)" type="number" {...register("timeLimit", { valueAsNumber: true })} />

      <Button type="submit" disabled={loading}>{loading ? "Submitting..." : "Create Test"}</Button>
    </form>
  );
}
