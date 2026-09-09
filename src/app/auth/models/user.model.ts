export interface User {
  id: number;
  username: string;
  password: string;
  email: string;
  fullName: string;
  role: 'admin' | 'viewer' | 'editor' | 'super-admin';
  avatar?: string;
  lastLogin?: Date;
  createdAt: Date;
  isActive: boolean;
  permissions: string[];
  school?: string;
  department?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthResponse {
  user: User;
  token: string;
  expiresIn: number;
}
