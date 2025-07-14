import { createFileRoute } from "@tanstack/react-router";
import { TestsPage } from "./page";

export const Route = createFileRoute("/(authenticated)/Dashboard/tests")({
  component: TestsPage,
});
