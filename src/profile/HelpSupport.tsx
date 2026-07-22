import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  HelpCircle,
  MessageSquare,
  Mail,
  Phone,
  FileText,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Lightbulb,
} from "lucide-react";
import { cn } from "@/shared/utils/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Separator } from "@/shared/components/ui/separator";

interface FAQ {
  question: string;
  answer: string;
  category: string;
}

export default function HelpSupport() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  const filteredFAQs =
    selectedCategory === "All"
      ? faqs
      : faqs.filter((faq) => faq.category === selectedCategory);

  const toggleFAQ = (index: number) => {
    setExpandedFAQ(expandedFAQ === index ? null : index);
  };

  const contactItems = [
    {
      icon: Mail,
      tint: "bg-primary/10 text-primary",
      title: "Email Support",
      detail: "support@tuabi.com",
      sub: "Response within 24 hours",
    },
    {
      icon: Phone,
      tint: "bg-success/10 text-success",
      title: "Phone Support",
      detail: "+233 XX XXX XXXX",
      sub: "Mon-Fri, 8AM-6PM GMT",
    },
    {
      icon: MessageSquare,
      tint: "bg-warning/10 text-warning",
      title: "Live Chat",
      detail: "Available 24/7",
      sub: "Instant responses",
    },
    {
      icon: FileText,
      tint: "bg-secondary text-secondary-foreground",
      title: "Documentation",
      detail: "docs.tuabi.com",
      sub: "Complete guides & tutorials",
    },
  ];

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
          <h1 className="text-2xl font-bold tracking-tight">Help & Support</h1>
          <p className="text-sm text-muted-foreground">
            Get help and find answers to your questions
          </p>
        </div>
      </div>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">
            Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {contactItems.map((item) => (
              <div key={item.title} className="flex items-center gap-3">
                <div className={cn("rounded-lg p-2", item.tint)}>
                  <item.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium">{item.title}</p>
                  <p className="text-sm text-muted-foreground">{item.detail}</p>
                  <p className="text-xs text-muted-foreground">{item.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <CardTitle className="text-lg md:text-xl">
              Frequently Asked Questions
            </CardTitle>
            <div className="flex items-center gap-2 text-muted-foreground">
              <BookOpen className="h-5 w-5" />
              <span className="text-sm">{filteredFAQs.length} questions</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                size="sm"
                variant={selectedCategory === category ? "default" : "outline"}
                className="rounded-full"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>

          {/* FAQ List */}
          <div className="space-y-3">
            {filteredFAQs.map((faq, index) => {
              const isOpen = expandedFAQ === index;
              return (
                <div
                  key={index}
                  className="overflow-hidden rounded-xl border border-border"
                >
                  <button
                    onClick={() => toggleFAQ(index)}
                    className="flex w-full items-center justify-between gap-3 p-4 text-left transition-colors hover:bg-muted/50"
                    aria-expanded={isOpen}
                  >
                    <div className="flex items-start gap-3">
                      <HelpCircle className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                      <div>
                        <p className="font-medium">{faq.question}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {faq.category}
                        </p>
                      </div>
                    </div>
                    {isOpen ? (
                      <ChevronUp className="h-5 w-5 shrink-0 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-5 w-5 shrink-0 text-muted-foreground" />
                    )}
                  </button>

                  {isOpen && (
                    <>
                      <Separator />
                      <div className="bg-muted/50 px-4 pb-4">
                        <div className="flex items-start gap-3 pt-4">
                          <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
                          <p className="text-sm leading-relaxed text-muted-foreground">
                            {faq.answer}
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

const faqs: FAQ[] = [
  {
    question: "How do I add a new debtor?",
    answer:
      "Click the 'Add Debtor' button on the Dashboard or Debtors page. Fill in the debtor's name, phone number, amount owed, and optional description. Click 'Add Debtor' to save.",
    category: "Getting Started",
  },
  {
    question: "How do I record a payment?",
    answer:
      "Go to the Debtors page and click 'Add Payment' on any debtor card. Choose the action (Reduce/Add/Settled), enter the amount, add a note if needed, and click 'Update Payment'.",
    category: "Payments",
  },
  {
    question: "Can I edit debtor information?",
    answer:
      "Yes! Click the 'Edit' button on any debtor card or use the 'View Details' button to go to the debtor's detail page where you can edit their information.",
    category: "Managing Debtors",
  },
  {
    question: "How do I change my password?",
    answer:
      "Go to Profile → Account Settings → Security section and click 'Change Password'. Enter your current password, new password, and confirm it.",
    category: "Account",
  },
  {
    question: "What happens if I forget my password?",
    answer:
      "On the login page, click 'Forgot Password?' and follow the instructions to reset your password using your phone number.",
    category: "Account",
  },
  {
    question: "How do I view transaction history?",
    answer:
      "Click 'View Details' on any debtor to see their complete transaction history. You can also see recent transactions on the Dashboard.",
    category: "Reports",
  },
  {
    question: "Is my data secure?",
    answer:
      "Yes! We use industry-standard encryption, secure authentication, and never share your data with third parties. See our Privacy & Security page for details.",
    category: "Security",
  },
  {
    question: "Can I export my data?",
    answer:
      "Currently, data export is not available, but we're working on this feature. Contact support if you need your data exported.",
    category: "Data",
  },
  {
    question: "How do I delete my account?",
    answer:
      "Contact our support team to request account deletion. We'll guide you through the process and ensure all your data is properly removed.",
    category: "Account",
  },
  {
    question: "What payment methods are supported?",
    answer:
      "Currently, we support manual payment tracking. You can record cash payments, bank transfers, mobile money, or any other payment method you use.",
    category: "Payments",
  },
];

const categories = [
  "All",
  "Getting Started",
  "Payments",
  "Managing Debtors",
  "Account",
  "Reports",
  "Security",
  "Data",
];
