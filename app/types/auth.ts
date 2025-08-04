// types/auth.ts

export interface User {
    id: string;
    name: string;
    username: string;
    email: string;
    role: string;
    avatar: string;
    license: string | null;
}

export interface LoginRequest {
    email_or_username: string;
    password: string;
}

export interface RegisterRequest {
    username: string;
    email: string;
    name: string;
    password: string;
    role: string;
}

export interface AuthResponse {
    code: number;
    status: string;
    data: {
        id: string;
        name: string;
        username: string;
        email: string;
        role: string;
        avatar: string;
        token: string;
        refresh_token: string;
        license: string | null;
    };
}

export interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    isInitialized: boolean;
}