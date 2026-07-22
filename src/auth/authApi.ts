import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithErrorHandling } from "@/shared/utils/api";

export interface LoginRequest {
  phoneNumber: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      id: number;
      name: string;
      email: string;
      phoneNumber: string;
      role: string;
    };
    token: string;
  };
}

export interface AdminLoginRequest {
  email: string;
  password: string;
}

export interface AcceptInviteRequest {
  phoneNumber: string;
  code: string;
  password: string;
}

export interface VerifyOTPRequest {
  phoneNumber: string;
  otpCode: string;
}

export interface ResendOTPRequest {
  phoneNumber: string;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UpdateProfileRequest {
  name?: string;
  email?: string;
}

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  phoneNumber: string;
  role: "USER" | "ADMIN" | "SUPER_ADMIN";
  status?: string;
  workspace?: {
    id: number;
    name: string;
    subscriptionExpiresAt?: string | null;
    billingExempt?: boolean;
  } | null;
  workspaceRole?: "OWNER" | "KEEPER" | null;
  subscriptionExpiresAt?: string | null;
  createdAt: string;
}

export interface RequestPasswordResetRequest {
  phoneNumber: string;
}

export interface VerifyResetCodeRequest {
  phoneNumber: string;
  resetCode: string;
}

export interface ResetPasswordRequest {
  phoneNumber: string;
  resetCode: string;
  newPassword: string;
}

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: baseQueryWithErrorHandling,
  tagTypes: ["Auth"],
  endpoints: (builder) => ({
    requestOTP: builder.mutation<
      { success: boolean; message: string; data: { expiresIn: number } },
      LoginRequest
    >({
      query: (credentials) => ({
        url: "/auth/request-otp",
        method: "POST",
        body: credentials,
      }),
    }),

    verifyOTP: builder.mutation<LoginResponse, VerifyOTPRequest>({
      query: (credentials) => ({
        url: "/auth/verify-otp",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["Auth"],
    }),

    resendOTP: builder.mutation<
      { success: boolean; message: string; data: { expiresIn: number } },
      ResendOTPRequest
    >({
      query: (data) => ({
        url: "/auth/resend-otp",
        method: "POST",
        body: data,
      }),
    }),

    // Email + password login for workspace owners / super admins (no OTP)
    adminLogin: builder.mutation<LoginResponse, AdminLoginRequest>({
      query: (credentials) => ({
        url: "/auth/admin-login",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["Auth"],
    }),

    // Invited users activate their account (set password) and are logged in
    acceptInvite: builder.mutation<LoginResponse, AcceptInviteRequest>({
      query: (data) => ({
        url: "/auth/accept-invite",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Auth"],
    }),

    // Password reset flow
    requestPasswordReset: builder.mutation<
      { success: boolean; message: string; data?: { expiresIn: string } },
      RequestPasswordResetRequest
    >({
      query: (data) => ({
        url: "/auth/request-reset",
        method: "POST",
        body: data,
      }),
    }),

    verifyResetCode: builder.mutation<
      { success: boolean; message: string },
      VerifyResetCodeRequest
    >({
      query: (data) => ({
        url: "/auth/verify-reset-code",
        method: "POST",
        body: data,
      }),
    }),

    resetPassword: builder.mutation<
      { success: boolean; message: string },
      ResetPasswordRequest
    >({
      query: (data) => ({
        url: "/auth/reset-password",
        method: "POST",
        body: data,
      }),
    }),

    // Change password (for logged-in users)
    changePassword: builder.mutation<
      { success: boolean; message: string },
      ChangePasswordRequest
    >({
      query: (passwordData) => ({
        url: "/users/change-password",
        method: "POST",
        body: passwordData,
      }),
    }),

    // Get user profile
    getUserProfile: builder.query<
      { success: boolean; message: string; data: UserProfile },
      void
    >({
      query: () => ({
        url: "/users/profile",
        method: "GET",
      }),
      providesTags: ["Auth"],
    }),

    // Update user profile
    updateProfile: builder.mutation<
      { success: boolean; message: string; data: UserProfile },
      UpdateProfileRequest
    >({
      query: (profileData) => ({
        url: "/users/profile",
        method: "PUT",
        body: profileData,
      }),
      invalidatesTags: ["Auth"],
    }),

    // Logout
    logout: builder.mutation<{ success: boolean; message: string }, void>({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
      invalidatesTags: ["Auth"],
    }),
  }),
});

export const {
  useRequestOTPMutation,
  useVerifyOTPMutation,
  useResendOTPMutation,
  useAdminLoginMutation,
  useAcceptInviteMutation,
  useRequestPasswordResetMutation,
  useVerifyResetCodeMutation,
  useResetPasswordMutation,
  useChangePasswordMutation,
  useGetUserProfileQuery,
  useUpdateProfileMutation,
  useLogoutMutation,
} = authApi;
