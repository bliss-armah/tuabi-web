import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import {
  useGetHistoryEntryQuery,
  type HistoryEntry,
} from "@/history/historyApi";
import { ErrorState } from "@/shared/components";
import { cn } from "@/shared/utils/utils";

import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Separator } from "@/shared/components/ui/separator";
import { Skeleton } from "@/shared/components/ui/skeleton";

function normalizeAction(action: string): "add" | "reduce" | "settled" {
  const a = action?.toLowerCase();
  if (a === "add") return "add";
  if (a === "settled") return "settled";
  return "reduce";
}

function formatAmount(entry: HistoryEntry): {
  text: string;
  className: string;
} {
  const kind = normalizeAction(entry.action);
  const amount = Math.abs(entry.amountChanged).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  if (kind === "add") {
    return { text: `+GH₵ ${amount}`, className: "text-destructive" };
  }
  return { text: `-GH₵ ${amount}`, className: "text-success" };
}

function ActionBadge({ action }: { action: string }) {
  const kind = normalizeAction(action);
  if (kind === "add") {
    return <Badge variant="destructive">Added</Badge>;
  }
  if (kind === "settled") {
    return (
      <Badge className="border-success/20 bg-success/10 text-success">
        Settled
      </Badge>
    );
  }
  return <Badge variant="secondary">Reduced</Badge>;
}

function DetailRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1 py-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="text-sm sm:text-right">{children}</div>
    </div>
  );
}

export default function HistoryDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const entryId = Number(id);
  const isValidId = id !== undefined && !Number.isNaN(entryId);

  const { data, isLoading, isError } = useGetHistoryEntryQuery(entryId, {
    skip: !isValidId,
  });

  const entry = data?.data;

  return (
    <div className="space-y-6">
      {/* Header / back */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>

      {isLoading ? (
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-40" />
            <Skeleton className="mt-2 h-5 w-24" />
          </CardHeader>
          <CardContent className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-40" />
              </div>
            ))}
          </CardContent>
        </Card>
      ) : isError || !isValidId || !entry ? (
        <Card>
          <CardContent>
            <ErrorState
              title="Transaction not found"
              message="We couldn't find this transaction. It may have been removed."
              actionLabel="Back to history"
              onAction={() => navigate("/history")}
            />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center gap-3">
              <span
                className={cn(
                  "text-3xl font-bold tracking-tight",
                  formatAmount(entry).className
                )}
              >
                {formatAmount(entry).text}
              </span>
              <ActionBadge action={entry.action} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-border">
              <DetailRow label="Debtor">
                {entry.debtor ? (
                  <Link
                    to={`/debtors/${entry.debtor.id}`}
                    className="font-medium text-primary hover:underline"
                  >
                    {entry.debtor.name}
                    {entry.debtor.phoneNumber && (
                      <span className="ml-2 font-normal text-muted-foreground">
                        {entry.debtor.phoneNumber}
                      </span>
                    )}
                  </Link>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </DetailRow>

              <DetailRow label="Performed by">
                <span className="font-medium">{entry.user?.name ?? "—"}</span>
                {entry.user?.email && (
                  <span className="ml-2 font-normal text-muted-foreground">
                    {entry.user.email}
                  </span>
                )}
              </DetailRow>

              <DetailRow label="Date & time">
                {new Date(entry.timestamp).toLocaleString()}
              </DetailRow>

              <DetailRow label="Note">
                {entry.note ? (
                  <span>{entry.note}</span>
                ) : (
                  <span className="text-muted-foreground">No note</span>
                )}
              </DetailRow>

              <DetailRow label="Transaction ID">
                <span className="font-mono text-muted-foreground">
                  #{entry.id}
                </span>
              </DetailRow>
            </div>

            <Separator className="my-4" />

            <Button variant="outline" asChild>
              <Link to="/history">
                <ArrowLeft className="h-4 w-4" />
                All transactions
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
