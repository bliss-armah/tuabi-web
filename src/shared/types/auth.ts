export type UserRole = "USER" | "ADMIN" | "SUPER_ADMIN";
export type WorkspaceRole = "OWNER" | "KEEPER";

export interface WorkspaceSummary {
  id: number;
  name: string;
  subscriptionExpiresAt?: string | null;
  billingExempt?: boolean;
}

export interface LoginFormData {
  phoneNumber: string;
  password: string;
}

export interface AcceptInviteFormData {
  phoneNumber: string;
  code: string;
  password: string;
}

export interface LoginResponse {
  data: LoginResponseData;
}

interface LoginResponseData {
  token: string;
  user: UserData;
}

interface UserData {
  id: number;
  name: string;
  email: string;
  phoneNumber: string;
  role?: UserRole;
  subscriptionExpiresAt?: string;
  isSubscribed?: boolean;
}

export interface User {
  id: number;
  name: string;
  email: string;
  phoneNumber: string;
  role?: UserRole;
  status?: string;
  workspace?: WorkspaceSummary | null;
  workspaceRole?: WorkspaceRole | null;
  subscriptionExpiresAt?: string;
  isSubscribed?: boolean;
  createdAt?: string;
  updatedAt?: string;
}
