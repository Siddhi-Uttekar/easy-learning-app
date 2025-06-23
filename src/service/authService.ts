import api from '@/lib/axios';
import { store } from '@/store';
import { loginSuccess } from '@/store/slices/authSlice';

class AuthService {
  public user: any = null;

  async sendOtp(email: string) {
    return api.post('/auth/send-otp', { email });
  }

  async verifyOtp(email: string, otp: string) {
    try {
      const res = await api.post('/auth/verify-otp', { email, otp });
      const { accessToken, isNewUser } = res.data;

      // Save token to Redux
      store.dispatch(loginSuccess({ accessToken }));

      // Save token to LocalStorage
      localStorage.setItem('accessToken', accessToken);

      return { isNewUser };
    } catch (error) {
      console.error('OTP verification failed:', error);
      throw error;
    }
  }

  isLoggedIn() {
    const accessToken = store.getState().auth.accessToken;
    return !!accessToken;
  }
}

export const authService = new AuthService();
