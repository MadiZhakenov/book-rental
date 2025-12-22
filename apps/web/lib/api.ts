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
    role?: string;
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

export interface CreateBookDto {
    title: string;
    author: string;
    isbn?: string;
    description?: string;
    genre?: string;
    images?: string[];
    publishYear?: number;
    language?: string;
    dailyPrice: number;
    deposit: number;
    latitude?: number;
    longitude?: number;
}

export interface Book {
    id: string;
    title: string;
    author: string;
    isbn?: string;
    description?: string;
    genre?: string;
    images: string[];
    publishYear?: number;
    language: string;
    dailyPrice: number;
    deposit: number;
    status: string;
    createdAt: string;
    updatedAt: string;
    ownerId: string;
}

export const uploadFile = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    
    return response.data.url;
};

export const createBook = async (data: CreateBookDto): Promise<Book> => {
    const response = await api.post('/books', data);
    return response.data;
};

export interface MyBook {
    id: string;
    title: string;
    author: string;
    dailyPrice: number;
    images: string[];
    status: string;
    deposit: number;
    createdAt: string;
}

export const getMyBooks = async (): Promise<MyBook[]> => {
    const response = await api.get('/books/my');
    return response.data;
};

export interface PublicBook {
    id: string;
    title: string;
    author: string;
    dailyPrice: number;
    images: string[];
    status: string;
    deposit: number;
    createdAt: string;
    location_lat?: number | null;
    location_lng?: number | null;
    latitude?: number | null;
    longitude?: number | null;
    owner: {
        id: string;
        email: string;
        avatarUrl: string | null;
    };
}

export interface PublicBooksResponse {
    books: PublicBook[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface PublicBooksQuery {
    page?: number;
    limit?: number;
    search?: string;
    genre?: string;
    minPrice?: number;
    maxPrice?: number;
}

export const getPublicBooks = async (query?: PublicBooksQuery): Promise<PublicBooksResponse> => {
    const params = new URLSearchParams();
    if (query?.page) params.append('page', query.page.toString());
    if (query?.limit) params.append('limit', query.limit.toString());
    if (query?.search) params.append('search', query.search);
    if (query?.genre) params.append('genre', query.genre);
    if (query?.minPrice !== undefined) params.append('minPrice', query.minPrice.toString());
    if (query?.maxPrice !== undefined) params.append('maxPrice', query.maxPrice.toString());
    
    const response = await api.get(`/books/public?${params.toString()}`);
    return response.data;
};

export interface FeaturedBooks {
    popular: PublicBook[];
    newArrivals: PublicBook[];
}

export const getFeaturedBooks = async (): Promise<FeaturedBooks> => {
    const response = await api.get('/books/featured');
    return response.data;
};

export interface Rental {
    id: string;
    startDate: string;
    endDate: string;
    totalPrice: number;
    status: string;
    pickupSecret?: string;
    book: {
        id: string;
        title: string;
        images: string[];
        dailyPrice: number;
        owner?: {
            id: string;
            email: string;
            avatarUrl: string | null;
        };
    };
    user?: {
        id: string;
        email: string;
        avatarUrl: string | null;
    };
    createdAt: string;
}

export interface CreateRentalDto {
    bookId: string;
    startDate: string;
    endDate: string;
}

export const createRental = async (data: CreateRentalDto): Promise<Rental> => {
    const response = await api.post('/rentals', data);
    return response.data;
};

export const getMyRentals = async (type: 'incoming' | 'outgoing'): Promise<Rental[]> => {
    const response = await api.get(`/rentals/my?type=${type}`);
    return response.data;
};

export const updateRentalStatus = async (id: string, status: 'APPROVED' | 'REJECTED'): Promise<Rental> => {
    const response = await api.patch(`/rentals/${id}/status`, { status });
    return response.data;
};

export const verifyRental = async (rentalId: string, secret: string, action: 'PICKUP' | 'RETURN'): Promise<Rental> => {
    const response = await api.post('/rentals/verify', { rentalId, secret, action });
    return response.data;
};

export const confirmReturn = async (rentalId: string): Promise<Rental> => {
    const response = await api.post(`/rentals/${rentalId}/return`);
    return response.data;
};

export interface Notification {
    id: string;
    userId: string;
    title: string;
    message: string;
    type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
    isRead: boolean;
    link?: string | null;
    createdAt: string;
}

export const getNotifications = async (): Promise<Notification[]> => {
    const response = await api.get('/notifications');
    return response.data;
};

export const markNotificationAsRead = async (id: string): Promise<void> => {
    await api.patch(`/notifications/${id}/read`);
};

export const markAllNotificationsAsRead = async (): Promise<void> => {
    await api.patch('/notifications/read-all');
};

export interface Review {
    id: string;
    rentalId: string;
    rating: number;
    comment?: string | null;
    createdAt: string;
    author: {
        id: string;
        email: string;
        avatarUrl: string | null;
    };
}

export const createReview = async (data: { rentalId: string; rating: number; comment?: string }): Promise<Review> => {
    const response = await api.post('/reviews', data);
    return response.data;
};

export const getBookReviews = async (bookId: string): Promise<Review[]> => {
    const response = await api.get(`/reviews/book/${bookId}`);
    return response.data;
};

// Chat API
export interface Message {
    id: string;
    content: string;
    createdAt: string;
    senderId: string;
    sender: {
        id: string;
        email: string;
        avatarUrl: string | null;
    };
}

export const getRentalMessages = async (rentalId: string): Promise<Message[]> => {
    const response = await api.get(`/rentals/${rentalId}/messages`);
    return response.data;
};

export const sendMessage = async (rentalId: string, content: string): Promise<Message> => {
    const response = await api.post(`/rentals/${rentalId}/messages`, { content });
    return response.data;
};

// Admin API
export interface AdminStats {
    totalUsers: number;
    totalBooks: number;
    activeRentals: number;
}

export interface AdminUser {
    id: string;
    email: string;
    name: string;
    role: string;
    isBlocked: boolean;
    booksCount: number;
    rentalsCount: number;
    createdAt: string;
}

export interface PaginatedUsers {
    users: AdminUser[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface AdminBook {
    id: string;
    title: string;
    author: string;
    owner: {
        id: string;
        email: string;
        name: string;
    };
    createdAt: string;
}

export interface PaginatedBooks {
    books: AdminBook[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export const adminApi = {
    getStats: async (): Promise<AdminStats> => {
        const response = await api.get('/admin/stats');
        return response.data;
    },

    getUsers: async (page: number = 1, limit: number = 10): Promise<PaginatedUsers> => {
        const response = await api.get(`/admin/users?page=${page}&limit=${limit}`);
        return response.data;
    },

    banUser: async (id: string): Promise<void> => {
        await api.patch(`/admin/users/${id}/ban`);
    },

    getBooks: async (page: number = 1, limit: number = 10): Promise<PaginatedBooks> => {
        const response = await api.get(`/admin/books?page=${page}&limit=${limit}`);
        return response.data;
    },

    deleteBook: async (id: string): Promise<void> => {
        await api.delete(`/admin/books/${id}`);
    },
};