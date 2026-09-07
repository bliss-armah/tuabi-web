import { useEffect } from "react";
import * as Sentry from "@sentry/react";
import type { User } from "@/shared/types/auth";

let lastKey: string | null = null;

export const useSentryUser = (user: User | null) => {
  useEffect(() => {
    if (!user?.id) {
      if (lastKey !== null) {
        Sentry.setUser(null);
        lastKey = null;
      }
      return;
    }

    const key = [
      user.id,
      user.role ?? "",
      user.workspaceRole ?? "",
      user.workspace?.id ?? "",
      user.isSubscribed ?? "",
    ].join(":");

    if (key === lastKey) return;
    lastKey = key;

    Sentry.setUser({ id: String(user.id) });
    Sentry.setTags({
      role: user.role ?? "unknown",
      workspace_role: user.workspaceRole ?? "none",
      workspace_id: String(user.workspace?.id ?? "none"),
      subscribed: String(Boolean(user.isSubscribed)),
    });
  }, [user]);
};
