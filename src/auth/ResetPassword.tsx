import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useResetPasswordMutation } from "./authApi";
import { Eye, EyeOff, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { cn } from "@/shared/utils/utils";

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const [resetPassword] = useResetPasswordMutation();

  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const [otpCode, setOtpCode] = useState(["", "", "", "", "", ""]);

  const [showPasswords, setShowPasswords] = useState({
    newPassword: false,
    confirmPassword: false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Get phone number from navigation state or URL params
  const phoneNumber = location.state?.phoneNumber || "";

  useEffect(() => {
    if (!phoneNumber) {
      // If no phone number, redirect to forgot password
      navigate("/forgot-password");
    }
  }, [phoneNumber, navigate]);

  const handleOtpChange = (index: number, value: string) => {
    if (value && !/^\d$/.test(value)) {
      return;
    }

    const newOtpCode = [...otpCode];
    newOtpCode[index] = value;
    setOtpCode(newOtpCode);

    if (value && index < 5) {
      const nextInput = document.getElementById(`reset-otp-${index + 1}`);
      if (nextInput) {
        nextInput.focus();
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();

    const pastedValue = e.clipboardData.getData('text');
    const numericValue = pastedValue.replace(/\D/g, '').slice(0, 6);

    if (numericValue.length === 0) return;

    const newOtpCode = ["", "", "", "", "", ""];

    for (let i = 0; i < numericValue.length && i < 6; i++) {
      newOtpCode[i] = numericValue[i];
    }

    setOtpCode(newOtpCode);

    const nextFocusIndex = Math.min(numericValue.length, 5);
    const nextInput = document.getElementById(`reset-otp-${nextFocusIndex}`);
    if (nextInput) {
      nextInput.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otpCode[index] && index > 0) {
      const prevInput = document.getElementById(`reset-otp-${index - 1}`);
      if (prevInput) {
        prevInput.focus();
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const resetCode = otpCode.join("");

    if (
      !resetCode ||
      !formData.newPassword ||
      !formData.confirmPassword
    ) {
      setError("All fields are required");
      return;
    }

    if (resetCode.length !== 6) {
      setError("Reset code must be 6 digits");
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    if (formData.newPassword.length < 6) {
      setError("New password must be at least 6 characters long");
      return;
    }

    setIsLoading(true);

    try {
      const response = await resetPassword({
        phoneNumber,
        resetCode: resetCode,
        newPassword: formData.newPassword,
      }).unwrap();

      if (response.success) {
        setSuccess(true);
      } else {
        setError(response.message || "Failed to reset password");
      }
    } catch (error: any) {
      console.error("Password reset error:", error);
      setError(
        error?.data?.message || "Failed to reset password. Please try again.",
      );
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

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-md space-y-6">
          {/* Brand */}
          <div className="flex items-center justify-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-lg font-bold text-primary-foreground">
              T
            </div>
            <span className="text-xl font-semibold tracking-tight text-foreground">
              Tuabi
            </span>
          </div>

          <Card>
            <CardHeader className="items-center text-center">
              <div className="mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
                <CheckCircle2 className="h-8 w-8 text-success" />
              </div>
              <CardTitle className="text-2xl">
                Password Reset Successfully!
              </CardTitle>
              <CardDescription>
                Your password has been updated. You can now log in with your new
                password.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <Button className="w-full" onClick={() => navigate("/login")}>
                Go to Login
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!phoneNumber) {
    return null; // Will redirect to forgot password
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Brand */}
        <div className="flex items-center justify-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-lg font-bold text-primary-foreground">
            T
          </div>
          <span className="text-xl font-semibold tracking-tight text-foreground">
            Tuabi
          </span>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Reset Password</CardTitle>
            <CardDescription>
              Enter the reset code and your new password
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Reset Code */}
              <div>
                <Label className="mb-4 block text-center">
                  Enter Reset Code
                </Label>
                <div className="flex justify-center gap-2 sm:gap-3">
                  {otpCode.map((digit, index) => (
                    <Input
                      key={index}
                      id={`reset-otp-${index}`}
                      type="tel"
                      inputMode="numeric"
                      pattern="\d*"
                      maxLength={1}
                      className="h-11 w-10 text-center text-lg font-semibold md:h-12 md:w-12"
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onPaste={(e) => handlePaste(e)}
                      disabled={isLoading}
                    />
                  ))}
                </div>
                <p className="mt-3 text-center text-xs text-muted-foreground">
                  Enter the 6-digit code sent to your phone
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showPasswords.newPassword ? "text" : "password"}
                    required
                    className="pr-10"
                    placeholder="Enter your new password"
                    value={formData.newPassword}
                    onChange={(e) =>
                      setFormData({ ...formData, newPassword: e.target.value })
                    }
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => togglePasswordVisibility("newPassword")}
                  >
                    {showPasswords.newPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Must be at least 6 characters long
                </p>
              </div>

              {/* Confirm New Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showPasswords.confirmPassword ? "text" : "password"}
                    required
                    className="pr-10"
                    placeholder="Confirm your new password"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        confirmPassword: e.target.value,
                      })
                    }
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => togglePasswordVisibility("confirmPassword")}
                  >
                    {showPasswords.confirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {formData.newPassword && formData.confirmPassword && (
                <div
                  className={cn(
                    "rounded-md border px-3 py-2 text-sm",
                    formData.newPassword === formData.confirmPassword
                      ? "border-success/50 text-success"
                      : "border-destructive/50 text-destructive",
                  )}
                >
                  {formData.newPassword === formData.confirmPassword
                    ? "✓ Passwords match"
                    : "✗ Passwords do not match"}
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => navigate("/forgot-password")}
                  disabled={isLoading}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={isLoading}
                >
                  {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isLoading ? "Resetting..." : "Reset Password"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Security Tips */}
        <Card>
          <CardContent className="space-y-3">
            <h3 className="font-semibold text-foreground">
              Password Security Tips
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Use a mix of letters, numbers, and symbols</li>
              <li>
                • Avoid using personal information like your name or phone
                number
              </li>
              <li>• Don't reuse passwords from other accounts</li>
              <li>• Consider using a password manager for better security</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
