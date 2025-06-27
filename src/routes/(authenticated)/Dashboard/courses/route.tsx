import { createFileRoute } from "@tanstack/react-router";
import CoursesPage from "./page";  // Make sure the path is correct

export const Route = createFileRoute("/(authenticated)/Dashboard/courses")({
  component: CoursesPage,
});

