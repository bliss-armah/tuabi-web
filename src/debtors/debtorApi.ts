import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithErrorHandling } from "@/shared/utils/api";
import type {
  DebtorResponse,
  DebtorsListResponse,
  DashboardResponse,
  DebtHistoryResponse,
  CreateDebtorRequest,
  UpdateDebtorRequest,
  DebtorAmountUpdateRequest,
  DebtorQueryParams,
} from "@/shared/types/debtor";

export const debtorApi = createApi({
  reducerPath: "debtorApi",
  baseQuery: baseQueryWithErrorHandling,
  tagTypes: ["Debtor", "Debtors", "Dashboard", "DebtHistory"],
  endpoints: (builder) => ({
    getDebtors: builder.query<DebtorsListResponse, DebtorQueryParams | void>({
      query: (params = {}) => ({
        url: "/debtors",
        params: {
          search: params?.search,
          sortBy: params?.sortBy,
          sortOrder: params?.sortOrder,
          limit: params?.limit || 50,
          offset: params?.offset || 0,
        },
      }),
      providesTags: ["Debtors"],
    }),

    getDebtor: builder.query<DebtorResponse, number>({
      query: (id) => `/debtors/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Debtor", id }],
    }),

    createDebtor: builder.mutation<DebtorResponse, CreateDebtorRequest>({
      query: (debtor) => ({
        url: "/debtors",
        method: "POST",
        body: debtor,
      }),
      invalidatesTags: ["Debtors", "Dashboard"],
    }),

    updateDebtor: builder.mutation<DebtorResponse, { id: number; data: UpdateDebtorRequest }>({
      query: ({ id, data }) => ({
        url: `/debtors/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        "Debtors",
        "Dashboard",
        { type: "Debtor", id },
      ],
    }),

    incrementDebtorAmount: builder.mutation<
      { success: boolean; message: string; data: any },
      { id: number; data: DebtorAmountUpdateRequest }
    >({
      query: ({ id, data }) => ({
        url: `/debtors/${id}/increment`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        "Debtors",
        "Dashboard",
        { type: "Debtor", id },
      ],
    }),

    decrementDebtorAmount: builder.mutation<
      { success: boolean; message: string; data: any },
      { id: number; data: DebtorAmountUpdateRequest }
    >({
      query: ({ id, data }) => ({
        url: `/debtors/${id}/decrement`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        "Debtors",
        "Dashboard",
        { type: "Debtor", id },
      ],
    }),

    getDebtorHistory: builder.query<
      DebtHistoryResponse,
      { debtorId: number; limit?: number; offset?: number; type?: "DEBT_ADDED" | "PAYMENT_RECEIVED" }
    >({
      query: ({ debtorId, limit = 50, offset = 0, type }) => ({
        url: `/debt-history/debtor/${debtorId}`,
        params: { limit, offset, type },
      }),
      providesTags: (_result, _error, { debtorId }) => [
        { type: "DebtHistory", id: debtorId },
      ],
    }),

    getDashboardSummary: builder.query<DashboardResponse, void>({
      query: () => "/debtors/dashboard",
      providesTags: ["Dashboard"],
    }),

    getRecentTransactions: builder.query<
      DebtHistoryResponse,
      { limit?: number } | void
    >({
      query: (params = {}) => ({
        url: "/debt-history",
        params: {
          limit: params?.limit || 10,
          offset: 0,
        },
      }),
      providesTags: ["DebtHistory"],
    }),
  }),
});

export const {
  useGetDebtorsQuery,
  useGetDebtorQuery,
  useCreateDebtorMutation,
  useUpdateDebtorMutation,
  useIncrementDebtorAmountMutation,
  useDecrementDebtorAmountMutation,
  useGetDebtorHistoryQuery,
  useGetDashboardSummaryQuery,
  useGetRecentTransactionsQuery,
} = debtorApi;
