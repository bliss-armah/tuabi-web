import { useAuth } from "@/shared/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import {
  Settings,
  ShieldCheck,
  HelpCircle,
  ChevronRight,
  Phone,
  Calendar,
  LogOut,
} from "lucide-react";
import { cn } from "@/shared/utils/utils";
import {
  Avatar,
  AvatarFallback,
} from "@/shared/components/ui/avatar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Separator } from "@/shared/components/ui/separator";

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const accountActions = [
    {
      title: "Account Settings",
      description: "Manage your personal information and preferences",
      icon: Settings,
      color: "primary",
      onClick: () => navigate("/profile/account-settings"),
    },
    {
      title: "Change Password",
      description: "Update your password for better security",
      icon: ShieldCheck,
      color: "warning",
      onClick: () => navigate("/profile/change-password"),
    },
    {
      title: "Privacy & Security",
      description: "Learn about how we protect your data",
      icon: ShieldCheck,
      color: "success",
      onClick: () => navigate("/profile/privacy-security"),
    },
    {
      title: "Help & Support",
      description: "Get help and find answers to your questions",
      icon: HelpCircle,
      color: "secondary",
      onClick: () => navigate("/profile/help-support"),
    },
  ];

  const initials =
    user?.name
      ?.split(" ")
      .map((part) => part[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "U";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
        <p className="text-sm text-muted-foreground">
          Manage your account and preferences
        </p>
      </div>

      {/* User Information */}
      <Card>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-primary/10 text-lg font-semibold text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-lg font-semibold md:text-xl">
                {user?.name}
              </h2>
              <p className="truncate text-muted-foreground">{user?.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex items-center gap-3 rounded-xl bg-muted/50 p-3">
              <div className="rounded-lg bg-secondary p-2 text-secondary-foreground">
                <Phone className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Phone Number
                </p>
                <p className="font-semibold">{user?.phoneNumber}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl bg-muted/50 p-3">
              <div className="rounded-lg bg-secondary p-2 text-secondary-foreground">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Member Since
                </p>
                <p className="font-semibold">
                  {user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">Account Actions</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {accountActions.map((action, index) => (
            <div key={index}>
              {index > 0 && <Separator />}
              <button
                onClick={action.onClick}
                className="group flex w-full items-center justify-between gap-4 px-6 py-4 text-left transition-colors hover:bg-muted/50"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={cn(
                      "rounded-lg p-2",
                      getColorClasses(action.color)
                    )}
                  >
                    <action.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">{action.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {action.description}
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
              </button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Logout */}
      <Card>
        <CardContent>
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="group h-auto w-full justify-between px-4 py-3 text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <span className="flex items-center gap-4">
              <span className="rounded-lg bg-destructive/10 p-2">
                <LogOut className="h-5 w-5" />
              </span>
              <span className="flex flex-col text-left">
                <span className="font-medium">Logout</span>
                <span className="text-sm text-destructive/80">
                  Sign out of your account
                </span>
              </span>
            </span>
            <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

const getColorClasses = (color: string) => {
  switch (color) {
    case "primary":
      return "bg-primary/10 text-primary";
    case "warning":
      return "bg-warning/10 text-warning";
    case "success":
      return "bg-success/10 text-success";
    case "secondary":
      return "bg-secondary text-secondary-foreground";
    default:
      return "bg-primary/10 text-primary";
  }
};
