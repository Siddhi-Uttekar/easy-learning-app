import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(authenticated)/Dashboard/settings')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/(authenticated)/(dashboard)/settings"!</div>
}
