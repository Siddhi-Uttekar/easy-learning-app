import { createFileRoute } from '@tanstack/react-router';
import { CreateCoursePage } from './page';
import { authService } from '@/service/authService';
import { redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/(authenticated)/Dashboard/create-course')({
    beforeLoad: () => {
    if (!authService.isAdmin()) {
      throw redirect({ to: '/Dashboard' });
    }
  },
  component: CreateCoursePage,
});
