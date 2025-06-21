// src/routes/(authenticated)/dashboard.tsx
import { createFileRoute, redirect } from '@tanstack/react-router';
import Dashboard from '@/pages/Dashboard';
import { store } from '@/store';

export const Route = createFileRoute('/(authenticated)/dashboard')({
  beforeLoad: () => {
    const token = store.getState().auth.token;
    if (!token) {
      // 🚫 Redirect to login if not authenticated
      throw redirect({ to: '/login' });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  return <Dashboard />;
}
