import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useGetNotificationsQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
  useDeleteNotificationMutation,
} from "./notificationsApi";
import type { Notification } from "./notificationsApi";
import {
  Bell,
  Check,
  Trash2,
  Clock,
  AlertTriangle,
  Info,
  CircleDollarSign,
  CreditCard,
  Calendar,
  MoreVertical,
} from "lucide-react";
import { Card } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { cn } from "@/shared/utils/utils";

interface NotificationsListProps {
  limit?: number;
  showPagination?: boolean;
  showFilters?: boolean;
  compactMode?: boolean;
}

export default function NotificationsList({
  limit = 20,
  showPagination = true,
  showFilters = true,
  compactMode = false,
}: NotificationsListProps) {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    page: 1,
    limit,
    type: "",
    unreadOnly: false,
    priority: "",
  });

  const {
    data: notificationsData,
    isLoading,
    error,
    refetch,
  } = useGetNotificationsQuery();

  const [markAsRead] = useMarkAsReadMutation();
  const [markAllAsRead] = useMarkAllAsReadMutation();
  const [deleteNotification] = useDeleteNotificationMutation();

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read if unread
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }

    // Navigate to relevant page
    // Normalize type to lowercase for consistent handling
    const notificationType = notification.type.toLowerCase();

    switch (notificationType) {
      case "reminder":
        if (notification.data?.debtorId) {
          const url = `/debtors/${notification.data.debtorId}?tab=reminders`;
          navigate(url);
        } else {
          navigate("/debtors");
        }
        break;
      case "subscription":
        navigate("/plans");
        break;
      case "payment":
        if (notification.data?.debtorId) {
          navigate(`/debtors/${notification.data.debtorId}`);
        } else {
          navigate("/debtors");
        }
        break;
      default:
        // Stay on current page for system notifications
        break;
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead().unwrap();
      refetch();
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  const handleDeleteNotification = async (
    notificationId: string,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    try {
      await deleteNotification(parseInt(notificationId)).unwrap();
      refetch();
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  };

  const getNotificationVisual = (notification: Notification) => {
    switch (notification.type) {
      case "reminder":
        return { Icon: Clock, tile: "bg-warning/10 text-warning" };
      case "subscription":
        return { Icon: CreditCard, tile: "bg-primary/10 text-primary" };
      case "payment":
        return { Icon: CircleDollarSign, tile: "bg-success/10 text-success" };
      case "system":
        return { Icon: Info, tile: "bg-accent text-accent-foreground" };
      default:
        return { Icon: Bell, tile: "bg-muted text-muted-foreground" };
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case "urgent":
        return <Badge variant="destructive">Urgent</Badge>;
      case "high":
        return (
          <Badge className="bg-warning/15 text-warning border-transparent">
            High
          </Badge>
        );
      case "medium":
        return <Badge variant="secondary">Medium</Badge>;
      case "low":
        return <Badge variant="outline">Low</Badge>;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);
    const diffInDays = diffInHours / 24;

    if (diffInHours < 1) {
      const minutes = Math.floor(diffInMs / (1000 * 60));
      return `${minutes}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInDays < 7) {
      return `${Math.floor(diffInDays)}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="gap-0 py-4">
            <div className="flex items-start gap-4 px-4">
              <Skeleton className="h-10 w-10 shrink-0 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-3 w-1/4" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="items-center gap-3 py-12 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
          <AlertTriangle className="h-6 w-6 text-destructive" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-semibold">Failed to Load Notifications</h3>
          <p className="text-sm text-muted-foreground">
            There was an error loading your notifications.
          </p>
        </div>
        <Button variant="outline" onClick={() => refetch()}>
          Try Again
        </Button>
      </Card>
    );
  }

  const notifications = notificationsData?.data || [];
  const hasUnreadNotifications = notifications.some((n) => !n.isRead);

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      {hasUnreadNotifications && !compactMode && (
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={handleMarkAllAsRead}>
            <Check className="h-4 w-4" />
            Mark All Read
          </Button>
        </div>
      )}

      {/* Filters */}
      {showFilters && !compactMode && (
        <Card className="gap-4 py-4">
          <div className="flex flex-col gap-4 px-4 md:flex-row md:flex-wrap md:items-end">
            <Tabs
              value={filters.unreadOnly ? "unread" : "all"}
              onValueChange={(value) =>
                setFilters((prev) => ({
                  ...prev,
                  unreadOnly: value === "unread",
                  page: 1,
                }))
              }
              className="w-full md:w-auto"
            >
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="unread">Unread</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex flex-1 flex-col gap-4 sm:flex-row">
              <Select
                value={filters.type || "all"}
                onValueChange={(value) =>
                  setFilters((prev) => ({
                    ...prev,
                    type: value === "all" ? "" : value,
                    page: 1,
                  }))
                }
              >
                <SelectTrigger className="w-full sm:w-44">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="reminder">Reminders</SelectItem>
                  <SelectItem value="subscription">Subscription</SelectItem>
                  <SelectItem value="payment">Payments</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.priority || "all"}
                onValueChange={(value) =>
                  setFilters((prev) => ({
                    ...prev,
                    priority: value === "all" ? "" : value,
                    page: 1,
                  }))
                }
              >
                <SelectTrigger className="w-full sm:w-44">
                  <SelectValue placeholder="All Priorities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              variant="ghost"
              onClick={() =>
                setFilters({
                  page: 1,
                  limit,
                  type: "",
                  unreadOnly: false,
                  priority: "",
                })
              }
            >
              Clear Filters
            </Button>
          </div>
        </Card>
      )}

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <Card className="items-center gap-3 py-12 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
            <Bell className="h-7 w-7 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-semibold">No Notifications</h3>
            <p className="text-sm text-muted-foreground">
              {filters.unreadOnly
                ? "You have no unread notifications."
                : "You don't have any notifications yet."}
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification: Notification) => {
            const { Icon, tile } = getNotificationVisual(notification);
            return (
              <Card
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={cn(
                  "cursor-pointer gap-0 border-l-4 border-l-transparent py-4 transition-colors hover:bg-accent/50",
                  !notification.isRead && "border-l-primary bg-accent/40"
                )}
              >
                <div className="flex items-start gap-4 px-4">
                  {/* Icon tile */}
                  <div
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                      tile
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <h3
                          className={cn(
                            "text-base font-semibold text-foreground",
                            !notification.isRead && "flex items-center gap-2"
                          )}
                        >
                          <span className="truncate">{notification.title}</span>
                          {!notification.isRead && (
                            <span
                              className="h-2 w-2 shrink-0 rounded-full bg-primary"
                              aria-label="Unread"
                            />
                          )}
                        </h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {notification.message}
                        </p>

                        {/* Metadata */}
                        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2">
                          <span className="flex items-center text-xs text-muted-foreground">
                            <Calendar className="mr-1 h-3 w-3" />
                            {formatDate(notification.createdAt)}
                          </span>
                          {getPriorityBadge(notification.priority)}
                          <span className="text-xs capitalize text-muted-foreground">
                            {notification.type}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div
                        className="shrink-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              aria-label="Notification actions"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={(e) =>
                                handleDeleteNotification(
                                  notification.id.toString(),
                                  e
                                )
                              }
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {showPagination && notificationsData?.pagination && (
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            Showing {notifications.length} of{" "}
            {notificationsData.pagination.total} notifications
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setFilters((prev) => ({ ...prev, page: prev.page - 1 }))
              }
              disabled={filters.page === 1}
            >
              Previous
            </Button>
            <span className="px-1 text-sm text-muted-foreground">
              Page {filters.page}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setFilters((prev) => ({ ...prev, page: prev.page + 1 }))
              }
              disabled={!notificationsData.pagination.hasMore}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
