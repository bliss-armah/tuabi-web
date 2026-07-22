import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithErrorHandling } from "@/shared/utils/api";

export interface Reminder {
  id: number;
  debtorId: number;
  debtorName: string;
  title: string;
  dueDate: string;
  status: "PENDING" | "COMPLETED" | "CANCELLED";
  message: string;
  reminderFrequency: "ONCE" | "DAILY" | "WEEKLY";
  isCompleted: boolean;
  wasNotified: boolean;
  isActive: boolean;
  lastNotifiedAt: string | null;
  createdAt: string;
}

export interface CreateReminderRequest {
  debtorId: number;
  title: string;
  dueDate: string;
  message?: string;
  reminderFrequency?: "ONCE" | "DAILY" | "WEEKLY";
}

export interface UpdateReminderRequest {
  title?: string;
  dueDate?: string;
  message?: string;
  reminderFrequency?: "ONCE" | "DAILY" | "WEEKLY";
  status?: "PENDING" | "COMPLETED" | "CANCELLED";
}

export interface ReminderResponse {
  success: boolean;
  message: string;
  data: Reminder;
}

export interface RemindersListResponse {
  success: boolean;
  message: string;
  data: Reminder[];
}

export interface ReminderQueryParams {
  status?: "PENDING" | "COMPLETED" | "CANCELLED";
  debtorId?: number;
  limit?: number;
  offset?: number;
}

export const remindersApi = createApi({
  reducerPath: "remindersApi",
  baseQuery: baseQueryWithErrorHandling,
  tagTypes: ["Reminder"],
  endpoints: (builder) => ({
    // Get all reminders with filters
    getReminders: builder.query<RemindersListResponse, ReminderQueryParams | void>({
      query: (params = {}) => ({
        url: "/reminders",
        params: {
          status: params?.status,
          debtorId: params?.debtorId,
          limit: params?.limit || 50,
          offset: params?.offset || 0,
        },
      }),
      providesTags: ["Reminder"],
    }),

    // Get reminders for a specific debtor
    getDebtorReminders: builder.query<RemindersListResponse, number>({
      query: (debtorId) => ({
        url: "/reminders",
        params: {
          debtorId,
          limit: 50,
          offset: 0,
        },
      }),
      providesTags: ["Reminder"],
    }),

    // Get overdue reminders
    getOverdueReminders: builder.query<RemindersListResponse, void>({
      query: () => "/reminders/overdue",
      providesTags: ["Reminder"],
    }),

    // Get specific reminder
    getReminder: builder.query<ReminderResponse, number>({
      query: (id) => `/reminders/${id}`,
      providesTags: ["Reminder"],
    }),

    // Create new reminder
    createReminder: builder.mutation<ReminderResponse, CreateReminderRequest>({
      query: (reminder) => ({
        url: "/reminders",
        method: "POST",
        body: reminder,
      }),
      invalidatesTags: ["Reminder"],
    }),

    // Update reminder
    updateReminder: builder.mutation<ReminderResponse, { id: number; data: UpdateReminderRequest }>({
      query: ({ id, data }) => ({
        url: `/reminders/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Reminder"],
    }),

    // Mark reminder as completed
    completeReminder: builder.mutation<
      { success: boolean; message: string; data: { id: number; status: string; completedAt: string } },
      number
    >({
      query: (id) => ({
        url: `/reminders/${id}/complete`,
        method: "PATCH",
      }),
      invalidatesTags: ["Reminder"],
    }),

    // Delete reminder
    deleteReminder: builder.mutation<{ success: boolean; message: string }, number>({
      query: (id) => ({
        url: `/reminders/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Reminder"],
    }),
  }),
});

export const {
  useGetRemindersQuery,
  useGetDebtorRemindersQuery,
  useGetOverdueRemindersQuery,
  useGetReminderQuery,
  useCreateReminderMutation,
  useUpdateReminderMutation,
  useCompleteReminderMutation,
  useDeleteReminderMutation,
} = remindersApi;
