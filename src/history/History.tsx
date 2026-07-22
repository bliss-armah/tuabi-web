import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { History as HistoryIcon, X, Check, ChevronsUpDown } from "lucide-react";

import {
  useGetHistoryQuery,
  type HistoryEntry,
} from "@/history/historyApi";
import { useGetMembersQuery } from "@/workspace/workspaceApi";
import { ErrorState } from "@/shared/components";
import { cn } from "@/shared/utils/utils";

import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/shared/components/ui/command";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { Badge } from "@/shared/components/ui/badge";
import { Skeleton } from "@/shared/components/ui/skeleton";

const PAGE_SIZE = 20;
const ALL = "all";

function normalizeAction(action: string): "add" | "reduce" | "settled" {
  const a = action?.toLowerCase();
  if (a === "add") return "add";
  if (a === "settled") return "settled";
  // "reduce" and "subtract" both decrease debt
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
  // "add" increases debt (bad → destructive), others decrease debt (good → success)
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

export default function History() {
  const navigate = useNavigate();

  const [performedById, setPerformedById] = useState<number | undefined>(
    undefined
  );
  const [personOpen, setPersonOpen] = useState(false);
  const [action, setAction] = useState<string | undefined>(undefined);
  const [page, setPage] = useState(1);

  const { data: membersData } = useGetMembersQuery();
  const members = membersData?.data ?? [];

  const {
    data,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetHistoryQuery({
    performedById,
    action,
    page,
    limit: PAGE_SIZE,
  });

  const result = data?.data;
  const items = result?.items ?? [];
  const totalPages = result?.totalPages ?? 1;
  const currentPage = result?.page ?? page;

  const hasFilters = performedById !== undefined || action !== undefined;

  const selectPerson = (id: number | undefined) => {
    setPerformedById(id);
    setPage(1);
    setPersonOpen(false);
  };

  const selectedPersonName =
    performedById === undefined
      ? "All people"
      : (members.find((m) => m.user.id === performedById)?.user.name ??
        "Unknown");

  const handleActionChange = (value: string) => {
    setAction(value === ALL ? undefined : value);
    setPage(1);
  };

  const clearFilters = () => {
    setPerformedById(undefined);
    setAction(undefined);
    setPage(1);
  };

  const openEntry = (id: number) => navigate(`/history/${id}`);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">History</h1>
          <p className="text-sm text-muted-foreground">
            Every debt transaction and who recorded it
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Performed by</label>
            <Popover open={personOpen} onOpenChange={setPersonOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={personOpen}
                  className="w-full justify-between font-normal sm:w-56"
                >
                  <span className="truncate">{selectedPersonName}</span>
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-0" align="start">
                <Command>
                  <CommandInput placeholder="Search people..." />
                  <CommandList>
                    <CommandEmpty>No one found.</CommandEmpty>
                    <CommandGroup>
                      <CommandItem
                        value="All people"
                        onSelect={() => selectPerson(undefined)}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            performedById === undefined
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        All people
                      </CommandItem>
                      {members.map((member) => (
                        <CommandItem
                          key={member.user.id}
                          value={member.user.name}
                          onSelect={() => selectPerson(member.user.id)}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              performedById === member.user.id
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          <span className="truncate">{member.user.name}</span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Action</label>
            <Select
              value={action === undefined ? ALL : action}
              onValueChange={handleActionChange}
            >
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder="All actions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>All actions</SelectItem>
                <SelectItem value="add">Added</SelectItem>
                <SelectItem value="reduce">Reduced</SelectItem>
                <SelectItem value="settled">Settled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {hasFilters && (
            <Button variant="ghost" onClick={clearFilters} className="sm:ml-auto">
              <X className="h-4 w-4" />
              Clear filters
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      <Card>
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
          <CardDescription>
            {result
              ? `${result.total.toLocaleString()} transaction${
                  result.total === 1 ? "" : "s"
                }`
              : "Recent debt activity across your workspace."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isError ? (
            <ErrorState
              message="We couldn't load the transaction history. Please try again."
              onAction={refetch}
            />
          ) : isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="ml-auto h-4 w-24" />
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
              <HistoryIcon className="h-10 w-10 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {hasFilters
                  ? "No transactions match your filters"
                  : "No transactions yet"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date &amp; time</TableHead>
                    <TableHead>Debtor</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Performed by</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((entry) => {
                    const amount = formatAmount(entry);
                    return (
                      <TableRow
                        key={entry.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => openEntry(entry.id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            openEntry(entry.id);
                          }
                        }}
                        className="cursor-pointer hover:bg-muted/50"
                      >
                        <TableCell className="whitespace-nowrap text-muted-foreground">
                          {new Date(entry.timestamp).toLocaleString()}
                        </TableCell>
                        <TableCell className="font-medium">
                          {entry.debtor?.name ?? "—"}
                        </TableCell>
                        <TableCell>
                          <ActionBadge action={entry.action} />
                        </TableCell>
                        <TableCell
                          className={cn(
                            "text-right font-medium whitespace-nowrap",
                            amount.className
                          )}
                        >
                          {amount.text}
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-muted-foreground">
                          {entry.user?.name ?? "—"}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {!isError && !isLoading && items.length > 0 && (
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1 || isFetching}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages || isFetching}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
