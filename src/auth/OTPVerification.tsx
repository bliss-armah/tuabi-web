import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useVerifyOTPMutation, useResendOTPMutation } from "./authApi";
import { ArrowLeft, CheckCircle2, ShieldAlert, Loader2 } from "lucide-react";
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
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/shared/components/ui/alert";
import { cn } from "@/shared/utils/utils";

export default function OTPVerification() {
  const navigate = useNavigate();
  const location = useLocation();
  const [verifyOTP] = useVerifyOTPMutation();
  const [resendOTP] = useResendOTPMutation();

  const [otpCode, setOtpCode] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [resendSuccess, setResendSuccess] = useState<string | null>(null);

  const { phoneNumber } = location.state || {};

  useEffect(() => {
    if (!phoneNumber) {
      navigate("/login");
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
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) {
        nextInput.focus();
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();

    const pastedValue = e.clipboardData.getData("text");
    const numericValue = pastedValue.replace(/\D/g, "").slice(0, 6);

    if (numericValue.length === 0) return;

    const newOtpCode = ["", "", "", "", "", ""];

    for (let i = 0; i < numericValue.length && i < 6; i++) {
      newOtpCode[i] = numericValue[i];
    }

    setOtpCode(newOtpCode);

    const nextFocusIndex = Math.min(numericValue.length, 5);
    const nextInput = document.getElementById(`otp-${nextFocusIndex}`);
    if (nextInput) {
      nextInput.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otpCode[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) {
        prevInput.focus();
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const otp = otpCode.join("");
    if (otp.length !== 6) {
      setError("Please enter the complete 6-digit code");
      return;
    }

    setIsLoading(true);

    try {
      const response = await verifyOTP({
        phoneNumber,
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
        phoneNumber,
      }).unwrap();

      if (response.success) {
        setResendSuccess("OTP resent successfully! Please check your phone.");
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

  if (!phoneNumber) {
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
            <CardTitle className="text-2xl">Verify OTP</CardTitle>
            <CardDescription>
              Enter the 6-digit code sent to your phone
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
                <div className="flex justify-center gap-2 sm:gap-3">
                  {otpCode.map((digit, index) => (
                    <Input
                      key={index}
                      id={`otp-${index}`}
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
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || otpCode.join("").length !== 6}
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
            The verification code expires in 10 minutes. Keep your phone nearby.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
