// contexts/AuthContext.tsx

'use client';

import { createContext, useContext, useEffect, useReducer, ReactNode } from 'react';
import { AuthState, User, LoginRequest, RegisterRequest } from '../types/auth';
import authService from '../services/authService';
import { useQueryClient } from '@tanstack/react-query';

// Auth Actions
type AuthAction =
    | { type: 'LOGIN_START' }
    | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string } }
    | { type: 'LOGIN_FAILURE' }
    | { type: 'REGISTER_START' }
    | { type: 'REGISTER_SUCCESS' }
    | { type: 'REGISTER_FAILURE' }
    | { type: 'LOGOUT' }
    | { type: 'SET_USER'; payload: { user: User; token: string } }
    | { type: 'INITIALIZE_AUTH_START' }
    | { type: 'INITIALIZE_AUTH_SUCCESS'; payload: { user: User; token: string } }
    | { type: 'INITIALIZE_AUTH_FAILURE' }
    | { type: 'INITIALIZE_AUTH_COMPLETE' }
    | { type: 'REFRESH_USER_DATA'; payload: { user: User } };

// Initial state
const initialState: AuthState = {
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true, // Start with loading true untuk initialization
    isInitialized: false,
};

// Auth reducer
function authReducer(state: AuthState, action: AuthAction): AuthState {
    switch (action.type) {
        case 'LOGIN_START':
        case 'REGISTER_START':
            return {
                ...state,
                isLoading: true,
            };
        case 'INITIALIZE_AUTH_START':
            return {
                ...state,
                isLoading: true,
                isInitialized: false,
            };
        case 'LOGIN_SUCCESS':
        case 'INITIALIZE_AUTH_SUCCESS':
            return {
                ...state,
                user: action.payload.user,
                token: action.payload.token,
                isAuthenticated: true,
                isLoading: false,
                isInitialized: true,
            };
        case 'REGISTER_SUCCESS':
            return {
                ...state,
                isLoading: false,
            };
        case 'LOGIN_FAILURE':
        case 'REGISTER_FAILURE':
        case 'INITIALIZE_AUTH_FAILURE':
            return {
                ...state,
                user: null,
                token: null,
                isAuthenticated: false,
                isLoading: false,
                isInitialized: true,
            };
        case 'LOGOUT':
            return {
                ...initialState,
                isLoading: false,
                isInitialized: true,
            };
        case 'SET_USER':
            return {
                ...state,
                user: action.payload.user,
                token: action.payload.token,
                isAuthenticated: true,
                isInitialized: true,
            };
        case 'REFRESH_USER_DATA':
            return {
                ...state,
                user: action.payload.user,
            };
        case 'INITIALIZE_AUTH_COMPLETE':
            return {
                ...state,
                isLoading: false,
                isInitialized: true,
            };
        default:
            return state;
    }
}

// Context type
interface AuthContextType {
    state: AuthState;
    login: (credentials: LoginRequest) => Promise<boolean>;
    register: (userData: RegisterRequest) => Promise<boolean>;
    logout: () => void;
    refreshUserData: () => Promise<boolean>;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
export function AuthProvider({ children }: { children: ReactNode }) {
    const [state, dispatch] = useReducer(authReducer, initialState);
    const queryClient = useQueryClient(); // ← TAMBAH INI

    // Function untuk fetch user data dari API
    const fetchUserData = async (token: string): Promise<User | null> => {
        try {
            const apiKey = process.env.NEXT_PUBLIC_API_KEY || '12345678';
            const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://auth.nautiproconnect.com/api/v1/web';

            const response = await fetch(`${baseUrl}/user`, {
                method: 'GET',
                headers: {
                    'x-api-key': apiKey || '',
                    'authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch user data: ${response.status}`);
            }

            const result = await response.json();

            if (result.code === 200 && result.data) {
                return {
                    id: result.data.id,
                    name: result.data.name,
                    username: result.data.username,
                    email: result.data.email,
                    role: result.data.role,
                    avatar: result.data.avatar_link || '',
                    license: result.data.license || null,
                };
            }

            throw new Error('Invalid response format');
        } catch (error) {
            console.error('Error fetching user data:', error);
            return null;
        }
    };

    // Function untuk refresh user data (bisa dipanggil dari komponen lain)
    const refreshUserData = async (): Promise<boolean> => {
        const token = authService.getToken();
        if (!token) return false;

        try {
            const userData = await fetchUserData(token);
            if (userData) {
                dispatch({
                    type: 'REFRESH_USER_DATA',
                    payload: { user: userData }
                });
                // Update localStorage dengan data terbaru
                localStorage.setItem('user_data', JSON.stringify({
                    ...userData,
                    token
                }));
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error refreshing user data:', error);
            return false;
        }
    };

    // Check for existing authentication on mount
    useEffect(() => {
        const initializeAuth = async () => {
            dispatch({ type: 'INITIALIZE_AUTH_START' });

            const token = authService.getToken();

            if (token) {
                // Jika ada token, fetch user data dari API (bukan dari localStorage)
                try {
                    const userData = await fetchUserData(token);

                    if (userData) {
                        // Update localStorage dengan data terbaru
                        localStorage.setItem('user_data', JSON.stringify({
                            ...userData,
                            token
                        }));

                        dispatch({
                            type: 'INITIALIZE_AUTH_SUCCESS',
                            payload: {
                                user: userData,
                                token,
                            },
                        });
                    } else {
                        // Jika gagal fetch user data, kemungkinan token invalid
                        authService.logout(); // Clear localStorage
                        dispatch({ type: 'INITIALIZE_AUTH_FAILURE' });
                    }
                } catch (error) {
                    console.error('Auth initialization error:', error);
                    authService.logout(); // Clear localStorage
                    dispatch({ type: 'INITIALIZE_AUTH_FAILURE' });
                }
            } else {
                // Tidak ada token, langsung complete initialization
                dispatch({ type: 'INITIALIZE_AUTH_COMPLETE' });
            }
        };

        initializeAuth();
    }, []);

    const login = async (credentials: LoginRequest): Promise<boolean> => {
        dispatch({ type: 'LOGIN_START' });

        try {
            const response = await authService.login(credentials);

            if (response.code === 200) {
                const userData: User = {
                    id: response.data.id,
                    name: response.data.name,
                    username: response.data.username,
                    email: response.data.email,
                    role: response.data.role,
                    avatar: response.data.avatar,
                    license: response.data.license,
                };

                // Clear Cache React Query sebelum login
                queryClient.clear();

                dispatch({
                    type: 'LOGIN_SUCCESS',
                    payload: {
                        user: userData,
                        token: response.data.token,
                    },
                });

                // Refresh user data after login
                await refreshUserData();

                return true;
            } else {
                dispatch({ type: 'LOGIN_FAILURE' });
                return false;
            }
        } catch (error: unknown) {
            dispatch({ type: 'LOGIN_FAILURE' });
            console.error('Login error:', error);
            return false;
        }
    };

    const register = async (userData: RegisterRequest): Promise<boolean> => {
        dispatch({ type: 'REGISTER_START' });

        try {
            const response = await authService.register(userData);

            if (response.code === 200) {
                dispatch({ type: 'REGISTER_SUCCESS' });
                return true;
            } else {
                dispatch({ type: 'REGISTER_FAILURE' });
                return false;
            }
        } catch (error: unknown) {
            dispatch({ type: 'REGISTER_FAILURE' });
            console.error('Registration error:', error);
            return false;
        }
    };

    const logout = () => {
        // Clear localStorage
        authService.logout();

        // ← TAMBAH BAGIAN INI untuk clear React Query cache
        queryClient.clear();
        queryClient.removeQueries();
        queryClient.resetQueries();

        // Dispatch logout action
        dispatch({ type: 'LOGOUT' });

        // Additional cleanup
        setTimeout(() => {
            queryClient.invalidateQueries();
        }, 100);
    };

    return (
        <AuthContext.Provider value={{ state, login, register, logout, refreshUserData }}>
            {children}
        </AuthContext.Provider>
    );
}

// Custom hook to use auth context
export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}