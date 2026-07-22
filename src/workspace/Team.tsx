import { useState } from "react";
import { Loader2, MoreVertical, UserPlus, UsersRound } from "lucide-react";

import {
  useGetMembersQuery,
  useGetWorkspaceQuery,
  useInviteMemberMutation,
  useRemoveMemberMutation,
  useResendMemberInviteMutation,
  useResetMemberPasswordMutation,
  type WorkspaceMember,
} from "@/workspace/workspaceApi";
import { useDeleteConfirmation } from "@/shared/components/ConfirmDialog";
import ResetPasswordDialog from "@/shared/components/ResetPasswordDialog";
import { showErrorToast, showSuccessToast } from "@/shared/utils/toastConfig";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { Badge } from "@/shared/components/ui/badge";
import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Skeleton } from "@/shared/components/ui/skeleton";

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

function RoleBadge({ role }: { role: WorkspaceMember["role"] }) {
  return (
    <Badge variant={role === "OWNER" ? "default" : "secondary"}>{role}</Badge>
  );
}

function StatusBadge({ status }: { status: string }) {
  const normalized = status?.toUpperCase();
  if (normalized === "ACTIVE") {
    return (
      <Badge className="border-success/20 bg-success/10 text-success">
        ACTIVE
      </Badge>
    );
  }
  if (normalized === "DISABLED") {
    return <Badge variant="destructive">DISABLED</Badge>;
  }
  return <Badge variant="secondary">{normalized || "PENDING"}</Badge>;
}

export default function Team() {
  const { data: workspaceData } = useGetWorkspaceQuery();
  const {
    data: membersData,
    isLoading: isLoadingMembers,
  } = useGetMembersQuery();

  const [inviteMember, { isLoading: isInviting }] = useInviteMemberMutation();
  const [resendInvite] = useResendMemberInviteMutation();
  const [removeMember] = useRemoveMemberMutation();
  const [resetMemberPassword, { isLoading: isResetting }] =
    useResetMemberPasswordMutation();

  const { showDeleteConfirmation, DeleteDialog } = useDeleteConfirmation();

  const [resetTarget, setResetTarget] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");

  const members = membersData?.data ?? [];
  const workspaceName = workspaceData?.data?.name;

  const resetForm = () => {
    setName("");
    setPhoneNumber("");
    setEmail("");
  };

  const handleInviteOpenChange = (open: boolean) => {
    setIsInviteOpen(open);
    if (!open) resetForm();
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await inviteMember({
        name: name.trim(),
        phoneNumber: phoneNumber.trim(),
        email: email.trim() || undefined,
      }).unwrap();
      showSuccessToast("Invitation sent");
      setIsInviteOpen(false);
      resetForm();
    } catch (err) {
      const message =
        (err as { data?: { message?: string } })?.data?.message ||
        "Failed to invite";
      showErrorToast(message);
    }
  };

  const handleResend = async (userId: number) => {
    try {
      await resendInvite(userId).unwrap();
      showSuccessToast("Invitation sent");
    } catch (err) {
      const message =
        (err as { data?: { message?: string } })?.data?.message ||
        "Failed to resend invite";
      showErrorToast(message);
    }
  };

  const handleResetPassword = async (
    newPassword: string
  ): Promise<boolean> => {
    if (!resetTarget) return false;
    try {
      await resetMemberPassword({
        userId: resetTarget.id,
        newPassword,
      }).unwrap();
      showSuccessToast(`Password reset for ${resetTarget.name}`);
      return true;
    } catch (err) {
      const message =
        (err as { data?: { message?: string } })?.data?.message ||
        "Failed to reset password";
      showErrorToast(message);
      return false;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Team</h1>
          <p className="text-sm text-muted-foreground">
            {workspaceName
              ? `Store keepers in ${workspaceName}`
              : "Store keepers in your workspace"}
          </p>
        </div>
        <Button onClick={() => setIsInviteOpen(true)}>
          <UserPlus className="h-4 w-4" />
          Invite store keeper
        </Button>
      </div>

      {/* Members */}
      <Card>
        <CardHeader>
          <CardTitle>Members</CardTitle>
          <CardDescription>
            People with access to this workspace.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingMembers ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-9 w-9 rounded-full" />
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="ml-auto h-4 w-24" />
                </div>
              ))}
            </div>
          ) : members.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
              <UsersRound className="h-10 w-10 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                No team members yet
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-12 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.map((member) => {
                    const { user, role } = member;
                    const isKeeper = role === "KEEPER";
                    const isPending = user.status?.toUpperCase() === "PENDING";
                    return (
                      <TableRow key={member.memberId}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              <AvatarFallback className="text-xs">
                                {getInitials(user.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="truncate font-medium">
                                {user.name}
                              </p>
                              {user.email && (
                                <p className="truncate text-xs text-muted-foreground">
                                  {user.email}
                                </p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-muted-foreground">
                          {user.phoneNumber}
                        </TableCell>
                        <TableCell>
                          <RoleBadge role={role} />
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={user.status} />
                        </TableCell>
                        <TableCell className="text-right">
                          {isKeeper ? (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon-sm"
                                  aria-label={`Actions for ${user.name}`}
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {isPending && (
                                  <DropdownMenuItem
                                    onClick={() => handleResend(user.id)}
                                  >
                                    Resend invite
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem
                                  onClick={() =>
                                    setResetTarget({
                                      id: user.id,
                                      name: user.name,
                                    })
                                  }
                                >
                                  Reset password
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  variant="destructive"
                                  onClick={() =>
                                    showDeleteConfirmation(
                                      user.id,
                                      user.name,
                                      "store keeper",
                                      () => removeMember(user.id)
                                    )
                                  }
                                >
                                  Remove
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
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

      {/* Invite dialog */}
      <Dialog open={isInviteOpen} onOpenChange={handleInviteOpenChange}>
        <DialogContent>
          <form onSubmit={handleInvite}>
            <DialogHeader>
              <DialogTitle>Invite store keeper</DialogTitle>
              <DialogDescription>
                Send an invitation to join
                {workspaceName ? ` ${workspaceName}` : " your workspace"}.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="invite-name">Full name</Label>
                <Input
                  id="invite-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Doe"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="invite-phone">Phone number</Label>
                <Input
                  id="invite-phone"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="0201234567"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="invite-email">
                  Email{" "}
                  <span className="text-muted-foreground">(optional)</span>
                </Label>
                <Input
                  id="invite-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jane@example.com"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleInviteOpenChange(false)}
                disabled={isInviting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isInviting}>
                {isInviting && (
                  <Loader2 className={cn("h-4 w-4 animate-spin")} />
                )}
                Send invitation
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <DeleteDialog />

      <ResetPasswordDialog
        open={!!resetTarget}
        onOpenChange={(open) => {
          if (!open) setResetTarget(null);
        }}
        targetName={resetTarget?.name}
        isLoading={isResetting}
        onSubmit={handleResetPassword}
      />
    </div>
  );
}
