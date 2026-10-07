const TOOL_LABELS: Record<string, string> = {
  getOverview: "Checking your totals",
  findDebtors: "Searching debtors",
  getDebtorDetails: "Opening debtor details",
  getOverdueDebts: "Looking up overdue debts",
  getCollectionForecast: "Forecasting collections",
  getRiskAlerts: "Checking risk alerts",
  getReminders: "Looking up reminders",
  getPaymentActivity: "Adding up payments",
  getStaleDebtors: "Finding debtors who haven't paid",
  getDebtAging: "Checking how old your debts are",
  getRecentActivity: "Checking recent activity",
  getPaymentPattern: "Looking at payment habits",
};

export const toolLabel = (toolName: string) =>
  TOOL_LABELS[toolName] ?? "Looking things up";
