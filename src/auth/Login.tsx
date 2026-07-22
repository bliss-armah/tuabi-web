import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useRequestOTPMutation, useAdminLoginMutation } from "./authApi";
import { Phone, Lock, Mail, Eye, EyeOff, Loader2 } from "lucide-react";
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

type Mode = "phone" | "email";

export default function Login() {
  const navigate = useNavigate();
  const [requestOTP] = useRequestOTPMutation();
  const [adminLogin] = useAdminLoginMutation();

  const [mode, setMode] = useState<Mode>("phone");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (mode === "phone") {
        if (!phoneNumber || !password) {
          setError("Please fill in all fields");
          return;
        }
        const response = await requestOTP({ phoneNumber, password }).unwrap();
        if (response.success) {
          navigate("/otp-verification", { state: { phoneNumber, password } });
        } else {
          setError(response.message || "Failed to send OTP");
        }
      } else {
        if (!email || !password) {
          setError("Please fill in all fields");
          return;
        }
        const response = await adminLogin({ email, password }).unwrap();
        if (response.success) {
          localStorage.setItem("user", JSON.stringify(response.data.user));
          if (response.data.token)
            localStorage.setItem("authToken", response.data.token);
          navigate("/");
        } else {
          setError(response.message || "Invalid credentials");
        }
      }
    } catch (err: any) {
      setError(err?.data?.message || "Sign in failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
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
            <CardTitle className="text-2xl">Welcome back</CardTitle>
            <CardDescription>Sign in to your account to continue</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Mode toggle */}
            <div className="grid grid-cols-2 gap-1 rounded-lg bg-muted p-1">
              <button
                type="button"
                onClick={() => {
                  setMode("phone");
                  setError(null);
                }}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  mode === "phone"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                Store keeper
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("email");
                  setError(null);
                }}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  mode === "email"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                Owner / Admin
              </button>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "phone" ? (
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone number</Label>
                  <div className="relative">
                    <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="phoneNumber"
                      type="tel"
                      className="pl-9"
                      placeholder="Enter your phone number"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      className="pl-9"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    className="pl-9 pr-10"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="text-right">
                <Link
                  to="/forgot-password"
                  className="text-sm font-medium text-primary hover:underline"
                >
                  Forgot your password?
                </Link>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                {isLoading
                  ? mode === "phone"
                    ? "Sending OTP..."
                    : "Signing in..."
                  : mode === "phone"
                    ? "Continue"
                    : "Sign in"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Invite activation */}
        <div className="text-center text-sm text-muted-foreground">
          <p>Have an invitation?</p>
          <Link
            to="/accept-invite"
            className="font-medium text-primary hover:underline"
          >
            Activate your account
          </Link>
        </div>
      </div>
    </div>
  );
}
