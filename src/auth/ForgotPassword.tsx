import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRequestPasswordResetMutation } from "./authApi";
import { AtSign, CheckCircle2, Loader2 } from "lucide-react";
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

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [requestPasswordReset] = useRequestPasswordResetMutation();

  const [identifier, setIdentifier] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const trimmed = identifier.trim();
  const isEmail = trimmed.includes("@");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!trimmed) {
      setError("Please enter your email address or phone number");
      return;
    }

    setIsLoading(true);

    try {
      const response = await requestPasswordReset({
        identifier: trimmed,
      }).unwrap();

      if (response.success) {
        setSuccess(true);
      } else {
        setError(response.message || "Failed to send reset code");
      }
    } catch (error: any) {
      console.error("Password reset request error:", error);
      setError(
        error?.data?.message || "Failed to send reset code. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
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
              <CardTitle className="text-2xl">Reset Code Sent!</CardTitle>
              <CardDescription>
                If an account exists for that {isEmail ? "email address" : "phone number"},
                we've sent it a 6-digit reset code. Check your{" "}
                {isEmail ? "inbox" : "SMS"} and enter the code to reset your
                password.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-3">
              <Button
                className="w-full"
                onClick={() =>
                  navigate("/reset-password", {
                    state: {
                      identifier: trimmed,
                      channel: isEmail ? "EMAIL" : "SMS",
                    },
                  })
                }
              >
                Enter Reset Code
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setSuccess(false);
                  setIdentifier("");
                }}
              >
                Send Another Code
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
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
            <CardTitle className="text-2xl">Forgot Password?</CardTitle>
            <CardDescription>
              Enter your email address or phone number and we'll send you a
              reset code
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="identifier">Email or phone number</Label>
                <div className="relative">
                  <AtSign className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="identifier"
                    type="text"
                    required
                    className="pl-9"
                    placeholder="you@example.com or 0245289983"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {isEmail
                    ? "We'll email a 6-digit reset code to this address"
                    : "We'll text a 6-digit reset code to this number"}
                </p>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                {isLoading ? "Sending Reset Code..." : "Send Reset Code"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
