// services/crewService.ts

import authService from './authService';

const BASE_URL = 'https://auth.nautiproconnect.com/api/v1/web';

export interface InviteCrewRequest {
    company_id: string;
    vessel_id: string;
    email: string;
    user_role_code: string;
}

export interface InviteCrewResponse {
    code: number;
    status: string;
    message?: string;
    data?: unknown;
}

class CrewService {
    async inviteCrewMember(inviteData: InviteCrewRequest): Promise<InviteCrewResponse> {
        try {
            const headers = authService.getAuthHeaders();

            const response = await fetch(`${BASE_URL}/create-invitation-vessel-member-maintena`, {
                method: 'POST',
                headers,
                body: JSON.stringify(inviteData),
            });

            if (!response.ok) {
                throw new Error(`Invitation failed: ${response.status}`);
            }

            const data: InviteCrewResponse = await response.json();
            return data;
        } catch (error) {
            console.error('Invite crew member error:', error);
            throw error;
        }
    }
}

export const crewService = new CrewService();
export default crewService;