import api from '@/lib/axios';
import { store } from '@/store';
import { loginSuccess } from '@/store/slices/authSlice';

import { jwtDecode } from 'jwt-decode';


class AuthService {
  public user: any = null;

  //function to send otp
  async sendOtp(email: string) {
    return api.post('/auth/send-otp', { email });
  }

  //function to verify otp
  async verifyOtp(email: string, otp: string) {
  try {
    const res = await api.post('/auth/verify-otp', { email, otp });
    const { access_token, isNewUser } = res.data;

    console.log("token", access_token);

    store.dispatch(loginSuccess({ accessToken: access_token }));

    localStorage.setItem('accessToken', access_token);

    return { isNewUser };
  } catch (error) {
    console.error('OTP verification failed:', error);
    throw error;
  }
}

  // isLoggedIn() {
  //   const accessToken = store.getState().auth.accessToken;
  //   return !!accessToken;
  // }
  isLoggedIn() {
  const tokenInStore = store.getState().auth.accessToken;
  const tokenInStorage = localStorage.getItem('accessToken');
  return !!(tokenInStore || tokenInStorage);
}


  isAdmin() {
    const token = store.getState().auth.accessToken || localStorage.getItem('accessToken');
    if (!token) return false;

    try {
      const decoded: any = jwtDecode(token);
      return decoded?.role === 'teacher' || decoded?.role === 'admin';
    } catch (error) {
      console.error('Invalid token:', error);
      return false;
    }
  }

}

export const authService = new AuthService();
