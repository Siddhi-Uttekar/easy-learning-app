import api from "@/lib/axios";
import type { Course } from "@/types/Course";

export const CourseService = {
  async getAllCourses(): Promise<Course[]> {
    const response = await api.get("/courses", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    });
    return response.data;
  },
};
