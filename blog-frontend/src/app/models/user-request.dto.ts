export interface UserRequestDto {
  username?: string;
  email?: string;
  password?: string;
  role?: string;
  name?: string;
  surname?: string;
  phoneNumber?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  description?: string;
} 