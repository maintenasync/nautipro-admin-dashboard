// app/services/userService.ts

import { UserData, ApiResponse } from '../types/user';

const BASE_URL = 'https://auth.nautiproconnect.com/api/v1/web';
const API_KEY = '12345678'

class UserService {
    private baseUrl: string;
    private apiKey: string;

    constructor() {
        this.baseUrl = process.env.NEXT_PUBLIC_API_URL || BASE_URL;
        this.apiKey = process.env.NEXT_PUBLIC_API_KEY || API_KEY;
    }

    private getHeaders(): HeadersInit {
        const token = localStorage.getItem('auth_token');
        return {
            'x-api-key': this.apiKey,
            'authorization': `Bearer ${token}`,
        };
    }

    private async handleResponse<T>(response: Response): Promise<T> {
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Network error' }));
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        return response.json();
    }

    async getUser(): Promise<UserData> {
        try {
            const response = await fetch(`${this.baseUrl}/user`, {
                method: 'GET',
                headers: this.getHeaders(),
            });

            const result: ApiResponse<UserData> = await this.handleResponse(response);
            return result.data;
        } catch (error) {
            console.error('Error fetching user data:', error);
            throw error;
        }
    }

    async updateAvatar(file: File): Promise<boolean> {
        try {
            const formData = new FormData();
            formData.append('avatar', file);

            const response = await fetch(`${this.baseUrl}/update-avatar`, {
                method: 'PUT',
                headers: {
                    'x-api-key': this.apiKey,
                    'authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                },
                body: formData,
            });

            const result: ApiResponse<string> = await this.handleResponse(response);
            return result.code === 200;
        } catch (error) {
            console.error('Error updating avatar:', error);
            throw error;
        }
    }

    async changePassword(oldPassword: string, newPassword: string): Promise<boolean> {
        try {
            const response = await fetch(`${this.baseUrl}/change-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...this.getHeaders(),
                },
                body: JSON.stringify({
                    old_password: oldPassword,
                    new_password: newPassword,
                }),
            });

            const result: ApiResponse<string> = await this.handleResponse(response);
            return result.code === 200;
        } catch (error) {
            console.error('Error changing password:', error);
            throw error;
        }
    }

    async createEmailVerification(email: string): Promise<boolean> {
        try {
            const response = await fetch(`${this.baseUrl}/create-email-verification/${email}`, {
                method: 'POST',
                headers: this.getHeaders(),
            });

            const result: ApiResponse<string> = await this.handleResponse(response);
            return result.code === 200;
        } catch (error) {
            console.error('Error creating email verification:', error);
            throw error;
        }
    }

    async verifyEmail(email: string, otp: string): Promise<boolean> {
        try {
            const response = await fetch(`${this.baseUrl}/verify-email-verification/${email}/${otp}`, {
                method: 'POST',
                headers: this.getHeaders(),
            });

            const result: ApiResponse<string> = await this.handleResponse(response);
            return result.code === 200;
        } catch (error) {
            console.error('Error verifying email:', error);
            throw error;
        }
    }
}

export const userService = new UserService();