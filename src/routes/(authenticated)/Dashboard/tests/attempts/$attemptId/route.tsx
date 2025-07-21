import { createFileRoute } from '@tanstack/react-router'
import AttemptTestPage from './page'
import testService from '@/service/TestService'
// export const Route = createFileRoute(
//   '/(authenticated)/Dashboard/tests/attempts/$attemptId',
// )({
//   component: AttemptTestPage,
// })
export const Route = createFileRoute('/(authenticated)/Dashboard/tests/attempts/$attemptId')({
  loader: async ({ params }) => {
    const attemptId = Number(params.attemptId)
    return await testService.getTestDetails(attemptId, true)
  },
  component: AttemptTestPage,
})
