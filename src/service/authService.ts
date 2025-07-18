import api from "@/lib/axios";
import { store } from "@/store";
import { loginSuccess } from "@/store/slices/authSlice";

import { jwtDecode } from "jwt-decode";

class AuthService {
  public user: any = null;

  //function to send otp
  async sendOtp(email: string) {
    return api.post("/auth/send-otp", { email });
  }

  //function to verify otp
  async verifyOtp(email: string, otp: string) {
    try {
      const res = await api.post("/auth/verify-otp", { email, otp });
      const { access_token, isNewUser } = res.data;

      console.log("token", access_token);

      store.dispatch(loginSuccess({ accessToken: access_token }));

      localStorage.setItem("accessToken", access_token);
      api.get("/auth/me").then((response) => {
        this.user = response.data.user;
        console.log("User data:", this.user);
      });

      return { isNewUser };
    } catch (error) {
      console.error("OTP verification failed:", error);
      throw error;
    }
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
  async getUser() {
    if (this.user) {
      return this.user;
    }

    try {
      const response = await api.get("/auth/me", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      this.user = response.data.user;
      return this.user;
    } catch (error) {
      console.error("Failed to fetch user data:", error);
      throw error;
    }
  }

  getUserFromToken() {
  const token = store.getState().auth.accessToken || localStorage.getItem("accessToken");
  if (!token) return null;
  try {
    const decoded: any = jwtDecode(token);
    return {
      id: decoded.sub, // Use sub as id!
      role: decoded.role,
      email: decoded.email,
    };
  } catch (error) {
    console.error("Invalid token:", error);
    return null;
  }
}
}

export const authService = new AuthService();
