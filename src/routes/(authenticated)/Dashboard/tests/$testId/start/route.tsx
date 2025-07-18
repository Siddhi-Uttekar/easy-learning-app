import { createFileRoute } from '@tanstack/react-router'
import StartTest from './page'
export const Route = createFileRoute(
  '/(authenticated)/Dashboard/tests/$testId/start',
)({
  component: StartTest,
})
