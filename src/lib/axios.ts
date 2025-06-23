import axios from 'axios';
import {store} from '../store/index';
import { logout } from '../store/slices/authSlice';

const api = axios.create({
    baseURL: "https://app.webfuze.in/",
    headers: {
        'Content-Type' : 'application/json',
    },
});

api.interceptors.request.use((config)=> {
    const token = store.getState().auth.token;
    if(token){
        config.headers.Authorization = `Bearer ${token}`;
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