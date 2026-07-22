import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithErrorHandling } from "@/shared/utils/api";

export interface WorkspaceDetail {
  id: number;
  name: string;
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
  };
}

export interface WorkspaceMember {
  memberId: number;
  role: "OWNER" | "KEEPER";
  joinedAt: string;
  user: {
    id: number;
    name: string;
    email: string;
    phoneNumber: string;
    status: string;
    createdAt: string;
  };
}

export interface InviteMemberRequest {
  name: string;
  phoneNumber: string;
  email?: string;
}

interface Envelope<T> {
  success: boolean;
  message: string;
  data: T;
}

export const workspaceApi = createApi({
  reducerPath: "workspaceApi",
  baseQuery: baseQueryWithErrorHandling,
  tagTypes: ["Workspace", "Members"],
  endpoints: (builder) => ({
    getWorkspace: builder.query<Envelope<WorkspaceDetail>, void>({
      query: () => ({ url: "/workspace", method: "GET" }),
      providesTags: ["Workspace"],
    }),
    updateWorkspace: builder.mutation<Envelope<unknown>, { name: string }>({
      query: (body) => ({ url: "/workspace", method: "PATCH", body }),
      invalidatesTags: ["Workspace"],
    }),
    getMembers: builder.query<Envelope<WorkspaceMember[]>, void>({
      query: () => ({ url: "/workspace/members", method: "GET" }),
      providesTags: ["Members"],
    }),
    inviteMember: builder.mutation<Envelope<unknown>, InviteMemberRequest>({
      query: (body) => ({ url: "/workspace/members", method: "POST", body }),
      invalidatesTags: ["Members", "Workspace"],
    }),
    resendMemberInvite: builder.mutation<Envelope<unknown>, number>({
      query: (userId) => ({
        url: `/workspace/members/${userId}/resend`,
        method: "POST",
      }),
      invalidatesTags: ["Members"],
    }),
    removeMember: builder.mutation<Envelope<unknown>, number>({
      query: (userId) => ({
        url: `/workspace/members/${userId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Members", "Workspace"],
    }),
    resetMemberPassword: builder.mutation<
      Envelope<unknown>,
      { userId: number; newPassword: string }
    >({
      query: ({ userId, newPassword }) => ({
        url: `/workspace/members/${userId}/reset-password`,
        method: "POST",
        body: { newPassword },
      }),
      invalidatesTags: ["Members"],
    }),
  }),
});

export const {
  useGetWorkspaceQuery,
  useUpdateWorkspaceMutation,
  useGetMembersQuery,
  useInviteMemberMutation,
  useResendMemberInviteMutation,
  useRemoveMemberMutation,
  useResetMemberPasswordMutation,
} = workspaceApi;
