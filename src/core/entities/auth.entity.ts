import type { User } from './user.entity';

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: 'ADMIN' | 'SUBADMIN' | 'MANAGER';
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

