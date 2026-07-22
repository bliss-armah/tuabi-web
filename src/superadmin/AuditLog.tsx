import { useState } from "react";
import {
  ScrollText,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from "lucide-react";

import { Button } from "@/shared/components/ui/button";
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
import { Input } from "@/shared/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/shared/components/ui/select";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { cn } from "@/shared/utils/utils";
import { ErrorState } from "@/shared/components";
import { useDeleteConfirmation } from "@/shared/components/ConfirmDialog";
import { showSuccessToast, showErrorToast } from "@/shared/utils/toastConfig";
import {
  useGetAuditQuery,
  usePurgeAuditMutation,
  type AuditEntry,
  type AuditLevel,
} from "@/superadmin/auditApi";

const ALL_LEVELS = "ALL";
const PAGE_SIZE = 25;
const DEFAULT_RETENTION = 100;

function LevelBadge({ level }: { level: AuditLevel }) {
  if (level === "ERROR") {
    return <Badge variant="destructive">ERROR</Badge>;
  }
  if (level === "WARNING") {
    return (
      <Badge className="border-warning/20 bg-warning/10 text-warning">
        WARNING
      </Badge>
    );
  }
  return <Badge variant="secondary">INFO</Badge>;
}

function AuditRow({ entry }: { entry: AuditEntry }) {
  const meta: string[] = [];
  if (entry.userId != null) meta.push(`user #${entry.userId}`);
  const request =
    entry.method && entry.path
      ? `${entry.method} ${entry.path}${
          entry.statusCode != null ? ` · ${entry.statusCode}` : ""
        }`
      : null;

  return (
    <TableRow>
      <TableCell className="whitespace-nowrap text-muted-foreground">
        {new Date(entry.createdAt).toLocaleString()}
      </TableCell>
      <TableCell>
        <LevelBadge level={entry.level} />
      </TableCell>
      <TableCell className="whitespace-nowrap">{entry.category}</TableCell>
      <TableCell className="whitespace-nowrap">
        {entry.workspaceName ? (
          entry.workspaceName
        ) : entry.workspaceId != null ? (
          <span className="text-muted-foreground">
            Workspace #{entry.workspaceId}
          </span>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </TableCell>
      <TableCell className="whitespace-nowrap font-mono text-xs text-muted-foreground">
        {entry.action}
      </TableCell>
      <TableCell>
        <div className="flex flex-col gap-0.5">
          <span
            className="max-w-[28rem] truncate"
            title={entry.message}
          >
            {entry.message}
          </span>
          {(meta.length > 0 || request) && (
            <span className="text-xs text-muted-foreground">
              {request ?? meta.join(" · ")}
            </span>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}

function TableSkeleton() {
  return (
    <>
      {Array.from({ length: 8 }).map((_, i) => (
        <TableRow key={i}>
          {Array.from({ length: 6 }).map((__, j) => (
            <TableCell key={j}>
              <Skeleton className="h-4 w-full" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}

export default function AuditLog() {
  const [level, setLevel] = useState<string>(ALL_LEVELS);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching, isError, refetch } = useGetAuditQuery({
    level: level === ALL_LEVELS ? undefined : level,
    search: search.trim() || undefined,
    page,
    limit: PAGE_SIZE,
  });

  const [purgeAudit, { isLoading: isPurging }] = usePurgeAuditMutation();
  const { showDeleteConfirmation, DeleteDialog } = useDeleteConfirmation();

  const result = data?.data;
  const items = result?.items ?? [];
  const totalPages = result?.totalPages ?? 1;
  const retentionDays = result?.retentionDays ?? DEFAULT_RETENTION;

  const hasFilters = level !== ALL_LEVELS || search.trim().length > 0;

  const handleLevelChange = (value: string) => {
    setLevel(value);
    setPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const clearFilters = () => {
    setLevel(ALL_LEVELS);
    setSearch("");
    setPage(1);
  };

  const handlePurge = () => {
    showDeleteConfirmation(
      retentionDays,
      `all audit entries older than ${retentionDays} days`,
      "Audit Entries",
      async () => {
        try {
          const res = await purgeAudit(retentionDays).unwrap();
          showSuccessToast(`Cleared ${res.data.deleted} entries`);
        } catch (err) {
          const message =
            (err as { data?: { message?: string } })?.data?.message ||
            "Failed to clear audit logs";
          showErrorToast(message);
        }
      }
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Audit Log</h1>
          <p className="text-sm text-muted-foreground">
            System events and admin activity. Auto-purged after {retentionDays}{" "}
            days.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCw
              className={cn("h-4 w-4", isFetching && "animate-spin")}
            />
            Refresh
          </Button>
          <Button
            variant="outline"
            className="border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={handlePurge}
            disabled={isPurging}
          >
            <Trash2 className="h-4 w-4" />
            Clear logs older than {retentionDays} days
          </Button>
        </div>
      </div>

      {/* Filter bar */}
      <Card>
        <CardContent className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center">
          <Select value={level} onValueChange={handleLevelChange}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="All levels" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_LEVELS}>All levels</SelectItem>
              <SelectItem value="INFO">INFO</SelectItem>
              <SelectItem value="WARNING">WARNING</SelectItem>
              <SelectItem value="ERROR">ERROR</SelectItem>
            </SelectContent>
          </Select>

          <Input
            value={search}
            onChange={handleSearchChange}
            placeholder="Search messages, actions, categories…"
            className="w-full sm:max-w-sm"
          />

          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="sm:ml-auto"
            >
              <X className="h-4 w-4" />
              Clear filters
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Events</CardTitle>
          <CardDescription>
            {result
              ? `${result.total.toLocaleString()} total ${
                  result.total === 1 ? "entry" : "entries"
                }`
              : "Recent system and admin events"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isError ? (
            <ErrorState
              title="Couldn't load audit log"
              message="We ran into a problem loading these events. Please try again."
              actionLabel="Retry"
              onAction={refetch}
            />
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Time</TableHead>
                      <TableHead>Level</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Workspace</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Message</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableSkeleton />
                    ) : items.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6}>
                          <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
                            <ScrollText className="h-10 w-10 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">
                              No audit entries
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      items.map((entry) => (
                        <AuditRow key={entry.id} entry={entry} />
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {items.length > 0 && (
                <div className="mt-4 flex items-center justify-between gap-4">
                  <p className="text-sm text-muted-foreground">
                    Page {result?.page ?? page} of {totalPages}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page <= 1 || isFetching}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Prev
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={page >= totalPages || isFetching}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <DeleteDialog />
    </div>
  );
}
