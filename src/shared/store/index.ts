import { configureStore } from "@reduxjs/toolkit";
import { useDispatch } from 'react-redux';
import { authApi } from "@/auth/authApi";
import { debtorApi } from "@/debtors/debtorApi";
import { subscriptionApi } from "@/subscription/subscriptionApi";
import { remindersApi } from "@/reminders/remindersApi";
import { aiApi } from "@/ai/aiApi";
import { notificationsApi } from "@/notifications/notificationsApi";
import { adminApi } from "@/superadmin/adminApi";
import { auditApi } from "@/superadmin/auditApi";
import { workspaceApi } from "@/workspace/workspaceApi";
import { historyApi } from "@/history/historyApi";

export const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
    [debtorApi.reducerPath]: debtorApi.reducer,
    [subscriptionApi.reducerPath]: subscriptionApi.reducer,
    [remindersApi.reducerPath]: remindersApi.reducer,
    [aiApi.reducerPath]: aiApi.reducer,
    [notificationsApi.reducerPath]: notificationsApi.reducer,
    [adminApi.reducerPath]: adminApi.reducer,
    [auditApi.reducerPath]: auditApi.reducer,
    [workspaceApi.reducerPath]: workspaceApi.reducer,
    [historyApi.reducerPath]: historyApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      debtorApi.middleware,
      subscriptionApi.middleware,
      remindersApi.middleware,
      aiApi.middleware,
      notificationsApi.middleware,
      adminApi.middleware,
      auditApi.middleware,
      workspaceApi.middleware,
      historyApi.middleware
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Typed hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
