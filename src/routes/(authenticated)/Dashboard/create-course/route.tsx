import { createFileRoute } from '@tanstack/react-router';
import { CreateCoursePage } from './page';

export const Route = createFileRoute('/(authenticated)/Dashboard/create-course')({
  component: CreateCoursePage,
});
