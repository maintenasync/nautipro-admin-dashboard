// app/types/invoice.ts

export interface Invoice {
    id: number;
    invoice_code: string;
    price: string;
    payment_method: string;
    payment_status: boolean;
    payment_receipt: string;
    paid_at: string;
    created_at: string;
    updated_at: string;
}

export interface InvoiceUI {
    id: number;
    invoice_code: string;
    price: string;
    formatted_price: string;
    payment_method: string;
    payment_status: 'Paid' | 'Unpaid';
    payment_receipt: string;
    paid_at: string;
    formatted_paid_at: string;
    created_at: string;
    formatted_created_at: string;
    updated_at: string;
    status_color: string;
}

export interface CreateInvoiceRequest {
    price: string;
    payment_method: string;
}

export interface UpdateInvoiceRequest {
    id: number;
    price: string;
    payment_method: string;
    payment_status: boolean;
    paid_at: string;
    payment_receipt: string;
}

export interface InvoiceFilters {
    payment_method?: string;
    payment_status?: string;
    search?: string;
}

export interface ApiResponse<T> {
    code: number;
    status: string;
    data: T;
}