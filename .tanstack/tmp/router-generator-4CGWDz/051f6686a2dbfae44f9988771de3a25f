import { createFileRoute, redirect } from '@tanstack/react-router'
import {CreateTestPage} from "./page";
import {authService} from "@/service/authService";

export const Route = createFileRoute('/(authenticated)/Dashboard/tests/create')({
  beforeLoad: () => {
    if(!authService.isAdmin()){
      throw redirect({to : "/Dashboard"});
    }
  },
  component: CreateTestPage
})
