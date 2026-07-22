import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithErrorHandling } from "@/shared/utils/api";

export const subscriptionApi = createApi({
  reducerPath: "subscriptionApi",
  baseQuery: baseQueryWithErrorHandling,
  tagTypes: [
    "Subscription",
    "SubscriptionStatus",
    "SubscriptionPlan",
    "Transaction",
  ],
  endpoints: (builder) => ({
    getSubscriptions: builder.query<SubscriptionsResponse, void>({
      query: () => "/subscriptions",
      providesTags: ["Subscription"],
    }),

    createSubscription: builder.mutation<
      { success: boolean; message: string; data: Subscription },
      { planId: string }
    >({
      query: (data) => ({
        url: "/subscriptions",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Subscription", "SubscriptionStatus"],
    }),

    cancelSubscription: builder.mutation<
      { success: boolean; message: string; data: { id: number; status: string; cancelledAt: string } },
      number
    >({
      query: (id) => ({
        url: `/subscriptions/${id}/cancel`,
        method: "PUT",
      }),
      invalidatesTags: ["Subscription", "SubscriptionStatus"],
    }),

    initializeSubscriptionPayment: builder.mutation<
      PaystackInitializeResponse,
      PaystackInitializeRequest
    >({
      query: (data) => ({
        url: "/subscriptions/initialize-payment",
        method: "POST",
        body: data,
      }),
    }),

    verifySubscriptionPayment: builder.mutation<
      PaystackVerifyResponse,
      PaystackVerifyRequest
    >({
      query: (data) => ({
        url: "/subscriptions/verify-payment",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Subscription", "SubscriptionStatus", "Transaction"],
      // Optimistic update for better UX
      async onQueryStarted({}, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(subscriptionApi.util.invalidateTags(["SubscriptionStatus"]));
        } catch (error) {
          console.error("Payment verification failed:", error);
        }
      },
    }),

    getUserTransactions: builder.query<
      UserTransactionsResponse,
      { limit?: number; offset?: number } | void
    >({
      query: (params = {}) => ({
        url: "/subscriptions/transactions",
        params: {
          limit: params?.limit || 20,
          offset: params?.offset || 0,
        },
      }),
      providesTags: ["Transaction"],
    }),

    getUserSubscriptionStatus: builder.query<UserSubscriptionStatus, void>({
      query: () => "/subscriptions/status",
      providesTags: ["SubscriptionStatus"],
    }),

    getSubscriptionPlans: builder.query<SubscriptionPlanData, void>({
      query: () => "/subscriptions/plans",
      providesTags: ["SubscriptionPlan"],
    }),

    // Add a manual refresh endpoint for immediate status updates
    refreshSubscriptionStatus: builder.mutation<void, void>({
      query: () => "/subscriptions/status",
      invalidatesTags: ["SubscriptionStatus"],
    }),
  }),
});

export const {
  useGetSubscriptionsQuery,
  useCreateSubscriptionMutation,
  useCancelSubscriptionMutation,
  useInitializeSubscriptionPaymentMutation,
  useVerifySubscriptionPaymentMutation,
  useGetUserTransactionsQuery,
  useGetUserSubscriptionStatusQuery,
  useGetSubscriptionPlansQuery,
  useRefreshSubscriptionStatusMutation,
} = subscriptionApi;

// Types
export interface SubscriptionPlan {
  id: string;
  name: string;
  amount: number;
  currency: string;
  features: string[];
  duration: number;
  isActive: boolean;
}

export interface SubscriptionPlanData {
  success: boolean;
  message: string;
  data: SubscriptionPlan[];
  
}

export interface PaystackInitializeRequest {
  planId: string;
  email: string;
  amount: number;
  currency: string;
}

export interface PaystackInitializeResponse {
  success: boolean;
  message: string;
  status: string;
  data: {
    authorization_url: string;
    accessCode: string;
    reference: string;
  };
}

export interface PaystackVerifyRequest {
  reference: string;
}

export interface PaystackVerifyResponse {
  success: boolean;
  message: string;
  data: {
    status: string;
    amount: number;
    currency: string;
    subscription: {
      id: number;
      planId: string;
      status: string;
      expiresAt: string;
    };
  };
}

export interface Transaction {
  id: number;
  reference: string;
  amount: number;
  currency: string;
  status: "SUCCESS" | "FAILED" | "PENDING";
  planId: string;
  createdAt: string;
}

export interface UserTransactionsResponse {
  success: boolean;
  message: string;
  data: {
    transactions: Transaction[];
    total: number;
    hasMore: boolean;
  };
}

export interface UserSubscriptionStatus {
  success: boolean;
  message: string;
  data: {
    isSubscribed: boolean;
    isActive: boolean;
    planName: string;
    expiresAt: string;
    daysRemaining: number;
    isInTrial: boolean;
    status: string;
    isExempt?: boolean;
    currentPlan:any
    subscriptionExpiresAt: string;
  };
}

export interface Subscription {
  id: number;
  planId: string;
  status: "ACTIVE" | "PENDING" | "CANCELLED";
  expiresAt: string;
  createdAt: string;
}

export interface SubscriptionsResponse {
  success: boolean;
  message: string;
  data: {
    subscriptions: Subscription[];
  };
}
