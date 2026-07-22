import { useNavigate } from "react-router-dom";
import { Lock, Check } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";

const benefits = [
  "Immediate access to all features",
  "Unlimited debtors and transactions",
  "Advanced analytics and reporting",
  "Priority customer support",
  "Web and mobile app access",
];

export default function SubscriptionLockScreen() {
  const navigate = useNavigate();

  const handleSubscribe = () => {
    navigate("/plans");
  };

  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          {/* Lock Icon */}
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
            <Lock className="h-12 w-12 text-primary" />
          </div>

          {/* Title */}
          <h1 className="mb-3 text-3xl font-bold tracking-tight text-foreground">
            Subscription Expired
          </h1>

          {/* Subtitle */}
          <p className="mb-8 text-muted-foreground">
            Your subscription has expired. Renew now to continue accessing all
            features.
          </p>

          {/* Subscribe Button */}
          <Button
            onClick={handleSubscribe}
            size="lg"
            className="w-full text-base font-semibold"
          >
            Subscribe Now
          </Button>

          {/* Help Text */}
          <p className="mt-6 text-sm text-muted-foreground">
            Need help?{" "}
            <Button
              variant="link"
              onClick={() => navigate("/profile/help-support")}
              className="h-auto p-0 text-sm font-medium"
            >
              Contact support
            </Button>{" "}
            for assistance
          </p>
        </div>

        {/* Additional Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              What happens when you subscribe?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {benefits.map((benefit) => (
                <li
                  key={benefit}
                  className="flex items-start gap-2 text-sm text-muted-foreground"
                >
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
