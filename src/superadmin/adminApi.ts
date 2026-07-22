import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithErrorHandling } from "@/shared/utils/api";

export interface PlatformStats {
  totalUsers: number;
  totalWorkspaces: number;
  activeWorkspaces: number;
  adminUsers: number;
  superAdminUsers: number;
  totalDebtors: number;
  totalReminders: number;
}

export interface WorkspaceAdmin {
  workspaceId: number;
  workspaceName: string;
  subscriptionExpiresAt: string | null;
  subscriptionActive: boolean;
  billingExempt: boolean;
  memberCount: number;
  debtorCount: number;
  owner: {
    id: number;
    name: string;
    email: string;
    phoneNumber: string;
    status: string;
    createdAt: string;
  };
}

export interface CreateAdminRequest {
  name: string;
  email: string;
  phoneNumber: string;
  workspaceName: string;
}

interface Envelope<T> {
  success: boolean;
  message: string;
  data: T;
}

export const adminApi = createApi({
  reducerPath: "adminApi",
  baseQuery: baseQueryWithErrorHandling,
  tagTypes: ["Admins", "PlatformStats"],
  endpoints: (builder) => ({
    getPlatformStats: builder.query<Envelope<PlatformStats>, void>({
      query: () => ({ url: "/admin/stats", method: "GET" }),
      providesTags: ["PlatformStats"],
    }),
    getAdmins: builder.query<Envelope<WorkspaceAdmin[]>, void>({
      query: () => ({ url: "/admin/admins", method: "GET" }),
      providesTags: ["Admins"],
    }),
    createAdmin: builder.mutation<Envelope<unknown>, CreateAdminRequest>({
      query: (body) => ({ url: "/admin/admins", method: "POST", body }),
      invalidatesTags: ["Admins", "PlatformStats"],
    }),
    resendAdminInvite: builder.mutation<Envelope<unknown>, number>({
      query: (id) => ({ url: `/admin/admins/${id}/resend`, method: "POST" }),
      invalidatesTags: ["Admins"],
    }),
    setAdminStatus: builder.mutation<
      Envelope<unknown>,
      { id: number; disabled: boolean }
    >({
      query: ({ id, disabled }) => ({
        url: `/admin/admins/${id}/status`,
        method: "PATCH",
        body: { disabled },
      }),
      invalidatesTags: ["Admins"],
    }),
    resetAdminPassword: builder.mutation<
      Envelope<unknown>,
      { id: number; newPassword: string }
    >({
      query: ({ id, newPassword }) => ({
        url: `/admin/admins/${id}/reset-password`,
        method: "POST",
        body: { newPassword },
      }),
      invalidatesTags: ["Admins"],
    }),
    setWorkspaceBilling: builder.mutation<
      Envelope<unknown>,
      { workspaceId: number; exempt: boolean }
    >({
      query: ({ workspaceId, exempt }) => ({
        url: `/admin/workspaces/${workspaceId}/billing`,
        method: "PATCH",
        body: { exempt },
      }),
      invalidatesTags: ["Admins", "PlatformStats"],
    }),
  }),
});

export const {
  useGetPlatformStatsQuery,
  useGetAdminsQuery,
  useCreateAdminMutation,
  useResendAdminInviteMutation,
  useSetAdminStatusMutation,
  useResetAdminPasswordMutation,
  useSetWorkspaceBillingMutation,
} = adminApi;
