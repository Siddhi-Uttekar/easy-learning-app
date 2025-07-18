import { createFileRoute } from '@tanstack/react-router'
import testService from '@/service/TestService'
import Page from './page'

export const Route = createFileRoute('/(authenticated)/Dashboard/tests/$testId/')({
  loader: async ({ params }) => {
    const testId = Number(params.testId)
    return await testService.getTestDetails(testId, true)
  },
  component: Page,
})
