// app/services/apiService.ts
import authService from './authService';
import type {
    ApiResponse,
    Company,
    Vessel,
    CrewMember,
    License,
    Invitation,
    VesselType,
    UserRole
} from '@/app/types/api';

const BASE_URL = 'https://auth.nautiproconnect.com/api/v1/web';
const BASE_URL_API = 'https://dev-api.nautiproconnect.com/api/v1/web';

class ApiService {
    private async request<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
        try {
            const headers = authService.getAuthHeaders();

            let baseUrl = BASE_URL;
            if (endpoint == "/vessel-types" || endpoint.includes("/update-image-vessel/")) {
                baseUrl = BASE_URL_API;
            }

            console.log("Base Url : ", baseUrl);

            const response = await fetch(`${baseUrl}${endpoint}`, {
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
            console.error('API Request failed:', error);
            throw error;
        }
    }

    async getDashboardOverview(): Promise<ApiResponse<{
        total_company: number;
        total_vessel: number;
        total_license: number;
    }>> {
        return this.request<{
            total_company: number;
            total_vessel: number;
            total_license: number;
        }>('/get-overview-total-company-vessel-license', {
            method: 'GET',
        });
    }

// ========== NOTIFICATION SETTING API ==========
    async getNotificationSetting(): Promise<ApiResponse<{
        id: number;
        user_id: string;
        telegram_chat_id: string;
        telegram_username: string;
        email: string;
        phone_number: string;
        whatsapp_number: string;
        created_at: string;
        updated_at: string;
    }>> {
        try {
            const response = await this.request<{
                id: number;
                user_id: string;
                telegram_chat_id: string;
                telegram_username: string;
                email: string;
                phone_number: string;
                whatsapp_number: string;
                created_at: string;
                updated_at: string;
            }>('/get-notification-contact', {
                method: 'GET',
            });

            return response;
        } catch (error: any) {
            // Jika not found (404 atau error lain), return default dengan current user email
            if (error.message?.includes('404') || error.message?.includes('not found')) {
                // ← MENGGUNAKAN authService.getCurrentUser() yang sudah ada
                const currentUser = await authService.getCurrentUser();
                const defaultData = {
                    id: 0, // 0 untuk create new
                    user_id: currentUser?.id || '',
                    telegram_chat_id: '',
                    telegram_username: '',
                    email: currentUser?.email || '',
                    phone_number: '',
                    whatsapp_number: '',
                    created_at: '',
                    updated_at: ''
                };

                return {
                    code: 200,
                    status: 'OK',
                    data: defaultData
                };
            }

            throw error;
        }
    }

    async saveNotificationSetting(data: {
        id: number;
        user_id: string;
        telegram_chat_id: string;
        telegram_username: string;
        email: string;
        phone_number: string;
        whatsapp_number: string;
    }): Promise<ApiResponse<{
        id: number;
        user_id: string;
        telegram_chat_id: string;
        telegram_username: string;
        email: string;
        phone_number: string;
        whatsapp_number: string;
        created_at: string;
        updated_at: string;
    }>> {
        return this.request<{
            id: number;
            user_id: string;
            telegram_chat_id: string;
            telegram_username: string;
            email: string;
            phone_number: string;
            whatsapp_number: string;
            created_at: string;
            updated_at: string;
        }>('/save-notification-contact', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
    }

    private async requestWithFormData<T>(endpoint: string, formData: FormData): Promise<ApiResponse<T>> {
        try {
            const authHeaders = authService.getAuthHeaders();
            // Remove Content-Type for FormData - let browser set it with boundary
            const { 'Content-Type': _, ...headers } = authHeaders;

            let baseUrl = BASE_URL;
            if (endpoint == "/vessel-types" || endpoint.includes("/update-image-vessel/")) {
                baseUrl = BASE_URL_API;
            }

            const response = await fetch(`${baseUrl}${endpoint}`, {
                method: 'POST',
                headers,
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status} ${response.statusText}`);
            }

            const data: ApiResponse<T> = await response.json();
            return data;
        } catch (error) {
            console.error('API Request failed:', error);
            throw error;
        }
    }

    // ========== CREW MANAGEMENT API ==========

    async getRoles(): Promise<ApiResponse<UserRole[]>> {
        return this.request<UserRole[]>('/get-roles-vessel-member-maintena');
    }

    async updateVesselMember(data: {
        vessel_id: string;
        user_role_code: string;
        user_id: string;
        company_id: string;
    }): Promise<ApiResponse<any>> {
        return this.request<any>('/update-vessel-member-maintena', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
    }

    async removeVesselMember(data: {
        vessel_id: string;
        user_role_code: string;
        user_id: string;
        company_id: string;
    }): Promise<ApiResponse<any>> {
        return this.request<any>('/end-vessel-member-maintena', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
    }

    // ========== COMPANIES CRUD API ==========

    async getVesselTypes(): Promise<ApiResponse<VesselType[]>> {
        return this.request<VesselType[]>('/vessel-types');
    }

    async createCompany(data: {
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
    }): Promise<ApiResponse<Company>> {
        return this.request<Company>('/create-company', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
    }

    async updateCompanyLogo(companyId: string, logoFile: File): Promise<ApiResponse<any>> {
        const formData = new FormData();
        formData.append('logo', logoFile);

        return this.requestWithFormData<any>(`/update-company-logo/${companyId}`, formData);
    }

    async updateCompany(companyId: string, data: {
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
    }): Promise<ApiResponse<Company>> {
        return this.request<Company>(`/update-company/${companyId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
    }

    async deleteCompany(companyId: string): Promise<ApiResponse<any>> {
        return this.request<any>(`/delete-company/${companyId}`, {
            method: 'DELETE',
        });
    }

    // ========== VESSEL CRUD API ==========

    async createVessel(data: {
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
    }): Promise<ApiResponse<Vessel>> {
        return this.request<Vessel>('/create-vessel', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
    }

    async updateVesselImage(vesselId: string, imageFile: File): Promise<ApiResponse<any>> {
        const formData = new FormData();
        formData.append('image', imageFile);

        return this.requestWithFormData<any>(`/update-image-vessel/${vesselId}`, formData);
    }

    async updateVessel(data: {
        id: string;
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
    }): Promise<ApiResponse<Vessel>> {
        return this.request<Vessel>('/update-vessel', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
    }

    async deleteVessel(vesselId: string): Promise<ApiResponse<any>> {
        return this.request<any>(`/delete-vessel/${vesselId}`, {
            method: 'DELETE',
        });
    }

    // ========== EXISTING METHODS (Keep existing functionality) ==========

    async getCompanies(): Promise<ApiResponse<Company[]>> {
        return this.request<Company[]>('/get-all-companies');
    }

    async getCompany(id: string): Promise<ApiResponse<Company>> {
        const companies = await this.getCompanies();
        const company = companies.data.find(c => c.id === id);

        if (!company) {
            throw new Error('Company not found');
        }

        return {
            code: 200,
            status: 'OK',
            data: company
        };
    }

    async getVesselsByCompany(companyId: string): Promise<ApiResponse<Vessel[]>> {
        return this.request<Vessel[]>(`/get-vessels-by-company/${companyId}`);
    }

    async getCrewsByVessel(vesselId: string): Promise<ApiResponse<CrewMember[]>> {
        return this.request<CrewMember[]>(`/get-vessel-member-maintena-by-vessel/${vesselId}`);
    }

    async getCrewsByCompany(companyId: string): Promise<ApiResponse<CrewMember[]>> {
        return this.request<CrewMember[]>(`/get-vessels-member-maintena-by-company/${companyId}`);
    }

    async getLicenses(): Promise<ApiResponse<License[]>> {
        return this.request<License[]>('/get-maintena-licenses');
    }

    async getInvitations(): Promise<ApiResponse<Invitation[]>> {
        return this.request<Invitation[]>('/get-invitations-vessel-member-maintena');
    }

    async acceptInvitation(invitationId: number): Promise<ApiResponse<any>> {
        return this.request<any>(`/accept-invitation-vessel-member-maintena/${invitationId}`);
    }

    async rejectInvitation(invitationId: number): Promise<ApiResponse<any>> {
        return this.request<any>(`/reject-invitation-vessel-member-maintena/${invitationId}`);
    }

    isAuthenticated(): boolean {
        try {
            authService.getAuthHeaders();
            return true;
        } catch {
            return false;
        }
    }
}

export const apiService = new ApiService();
export default apiService;