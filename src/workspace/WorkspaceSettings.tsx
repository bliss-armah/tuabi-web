import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Building2,
  CreditCard,
  Loader2,
  Users,
  UserRound,
} from "lucide-react";

import {
  useGetWorkspaceQuery,
  useUpdateWorkspaceMutation,
} from "@/workspace/workspaceApi";
import { authApi } from "@/auth/authApi";
import { useAppDispatch } from "@/shared/store";
import { ErrorState } from "@/shared/components";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Badge } from "@/shared/components/ui/badge";
import { Separator } from "@/shared/components/ui/separator";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { cn } from "@/shared/utils/utils";
import {
  showErrorToast,
  showSuccessToast,
} from "@/shared/utils/toastConfig";

function formatDate(value: string | null): string {
  if (!value) return "No expiry date";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "No expiry date";
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-72" />
      </div>
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="gap-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-10 w-full max-w-sm" />
            <Skeleton className="h-9 w-32" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function StatTile({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-lg border border-border bg-muted/40 p-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className="h-4 w-4" />
        <span>{label}</span>
      </div>
      <p className="mt-2 text-2xl font-bold tracking-tight">{value}</p>
    </div>
  );
}

export default function WorkspaceSettings() {
  const dispatch = useAppDispatch();
  const { data, isLoading, isError, refetch } = useGetWorkspaceQuery();
  const [updateWorkspace, { isLoading: isSaving }] =
    useUpdateWorkspaceMutation();

  const workspace = data?.data;
  const [name, setName] = useState("");

  useEffect(() => {
    if (workspace?.name) setName(workspace.name);
  }, [workspace?.name]);

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (isError || !workspace) {
    return (
      <div className="space-y-6">
        <ErrorState
          title="Unable to load workspace"
          message="We couldn't load your workspace settings. Please try again."
          actionLabel="Retry"
          onAction={refetch}
        />
      </div>
    );
  }

  const trimmedName = name.trim();
  const hasChanges = trimmedName.length > 0 && trimmedName !== workspace.name;

  const handleSave = async () => {
    if (!hasChanges) return;
    try {
      await updateWorkspace({ name: trimmedName }).unwrap();
      // Refresh the cached profile so the sidebar workspace name updates.
      dispatch(authApi.util.invalidateTags(["Auth"]));
      showSuccessToast("Workspace updated");
    } catch {
      showErrorToast("Failed to update workspace. Please try again.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Workspace settings
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage your shop's details and subscription
          </p>
        </div>
      </div>

      {/* General */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            General
          </CardTitle>
          <CardDescription>
            Update the name of your workspace.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid w-full max-w-sm gap-2">
            <Label htmlFor="workspace-name">Workspace name</Label>
            <Input
              id="workspace-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter workspace name"
              disabled={isSaving}
            />
          </div>
          <Button onClick={handleSave} disabled={!hasChanges || isSaving}>
            {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
            Save changes
          </Button>
        </CardContent>
      </Card>

      {/* Subscription */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-muted-foreground" />
            Subscription
          </CardTitle>
          <CardDescription>
            View your plan status and manage billing.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {workspace.billingExempt ? (
            <div className="flex flex-wrap items-center gap-3">
              <Badge className="border-transparent bg-primary/10 text-primary">
                No billing
              </Badge>
              <span className="text-sm text-muted-foreground">
                This workspace is exempt from billing — no subscription required.
              </span>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-3">
                {workspace.subscriptionActive ? (
                  <Badge className="border-transparent bg-success/15 text-success">
                    Active
                  </Badge>
                ) : (
                  <Badge variant="destructive">Expired</Badge>
                )}
                <span className="text-sm text-muted-foreground">
                  {workspace.subscriptionActive ? "Renews" : "Expired"} on{" "}
                  {formatDate(workspace.subscriptionExpiresAt)}
                </span>
              </div>
              <Button asChild variant="outline">
                <Link to="/plans">Manage billing</Link>
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            Overview
          </CardTitle>
          <CardDescription>
            A quick snapshot of your workspace.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <StatTile
              label="Members"
              value={workspace.memberCount}
              icon={Users}
            />
            <StatTile
              label="Debtors"
              value={workspace.debtorCount}
              icon={UserRound}
            />
          </div>

          <Separator />

          <div>
            <p className="text-sm font-medium">Owner</p>
            <div className={cn("mt-1 space-y-0.5 text-sm text-muted-foreground")}>
              <p>{workspace.owner.name}</p>
              <p>{workspace.owner.email}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
