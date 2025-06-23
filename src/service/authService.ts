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
    const { access_token, isNewUser } = res.data;

    console.log("token", access_token);

    // Save token to Redux
    store.dispatch(loginSuccess({ accessToken: access_token }));

    // Save token to LocalStorage
    localStorage.setItem('accessToken', access_token);

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
