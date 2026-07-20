export type UserRole = 'customer' | 'photographer' | 'admin';

export interface User {
  id: number;
  email: string;
  full_name: string;
  phone: string | null;
  location: string | null;
  avatar: string | null;
  email_notifications: boolean;
  role: UserRole;
  is_active: boolean;
  created_at: string;
}

export interface UserUpdate {
  email?: string;
  full_name?: string;
  phone?: string | null;
  location?: string | null;
  avatar?: string | null;
  email_notifications?: boolean;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  full_name: string;
  role?: UserRole;
}
