// app/dashboard/components/layout/TopBar.tsx - Enhanced Version Lengkap

import { useState, useRef, useEffect } from 'react';
import { BellIcon, UserIcon } from '../icons/Icons'; // ← IMPORT UserIcon dari Icons.tsx
import { useAuth } from '@/app/contexts/AuthContext';
import { useSafeTheme } from '@/app/hooks/useSafeTheme';
import LogoutConfirmDialog from '../dialogs/LogoutConfirmDialog';

// MenuIcon untuk mobile menu button
const MenuIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
);

interface MenuItem {
    id: string;
    label: string;
    icon: React.ComponentType;
    component: React.ComponentType;
}

interface TopBarProps {
    menuItems: MenuItem[];
    activeMenuItem: string;
    sidebarOpen?: boolean;
    setSidebarOpen?: (open: boolean) => void;
}

export default function TopBar({
                                   menuItems,
                                   activeMenuItem,
                                   sidebarOpen,
                                   setSidebarOpen
                               }: TopBarProps) {
    const { state, logout } = useAuth();
    const { theme, setTheme, mounted } = useSafeTheme();
    const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    // ✨ Refs untuk keyboard navigation
    const userButtonRef = useRef<HTMLButtonElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Get active menu label for title
    const activeMenuLabel = menuItems.find(item => item.id === activeMenuItem)?.label || 'Dashboard';

    // ✨ Keyboard support
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (isUserMenuOpen) {
                switch (event.key) {
                    case 'Escape':
                        setIsUserMenuOpen(false);
                        userButtonRef.current?.focus();
                        break;
                    case 'Tab':
                        // Allow normal tab behavior but close dropdown after tabbing out
                        if (!dropdownRef.current?.contains(event.target as Node)) {
                            setIsUserMenuOpen(false);
                        }
                        break;
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isUserMenuOpen]);

    // ✨ Enhanced logout dengan custom confirmation dialog
    const handleLogout = () => {
        setIsUserMenuOpen(false);
        setIsLogoutDialogOpen(true);
    };

    // Handle logout confirmation
    const handleLogoutConfirm = async () => {
        setIsLoggingOut(true);
        try {
            logout();
        } finally {
            setIsLoggingOut(false);
            setIsLogoutDialogOpen(false);
        }
    };

    // Handle logout cancel
    const handleLogoutCancel = () => {
        setIsLogoutDialogOpen(false);
    };

    // ✨ Menu items dengan icons
    const userMenuItems = [
        {
            label: 'Profile Settings',
            icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
            ),
            onClick: () => {
                setIsUserMenuOpen(false);
                // Navigate to profile
                console.log('Navigate to profile');
            }
        },
        {
            label: 'Account Settings',
            icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            ),
            onClick: () => {
                setIsUserMenuOpen(false);
                // Navigate to settings
                console.log('Navigate to settings');
            }
        },
        {
            label: 'Help & Support',
            icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            onClick: () => {
                setIsUserMenuOpen(false);
                // Open help center
                window.open('/help', '_blank');
            }
        }
    ];

    const themes = [
        {
            value: 'light' as const,
            label: 'Light',
            icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
            ),
        },
        {
            value: 'dark' as const,
            label: 'Dark',
            icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
            ),
        },
        {
            value: 'auto' as const,
            label: 'Auto',
            icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
            ),
        },
    ];

    if (!mounted) return null;

    return (
        <header className="bg-white [data-theme='dark']_&:bg-gray-800 border-b border-gray-100 [data-theme='dark']_&:border-gray-700 shadow-sm z-30">
            <div className="px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* LEFT SECTION - Mobile Menu + Title */}
                    <div className="flex items-center space-x-4">
                        {/* MOBILE MENU BUTTON */}
                        <button
                            onClick={() => setSidebarOpen?.(!sidebarOpen)}
                            className="lg:hidden p-2 rounded-md text-gray-600 [data-theme='dark']_&:text-gray-400 hover:bg-gray-100 [data-theme='dark']_&:hover:bg-gray-700 transition-colors"
                            aria-label="Toggle navigation menu"
                        >
                            <MenuIcon className="w-6 h-6" />
                        </button>

                        {/* PAGE TITLE */}
                        <div>
                            <h1 className="text-lg sm:text-xl font-semibold text-gray-800 [data-theme='dark']_&:text-white">
                                {activeMenuLabel}
                            </h1>
                        </div>
                    </div>

                    {/* RIGHT SECTION - Theme, Notifications, User */}
                    <div className="flex items-center space-x-2 sm:space-x-4">
                        {/* THEME SELECTOR */}
                        <div className="relative">
                            <button
                                onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
                                className="p-2 rounded-md text-gray-600 [data-theme='dark']_&:text-gray-400 hover:bg-gray-100 [data-theme='dark']_&:hover:bg-gray-700 transition-colors"
                                aria-label="Change theme"
                            >
                                {themes.find(t => t.value === theme)?.icon || themes[0].icon}
                            </button>

                            {/* Theme Dropdown */}
                            {isThemeMenuOpen && (
                                <>
                                    <div
                                        className="fixed inset-0 z-10"
                                        onClick={() => setIsThemeMenuOpen(false)}
                                    />
                                    <div className="absolute right-0 mt-2 w-32 bg-white [data-theme='dark']_&:bg-gray-800 rounded-md border border-gray-100 [data-theme='dark']_&:border-gray-600 shadow-lg py-1 z-20">
                                        {themes.map((themeOption) => (
                                            <button
                                                key={themeOption.value}
                                                onClick={() => {
                                                    setTheme(themeOption.value);
                                                    setIsThemeMenuOpen(false);
                                                }}
                                                className={`w-full flex items-center px-4 py-2 text-sm text-left transition-colors duration-150 ${
                                                    theme === themeOption.value
                                                        ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-500 [data-theme=\'dark\']_&:bg-blue-900/20 [data-theme=\'dark\']_&:text-blue-400 [data-theme=\'dark\']_&:border-blue-400'
                                                        : 'text-gray-700 hover:bg-gray-100 [data-theme=\'dark\']_&:text-gray-300 [data-theme=\'dark\']_&:hover:bg-gray-700'
                                                }`}
                                            >
                                                <span className="mr-3 flex-shrink-0">{themeOption.icon}</span>
                                                <span className="font-medium">{themeOption.label}</span>
                                                {theme === themeOption.value && (
                                                    <span className="ml-auto">
                                                        <svg className="w-4 h-4 text-blue-500 [data-theme='dark']_&:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                    </span>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* NOTIFICATIONS - Hidden on small screens */}
                        {/*<button className="hidden sm:block p-2 rounded-md text-gray-600 [data-theme='dark']_&:text-gray-400 hover:bg-gray-100 [data-theme='dark']_&:hover:bg-gray-700 transition-colors relative">*/}
                        {/*    <BellIcon />*/}
                        {/*    /!* Notification Badge *!/*/}
                        {/*    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">*/}
                        {/*        3*/}
                        {/*    </span>*/}
                        {/*</button>*/}

                        {/* ✨ ENHANCED USER MENU */}
                        <div className="relative">
                            <button
                                ref={userButtonRef}
                                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        setIsUserMenuOpen(!isUserMenuOpen);
                                    }
                                }}
                                className={`flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 [data-theme='dark']_&:hover:bg-gray-700 transition-all duration-200 ${
                                    isUserMenuOpen
                                        ? 'bg-gray-100 [data-theme=\'dark\']_&:bg-gray-700 ring-2 ring-blue-500 ring-opacity-50'
                                        : ''
                                } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50`}
                                aria-expanded={isUserMenuOpen}
                                aria-haspopup="true"
                            >
                                {/* User Avatar with Status Indicator */}
                                <div className="relative h-8 w-8 rounded-full overflow-hidden bg-gray-300 [data-theme='dark']_&:bg-gray-600 flex items-center justify-center">
                                    {state.user?.avatar ? (
                                        <img
                                            src={state.user.avatar}
                                            alt="Profile"
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="text-gray-500 [data-theme='dark']_&:text-gray-400">
                                            <UserIcon/>
                                        </div>
                                    )}
                                    {/* ✨ Online Status Indicator */}
                                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white [data-theme='dark']_&:border-gray-800 rounded-full"></div>
                                </div>

                                {/* User Name with Role */}
                                <div className="hidden md:block text-left">
                                    <p className="text-sm font-medium text-gray-900 [data-theme='dark']_&:text-white">
                                        {state.user?.name || 'User'}
                                    </p>
                                    <p className="text-xs text-gray-500 [data-theme='dark']_&:text-gray-400">
                                        {state.user?.role || 'Admin'}
                                    </p>
                                </div>

                                {/* Enhanced Arrow with Animation */}
                                <svg
                                    className={`w-4 h-4 text-gray-400 transform transition-all duration-300 ease-in-out ${
                                        isUserMenuOpen ? 'rotate-180 text-blue-500' : ''
                                    }`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {/* ✨ ENHANCED DROPDOWN with Animation */}
                            {isUserMenuOpen && (
                                <>
                                    <div
                                        className="fixed inset-0 z-10"
                                        onClick={() => setIsUserMenuOpen(false)}
                                    />

                                    <div
                                        ref={dropdownRef}
                                        className="absolute right-0 mt-2 w-56 bg-white rounded-lg border border-gray-200 shadow-xl py-2 z-50 transform transition-all duration-200 ease-out [data-theme='dark']_&:bg-gray-800 [data-theme='dark']_&:border-gray-600"
                                        role="menu"
                                        aria-orientation="vertical"
                                    >
                                        {/* Enhanced User Info Header */}
                                        <div className="px-4 py-3 border-b border-gray-100 [data-theme='dark']_&:border-gray-600">
                                            <div className="flex items-center space-x-3">
                                                <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-300 [data-theme='dark']_&:bg-gray-600 flex items-center justify-center">
                                                    {state.user?.avatar ? (
                                                        <img
                                                            src={state.user.avatar}
                                                            alt="Profile"
                                                            className="h-full w-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="text-gray-500 [data-theme='dark']_&:text-gray-400">
                                                            <UserIcon />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 [data-theme='dark']_&:text-white truncate">
                                                        {state.user?.name}
                                                    </p>
                                                    <p className="text-sm text-gray-500 [data-theme='dark']_&:text-gray-400 truncate">
                                                        {state.user?.email}
                                                    </p>
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 [data-theme='dark']_&:bg-green-900/20 [data-theme='dark']_&:text-green-300 mt-1">
                                                        {state.user?.role || 'Member'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>


                                        {/* Enhanced Menu Items with Icons */}
                                        <div className="py-1">
                                            {userMenuItems.map((item, index) => (
                                                <button
                                                    key={index}
                                                    onClick={item.onClick}
                                                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 [data-theme='dark']_&:text-gray-200 [data-theme='dark']_&:hover:bg-gray-700 transition-colors duration-150 focus:outline-none focus:bg-gray-100 [data-theme='dark']_&:focus:bg-gray-700"
                                                    role="menuitem"
                                                >
                                                    <span className="mr-3 text-gray-400">{item.icon}</span>
                                                    {item.label}
                                                </button>
                                            ))}
                                        </div>

                                        {/* Divider */}
                                        <div className="border-t border-gray-100 [data-theme='dark']_&:border-gray-600 my-1"></div>

                                        {/* Enhanced Logout Button */}
                                        <button
                                            onClick={handleLogout}
                                            className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 [data-theme='dark']_&:text-red-400 [data-theme='dark']_&:hover:bg-red-900/20 transition-colors duration-150 focus:outline-none focus:bg-red-50 [data-theme='dark']_&:focus:bg-red-900/20"
                                            role="menuitem"
                                        >
                                            <span className="mr-3">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                                </svg>
                                            </span>
                                            Sign Out
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ✨ LOGOUT CONFIRMATION DIALOG */}
            <LogoutConfirmDialog
                isOpen={isLogoutDialogOpen}
                onConfirm={handleLogoutConfirm}
                onCancel={handleLogoutCancel}
                isLoading={isLoggingOut}
                userName={state.user?.name}
            />
        </header>
    );
}
