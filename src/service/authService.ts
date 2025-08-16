import api from "@/lib/axios";
import { store } from "@/store";
import { loginSuccess, logout } from "@/store/slices/authSlice";
import { queryClient } from "@/lib/queryClient";
import { jwtDecode } from "jwt-decode";

export const USER_QUERY_KEY = ["user"] as const;

class AuthService {
  async sendOtp(email: string) {
    return api.post("/auth/send-otp", { email });
  }

  async verifyOtp(email: string, otp: string) {
    try {
      const res = await api.post("/auth/verify-otp", { email, otp });
      const { access_token, isNewUser } = res.data;

      store.dispatch(loginSuccess({ accessToken: access_token }));
      localStorage.setItem("accessToken", access_token);

      await queryClient.prefetchQuery({
        queryKey: USER_QUERY_KEY,
        queryFn: this.fetchUserData,
      });

      return { isNewUser };
    } catch (error) {
      console.error("OTP verification failed:", error);
      throw error;
    }
  }

  async fetchUserData() {
    const token =
      store.getState().auth.accessToken || localStorage.getItem("accessToken");

    if (!token) {
      throw new Error("No access token available");
    }

    const response = await api.get("/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log({ response });

    return response.data.user;
  }

  isLoggedIn() {
    const tokenInStore = store.getState().auth.accessToken;
    const tokenInStorage = localStorage.getItem("accessToken");
    return !!(tokenInStore || tokenInStorage);
  }

  isAdmin() {
    const token =
      store.getState().auth.accessToken || localStorage.getItem("accessToken");
    if (!token) return false;

    try {
      const decoded: any = jwtDecode(token);
      return decoded?.role === "TEACHER" || decoded?.role === "admin";
    } catch (error) {
      console.error("Invalid token:", error);
      return false;
    }
  }

  getUserFromToken() {
    const token =
      store.getState().auth.accessToken || localStorage.getItem("accessToken");
    if (!token) return null;

    try {
      const decoded: any = jwtDecode(token);
      return {
        id: decoded.sub,
        role: decoded.role,
        email: decoded.email,
      };
    } catch (error) {
      console.error("Invalid token:", error);
      return null;
    }
  }

  logout() {
    store.dispatch(logout());
    localStorage.removeItem("accessToken");
    queryClient.removeQueries({ queryKey: USER_QUERY_KEY });
    queryClient.clear();
  }

  invalidateUserQuery() {
    queryClient.invalidateQueries({ queryKey: USER_QUERY_KEY });
  }

  prefetchUser() {
    return queryClient.prefetchQuery({
      queryKey: USER_QUERY_KEY,
      queryFn: this.fetchUserData,
    });
  }
}

export const authService = new AuthService();
