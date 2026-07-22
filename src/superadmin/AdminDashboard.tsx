import { useState } from "react";
import {
  Plus,
  Loader2,
  Building2,
  Users,
  UserCog,
  CheckCircle2,
  MoreVertical,
  Send,
  Ban,
  CircleCheck,
  KeyRound,
  BadgeDollarSign,
  Gift,
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
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/shared/components/ui/dropdown-menu";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { showSuccessToast, showErrorToast } from "@/shared/utils/toastConfig";
import {
  useGetPlatformStatsQuery,
  useGetAdminsQuery,
  useCreateAdminMutation,
  useResendAdminInviteMutation,
  useSetAdminStatusMutation,
  useResetAdminPasswordMutation,
  useSetWorkspaceBillingMutation,
  type WorkspaceAdmin,
} from "@/superadmin/adminApi";
import ResetPasswordDialog from "@/shared/components/ResetPasswordDialog";

interface CreateAdminForm {
  name: string;
  email: string;
  phoneNumber: string;
  workspaceName: string;
}

const emptyForm: CreateAdminForm = {
  name: "",
  email: "",
  phoneNumber: "",
  workspaceName: "",
};

function StatTile({
  label,
  value,
  icon: Icon,
  loading,
}: {
  label: string;
  value?: number;
  icon: React.ComponentType<{ className?: string }>;
  loading: boolean;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardDescription className="text-sm text-muted-foreground">
          {label}
        </CardDescription>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-16" />
        ) : (
          <div className="text-2xl font-bold">
            {(value ?? 0).toLocaleString()}
          </div>
        )}
      </CardContent>
    </Card>
  );
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

function formatDate(value: string | null) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function WorkspaceRow({ workspace }: { workspace: WorkspaceAdmin }) {
  const { owner } = workspace;
  const status = owner.status?.toUpperCase();

  const [resendInvite, { isLoading: isResending }] =
    useResendAdminInviteMutation();
  const [setStatus, { isLoading: isUpdatingStatus }] =
    useSetAdminStatusMutation();
  const [resetPassword, { isLoading: isResetting }] =
    useResetAdminPasswordMutation();
  const [setBilling, { isLoading: isBilling }] =
    useSetWorkspaceBillingMutation();

  const [resetOpen, setResetOpen] = useState(false);

  const handleSetBilling = async (exempt: boolean) => {
    try {
      await setBilling({ workspaceId: workspace.workspaceId, exempt }).unwrap();
      showSuccessToast(
        exempt ? "Workspace set to no billing" : "Billing enabled"
      );
    } catch (err) {
      const message =
        (err as { data?: { message?: string } })?.data?.message ||
        "Failed to update billing";
      showErrorToast(message);
    }
  };

  const handleResetPassword = async (
    newPassword: string
  ): Promise<boolean> => {
    try {
      await resetPassword({ id: owner.id, newPassword }).unwrap();
      showSuccessToast(`Password reset for ${owner.name}`);
      return true;
    } catch (err) {
      const message =
        (err as { data?: { message?: string } })?.data?.message ||
        "Failed to reset password";
      showErrorToast(message);
      return false;
    }
  };

  const handleResend = async () => {
    try {
      await resendInvite(owner.id).unwrap();
      showSuccessToast("Invitation SMS resent");
    } catch (err) {
      const message =
        (err as { data?: { message?: string } })?.data?.message ||
        "Failed to resend invite";
      showErrorToast(message);
    }
  };

  const handleSetStatus = async (disabled: boolean) => {
    try {
      await setStatus({ id: owner.id, disabled }).unwrap();
      showSuccessToast(disabled ? "Workspace disabled" : "Workspace enabled");
    } catch (err) {
      const message =
        (err as { data?: { message?: string } })?.data?.message ||
        "Failed to update status";
      showErrorToast(message);
    }
  };

  const subscriptionExpiry = formatDate(workspace.subscriptionExpiresAt);
  const busy = isResending || isUpdatingStatus || isResetting || isBilling;

  return (
    <>
    <TableRow>
      <TableCell className="font-medium">{workspace.workspaceName}</TableCell>
      <TableCell>
        <div className="flex flex-col">
          <span className="font-medium">{owner.name}</span>
          <span className="text-xs text-muted-foreground">{owner.email}</span>
        </div>
      </TableCell>
      <TableCell>
        <StatusBadge status={owner.status} />
      </TableCell>
      <TableCell>{workspace.memberCount.toLocaleString()}</TableCell>
      <TableCell>{workspace.debtorCount.toLocaleString()}</TableCell>
      <TableCell>
        <div className="flex flex-col gap-0.5">
          {workspace.billingExempt ? (
            <Badge className="border-primary/20 bg-primary/10 text-primary">
              <Gift className="mr-1 h-3 w-3" />
              No billing
            </Badge>
          ) : workspace.subscriptionActive ? (
            <Badge className="bg-success text-success-foreground hover:bg-success/90">
              Active
            </Badge>
          ) : (
            <Badge variant="secondary">Expired</Badge>
          )}
          {!workspace.billingExempt && subscriptionExpiry && (
            <span className="text-xs text-muted-foreground">
              {subscriptionExpiry}
            </span>
          )}
        </div>
      </TableCell>
      <TableCell className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              disabled={busy}
              aria-label="Workspace actions"
            >
              {busy ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <MoreVertical className="h-4 w-4" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {status === "PENDING" && (
              <DropdownMenuItem onClick={handleResend}>
                <Send className="h-4 w-4" />
                Resend invite
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => setResetOpen(true)}>
              <KeyRound className="h-4 w-4" />
              Reset password
            </DropdownMenuItem>
            {workspace.billingExempt ? (
              <DropdownMenuItem onClick={() => handleSetBilling(false)}>
                <BadgeDollarSign className="h-4 w-4" />
                Enable billing
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem onClick={() => handleSetBilling(true)}>
                <Gift className="h-4 w-4" />
                Set to no billing
              </DropdownMenuItem>
            )}
            {status === "ACTIVE" && (
              <DropdownMenuItem
                variant="destructive"
                onClick={() => handleSetStatus(true)}
              >
                <Ban className="h-4 w-4" />
                Disable
              </DropdownMenuItem>
            )}
            {status === "DISABLED" && (
              <DropdownMenuItem onClick={() => handleSetStatus(false)}>
                <CircleCheck className="h-4 w-4" />
                Enable
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>

    <ResetPasswordDialog
      open={resetOpen}
      onOpenChange={setResetOpen}
      targetName={owner.name}
      isLoading={isResetting}
      onSubmit={handleResetPassword}
    />
    </>
  );
}

export default function AdminDashboard() {
  const { data: statsData, isLoading: statsLoading } =
    useGetPlatformStatsQuery();
  const { data: adminsData, isLoading: adminsLoading } = useGetAdminsQuery();
  const [createAdmin, { isLoading: isCreating }] = useCreateAdminMutation();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<CreateAdminForm>(emptyForm);

  const stats = statsData?.data;
  const workspaces = adminsData?.data ?? [];

  const handleChange =
    (field: keyof CreateAdminForm) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createAdmin(form).unwrap();
      showSuccessToast("Admin created — invitation SMS sent");
      setDialogOpen(false);
      setForm(emptyForm);
    } catch (err) {
      const message =
        (err as { data?: { message?: string } })?.data?.message ||
        "Failed to create admin";
      showErrorToast(message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Platform Console
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage store owners and their workspaces
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4" />
              Create admin
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Create admin</DialogTitle>
                <DialogDescription>
                  Add a store owner and set up their workspace. An invitation
                  SMS will be sent.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Full name</Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={handleChange("name")}
                    placeholder="Ama Mensah"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange("email")}
                    placeholder="owner@example.com"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phoneNumber">Phone number</Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    value={form.phoneNumber}
                    onChange={handleChange("phoneNumber")}
                    placeholder="+233 20 000 0000"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="workspaceName">Workspace / Shop name</Label>
                  <Input
                    id="workspaceName"
                    value={form.workspaceName}
                    onChange={handleChange("workspaceName")}
                    placeholder="Ama's Store"
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                  disabled={isCreating}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isCreating}>
                  {isCreating && <Loader2 className="h-4 w-4 animate-spin" />}
                  Create admin
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stat tiles */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          label="Total Workspaces"
          value={stats?.totalWorkspaces}
          icon={Building2}
          loading={statsLoading}
        />
        <StatTile
          label="Active Workspaces"
          value={stats?.activeWorkspaces}
          icon={CheckCircle2}
          loading={statsLoading}
        />
        <StatTile
          label="Store Owners"
          value={stats?.adminUsers}
          icon={UserCog}
          loading={statsLoading}
        />
        <StatTile
          label="Total Users"
          value={stats?.totalUsers}
          icon={Users}
          loading={statsLoading}
        />
      </div>

      {/* Workspaces table */}
      <Card>
        <CardHeader>
          <CardTitle>Workspaces</CardTitle>
          <CardDescription>
            All store-owner workspaces on the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          {adminsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : workspaces.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
              <Building2 className="h-10 w-10 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                No workspaces yet
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Workspace</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Members</TableHead>
                    <TableHead>Debtors</TableHead>
                    <TableHead>Subscription</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {workspaces.map((workspace) => (
                    <WorkspaceRow
                      key={workspace.workspaceId}
                      workspace={workspace}
                    />
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
