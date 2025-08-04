// app/types/user.ts

export interface UserData {
    id: string;
    username: string;
    email: string;
    email_verification: boolean;
    name: string;
    user_status: boolean;
    avatar: string;
    avatar_link: string;
    role: string;
    created_at: string;
    updated_at: string;
}

export interface ApiResponse<T> {
    code: number;
    status: string;
    data: T;
}

export interface ChangePasswordRequest {
    old_password: string;
    new_password: string;
}