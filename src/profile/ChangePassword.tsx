import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useChangePasswordMutation } from "@/auth/authApi";
import { Eye, EyeOff, ShieldCheck, CheckCircle2, Loader2 } from "lucide-react";
import { cn } from "@/shared/utils/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";

export default function ChangePassword() {
  const navigate = useNavigate();
  const [changePassword] = useChangePasswordMutation();

  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPasswords, setShowPasswords] = useState({
    oldPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (
      !formData.oldPassword ||
      !formData.newPassword ||
      !formData.confirmPassword
    ) {
      setError("All fields are required");
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    if (formData.newPassword.length < 8) {
      setError("New password must be at least 8 characters long");
      return;
    }

    // Check for uppercase letter
    if (!/[A-Z]/.test(formData.newPassword)) {
      setError("Password must contain at least one uppercase letter");
      return;
    }

    // Check for lowercase letter
    if (!/[a-z]/.test(formData.newPassword)) {
      setError("Password must contain at least one lowercase letter");
      return;
    }

    // Check for number
    if (!/[0-9]/.test(formData.newPassword)) {
      setError("Password must contain at least one number");
      return;
    }

    // Check for special character
    if (!/[^A-Za-z0-9]/.test(formData.newPassword)) {
      setError("Password must contain at least one special character");
      return;
    }

    if (formData.oldPassword === formData.newPassword) {
      setError("New password must be different from current password");
      return;
    }

    setIsLoading(true);

    try {
      const response = await changePassword({
        oldPassword: formData.oldPassword,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword,
      }).unwrap();

      if (response.success) {
        setSuccess(true);
        setFormData({
          oldPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        setError(response.message || "Failed to change password");
      }
    } catch (error) {
      console.error("Change password error:", error);
      const errorMessage =
        error && typeof error === "object" && "data" in error
          ? (error.data as { message?: string })?.message ||
            "Failed to change password. Please try again."
          : "Failed to change password. Please try again.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const passwordFields = [
    {
      id: "oldPassword" as const,
      label: "Current Password",
      placeholder: "Enter your current password",
      hint: null as string | null,
    },
    {
      id: "newPassword" as const,
      label: "New Password",
      placeholder: "Enter your new password",
      hint: "Must be at least 8 characters with uppercase, lowercase, number, and special character",
    },
    {
      id: "confirmPassword" as const,
      label: "Confirm New Password",
      placeholder: "Confirm your new password",
      hint: null as string | null,
    },
  ];

  if (success) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
            <CheckCircle2 className="h-8 w-8 text-success" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight">
              Password Changed!
            </h2>
            <p className="text-muted-foreground">
              Your password has been successfully updated. You can now use your
              new password to log in.
            </p>
          </div>
          <Button className="w-full" onClick={() => navigate("/profile")}>
            Back to Profile
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-md space-y-6">
      {/* Header */}
      <div className="space-y-3 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <ShieldCheck className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Change Password</h1>
          <p className="text-sm text-muted-foreground">
            Update your password to keep your account secure
          </p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {passwordFields.map((field) => (
              <div key={field.id} className="space-y-2">
                <Label htmlFor={field.id}>{field.label}</Label>
                <div className="relative">
                  <Input
                    id={field.id}
                    type={showPasswords[field.id] ? "text" : "password"}
                    required
                    className="pr-10"
                    placeholder={field.placeholder}
                    value={formData[field.id]}
                    onChange={(e) =>
                      setFormData({ ...formData, [field.id]: e.target.value })
                    }
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground transition-colors hover:text-foreground"
                    onClick={() => togglePasswordVisibility(field.id)}
                    aria-label={
                      showPasswords[field.id] ? "Hide password" : "Show password"
                    }
                  >
                    {showPasswords[field.id] ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {field.hint && (
                  <p className="text-xs text-muted-foreground">{field.hint}</p>
                )}
              </div>
            ))}

            {/* Password Match Indicator */}
            {formData.newPassword && formData.confirmPassword && (
              <div
                className={cn(
                  "rounded-md border p-3 text-sm",
                  formData.newPassword === formData.confirmPassword
                    ? "border-success/50 bg-success/10 text-success"
                    : "border-destructive/50 bg-destructive/10 text-destructive"
                )}
              >
                {formData.newPassword === formData.confirmPassword
                  ? "✓ Passwords match"
                  : "✗ Passwords do not match"}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => navigate("/profile")}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Password"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Security Tips */}
      <Card className="border-primary/30 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-base text-primary">
            Password Requirements
          </CardTitle>
          <CardDescription className="sr-only">
            Password requirements list
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• At least 8 characters long</li>
            <li>• At least one uppercase letter (A-Z)</li>
            <li>• At least one lowercase letter (a-z)</li>
            <li>• At least one number (0-9)</li>
            <li>• At least one special character (!@#$%^&*)</li>
            <li>
              • Avoid using personal information like your name or phone number
            </li>
            <li>• Don't reuse passwords from other accounts</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
