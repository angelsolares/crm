export type UserRole = 'admin' | 'manager' | 'sales_rep';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  email_verified_at?: string;
  created_at: string;
  updated_at?: string;
}

export interface UserCreateData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface UserUpdateData {
  name?: string;
  email?: string;
  password?: string;
  role?: UserRole;
}

export interface RoleOption {
  value: UserRole;
  label: string;
}

export const ROLE_OPTIONS: RoleOption[] = [
  { value: 'admin', label: 'Administrator' },
  { value: 'manager', label: 'Manager' },
  { value: 'sales_rep', label: 'Sales Representative' },
];

export const getRoleLabel = (role: UserRole): string => {
  const option = ROLE_OPTIONS.find(r => r.value === role);
  return option?.label || role;
};

export const getRoleColor = (role: UserRole): string => {
  switch (role) {
    case 'admin':
      return 'bg-red-100 text-red-700';
    case 'manager':
      return 'bg-blue-100 text-blue-700';
    case 'sales_rep':
      return 'bg-green-100 text-green-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};

