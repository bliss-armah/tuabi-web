import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithErrorHandling } from "@/shared/utils/api";

export interface HistoryEntry {
  id: number;
  amountChanged: number;
  action: string;
  note: string | null;
  timestamp: string;
  debtorId: number;
  performedById: number;
  debtor: { id: number; name: string; phoneNumber: string };
  user: { id: number; name: string; email: string };
}

export interface HistoryListParams {
  performedById?: number;
  debtorId?: number;
  action?: string;
  page?: number;
  limit?: number;
}

interface Envelope<T> {
  success: boolean;
  message: string;
  data: T;
}

interface HistoryListData {
  items: HistoryEntry[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const historyApi = createApi({
  reducerPath: "historyApi",
  baseQuery: baseQueryWithErrorHandling,
  tagTypes: ["History"],
  endpoints: (builder) => ({
    getHistory: builder.query<Envelope<HistoryListData>, HistoryListParams>({
      query: (params) => {
        const search = new URLSearchParams();
        if (params.performedById)
          search.set("performedById", String(params.performedById));
        if (params.debtorId) search.set("debtorId", String(params.debtorId));
        if (params.action) search.set("action", params.action);
        if (params.page) search.set("page", String(params.page));
        if (params.limit) search.set("limit", String(params.limit));
        const qs = search.toString();
        return { url: `/debt-history${qs ? `?${qs}` : ""}`, method: "GET" };
      },
      providesTags: ["History"],
    }),
    getHistoryEntry: builder.query<Envelope<HistoryEntry>, number>({
      query: (id) => ({ url: `/debt-history/${id}`, method: "GET" }),
      providesTags: ["History"],
    }),
  }),
});

export const { useGetHistoryQuery, useGetHistoryEntryQuery } = historyApi;
