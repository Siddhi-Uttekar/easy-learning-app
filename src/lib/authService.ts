// src/lib/authService.ts
import { store } from '@/store';

export const authService = {
  isLoggedIn: () => {
    const accessToken = store.getState().auth.accessToken;
    return !!accessToken;
  },
};
