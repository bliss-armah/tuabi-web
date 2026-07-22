import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithErrorHandling } from "@/shared/utils/api";

export type AuditLevel = "INFO" | "WARNING" | "ERROR";

export interface AuditEntry {
  id: number;
  createdAt: string;
  level: AuditLevel;
  category: string;
  action: string;
  message: string;
  context: Record<string, unknown> | null;
  userId: number | null;
  workspaceId: number | null;
  workspaceName: string | null;
  method: string | null;
  path: string | null;
  statusCode: number | null;
  ipAddress: string | null;
}

export interface AuditListParams {
  level?: string;
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
}

interface Envelope<T> {
  success: boolean;
  message: string;
  data: T;
}

interface AuditListData {
  items: AuditEntry[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  retentionDays: number;
}

export const auditApi = createApi({
  reducerPath: "auditApi",
  baseQuery: baseQueryWithErrorHandling,
  tagTypes: ["Audit"],
  endpoints: (builder) => ({
    getAudit: builder.query<Envelope<AuditListData>, AuditListParams>({
      query: (params) => {
        const s = new URLSearchParams();
        if (params.level) s.set("level", params.level);
        if (params.category) s.set("category", params.category);
        if (params.search) s.set("search", params.search);
        if (params.page) s.set("page", String(params.page));
        if (params.limit) s.set("limit", String(params.limit));
        const qs = s.toString();
        return { url: `/admin/audit${qs ? `?${qs}` : ""}`, method: "GET" };
      },
      providesTags: ["Audit"],
    }),
    purgeAudit: builder.mutation<
      Envelope<{ deleted: number }>,
      number | void
    >({
      query: (days) => ({
        url: `/admin/audit${days ? `?days=${days}` : ""}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Audit"],
    }),
  }),
});

export const { useGetAuditQuery, usePurgeAuditMutation } = auditApi;
