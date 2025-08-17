// app/dashboard/page.tsx - QUICK MOBILE FIX

'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';

// Import layout components
import Sidebar from './components/layout/Sidebar';
import TopBar from './components/layout/TopBar';

// Import page components
import DashboardHome from './components/pages/DashboardHome';
import ContactUs from './components/pages/ContactUs';
import Vessels from './components/pages/Vessels';
import License from './components/pages/License';
import Invoice from './components/pages/Invoice';
import UserSettings from './components/pages/UserSettings';
import CreateCompany from './components/pages/CreateCompany';
import CreateVessel from './components/pages/CreateVessel';
import VesselDetail from './components/pages/VesselDetail';

// Import icons
import {
    HomeIcon,
    CrewIcon,
    BuildingIcon,
    ShipIcon,
    LicenseIcon,
    InvitationIcon,
    NotificationIcon,
    InvoiceIcon,
    SettingsIcon, MessageIcon
} from './components/icons/Icons';
import {useUserDataManager} from "@/app/hooks/useDataManager";

// Menu items configuration
const menuItems = [
    { id: 'home', label: 'Dashboard', icon: HomeIcon, component: DashboardHome },
    { id: 'vessels', label: 'Vessels', icon: ShipIcon, component: Vessels },
    { id: 'invoice', label: 'Invoices', icon: InvoiceIcon, component: Invoice },
    { id: 'license', label: 'License', icon: LicenseIcon, component: License },
    { id: 'contact-us', label: 'Contact Us', icon: MessageIcon, component: ContactUs },
    { id: 'settings', label: 'Settings', icon: SettingsIcon, component: UserSettings },
];

// Dashboard Content Component (protected content)
function DashboardContent() {
    const { state, refreshUserData } = useAuth();
    const [activeMenuItem, setActiveMenuItem] = useState('home');
    const [sidebarOpen, setSidebarOpen] = useState(false); // DEFAULT FALSE untuk mobile
    const [currentView, setCurrentView] = useState<'main' | 'create-company' | 'create-vessel' | 'vessel-detail'>('main');
    const [selectedVesselId, setSelectedVesselId] = useState<string | null>(null);

    // RESPONSIVE BEHAVIOR HANDLER
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) {
                // Desktop: sidebar auto-open
                setSidebarOpen(true);
            } else {
                // Mobile: sidebar auto-close
                setSidebarOpen(false);
            }
        };

        // Set initial state
        handleResize();

        // Listen to resize
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Close sidebar when menu item changes on mobile
    useEffect(() => {
        if (window.innerWidth < 1024) {
            setSidebarOpen(false);
        }
    }, [activeMenuItem]);

    const handleBackToMain = () => {
        setCurrentView('main');
        setSelectedVesselId(null);
    };

    const handleNavigateToCreateCompany = () => {
        setCurrentView('create-company');
    };

    const handleNavigateToCreateVessel = () => {
        setCurrentView('create-vessel');
    };

    const handleNavigateToVesselDetail = (vesselId: string) => {
        setSelectedVesselId(vesselId);
        setCurrentView('vessel-detail');
    };

    const handleCreateCompany = async (companyData: unknown) => {
        try {
            console.log('Creating company:', companyData);
            setCurrentView('main');
            setActiveMenuItem('companies');
            await refreshUserData();
        } catch (error) {
            console.error('Error creating company:', error);
        }
    };

    const handleCreateVessel = async (vesselData: unknown) => {
        try {
            console.log('Creating vessel:', vesselData);
            setCurrentView('main');
            setActiveMenuItem('vessels');
            await refreshUserData();
        } catch (error) {
            console.error('Error creating vessel:', error);
        }
    };

    // Get the active component based on current view
    const getActiveComponent = () => {
        if (currentView === 'create-company') {
            return (
                <CreateCompany
                    onBack={handleBackToMain}
                    onSubmit={handleCreateCompany}
                />
            );
        }

        if (currentView === 'create-vessel') {
            return (
                <CreateVessel
                    onBack={handleBackToMain}
                    onSubmit={handleCreateVessel}
                />
            );
        }

        if (currentView === 'vessel-detail' && selectedVesselId) {
            return (
                <VesselDetail
                    vesselId={selectedVesselId}
                    onBack={handleBackToMain}
                />
            );
        }

        // Main view - render the selected menu component
        const menuItem = menuItems.find(item => item.id === activeMenuItem);
        if (!menuItem) return <DashboardHome />;

        const Component = menuItem.component;

        // Pass navigation handlers sebagai props jika diperlukan
        const componentProps: any = {};

        if (activeMenuItem === 'companies') {
            componentProps.onNavigateToCreate = handleNavigateToCreateCompany;
        }

        if (activeMenuItem === 'vessels') {
            componentProps.onNavigateToCreate = handleNavigateToCreateVessel;
            componentProps.onNavigateToDetail = handleNavigateToVesselDetail;
        }

        return <Component {...componentProps} />;
    };

    // Loading state untuk operations
    if (state.isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 [data-theme='dark']_&:bg-gray-900">
                <div className="flex flex-col items-center space-y-4">
                    <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                    <p className="text-gray-600 [data-theme='dark']_&:text-gray-400">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-100 [data-theme='dark']_&:bg-gray-900 relative overflow-hidden">
            {/* MOBILE/DESKTOP RESPONSIVE SIDEBAR */}
            <div className={`
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                lg:translate-x-0
                fixed top-0 left-0 z-50 h-full
                lg:relative lg:z-auto
                transition-transform duration-300 ease-in-out
                ${sidebarOpen ? 'w-64' : 'w-64 lg:w-20'}
            `}>
                <Sidebar
                    sidebarOpen={sidebarOpen}
                    setSidebarOpen={setSidebarOpen}
                    menuItems={menuItems}
                    activeMenuItem={activeMenuItem}
                    setActiveMenuItem={setActiveMenuItem}
                />
            </div>

            {/* MAIN CONTENT AREA */}
            <div className="flex-1 flex flex-col min-w-0 relative">
                {/* TOPBAR WITH MOBILE MENU BUTTON */}
                <TopBar
                    menuItems={menuItems}
                    activeMenuItem={activeMenuItem}
                    sidebarOpen={sidebarOpen}
                    setSidebarOpen={setSidebarOpen}
                />

                {/* CONTENT AREA */}
                <main className="flex-1 overflow-y-auto bg-gray-50 [data-theme='dark']_&:bg-gray-900">
                    <div className="p-4 sm:p-6">
                        {getActiveComponent()}
                    </div>
                </main>
            </div>

            {/* MOBILE OVERLAY BACKDROP */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-opacity-50 backdrop-blur-sm lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                    aria-hidden="true"
                />
            )}
        </div>
    );
}

// Error Boundary Component
class DashboardErrorBoundary extends React.Component<
    { children: React.ReactNode },
    { hasError: boolean; error?: Error }
> {
    constructor(props: { children: React.ReactNode }) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('Dashboard Error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50 [data-theme='dark']_&:bg-gray-900 p-4">
                    <div className="max-w-md w-full bg-white [data-theme='dark']_&:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
                        <div className="w-16 h-16 bg-red-100 [data-theme='dark']_&:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-red-600 [data-theme='dark']_&:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold text-gray-800 [data-theme='dark']_&:text-white mb-2">
                            Something went wrong
                        </h2>
                        <p className="text-gray-600 [data-theme='dark']_&:text-gray-400 mb-6">
                            We&#39;re sorry, but something unexpected happened. Please refresh the page or try again later.
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                            Reload Page
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default function Dashboard() {
    useUserDataManager();
    return (
        <ProtectedRoute>
            <DashboardErrorBoundary>
                <DashboardContent />
            </DashboardErrorBoundary>
        </ProtectedRoute>
    );
}