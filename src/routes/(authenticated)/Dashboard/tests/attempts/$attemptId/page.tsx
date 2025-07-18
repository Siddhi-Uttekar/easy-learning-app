import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/(authenticated)/Dashboard/tests/attempts/$attemptId/page',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div>
      Hello "/(authenticated)/Dashboard/tests/attempts/$attemptId/page"!
    </div>
  )
}
