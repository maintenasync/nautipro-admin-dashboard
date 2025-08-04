// types/company.ts

export interface Company {
    id: number;
    name: string;
    location: string;
    vessels: number;
    created: string;
}

export interface CompanyFormData {
    name: string;
    registrationNumber: string;
    address: string;
    city: string;
    province: string;
    postalCode: string;
    country: string;
    phone: string;
    email: string;
    website: string;
    logo: File | null; // Tipe File untuk logo
}