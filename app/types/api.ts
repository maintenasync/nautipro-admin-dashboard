// app/types/api.ts

// Base API Response Structure
export interface ApiResponse<T> {
    code: number;
    status: string;
    data: T;
}

// ========== NOTIFICATION SETTING INTERFACES ==========
export interface NotificationSetting {
    id: number;
    user_id: string;
    telegram_chat_id: string;
    telegram_username: string;
    email: string;
    phone_number: string;
    whatsapp_number: string;
    created_at: string;
    updated_at: string;
}

export interface NotificationSettingRequest {
    id: number;
    user_id: string;
    telegram_chat_id: string;
    telegram_username: string;
    email: string;
    phone_number: string;
    whatsapp_number: string;
}

// For UI Components (transformed data)
export interface NotificationSettingUI {
    id: number;
    userId: string;
    telegramChatId: string;
    telegramUsername: string;
    email: string;
    phoneNumber: string;
    whatsappNumber: string;
    createdAt: string;
    updatedAt: string;
    isNew: boolean; // untuk menentukan apakah ini data baru atau update
}

// Company Interfaces
export interface Company {
    id: string;
    name: string;
    registration_number: string;
    address: string;
    city: string;
    province: string;
    postal_code: string;
    country: string;
    phone: string;
    email: string;
    website: string;
    created_at: string;
    updated_at: string;
    logo?: string;
}

// Vessel Type Interface (NEW)
export interface VesselType {
    id: number;
    name: string;
}

// User Role Interface (NEW)
export interface UserRole {
    id: number;
    role_code: string;
    name: string;
    description: string;
}

// Vessel Interfaces
export interface VesselClass {
    id: number;
    name: string;
    country: string;
    is_iacs: boolean;
    created_at: string;
    updated_at: string;
}

export interface Vessel {
    id: string;
    name: string;
    previous_name: string;
    imo: string;
    mmsi: string;
    flag: string;
    callsign: string;
    gross_tonnage: number;
    summer_deadweight: number;
    year_of_build: number;
    place_of_build: string;
    vesseltype_id: number;
    class_id: number;
    company_id: string;
    is_deleted: boolean;
    image: string;
    created_at: string;
    updated_at: string;
    vessel_type: VesselType;
    class: VesselClass;
}

// Crew/User Interfaces
export interface User {
    id: string;
    username: string;
    email: string;
    email_verification: boolean;
    name: string;
    password: string;
    user_status: boolean;
    avatar: string;
    role: string;
    created_at: string;
    updated_at: string;
}

export interface CrewMember {
    id: number;
    company_id: string;
    vessel_id: string;
    user_id: string;
    user_role_id: number;
    start_at: string;
    end_at: string;
    created_at: string;
    updated_at: string;
    company: Company;
    user: User;
    user_role: UserRole;
}

// Invitation Interfaces
export interface Invitation {
    id: number;
    company_id: string;
    vessel_id: string;
    user_id: string;
    email: string;
    user_role_id: number;
    status: 'pending' | 'accept' | 'reject';
    expired_at: string;
    created_at: string;
    updated_at: string;
    company: Company;
    user_role: UserRole;
    vessel: Vessel;
}

// License Interfaces
export interface License {
    license_code: string;
    valid_until: string;
    company_id: string;
    vessel_id: string;
    company: Company;
    vessel: Vessel;
    role: UserRole;
}

// For UI Components (transformed data) - CORRECTED VERSIONS
export interface CompanyUI {
    id: string;
    name: string;
    location: string;
    registrationNumber: string;
    address: string;
    city: string;
    province: string;
    postalCode: string;
    country: string;
    phone: string;
    email: string;
    website: string;
    logo?: string;
    createdAt: string;
    updatedAt: string;
    vessels?: number;
    crews?: number;
    created: string;
}

export interface VesselUI {
    id: string;
    name: string;
    type: string;
    company: string;
    status: string;
    imo: string;
    image?: string;
    mmsi: string;
    flag: string;
    callsign: string;
    gross_tonnage: number;
    summer_dead_weight: number;
    year_of_build: number;
    place_of_build: string;
    class_name: string;
}

export interface CrewMemberUI {
    id: number;
    name: string;
    email: string;
    role: string;
    vessel: string;
    vessel_id: string;
    startDate: string;
    user_id: string;
    status: string;
    avatar?: string;
    company: CompanyUI;
}

// CORRECTED LicenseUI - matching what's actually used in components
export interface LicenseUI {
    id: string;
    license_code: string;
    company_name: string;
    vessel_name: string;
    vessel_imo: string;
    valid_until: string;
    status: string;
    days_remaining: number;
    vessel_image?: string;
    company_location: string;
}

// CORRECTED InvitationUI - matching what's actually used in components
export interface InvitationUI {
    id: number;
    company_name: string;
    company_location: string;
    vessel_name: string;
    role_name: string;
    role_description: string;
    email: string;
    status: 'pending' | 'accept' | 'reject';
    created_date: string;
    expired_date: string;
    days_remaining: number;
    is_expired: boolean;
}

// Request/Response Types for API calls

// Company Create/Update Request
export interface CompanyCreateRequest {
    name: string;
    registration_number: string;
    address: string;
    city: string;
    province: string;
    postal_code: string;
    country: string;
    phone: string;
    email: string;
    website: string;
}

// Vessel Create/Update Request
export interface VesselCreateRequest {
    name: string;
    previous_name?: string;
    imo: string;
    mmsi: string;
    flag: string;
    callsign: string;
    gross_tonnage: number;
    summer_deadweight: number;
    year_of_build: number;
    place_of_build: string;
    vesseltype_id: number;
    class_name: string;
    company_id: string;
}

export interface VesselUpdateRequest extends VesselCreateRequest {
    id: string;
}

// Crew Update/Remove Request
export interface CrewUpdateRequest {
    vessel_id: string;
    user_role_code: string;
    user_id: string;
    company_id: string;
}

// Form Data Types for UI Components
export interface CompanyFormData {
    name: string;
    registration_number: string;
    address: string;
    city: string;
    province: string;
    postal_code: string;
    country: string;
    phone: string;
    email: string;
    website: string;
    logo?: File;
}

export interface VesselFormData {
    name: string;
    previous_name: string;
    imo: string;
    mmsi: string;
    flag: string;
    callsign: string;
    gross_tonnage: string;
    summer_deadweight: string;
    year_of_build: string;
    place_of_build: string;
    vesseltype_id: string;
    class_name: string;
    company_id: string;
    image?: File;
}

// Filter Types
export interface CrewFilters {
    vessel?: string;
    role?: string;
    status?: string;
    search?: string;
}

export interface VesselFilters {
    company?: string;
    type?: string;
    status?: string;
    search?: string;
}

export interface LicenseFilters {
    company?: string;
    vessel?: string;
    status?: string;
    search?: string;
}

export interface InvitationFilters {
    company?: string;
    status?: string;
    search?: string;
}

// Utility Types
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
    meta: PaginationMeta;
}

// Error Types
export interface ApiError {
    code: number;
    status: string;
    message: string;
    errors?: Record<string, string[]>;
}

// Upload Response Types
export interface FileUploadResponse {
    url: string;
    filename: string;
    size: number;
    type: string;
}

// Statistics/Dashboard Types
export interface DashboardStats {
    total_companies: number;
    total_vessels: number;
    total_crew: number;
    active_licenses: number;
    pending_invitations: number;
    expiring_licenses: number;
}

// Chart Data Types for Dashboard
export interface ChartDataPoint {
    name: string;
    value: number;
    color?: string;
}

export interface TimeSeriesDataPoint {
    date: string;
    value: number;
    label?: string;
}

// Theme Types
export type Theme = 'light' | 'dark' | 'auto';

// Navigation Types
export interface MenuItem {
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    path: string;
    badge?: number;
    active?: boolean;
}

// Modal/Dialog Types
export interface DialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export interface ConfirmDialogProps extends DialogProps {
    title: string;
    message: string;
    onConfirm: () => void;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'info';
}

// Table Types
export interface TableColumn<T = any> {
    key: keyof T;
    label: string;
    sortable?: boolean;
    render?: (value: any, row: T) => React.ReactNode;
    width?: string;
    align?: 'left' | 'center' | 'right';
}

export interface TableProps<T = any> {
    data: T[];
    columns: TableColumn<T>[];
    loading?: boolean;
    error?: string;
    onSort?: (key: keyof T, direction: 'asc' | 'desc') => void;
    sortKey?: keyof T;
    sortDirection?: 'asc' | 'desc';
    emptyMessage?: string;
}