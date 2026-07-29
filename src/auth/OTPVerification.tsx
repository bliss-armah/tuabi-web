import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useVerifyOTPMutation, useResendOTPMutation } from "./authApi";
import { ArrowLeft, CheckCircle2, ShieldAlert, Loader2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/shared/components/ui/alert";
import { cn } from "@/shared/utils/utils";
import { OtpInput } from "@/shared/components/OtpInput";

export default function OTPVerification() {
  const navigate = useNavigate();
  const location = useLocation();
  const [verifyOTP] = useVerifyOTPMutation();
  const [resendOTP] = useResendOTPMutation();

  const [otpCode, setOtpCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [resendSuccess, setResendSuccess] = useState<string | null>(null);

  const { identifier, channel, maskedTarget, expiryMinutes } =
    location.state || {};
  const isEmail = channel === "EMAIL";
  const destination = isEmail ? "email" : "phone";

  useEffect(() => {
    if (!identifier) {
      navigate("/login");
    }
  }, [identifier, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const otp = otpCode;
    if (otp.length !== 6) {
      setError("Please enter the complete 6-digit code");
      return;
    }

    setIsLoading(true);

    try {
      const response = await verifyOTP({
        identifier,
        otpCode: otp,
      }).unwrap();

      if (response.success) {
        setSuccess(true);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        localStorage.setItem("authToken", response.data.token);

        setTimeout(() => {
          navigate("/");
        }, 2000);
      } else {
        setError(response.message || "Invalid OTP code");
      }
    } catch (error: any) {
      console.error("OTP verification error:", error);
      setError(
        error?.data?.message || "Failed to verify OTP. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setError(null);
    setResendSuccess(null);
    setIsResending(true);

    try {
      const response = await resendOTP({
        identifier,
      }).unwrap();

      if (response.success) {
        setResendSuccess(`Code resent. Please check your ${destination}.`);
        setTimeout(() => {
          setResendSuccess(null);
        }, 5000);
      } else {
        setError(response.message || "Failed to resend OTP. Please try again.");
      }
    } catch (error: any) {
      console.error("Resend OTP error:", error);
      setError(
        error?.data?.message || "Failed to resend OTP. Please try again.",
      );
    } finally {
      setIsResending(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-md">
          <Card>
            <CardContent className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
                <CheckCircle2 className="h-8 w-8 text-success" />
              </div>
              <h2 className="mb-2 text-2xl font-bold tracking-tight text-foreground">
                Verification Successful!
              </h2>
              <p className="mb-6 text-sm text-muted-foreground">
                Welcome back! Redirecting you to your dashboard...
              </p>
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!identifier) {
    return null; // Will redirect to login
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
            <CardTitle className="text-2xl">Verify your code</CardTitle>
            <CardDescription>
              Enter the 6-digit code we sent to your {destination}
              {maskedTarget ? ` (${maskedTarget})` : ""}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {resendSuccess && (
              <Alert className="border-success/50 text-success">
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription className="text-success">
                  {resendSuccess}
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* OTP Input */}
              <div>
                <Label className="mb-4 block text-center">
                  Enter Verification Code
                </Label>
                <OtpInput
                  value={otpCode}
                  onChange={setOtpCode}
                  disabled={isLoading}
                  autoFocus
                  idPrefix="otp"
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || otpCode.length !== 6}
              >
                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                {isLoading ? "Verifying..." : "Verify OTP"}
              </Button>
            </form>

            {/* Resend OTP */}
            <div className="text-center">
              <button
                onClick={handleResendOTP}
                disabled={isLoading || isResending}
                className={cn(
                  "inline-flex items-center justify-center text-sm font-medium text-primary hover:underline",
                  "disabled:cursor-not-allowed disabled:opacity-50",
                )}
              >
                {isResending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Resending...
                  </>
                ) : (
                  "Didn't receive the code? Resend"
                )}
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Back to Login */}
        <div className="text-center">
          <button
            onClick={() => navigate("/login")}
            className="mx-auto flex items-center justify-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Login</span>
          </button>
        </div>

        {/* Security Notice */}
        <Alert className="border-warning/50 text-warning">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle className="text-warning">Security Notice</AlertTitle>
          <AlertDescription className="text-warning/90">
            The verification code expires in {expiryMinutes ?? 5} minutes. Keep
            your {destination} nearby.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
