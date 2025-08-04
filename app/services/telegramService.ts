// app/services/telegramService.ts

interface CreateVerificationResponse {
    code: number;
    status: string;
    data: {
        id: number;
        user_id: string;
        token: string;
        is_used: boolean;
        active_until: string;
        created_at: string;
        updated_at: string;
    };
}

interface VerifyTokenResponse {
    code: number;
    status: string;
    message?: string;
    data?: {
        is_verified: boolean;
        username?: string;
    };
}

const BASE_URL = 'https://auth.nautiproconnect.com/api/v1/web';
const API_KEY = '12345678'

class TelegramService {
    private baseUrl: string;
    private apiKey: string;

    constructor() {
        this.baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || BASE_URL;
        this.apiKey = process.env.NEXT_PUBLIC_API_KEY || API_KEY;

        if (!this.baseUrl || !this.apiKey) {
            console.warn('Telegram API configuration is missing. Please set NEXT_PUBLIC_API_BASE_URL and NEXT_PUBLIC_API_KEY');
        }
    }

    private getAuthToken(): string {
        // Get JWT token from localStorage, sessionStorage, or your auth context
        if (typeof window !== 'undefined') {
            return localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token') || '';
        }
        return '';
    }

    private getHeaders(): HeadersInit {
        const token = this.getAuthToken();

        return {
            'Content-Type': 'application/json',
            'x-api-key': this.apiKey,
            ...(token && { 'Authorization': `Bearer ${token}` })
        };
    }

    async createVerification(): Promise<CreateVerificationResponse> {
        try {
            const response = await fetch(`${this.baseUrl}/create-telegram-verification`, {
                method: 'POST',
                headers: this.getHeaders()
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            if (result.code !== 200) {
                throw new Error(result.message || 'Failed to create verification token');
            }

            return result;
        } catch (error) {
            console.error('Error creating verification token:', error);
            throw error;
        }
    }

    // Optional: Add method to check verification status
    async checkVerificationStatus(tokenId: number): Promise<VerifyTokenResponse> {
        try {
            const response = await fetch(`${this.baseUrl}/check-telegram-verification/${tokenId}`, {
                method: 'GET',
                headers: this.getHeaders()
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Error checking verification status:', error);
            throw error;
        }
    }

    // Optional: Add method to save verified telegram username
    async saveVerifiedUsername(username: string): Promise<any> {
        try {
            const response = await fetch(`${this.baseUrl}/save-telegram-username`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({ username })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Error saving verified username:', error);
            throw error;
        }
    }
}

// Export singleton instance
const telegramService = new TelegramService();
export default telegramService;