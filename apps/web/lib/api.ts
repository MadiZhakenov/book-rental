import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export const api = axios.create({
    baseURL: API_URL,
});

// Добавляем токен к каждому запросу
api.interceptors.request.use((config) => {
    const token = Cookies.get('token');
    if (token) {
        console.log('Interceptor: Attaching token to request:', config.url);
        config.headers.Authorization = `Bearer ${token}`;
    } else {
        console.log('Interceptor: No token found for request:', config.url);
    }
    return config;
});

export interface RegisterData {
    email: string;
    password: string;
    name: string;
}

export interface LoginData {
    email: string;
    password: string;
}

export interface User {
    id: string;
    email: string;
    name: string;
    isPremium: boolean;
    booksCount: number;
    rating: number;
    createdAt: string;
}

export const authApi = {
    register: async (data: RegisterData) => {
        const response = await api.post('/auth/register', data);
        return response.data;
    },

    login: async (data: LoginData) => {
        const response = await api.post('/auth/login', data);
        return response.data;
    },

    getMe: async (): Promise<User> => {
        const response = await api.get('/auth/me');
        return response.data;
    },
};

export const setAuthToken = (token: string) => {
    Cookies.set('token', token, { expires: 7 });
};

export const removeAuthToken = () => {
    Cookies.remove('token');
};

export const getAuthToken = () => {
    return Cookies.get('token');
};
