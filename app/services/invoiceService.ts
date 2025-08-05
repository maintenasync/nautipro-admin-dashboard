// app/services/invoiceService.ts

import authService from './authService';
import type { Invoice, CreateInvoiceRequest, UpdateInvoiceRequest, ApiResponse } from '@/app/types/invoice';

const BASE_URL = 'https://auth.nautiproconnect.com/api/v1/web';

class InvoiceService {
    private async request<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
        try {
            const headers = authService.getAuthHeaders();

            const response = await fetch(`${BASE_URL}${endpoint}`, {
                ...options,
                headers: {
                    ...headers,
                    ...options?.headers,
                },
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status} ${response.statusText}`);
            }

            const data: ApiResponse<T> = await response.json();
            return data;
        } catch (error) {
            console.error('Invoice API Request failed:', error);
            throw error;
        }
    }

    async getInvoices(): Promise<ApiResponse<Invoice[]>> {
        return this.request<Invoice[]>('/get-invoices', {
            method: 'GET',
        });
    }

    async createInvoice(data: CreateInvoiceRequest): Promise<ApiResponse<Invoice>> {
        return this.request<Invoice>('/create-invoice', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
    }

    async updateInvoice(data: UpdateInvoiceRequest): Promise<ApiResponse<Invoice>> {
        return this.request<Invoice>('/update-invoice', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
    }

    async uploadPaymentReceipt(invoiceId: number, receiptFile: File): Promise<ApiResponse<any>> {
        try {
            const authHeaders = authService.getAuthHeaders();
            const { 'Content-Type': _, ...headers } = authHeaders;

            const formData = new FormData();
            formData.append('receipt', receiptFile);
            formData.append('invoice_id', invoiceId.toString());

            const response = await fetch(`${BASE_URL}/upload-payment-receipt`, {
                method: 'POST',
                headers,
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status} ${response.statusText}`);
            }

            const data: ApiResponse<any> = await response.json();
            return data;
        } catch (error) {
            console.error('Upload payment receipt failed:', error);
            throw error;
        }
    }
}

export const invoiceService = new InvoiceService();
export default invoiceService;