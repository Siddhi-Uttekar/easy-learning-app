import { createFileRoute } from '@tanstack/react-router'
import AttemptTestPage from './page'
export const Route = createFileRoute(
  '/(authenticated)/Dashboard/tests/attempts/$attemptId',
)({
  component: AttemptTestPage,
})
