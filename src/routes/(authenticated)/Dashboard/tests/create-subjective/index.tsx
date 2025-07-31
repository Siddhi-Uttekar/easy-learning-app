import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/(authenticated)/Dashboard/tests/create-subjective/"
)({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>Hello "/(authenticated)/Dashboard/tests/create-subjective/"!</div>
  );
}
