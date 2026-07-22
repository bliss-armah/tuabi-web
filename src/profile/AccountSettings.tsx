import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/shared/hooks/useAuth";
import {
  User,
  Mail,
  Phone,
  ShieldCheck,
  ArrowLeft,
  Pencil,
  Check,
  X,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import {
  Alert,
  AlertDescription,
} from "@/shared/components/ui/alert";

export default function AccountSettings() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [editedName, setEditedName] = useState(user?.name || "");
  const [editedEmail, setEditedEmail] = useState(user?.email || "");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSaveName = async () => {
    if (!editedName.trim()) {
      setError("Name cannot be empty");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Here you would typically call an API to update the user's name
      // For now, we'll just update the local state
      if (!user) return;
      const updatedUser = { ...user, name: editedName.trim() };
      await updateUser(updatedUser);

      setSuccess("Name updated successfully!");
      setIsEditingName(false);
    } catch (err) {
      setError("Failed to update name. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveEmail = async () => {
    if (!editedEmail.trim() || !editedEmail.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Here you would typically call an API to update the user's email
      // For now, we'll just update the local state
      if (!user) return;
      const updatedUser = { ...user, email: editedEmail.trim() };
      await updateUser(updatedUser);

      setSuccess("Email updated successfully!");
      setIsEditingEmail(false);
    } catch (err) {
      setError("Failed to update email. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const cancelEdit = (type: "name" | "email") => {
    if (type === "name") {
      setEditedName(user?.name || "");
      setIsEditingName(false);
    } else {
      setEditedEmail(user?.email || "");
      setIsEditingEmail(false);
    }
    setError(null);
    setSuccess(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/profile")}
          aria-label="Back to profile"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Account Settings
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage your personal information
          </p>
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <Alert className="border-success/50 text-success [&>svg]:text-success">
          <Check className="h-4 w-4" />
          <AlertDescription className="text-success">
            {success}
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <X className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Name */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-1 items-start gap-3">
              <div className="rounded-lg bg-primary/10 p-2 text-primary">
                <User className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Full Name
                </p>
                {isEditingName ? (
                  <Input
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="mt-1"
                    placeholder="Enter your full name"
                    disabled={isLoading}
                  />
                ) : (
                  <p className="text-lg font-semibold">{user?.name}</p>
                )}
              </div>
            </div>
            {isEditingName ? (
              <div className="flex items-center gap-2">
                <Button
                  size="icon"
                  variant="outline"
                  onClick={handleSaveName}
                  disabled={isLoading}
                  className="text-success hover:text-success"
                  aria-label="Save name"
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => cancelEdit("name")}
                  disabled={isLoading}
                  className="text-destructive hover:text-destructive"
                  aria-label="Cancel"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setIsEditingName(true)}
                aria-label="Edit name"
              >
                <Pencil className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Email */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-1 items-start gap-3">
              <div className="rounded-lg bg-secondary p-2 text-secondary-foreground">
                <Mail className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Email Address
                </p>
                {isEditingEmail ? (
                  <Input
                    type="email"
                    value={editedEmail}
                    onChange={(e) => setEditedEmail(e.target.value)}
                    className="mt-1"
                    placeholder="Enter your email address"
                    disabled={isLoading}
                  />
                ) : (
                  <p className="text-lg font-semibold">{user?.email}</p>
                )}
              </div>
            </div>
            {isEditingEmail ? (
              <div className="flex items-center gap-2">
                <Button
                  size="icon"
                  variant="outline"
                  onClick={handleSaveEmail}
                  disabled={isLoading}
                  className="text-success hover:text-success"
                  aria-label="Save email"
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => cancelEdit("email")}
                  disabled={isLoading}
                  className="text-destructive hover:text-destructive"
                  aria-label="Cancel"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setIsEditingEmail(true)}
                aria-label="Edit email"
              >
                <Pencil className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Phone Number (Read-only) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-success/10 p-2 text-success">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Phone Number
                  </p>
                  <p className="text-lg font-semibold">{user?.phoneNumber}</p>
                </div>
              </div>
              <div className="rounded-lg bg-secondary p-2 text-secondary-foreground">
                <ShieldCheck className="h-5 w-5" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Phone number cannot be changed for security reasons. Contact
              support if needed.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Security Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">Security</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 rounded-xl bg-muted/50 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-warning/10 p-2 text-warning">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">Change Password</p>
                <p className="text-sm text-muted-foreground">
                  Update your password to keep your account secure
                </p>
              </div>
            </div>
            <Button
              size="sm"
              onClick={() => navigate("/profile/change-password")}
            >
              Change Password
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Account Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">Account Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-xl bg-success/10 p-4">
              <div className="flex items-center gap-3">
                <span className="h-3 w-3 rounded-full bg-success"></span>
                <div>
                  <p className="font-medium">Account Status</p>
                  <p className="text-sm text-muted-foreground">Active</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-primary/10 p-4">
              <div className="flex items-center gap-3">
                <span className="h-3 w-3 rounded-full bg-primary"></span>
                <div>
                  <p className="font-medium">Member Since</p>
                  <p className="text-sm text-muted-foreground">
                    {user?.createdAt
                      ? new Date(user.createdAt).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
