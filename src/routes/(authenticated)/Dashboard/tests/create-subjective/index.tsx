import { createFileRoute } from "@tanstack/react-router";
import CreateSubjectiveTest from "./page";


export const Route = createFileRoute(
  "/(authenticated)/Dashboard/tests/create-subjective/"
)({
  component: CreateSubjectiveTest,
});
