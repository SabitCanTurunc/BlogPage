export interface User {
    id: number;
    email: string;
    username: string;
    role: string;
    isEnabled: boolean;
    profileImageUrl?: string;
} 