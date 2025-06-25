import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(authenticated)/Dashboard/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/(authenticated)/Dashboard/"!</div>
}
