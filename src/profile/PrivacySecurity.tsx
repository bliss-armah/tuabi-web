import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ShieldCheck,
  Lock,
  Eye,
  FileText,
  Info,
  CheckCircle2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";

export default function PrivacySecurity() {
  const navigate = useNavigate();

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
            Privacy & Security
          </h1>
          <p className="text-sm text-muted-foreground">
            How we protect and handle your data
          </p>
        </div>
      </div>

      {/* Data Protection */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2 text-primary">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <CardTitle className="text-lg md:text-xl">Data Protection</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-xl border border-success/30 bg-success/10 p-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" />
              <div>
                <h3 className="mb-2 font-semibold text-success">
                  End-to-End Encryption
                </h3>
                <p className="text-sm text-muted-foreground">
                  All your data is encrypted both in transit and at rest using
                  industry-standard AES-256 encryption.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-primary/30 bg-primary/10 p-4">
            <div className="flex items-start gap-3">
              <Lock className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div>
                <h3 className="mb-2 font-semibold text-primary">
                  Secure Authentication
                </h3>
                <p className="text-sm text-muted-foreground">
                  We use OTP-based authentication and JWT tokens to ensure
                  secure access to your account.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-warning/30 bg-warning/10 p-4">
            <div className="flex items-start gap-3">
              <Eye className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
              <div>
                <h3 className="mb-2 font-semibold text-warning">
                  Privacy Controls
                </h3>
                <p className="text-sm text-muted-foreground">
                  You have full control over your data. You can view, edit, or
                  delete your information at any time.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* What We Collect */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-secondary p-2 text-secondary-foreground">
              <FileText className="h-6 w-6" />
            </div>
            <CardTitle className="text-lg md:text-xl">What We Collect</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-xl bg-muted/50 p-4">
              <h3 className="mb-2 font-semibold">Personal Information</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Full name</li>
                <li>• Email address</li>
                <li>• Phone number</li>
                <li>• Account creation date</li>
              </ul>
            </div>

            <div className="rounded-xl bg-muted/50 p-4">
              <h3 className="mb-2 font-semibold">Business Data</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Debtor information</li>
                <li>• Transaction history</li>
                <li>• Payment records</li>
                <li>• Account activity logs</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* What We Don't Collect */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-destructive/10 p-2 text-destructive">
              <Info className="h-6 w-6" />
            </div>
            <CardTitle className="text-lg md:text-xl">
              What We Don't Collect
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4">
            <h3 className="mb-3 font-semibold text-destructive">
              We Never Collect:
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Financial account details (bank accounts, credit cards)</li>
              <li>• Government ID numbers</li>
              <li>• Biometric data</li>
              <li>• Location data (unless you explicitly share it)</li>
              <li>• Third-party social media data</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Data Usage */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">
            How We Use Your Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-xl bg-primary/10 p-4">
              <h3 className="mb-2 font-semibold text-primary">Core Services</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Manage your debtors</li>
                <li>• Track payments and transactions</li>
                <li>• Send notifications</li>
                <li>• Provide customer support</li>
              </ul>
            </div>

            <div className="rounded-xl bg-success/10 p-4">
              <h3 className="mb-2 font-semibold text-success">
                Security & Compliance
              </h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Prevent fraud and abuse</li>
                <li>• Comply with legal requirements</li>
                <li>• Improve our services</li>
                <li>• Maintain system security</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Sharing */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">Data Sharing</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border border-warning/30 bg-warning/10 p-4">
            <h3 className="mb-3 font-semibold text-warning">
              We Do Not Sell Your Data
            </h3>
            <p className="mb-3 text-sm text-muted-foreground">
              We never sell, rent, or trade your personal information to third
              parties for marketing purposes.
            </p>
            <h4 className="mb-2 font-medium text-warning">
              Limited Sharing Only:
            </h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Service providers (hosting, payment processing)</li>
              <li>• Legal requirements (court orders, law enforcement)</li>
              <li>• Business transfers (with your consent)</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Your Rights */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">Your Rights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-xl bg-muted/50 p-4">
              <h3 className="mb-2 font-semibold">Access & Control</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• View your personal data</li>
                <li>• Update your information</li>
                <li>• Download your data</li>
                <li>• Delete your account</li>
              </ul>
            </div>

            <div className="rounded-xl bg-muted/50 p-4">
              <h3 className="mb-2 font-semibold">Privacy Controls</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Control notification settings</li>
                <li>• Manage data retention</li>
                <li>• Opt-out of communications</li>
                <li>• Request data deletion</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Measures */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">Security Measures</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-xl bg-success/10 p-4">
              <h3 className="mb-2 font-semibold text-success">
                Technical Security
              </h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• SSL/TLS encryption</li>
                <li>• Secure data centers</li>
                <li>• Regular security audits</li>
                <li>• Automated threat detection</li>
              </ul>
            </div>

            <div className="rounded-xl bg-primary/10 p-4">
              <h3 className="mb-2 font-semibold text-primary">Access Controls</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Multi-factor authentication</li>
                <li>• Role-based access</li>
                <li>• Session management</li>
                <li>• Audit logging</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">
            Questions About Privacy?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl bg-primary/10 p-4">
            <p className="mb-3 text-sm text-muted-foreground">
              If you have any questions about our privacy practices or would like
              to exercise your rights, please contact us:
            </p>
            <div className="space-y-2 text-sm text-foreground">
              <p>
                <strong>Email:</strong> privacy@tuabi.com
              </p>
              <p>
                <strong>Phone:</strong> +233 XX XXX XXXX
              </p>
              <p>
                <strong>Address:</strong> Accra, Ghana
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Last Updated */}
      <div className="text-center text-sm text-muted-foreground">
        <p>Last updated: {new Date().toLocaleDateString()}</p>
        <p>Version: 1.0.0</p>
      </div>
    </div>
  );
}
