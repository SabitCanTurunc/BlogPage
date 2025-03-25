export interface UserResponseDto {
  id: number;
  username: string;
  email: string;
  role: 'ADMIN' | 'USER';
  name?: string;
  surname?: string;
  phoneNumber?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  description?: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
} 