import { Receipt, Clock } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";

interface TabNavigationProps {
  activeTab: "transactions" | "reminders";
  onTabChange: (tab: "transactions" | "reminders") => void;
}

export default function TabNavigation({
  activeTab,
  onTabChange,
}: TabNavigationProps) {
  return (
    <Tabs
      value={activeTab}
      onValueChange={(value) =>
        onTabChange(value as "transactions" | "reminders")
      }
    >
      <TabsList>
        <TabsTrigger value="transactions">
          <Receipt className="h-4 w-4" />
          <span className="hidden sm:inline">Transaction History</span>
          <span className="sm:hidden">History</span>
        </TabsTrigger>
        <TabsTrigger value="reminders">
          <Clock className="h-4 w-4" />
          <span>Reminders</span>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
