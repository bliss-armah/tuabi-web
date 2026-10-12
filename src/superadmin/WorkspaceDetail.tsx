import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Gift } from "lucide-react";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/shared/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/shared/components/ui/table";
import { Badge } from "@/shared/components/ui/badge";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { ErrorState } from "@/shared/components";
import {
  useGetWorkspaceDetailQuery,
  type WorkspaceDetail as WorkspaceDetailData,
} from "@/superadmin/adminApi";

function formatDate(value: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function timeAgo(value: string | null) {
  if (!value) return "Never";
  const elapsed = Date.now() - new Date(value).getTime();
  if (Number.isNaN(elapsed)) return "—";
  if (elapsed < 60_000) return "Just now";
  if (elapsed < 3_600_000) return `${Math.floor(elapsed / 60_000)}m ago`;
  if (elapsed < 86_400_000) return `${Math.floor(elapsed / 3_600_000)}h ago`;
  return `${Math.floor(elapsed / 86_400_000)}d ago`;
}

function StatusBadge({ status }: { status: string }) {
  const normalized = status?.toUpperCase();
  if (normalized === "ACTIVE") {
    return (
      <Badge className="bg-success text-success-foreground hover:bg-success/90">
        ACTIVE
      </Badge>
    );
  }
  if (normalized === "DISABLED") {
    return <Badge variant="destructive">DISABLED</Badge>;
  }
  return <Badge variant="secondary">{normalized || "PENDING"}</Badge>;
}

function SubscriptionBadge({
  workspace,
}: {
  workspace: WorkspaceDetailData["workspace"];
}) {
  if (workspace.billingExempt) {
    return (
      <Badge className="border-primary/20 bg-primary/10 text-primary">
        <Gift className="mr-1 h-3 w-3" />
        No billing
      </Badge>
    );
  }
  if (workspace.subscriptionActive) {
    return (
      <Badge className="bg-success text-success-foreground hover:bg-success/90">
        Active
      </Badge>
    );
  }
  return <Badge variant="secondary">Expired</Badge>;
}

function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <Card>
      <CardHeader className="space-y-0 pb-2">
        <CardDescription className="text-sm text-muted-foreground">
          {label}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </CardContent>
    </Card>
  );
}

function DailyActivity({
  days,
}: {
  days: WorkspaceDetailData["activityByDay"];
}) {
  const peak = Math.max(1, ...days.map((day) => day.count));
  return (
    <div
      className="flex h-32 items-end gap-1"
      role="img"
      aria-label="Transactions recorded per day over the last 30 days"
    >
      {days.map((day) => (
        <div
          key={day.date}
          className="flex h-full flex-1 items-end"
          title={`${formatDate(day.date)}: ${day.count}`}
        >
          <div
            className={
              day.count > 0
                ? "w-full rounded-sm bg-primary"
                : "w-full rounded-sm bg-muted"
            }
            style={{ height: `${day.count > 0 ? Math.max(6, (day.count / peak) * 100) : 4}%` }}
          />
        </div>
      ))}
    </div>
  );
}

function LoadingState() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-64" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
      <Skeleton className="h-48 w-full" />
    </div>
  );
}

export default function WorkspaceDetail() {
  const { id } = useParams();
  const workspaceId = Number(id);
  const { data, isLoading, isError, refetch } = useGetWorkspaceDetailQuery(
    workspaceId,
    { skip: !Number.isInteger(workspaceId) }
  );

  const detail = data?.data;

  return (
    <div className="space-y-6">
      <Link
        to="/admin"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        All workspaces
      </Link>

      {isLoading ? (
        <LoadingState />
      ) : isError || !detail ? (
        <ErrorState
          title="Couldn't load this workspace"
          message="It may not exist, or something went wrong. Please try again."
          actionLabel="Retry"
          onAction={refetch}
        />
      ) : (
        <>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold tracking-tight">
                {detail.workspace.name}
              </h1>
              <p className="text-sm text-muted-foreground">
                Created {formatDate(detail.workspace.createdAt)} · Owner{" "}
                {detail.owner.name} ({detail.owner.email})
              </p>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={detail.owner.status} />
              <SubscriptionBadge workspace={detail.workspace} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat
              label="Last transaction"
              value={timeAgo(detail.usage.lastTransactionAt)}
              hint={
                detail.usage.firstTransactionAt
                  ? `First on ${formatDate(detail.usage.firstTransactionAt)}`
                  : undefined
              }
            />
            <Stat
              label="Transactions, last 7 days"
              value={detail.usage.transactionsLast7Days.toLocaleString()}
            />
            <Stat
              label="Transactions, last 30 days"
              value={detail.usage.transactionsLast30Days.toLocaleString()}
              hint={`${detail.usage.transactionsTotal.toLocaleString()} all time`}
            />
            <Stat
              label="Debtors"
              value={detail.usage.debtorCount.toLocaleString()}
            />
            <Stat
              label="Active reminders"
              value={detail.usage.activeReminderCount.toLocaleString()}
              hint={`${detail.usage.reminderCount.toLocaleString()} total`}
            />
            <Stat
              label="Members"
              value={detail.members.length.toLocaleString()}
            />
            <Stat
              label="Subscription ends"
              value={
                detail.workspace.billingExempt
                  ? "Never"
                  : formatDate(detail.workspace.subscriptionExpiresAt)
              }
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Transactions per day</CardTitle>
              <CardDescription>Last 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              <DailyActivity days={detail.activityByDay} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Members</CardTitle>
              <CardDescription>
                Who is recording transactions in this workspace
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Transactions</TableHead>
                      <TableHead>Last transaction</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {detail.members.map((member) => (
                      <TableRow key={member.userId}>
                        <TableCell className="font-medium">
                          {member.name}
                        </TableCell>
                        <TableCell>
                          {member.role === "OWNER" ? "Owner" : "Keeper"}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={member.status} />
                        </TableCell>
                        <TableCell>{formatDate(member.joinedAt)}</TableCell>
                        <TableCell>
                          {member.transactionsTotal.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {timeAgo(member.lastTransactionAt)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Subscription history</CardTitle>
              <CardDescription>Most recent five</CardDescription>
            </CardHeader>
            <CardContent>
              {detail.subscriptions.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  No paid subscriptions yet
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Plan</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Started</TableHead>
                        <TableHead>Ends</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {detail.subscriptions.map((subscription) => (
                        <TableRow key={`${subscription.startDate}-${subscription.planName}`}>
                          <TableCell className="font-medium">
                            {subscription.planName}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {subscription.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {formatDate(subscription.startDate)}
                          </TableCell>
                          <TableCell>
                            {formatDate(subscription.endDate)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
