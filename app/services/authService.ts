// services/authService.ts

import { LoginRequest, RegisterRequest, AuthResponse, User } from '../types/auth';

// Use environment variables untuk production
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://auth.nautiproconnect.com/api/v1/web';
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || '12345678';

class AuthService {
    private getHeaders() {
        return {
            'Content-Type': 'application/json',
            'x-api-key': API_KEY,
        };
    }

     getAuthHeaders() {
        const token = this.getToken();
        return {
            'Content-Type': 'application/json',
            'x-api-key': API_KEY,
            ...(token && { 'authorization': `Bearer ${token}` }),
        };
    }

    async login(credentials: LoginRequest): Promise<AuthResponse> {
        try {
            const response = await fetch(`${BASE_URL}/login-admin`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(credentials),
            });

            if (!response.ok) {
                throw new Error(`Login failed: ${response.status}`);
            }

            const data: AuthResponse = await response.json();

            // Store token in localStorage for global access
            if (data.data.token) {
                localStorage.setItem('auth_token', data.data.token);
                localStorage.setItem('refresh_token', data.data.refresh_token);
                localStorage.setItem('user_data', JSON.stringify(data.data));
            }

            return data;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }

    async register(userData: RegisterRequest): Promise<AuthResponse> {
        try {
            const response = await fetch(`${BASE_URL}/register-user`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(userData),
            });

            if (!response.ok) {
                throw new Error(`Registration failed: ${response.status}`);
            }

            const data: AuthResponse = await response.json();
            return data;
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    }

    // New: Get current user data from API
    async getCurrentUser(): Promise<User | null> {
        try {
            const response = await fetch(`${BASE_URL}/user`, {
                method: 'GET',
                headers: this.getAuthHeaders(),
            });

            if (!response.ok) {
                if (response.status === 401) {
                    // Token invalid, clear localStorage
                    this.logout();
                    return null;
                }
                throw new Error(`Failed to fetch user: ${response.status}`);
            }

            const data = await response.json();

            if (data.code === 200 && data.data) {
                const user: User = {
                    id: data.data.id,
                    name: data.data.name,
                    username: data.data.username,
                    email: data.data.email,
                    role: data.data.role,
                    avatar: data.data.avatar || data.data.avatar_link || '',
                    license: data.data.license || null,
                };

                // Update localStorage dengan data terbaru
                localStorage.setItem('user_data', JSON.stringify({
                    ...user,
                    token: this.getToken()
                }));

                return user;
            }

            return null;
        } catch (error) {
            console.error('Get current user error:', error);
            return null;
        }
    }

    // Get stored token for API requests
    getToken(): string | null {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('auth_token');
        }
        return null;
    }

    // Get stored user data (sebagai fallback, tapi idealnya gunakan getCurrentUser())
    getUserData(): User | null {
        if (typeof window !== 'undefined') {
            const userData = localStorage.getItem('user_data');
            return userData ? JSON.parse(userData) : null;
        }
        return null;
    }

    // Check if user is authenticated
    isAuthenticated(): boolean {
        return !!this.getToken();
    }

    // Logout function
    logout(): void {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user_data');
        }
    }

    // Get headers with authorization for API requests (untuk service lain)
    getAuthHeaders_Public() {
        return this.getAuthHeaders();
    }

    // Refresh token functionality (jika diperlukan di masa depan)
    async refreshToken(): Promise<boolean> {
        try {
            const refreshToken = localStorage.getItem('refresh_token');
            if (!refreshToken) return false;

            const response = await fetch(`${BASE_URL}/refresh-token`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({ refresh_token: refreshToken }),
            });

            if (!response.ok) {
                this.logout();
                return false;
            }

            const data = await response.json();
            if (data.code === 200 && data.data.token) {
                localStorage.setItem('auth_token', data.data.token);
                if (data.data.refresh_token) {
                    localStorage.setItem('refresh_token', data.data.refresh_token);
                }
                return true;
            }

            return false;
        } catch (error) {
            console.error('Refresh token error:', error);
            this.logout();
            return false;
        }
    }
}

export const authService = new AuthService();
export default authService;