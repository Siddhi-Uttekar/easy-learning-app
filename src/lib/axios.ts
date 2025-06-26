import axios from 'axios';
import { store } from '../store/index';
import { logout } from '../store/slices/authSlice';

const api = axios.create({
  baseURL: "https://app.webfuze.in/",
});

api.interceptors.request.use((config) => {
  const token = store.getState().auth.accessToken;

  if (token) {
    // Ensure headers exists and mutate directly
    if (config.headers && typeof config.headers.set === 'function') {
      config.headers.set('Authorization', `Bearer ${token}`);
    } else if (config.headers) {
      // Fallback for plain object case (some older Axios versions)
      (config.headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }
  }

  return config;
});

api.interceptors.response.use(
  response => response,
  error => {
    const { status } = error.response || {};
    if (status === 401 || status === 403) {
      store.dispatch(logout());
    }
    return Promise.reject(error);
  }
);

export default api;