import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import api from "@/lib/axios";
import { useState } from "react";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  price: z.number({ invalid_type_error: "Price is required" }),
  category: z.string().min(1, "Category is required"),
  tags: z.string().optional(),
  image: z
    .instanceof(File)
    .refine((file) => file.type.startsWith("image/"), "Image is required"),
});

export type FormDataType = z.infer<typeof formSchema>;

export function CreateCoursePage() {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormDataType>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: FormDataType) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("description", data.description);
      formData.append("price", data.price.toString());
      formData.append("category", data.category);
      formData.append("tags", data.tags || "");
      formData.append("image", data.image);

      await api.post("/courses", formData);

      toast.success("Course created successfully!");
      // Optionally redirect after success
      // navigate({ to: "/dashboard/courses" });
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create course");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 border rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">Create New Course</h2>

      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>

        <div>
          <Label>Title</Label>
          <Input {...register("title")} />
          {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
        </div>

        <div>
          <Label>Description</Label>
          <Textarea {...register("description")} />
          {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}
        </div>

        <div>
          <Label>Price</Label>
          <Input
            type="number"
            {...register("price", { valueAsNumber: true })}
          />
          {errors.price && <p className="text-red-500 text-sm">{errors.price.message}</p>}
        </div>

        <div>
          <Label>Category</Label>
          <Input {...register("category")} />
          {errors.category && <p className="text-red-500 text-sm">{errors.category.message}</p>}
        </div>

        <div>
          <Label>Tags (comma separated)</Label>
          <Input {...register("tags")} />
        </div>

        <div>
          <Label>Image</Label>
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) setValue("image", file);
            }}
          />
          {errors.image && <p className="text-red-500 text-sm">{errors.image.message}</p>}
        </div>

        <Button type="submit" disabled={loading}>
          {loading ? "Submitting..." : "Create Course"}
        </Button>
      </form>
    </div>
  );
}
