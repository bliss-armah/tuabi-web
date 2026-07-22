import { Users, Phone, Banknote, Calendar } from "lucide-react";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Separator } from "@/shared/components/ui/separator";
import { cn } from "@/shared/utils/utils";
import type { Debtor } from "@/shared/types/debtor";

interface DebtorInfoCardProps {
  debtor: Debtor;
}

export default function DebtorInfoCard({ debtor }: DebtorInfoCardProps) {
  const infoItems = [
    {
      icon: Users,
      label: "Name",
      value: debtor.name,
      iconClass: "bg-primary/10 text-primary",
      valueClass: "text-foreground",
    },
    ...(debtor.phoneNumber
      ? [
          {
            icon: Phone,
            label: "Phone",
            value: debtor.phoneNumber,
            iconClass: "bg-muted text-muted-foreground",
            valueClass: "text-foreground",
          },
        ]
      : []),
    {
      icon: Banknote,
      label: "Amount Owed",
      value: `GH₵ ${debtor.amountOwed?.toLocaleString() || 0}`,
      iconClass: "bg-destructive/10 text-destructive",
      valueClass: "text-destructive",
    },
    {
      icon: Calendar,
      label: "Added",
      value: new Date(debtor.createdAt).toLocaleDateString(),
      iconClass: "bg-success/10 text-success",
      valueClass: "text-foreground",
    },
  ];

  return (
    <Card>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
          {infoItems.map((item, index) => (
            <div key={index} className="flex items-center gap-3">
              <div
                className={cn(
                  "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl",
                  item.iconClass
                )}
              >
                <item.icon className="h-6 w-6" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-muted-foreground">
                  {item.label}
                </p>
                <p
                  className={cn(
                    "truncate text-lg font-semibold",
                    item.valueClass
                  )}
                >
                  {item.value}
                </p>
              </div>
            </div>
          ))}
        </div>

        {debtor.description && (
          <>
            <Separator />
            <div>
              <p className="mb-2 text-sm font-medium text-muted-foreground">
                Description
              </p>
              <p className="leading-relaxed text-foreground">
                {debtor.description}
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
