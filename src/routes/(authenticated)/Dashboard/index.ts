import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/(authenticated)/Dashboard/')({
  component: RouteComponent,
});

function RouteComponent() {
  return  (
<div>
rendered 
</div>
)
}
