// app/dashboard/components/dialogs/ConfirmDeleteDialog.tsx

'use client';

interface ConfirmDeleteDialogProps {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    isLoading?: boolean;
    error?: string;
    confirmText?: string;
    cancelText?: string;
}

export default function ConfirmDeleteDialog({
                                                isOpen,
                                                title,
                                                message,
                                                onConfirm,
                                                onCancel,
                                                isLoading = false,
                                                error,
                                                confirmText = "Delete",
                                                cancelText = "Cancel"
                                            }: ConfirmDeleteDialogProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white [data-theme='dark']_&:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
                <div className="p-6">
                    <div className="flex items-center">
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 [data-theme='dark']_&:bg-red-900">
                            <svg
                                className="h-6 w-6 text-red-600 [data-theme='dark']_&:text-red-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z"
                                />
                            </svg>
                        </div>
                    </div>

                    <div className="mt-3 text-center">
                        <h3 className="text-lg font-medium text-gray-900 [data-theme='dark']_&:text-white">
                            {title}
                        </h3>
                        <div className="mt-2">
                            <p className="text-sm text-gray-500 [data-theme='dark']_&:text-gray-400">
                                {message}
                            </p>
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-md [data-theme='dark']_&:bg-red-900 [data-theme='dark']_&:border-red-700 [data-theme='dark']_&:text-red-300">
                            {error}
                        </div>
                    )}
                </div>

                <div className="bg-gray-50 [data-theme='dark']_&:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-lg">
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={isLoading}
                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Deleting...
                            </>
                        ) : (
                            confirmText
                        )}
                    </button>
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isLoading}
                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm [data-theme='dark']_&:bg-gray-600 [data-theme='dark']_&:text-gray-300 [data-theme='dark']_&:border-gray-500 [data-theme='dark']_&:hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {cancelText}
                    </button>
                </div>
            </div>
        </div>
    );
}