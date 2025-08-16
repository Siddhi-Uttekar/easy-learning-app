import { createFileRoute } from '@tanstack/react-router'
import SubmitObjectivePage from './page'
export const Route = createFileRoute(
  '/(authenticated)/Dashboard/tests/$testId/submit-subjective',
)({
  component: SubmitObjectivePage,
})
