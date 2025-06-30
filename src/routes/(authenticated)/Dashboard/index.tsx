import { authService } from "@/service/authService";
import { createFileRoute } from "@tanstack/react-router";
import { use, useEffect, useState } from "react";

export const Route = createFileRoute("/(authenticated)/Dashboard/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/(authenticated)/Dashboard/"!</div>;
}
