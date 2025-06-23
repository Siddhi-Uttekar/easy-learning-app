// src/routes/(authenticated)/route.tsx
import { createFileRoute, redirect } from '@tanstack/react-router';
import { authService } from '@/lib/authService';

export const Route = createFileRoute('/(authenticated)')({
  beforeLoad: ({ location }) => {
    const isLoggedIn = authService.isLoggedIn();

    if (!isLoggedIn) {
      throw redirect({
        to: '/login',
        search: { from: location.href },
      });
    }
  },
});
