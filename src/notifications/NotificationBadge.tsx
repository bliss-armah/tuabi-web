import { useNotifications } from "@/shared/hooks/useNotifications";
import { Bell } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/shared/utils/utils";

interface NotificationBadgeProps {
  className?: string;
  showZero?: boolean;
  maxCount?: number;
  showDebug?: boolean;
}

export default function NotificationBadge({
  className = "",
  showZero = false,
  maxCount = 99,
}: NotificationBadgeProps) {
  const { unreadCount, loading, error } = useNotifications();

  const base =
    "relative inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground";

  if (loading) {
    return (
      <span className={cn(base, className)}>
        <Bell className="h-5 w-5" />
        <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 animate-pulse rounded-full bg-muted-foreground/50" />
      </span>
    );
  }

  if (error) {
    return (
      <Link to="/notifications" className={cn(base, className)}>
        <Bell className="h-5 w-5" />
        <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white">
          !
        </span>
      </Link>
    );
  }

  const displayCount =
    unreadCount > maxCount ? `${maxCount}+` : unreadCount.toString();
  const shouldShowBadge = unreadCount > 0 || showZero;

  return (
    <Link to="/notifications" className={cn(base, className)} aria-label="Notifications">
      <Bell className="h-5 w-5" />
      {shouldShowBadge && (
        <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold leading-none text-white">
          {unreadCount > 0 ? displayCount : "0"}
        </span>
      )}
    </Link>
  );
}
