import { createFileRoute } from '@tanstack/react-router';
import Otp from '@/pages/Otp';
import { z } from 'zod';

export const Route = createFileRoute('/(auth)/otp')({
  component: Otp,
  validateSearch: z.object({
    email: z.string().email(), // Ensures 'email' is present in URL search params
  }),
});

