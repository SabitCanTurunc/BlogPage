export interface UserResponseDto {
  id: number;
  username: string;
  email: string;
  role: 'ADMIN' | 'USER';
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
} 