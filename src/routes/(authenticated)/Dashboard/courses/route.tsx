import { createFileRoute } from "@tanstack/react-router";
import CoursesPage from "./page"; 

export const Route = createFileRoute("/(authenticated)/Dashboard/courses")({
  component: CoursesPage,
});
