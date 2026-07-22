import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithErrorHandling } from "@/shared/utils/api";

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: "reminder" | "subscription" | "payment" | "system";
  isRead: boolean;
  data?: {
    debtorId?: number;
    amount?: number;
    [key: string]: any;
  };
  createdAt: string;
  readAt?: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
}

export interface NotificationListResponse {
  success: boolean;
  message: string;
  data: Notification[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
  };
}

export interface NotificationResponse {
  success: boolean;
  message: string;
  data: Notification;
}

export interface NotificationStats {
  total: number;
  unread: number;
  byType: {
    PAYMENT_REMINDER: number;
    PAYMENT_RECEIVED: number;
    SYSTEM_ALERT: number;
  };
}

export interface UnreadCountResponse {
  success: boolean;
  message: string;
  data: {
    unreadCount: number;
    count: number;
  };
}

export interface NotificationQueryParams {
  isRead?: boolean;
  type?: "reminder" | "subscription" | "payment" | "system";
  priority?: "urgent" | "high" | "medium" | "low";
  limit?: number;
  offset?: number;
}

export const notificationsApi = createApi({
  reducerPath: "notificationsApi",
  baseQuery: baseQueryWithErrorHandling,
  tagTypes: ["Notification", "NotificationStats"],
  endpoints: (builder) => ({
    // Get all notifications with pagination and filters
    getNotifications: builder.query<
      NotificationListResponse,
      NotificationQueryParams | void
    >({
      query: (params) => {
        const queryParams: Record<string, any> = {
          limit: params?.limit || 20,
          offset: params?.offset || 0,
        };

        // Only add filters when they are provided
        if (params?.isRead !== undefined) {
          queryParams.isRead = params.isRead;
        }
        if (params?.type?.trim()) {
          queryParams.type = params.type;
        }
        if (params?.priority?.trim()) {
          queryParams.priority = params.priority;
        }

        return {
          url: "/notifications",
          params: queryParams,
        };
      },
      providesTags: ["Notification"],
    }),

    // Get notification statistics
    getNotificationStats: builder.query<
      { success: boolean; message: string; data: NotificationStats },
      void
    >({
      query: () => "/notifications/stats",
      providesTags: ["NotificationStats"],
    }),

    // Get unread notification count (for badge)
    getUnreadCount: builder.query<UnreadCountResponse, void>({
      query: () => "/notifications/unread-count",
      providesTags: ["NotificationStats"],
    }),

    // Get specific notification
    getNotification: builder.query<NotificationResponse, number>({
      query: (id) => `/notifications/${id}`,
      providesTags: ["Notification"],
    }),

    // Mark notification as read
    markAsRead: builder.mutation<
      { success: boolean; message: string; data: any },
      number
    >({
      query: (notificationId) => ({
        url: `/notifications/${notificationId}/read`,
        method: "PATCH",
      }),
      invalidatesTags: ["Notification", "NotificationStats"],
    }),

    // Mark multiple notifications as read
    markMultipleAsRead: builder.mutation<
      { success: boolean; message: string; data: { markedCount: number } },
      number[]
    >({
      query: (notificationIds) => ({
        url: "/notifications/mark-read",
        method: "PATCH",
        body: { notificationIds },
      }),
      invalidatesTags: ["Notification", "NotificationStats"],
    }),

    // Mark all notifications as read
    markAllAsRead: builder.mutation<
      { success: boolean; message: string; data: { markedCount: number } },
      void
    >({
      query: () => ({
        url: "/notifications/mark-all-read",
        method: "PATCH",
      }),
      invalidatesTags: ["Notification", "NotificationStats"],
    }),

    // Delete notification
    deleteNotification: builder.mutation<
      { success: boolean; message: string },
      number
    >({
      query: (notificationId) => ({
        url: `/notifications/${notificationId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Notification", "NotificationStats"],
    }),

    // Delete multiple notifications
    deleteMultipleNotifications: builder.mutation<
      { success: boolean; message: string; data: { deletedCount: number } },
      number[]
    >({
      query: (notificationIds) => ({
        url: "/notifications/delete-multiple",
        method: "DELETE",
        body: { notificationIds },
      }),
      invalidatesTags: ["Notification", "NotificationStats"],
    }),

    // Clean up old notifications
    cleanupNotifications: builder.mutation<
      { success: boolean; message: string; data: { deletedCount: number } },
      void
    >({
      query: () => ({
        url: "/notifications/cleanup",
        method: "DELETE",
      }),
      invalidatesTags: ["Notification", "NotificationStats"],
    }),

    // Create test notification
    createTestNotification: builder.mutation<
      NotificationResponse,
      { title?: string; message?: string; type?: string }
    >({
      query: (data) => ({
        url: "/notifications/test",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Notification", "NotificationStats"],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useGetNotificationStatsQuery,
  useGetUnreadCountQuery,
  useGetNotificationQuery,
  useMarkAsReadMutation,
  useMarkMultipleAsReadMutation,
  useMarkAllAsReadMutation,
  useDeleteNotificationMutation,
  useDeleteMultipleNotificationsMutation,
  useCleanupNotificationsMutation,
  useCreateTestNotificationMutation,
} = notificationsApi;
