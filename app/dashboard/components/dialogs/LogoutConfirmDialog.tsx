// app/dashboard/components/dialogs/LogoutConfirmDialog.tsx

'use client';

interface LogoutConfirmDialogProps {
    isOpen: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    isLoading?: boolean;
    userName?: string;
}

export default function LogoutConfirmDialog({
    isOpen,
    onConfirm,
    onCancel,
    isLoading = false,
    userName
}: LogoutConfirmDialogProps) {
    if (!isOpen) return null;

    // Handle keyboard events
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape' && !isLoading) {
            onCancel();
        }
    };

    return (
        <div 
            className="fixed inset-0 bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onKeyDown={handleKeyDown}
            tabIndex={-1}
        >
            <div className="bg-white [data-theme='dark']_&:bg-gray-800 rounded-lg shadow-xl w-full max-w-md transform transition-all duration-200 scale-100">
                <div className="p-6">
                    <div className="flex items-center">
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-amber-100 [data-theme='dark']_&:bg-amber-900/20">
                            <svg
                                className="h-6 w-6 text-amber-600 [data-theme='dark']_&:text-amber-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                                />
                            </svg>
                        </div>
                    </div>

                    <div className="mt-3 text-center">
                        <h3 className="text-lg font-medium text-gray-900 [data-theme='dark']_&:text-white">
                            Logout Confirmation
                        </h3>
                        <div className="mt-2">
                            <p className="text-sm text-gray-500 [data-theme='dark']_&:text-gray-400">
                                {userName ? (
                <>Are you sure you want to log out of the account <span className="font-medium text-gray-700 [data-theme='dark']_&:text-gray-300">{userName}</span>?</>
            ) : (
                'Are you sure you want to log out of your account?'
            )}
                            </p>
                            <p className="text-xs text-gray-400 [data-theme='dark']_&:text-gray-500 mt-1">
                                 You will be redirected to the login page.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-50 [data-theme='dark']_&:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-lg">
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={isLoading}
                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-amber-600 text-base font-medium text-white hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 [data-theme='dark']_&:bg-amber-600 [data-theme='dark']_&:hover:bg-amber-700"
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Logging out...
                            </>
                        ) : (
                            <>
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                Yes, Logout
                            </>
                        )}
                    </button>
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isLoading}
                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:mr-3 sm:w-auto sm:text-sm [data-theme='dark']_&:bg-gray-600 [data-theme='dark']_&:text-gray-300 [data-theme='dark']_&:border-gray-500 [data-theme='dark']_&:hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}
