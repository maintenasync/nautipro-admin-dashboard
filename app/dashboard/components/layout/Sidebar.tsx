// app/dashboard/components/layout/Sidebar.tsx - QUICK MOBILE FIX

import { LogoFull, LogoIcon } from '../icons/Logos';

interface MenuItem {
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    component: React.ComponentType<any>;
}

interface SidebarProps {
    sidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;
    menuItems: MenuItem[];
    activeMenuItem: string;
    setActiveMenuItem: (id: string) => void;
}

export default function Sidebar({
                                    sidebarOpen,
                                    setSidebarOpen,
                                    menuItems,
                                    activeMenuItem,
                                    setActiveMenuItem
                                }: SidebarProps) {

    const handleMenuItemClick = (id: string) => {
        setActiveMenuItem(id);
        // Auto-close sidebar on mobile when menu item is selected
        if (window.innerWidth < 1024) {
            setSidebarOpen(false);
        }
    };

    return (
        <div className={`
            bg-white [data-theme='dark']_&:bg-gray-800 shadow-lg h-full
            transition-all duration-300 ease-in-out flex flex-col
            ${sidebarOpen ? 'w-64' : 'w-64 lg:w-20'}
        `}>
            {/* HEADER dengan Logo */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100 [data-theme='dark']_&:border-gray-700 min-h-[4rem]">
                {/* Logo Container */}
                <div className={`flex items-center justify-center transition-all duration-300 ${sidebarOpen ? 'flex-1' : 'w-full'}`}>
                    {sidebarOpen ? (
                        <LogoFull className="h-8 w-auto text-blue-600 [data-theme='dark']_&:text-blue-400" />
                    ) : (
                        <LogoIcon className="h-8 w-8 text-blue-600 [data-theme='dark']_&:text-blue-400" />
                    )}
                </div>

                {/* Close Button - Hanya show di mobile atau ketika sidebar open */}
                {sidebarOpen && (
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden p-2 rounded-lg hover:bg-gray-100 [data-theme='dark']_&:hover:bg-gray-700 transition-colors flex-shrink-0 ml-2"
                        aria-label="Close sidebar"
                    >
                        <svg className="w-5 h-5 text-gray-600 [data-theme='dark']_&:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}
            </div>

            {/* NAVIGATION MENU */}
            <nav className="flex-1 p-4 overflow-y-auto">
                <ul className="space-y-2">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeMenuItem === item.id;

                        return (
                            <li key={item.id}>
                                <button
                                    onClick={() => handleMenuItemClick(item.id)}
                                    className={`
                                        w-full flex items-center rounded-lg transition-all duration-200 group
                                        ${sidebarOpen ? 'justify-start space-x-3 px-4 py-3' : 'justify-center px-2 py-3'}
                                        ${isActive
                                        ? 'bg-blue-500 text-white shadow-md'
                                        : 'text-gray-700 [data-theme=\'dark\']_&:text-gray-300 hover:bg-gray-100 [data-theme=\'dark\']_&:hover:bg-gray-700'
                                    }
                                    `}
                                    title={!sidebarOpen ? item.label : undefined}
                                >
                                    <Icon
                                        className={`
                                            h-6 w-6 transition-colors flex-shrink-0
                                            ${isActive
                                            ? 'text-white'
                                            : 'text-gray-500 [data-theme=\'dark\']_&:text-gray-400 group-hover:text-gray-700 [data-theme=\'dark\']_&:group-hover:text-gray-200'
                                        }
                                        `}
                                    />
                                    <span
                                        className={`
                                            font-medium transition-all duration-300
                                            ${sidebarOpen
                                            ? 'opacity-100 translate-x-0'
                                            : 'opacity-0 -translate-x-2 w-0 overflow-hidden lg:opacity-0'
                                        }
                                        `}
                                    >
                                        {item.label}
                                    </span>
                                </button>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* FOOTER - Optional */}
            <div className={`
                border-t border-gray-100 [data-theme='dark']_&:border-gray-700 p-4
                ${sidebarOpen ? 'block' : 'hidden lg:hidden'}
            `}>
                <div className="text-center">
                    <p className="text-xs text-gray-500 [data-theme='dark']_&:text-gray-400">
                        Maintena Sync Dashboard v1.0
                    </p>
                </div>
            </div>
        </div>
    );
}