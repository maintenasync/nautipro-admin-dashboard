// app/hooks/useApiQuery.ts - Fixed with correct transform functions

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiService from '@/app/services/apiService';
import type {
    CompanyUI,
    VesselUI,
    CrewMemberUI,
    LicenseUI,
    InvitationUI,
    Company,
    Vessel,
    CrewMember,
    License,
    Invitation,
    VesselType,
    UserRole
} from '@/app/types/api';

import type {
    NotificationSetting,
    NotificationSettingRequest,
    NotificationSettingUI
} from '@/app/types/api';

// Transform function untuk notification setting
const transformNotificationSettingForUI = (setting: NotificationSetting): NotificationSettingUI => ({
    id: setting.id,
    userId: setting.user_id,
    telegramChatId: setting.telegram_chat_id,
    telegramUsername: setting.telegram_username,
    email: setting.email,
    phoneNumber: setting.phone_number,
    whatsappNumber: setting.whatsapp_number,
    createdAt: setting.created_at ? new Date(parseInt(setting.created_at)).toLocaleDateString('id-ID') : '',
    updatedAt: setting.updated_at ? new Date(parseInt(setting.updated_at)).toLocaleDateString('id-ID') : '',
    isNew: setting.id === 0, // jika id 0 berarti data baru
});

// ========== NOTIFICATION SETTING HOOKS ==========
export const useNotificationSetting = () => {
    return useQuery({
        queryKey: ['notification-setting'],
        queryFn: async () => {
            const response = await apiService.getNotificationSetting();
            return transformNotificationSettingForUI(response.data);
        },
        staleTime: 5 * 60 * 1000, // Cache for 5 minutes
        retry: 1, // Only retry once for this endpoint
    });
};

export const useSaveNotificationSetting = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: NotificationSettingUI) => {
            // Transform UI data back to API format
            const apiData: NotificationSettingRequest = {
                id: data.isNew ? 0 : data.id, // Set id to 0 for new data
                user_id: data.userId,
                telegram_chat_id: data.telegramChatId,
                telegram_username: data.telegramUsername,
                email: data.email,
                phone_number: data.phoneNumber,
                whatsapp_number: data.whatsappNumber,
            };

            const response = await apiService.saveNotificationSetting(apiData);
            return transformNotificationSettingForUI(response.data);
        },
        onSuccess: (savedData) => {
            // Update the cache with saved data
            queryClient.setQueryData(['notification-setting'], savedData);

            // Invalidate to ensure fresh data
            queryClient.invalidateQueries({ queryKey: ['notification-setting'] });
        },
        onError: (error) => {
            console.error('Failed to save notification setting:', error);
        }
    });
};
// ========== DASHBOARD OVERVIEW HOOKS ==========
export const useDashboardOverview = () => {
    return useQuery({
        queryKey: ['dashboard-overview'],
        queryFn: async () => {
            const response = await apiService.getDashboardOverview();
            return response.data;
        },
        staleTime: 2 * 60 * 1000, // Cache for 2 minutes
        refetchOnWindowFocus: true, // Refresh when user focuses window
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    });
};

// CORRECTED Transform functions
const transformCompanyForUI = (company: Company): CompanyUI => ({
    id: company.id,
    name: company.name,
    location: `${company.city}, ${company.province}`,
    registrationNumber: company.registration_number,
    address: company.address,
    city: company.city,
    province: company.province,
    postalCode: company.postal_code,
    country: company.country,
    phone: company.phone,
    email: company.email,
    website: company.website,
    logo: company.logo,
    createdAt: new Date(parseInt(company.created_at)).toLocaleDateString('id-ID'),
    updatedAt: new Date(parseInt(company.updated_at)).toLocaleDateString('id-ID'),
    created: new Date(parseInt(company.created_at)).toLocaleDateString('id-ID'),
});

const transformVesselForUI = (vessel: Vessel, companyName?: string): VesselUI => ({
    id: vessel.id,
    name: vessel.name.trim(),
    type: vessel.vessel_type.name,
    company: companyName || 'Unknown Company',
    status: vessel.is_deleted ? 'Inactive' : 'Active',
    imo: vessel.imo,
    image: vessel.image,
    mmsi: vessel.mmsi || 'N/A',
    flag: vessel.flag || 'N/A',
    callsign: vessel.callsign || 'N/A',
    gross_tonnage: vessel.gross_tonnage || 0,
    summer_dead_weight: vessel.summer_deadweight || 0,
    year_of_build: vessel.year_of_build || 0,
    place_of_build: vessel.place_of_build || 'N/A',
    class_name: 'N/A',
});

const transformCrewForUI = (crew: CrewMember, vesselName?: string): CrewMemberUI => ({
    id: crew.id,
    name: crew.user.name,
    email: crew.user.email,
    role: crew.user_role.name,
    user_id: crew.user.id,
    vessel: vesselName || 'Unknown Vessel',
    vessel_id: crew.vessel_id,
    startDate: crew.start_at ? new Date(parseInt(crew.start_at)).toLocaleDateString('id-ID') : 'N/A',
    status: crew.user.user_status ? 'Active' : 'Inactive',
    avatar: crew.user.avatar,
    company: {
        id: crew.company.id,
        name: crew.company.name,
        location: `${crew.company.city}, ${crew.company.province}`,
        registrationNumber: crew.company.registration_number,
        address: crew.company.address,
        city: crew.company.city,
        province: crew.company.province,
        postalCode: crew.company.postal_code,
        country: crew.company.country,
        phone: crew.company.phone,
        email: crew.company.email,
        website: crew.company.website,
        logo: crew.company.logo,
        createdAt: new Date(parseInt(crew.company.created_at)).toLocaleDateString('id-ID'),
        updatedAt: new Date(parseInt(crew.company.updated_at)).toLocaleDateString('id-ID'),
        created: new Date(parseInt(crew.company.created_at)).toLocaleDateString('id-ID'),
    },
});

// CORRECTED License transform function
const transformLicenseForUI = (license: License): LicenseUI => {
    const validUntil = new Date(parseInt(license.valid_until));
    const now = new Date();
    const daysRemaining = Math.ceil((validUntil.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    let status = 'Valid';
    if (daysRemaining < 0) {
        status = 'Expired';
    } else if (daysRemaining <= 30) {
        status = 'Expiring Soon';
    }

    return {
        id: license.license_code, // Use license_code as id
        license_code: license.license_code,
        company_name: license.company.name,
        vessel_name: license.vessel.name.trim(),
        vessel_imo: license.vessel.imo,
        valid_until: validUntil.toLocaleDateString('id-ID'),
        status,
        days_remaining: daysRemaining,
        vessel_image: license.vessel.image,
        company_location: `${license.company.city}, ${license.company.province}`,
    };
};

// CORRECTED Invitation transform function
const transformInvitationForUI = (invitation: Invitation): InvitationUI => {
    const createdAt = new Date(parseInt(invitation.created_at));
    const expiredAt = new Date(parseInt(invitation.expired_at));
    const now = new Date();
    const daysRemaining = Math.ceil((expiredAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const isExpired = daysRemaining < 0;

    // Find vessel name from vessels list
    const vessel = invitation.vessel;
    const vesselName = vessel?.name || 'Unknown Vessel';

    return {
        id: invitation.id,
        company_name: invitation.company.name,
        company_location: `${invitation.company.city}, ${invitation.company.province}`,
        vessel_name: vesselName,
        role_name: invitation.user_role.name,
        role_description: invitation.user_role.description,
        email: invitation.email,
        status: invitation.status,
        created_date: createdAt.toLocaleDateString('id-ID'),
        expired_date: expiredAt.toLocaleDateString('id-ID'),
        days_remaining: daysRemaining,
        is_expired: isExpired,
    };
};

// ========== NEW HOOKS FOR ROLES AND VESSEL TYPES ==========

export const useRoles = () => {
    return useQuery({
        queryKey: ['roles'],
        queryFn: async () => {
            const response = await apiService.getRoles();
            return response.data;
        },
        staleTime: 10 * 60 * 1000, // 10 minutes - roles don't change often
    });
};

export const useVesselTypes = () => {
    return useQuery({
        queryKey: ['vessel-types'],
        queryFn: async () => {
            const response = await apiService.getVesselTypes();
            return response.data;
        },
        staleTime: 10 * 60 * 1000, // 10 minutes - vessel types don't change often
    });
};

// ========== CREW MANAGEMENT MUTATIONS ==========

export const useUpdateCrewMember = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: {
            vessel_id: string;
            user_role_code: string;
            user_id: string;
            company_id: string;
        }) => apiService.updateVesselMember(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['crews'] });
            queryClient.invalidateQueries({ queryKey: ['vessels'] });
        },
    });
};

export const useRemoveCrewMember = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: {
            vessel_id: string;
            user_role_code: string;
            user_id: string;
            company_id: string;
        }) => apiService.removeVesselMember(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['crews'] });
            queryClient.invalidateQueries({ queryKey: ['vessels'] });
        },
    });
};

// ========== COMPANY MUTATIONS ==========

export const useCreateCompany = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: {
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
        }) => apiService.createCompany(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['companies'] });
        },
    });
};

export const useUpdateCompany = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ companyId, data }: {
            companyId: string;
            data: {
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
            };
        }) => apiService.updateCompany(companyId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['companies'] });
        },
    });
};

export const useUpdateCompanyLogo = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ companyId, logoFile }: {
            companyId: string;
            logoFile: File;
        }) => apiService.updateCompanyLogo(companyId, logoFile),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['companies'] });
        },
    });
};

export const useDeleteCompany = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (companyId: string) => apiService.deleteCompany(companyId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['companies'] });
            queryClient.invalidateQueries({ queryKey: ['vessels'] });
            queryClient.invalidateQueries({ queryKey: ['crews'] });
        },
    });
};

// ========== VESSEL MUTATIONS ==========

export const useCreateVessel = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: {
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
        }) => apiService.createVessel(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['vessels'] });
            queryClient.invalidateQueries({ queryKey: ['companies'] });
        },
    });
};

export const useUpdateVessel = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: {
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
        }) => apiService.updateVessel(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['vessels'] });
        },
    });
};

export const useUpdateVesselImage = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ vesselId, imageFile }: {
            vesselId: string;
            imageFile: File;
        }) => apiService.updateVesselImage(vesselId, imageFile),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['vessels'] });
        },
    });
};

export const useDeleteVessel = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (vesselId: string) => apiService.deleteVessel(vesselId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['vessels'] });
            queryClient.invalidateQueries({ queryKey: ['companies'] });
            queryClient.invalidateQueries({ queryKey: ['crews'] });
        },
    });
};

// ========== EXISTING QUERY HOOKS ==========

export const useCompanies = () => {
    return useQuery({
        queryKey: ['companies'],
        queryFn: async () => {
            const response = await apiService.getCompanies();
            return response.data ? response.data.map(transformCompanyForUI) : [];
        },
        staleTime: 5 * 60 * 1000,
    });
};

export const useCompany = (companyId: string) => {
    return useQuery({
        queryKey: ['company', companyId],
        queryFn: async () => {
            const response = await apiService.getCompany(companyId);
            return transformCompanyForUI(response.data);
        },
        enabled: !!companyId,
        staleTime: 5 * 60 * 1000,
    });
};

export const useVesselsByCompany = (companyId: string) => {
    const { data: companies } = useCompanies();

    return useQuery({
        queryKey: ['vessels', 'company', companyId],
        queryFn: async () => {
            const response = await apiService.getVesselsByCompany(companyId);
            const company = companies?.find(c => c.id === companyId);
            return response.data.map(vessel => transformVesselForUI(vessel, company?.name));
        },
        enabled: !!companyId,
        staleTime: 3 * 60 * 1000,
    });
};

export const useAllVessels = () => {
    const { data: companies } = useCompanies();

    return useQuery({
        queryKey: ['vessels', 'all'],
        queryFn: async () => {
            if (!companies) return [];

            const allVessels: VesselUI[] = [];

            for (const company of companies) {
                try {
                    const response = await apiService.getVesselsByCompany(company.id);
                    const transformedVessels = response.data.map(vessel =>
                        transformVesselForUI(vessel, company.name)
                    );
                    allVessels.push(...transformedVessels);
                } catch (error) {
                    console.warn(`Failed to fetch vessels for company ${company.id}:`, error);
                }
            }

            return allVessels;
        },
        enabled: !!companies && companies.length > 0,
        staleTime: 3 * 60 * 1000,
    });
};

export const useCrewsByVessel = (vesselId: string) => {
    const { data: vessels } = useAllVessels();

    return useQuery({
        queryKey: ['crews', 'vessel', vesselId],
        queryFn: async () => {
            const response = await apiService.getCrewsByVessel(vesselId);
            const vessel = vessels?.find(v => v.id === vesselId);
            return response.data.map(crew => transformCrewForUI(crew, vessel?.name));
        },
        enabled: !!vesselId,
        staleTime: 2 * 60 * 1000,
    });
};

export const useCrewsByCompany = (companyId: string) => {
    const { data: vessels } = useAllVessels();

    return useQuery({
        queryKey: ['crews', 'company', companyId],
        queryFn: async () => {
            const response = await apiService.getCrewsByCompany(companyId);
            return response.data.map(crew => {
                const vessel = vessels?.find(v => v.id === crew.vessel_id);
                return transformCrewForUI(crew, vessel?.name);
            });
        },
        enabled: !!companyId,
        staleTime: 2 * 60 * 1000,
    });
};

export const useAllCrews = () => {
    const { data: companies } = useCompanies();
    const { data: vessels } = useAllVessels();

    return useQuery({
        queryKey: ['crews', 'all'],
        queryFn: async () => {
            if (!companies) return [];

            const allCrews: CrewMemberUI[] = [];

            for (const company of companies) {
                try {
                    const response = await apiService.getCrewsByCompany(company.id);
                    const transformedCrews = response.data.map(crew => {
                        const vessel = vessels?.find(v => v.id === crew.vessel_id);
                        return transformCrewForUI(crew, vessel?.name);
                    });
                    allCrews.push(...transformedCrews);
                } catch (error) {
                    console.warn(`Failed to fetch crews for company ${company.id}:`, error);
                }
            }

            return allCrews;
        },
        enabled: !!companies && companies.length > 0 && !!vessels,
        staleTime: 2 * 60 * 1000,
    });
};

export const useFilteredCrews = (filters: {
    vessel?: string;
    role?: string;
    status?: string;
    search?: string;
}) => {
    const { data: crews, ...query } = useAllCrews();

    const filteredCrews = crews?.filter(crew => {
        const matchesVessel = !filters.vessel || filters.vessel === 'All Vessels' || crew.vessel === filters.vessel;
        const matchesRole = !filters.role || filters.role === 'All Roles' || crew.role === filters.role;
        const matchesStatus = !filters.status || filters.status === 'All Status' || crew.status === filters.status;
        const matchesSearch = !filters.search ||
            crew.name.toLowerCase().includes(filters.search.toLowerCase()) ||
            crew.email.toLowerCase().includes(filters.search.toLowerCase());

        return matchesVessel && matchesRole && matchesStatus && matchesSearch;
    }) || [];

    return {
        ...query,
        data: filteredCrews,
    };
};

// ========== LICENSES HOOKS ==========

export const useLicenses = () => {
    return useQuery({
        queryKey: ['licenses'],
        queryFn: async () => {
            try {
                const response = await apiService.getLicenses();
                return response.data.map(transformLicenseForUI);
            } catch (error) {
                // Log error for debugging purposes if needed
                console.error("Error fetching licenses:", error);
                // Return an empty array on error to prevent UI from showing a failed state
                return [];
            }
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};

export const useFilteredLicenses = (filters: {
    company?: string;
    vessel?: string;
    status?: string;
    search?: string;
}) => {
    const { data: licenses, ...query } = useLicenses();

    const filteredLicenses = licenses?.filter(license => {
        const matchesCompany = !filters.company || filters.company === 'All Companies' || license.company_name === filters.company;
        const matchesVessel = !filters.vessel || filters.vessel === 'All Vessels' || license.vessel_name === filters.vessel;
        const matchesStatus = !filters.status || filters.status === 'All Status' || license.status === filters.status;
        const matchesSearch = !filters.search ||
            license.license_code.toLowerCase().includes(filters.search.toLowerCase()) ||
            license.company_name.toLowerCase().includes(filters.search.toLowerCase()) ||
            license.vessel_name.toLowerCase().includes(filters.search.toLowerCase());

        return matchesCompany && matchesVessel && matchesStatus && matchesSearch;
    }) || [];

    return {
        ...query,
        data: filteredLicenses,
    };
};

// ========== INVITATIONS HOOKS ==========

export const useInvitations = () => {
    // const { data: vessels = [] } = useAllVessels();

    return useQuery({
        queryKey: ['invitations'],
        queryFn: async () => {
            const response = await apiService.getInvitations();
            return response.data.map(invitation => transformInvitationForUI(invitation));
        },
        // enabled: vessels.length > 0,
        enabled: true, // Always enabled to fetch invitations
        staleTime: 2 * 60 * 1000, // 2 minutes
    });
};

export const useAcceptInvitation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (invitationId: number) => apiService.acceptInvitation(invitationId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['invitations'] });
            queryClient.invalidateQueries({ queryKey: ['crews'] });
        },
    });
};

export const useRejectInvitation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (invitationId: number) => apiService.rejectInvitation(invitationId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['invitations'] });
        },
    });
};

export const useFilteredInvitations = (filters: {
    company?: string;
    status?: string;
    search?: string;
}) => {
    const { data: invitations, ...query } = useInvitations();

    const filteredInvitations = invitations?.filter(invitation => {
        const matchesCompany = !filters.company || filters.company === 'All Companies' || invitation.company_name === filters.company;
        const matchesStatus = !filters.status || filters.status === 'All Status' || invitation.status === filters.status;
        const matchesSearch = !filters.search ||
            invitation.email.toLowerCase().includes(filters.search.toLowerCase()) ||
            invitation.role_name.toLowerCase().includes(filters.search.toLowerCase()) ||
            invitation.company_name.toLowerCase().includes(filters.search.toLowerCase()) ||
            invitation.vessel_name.toLowerCase().includes(filters.search.toLowerCase());

        return matchesCompany && matchesStatus && matchesSearch;
    }) || [];

    return {
        ...query,
        data: filteredInvitations,
    };
};