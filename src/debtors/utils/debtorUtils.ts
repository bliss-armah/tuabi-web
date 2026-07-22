import type { Debtor } from "@/shared/types/debtor";

/**
 * Filter debtors based on search term
 */
export const filterDebtors = (debtors: Debtor[], searchTerm: string): Debtor[] => {
  if (!searchTerm.trim()) return debtors;

  const term = searchTerm.toLowerCase().trim();

  return debtors.filter(
    (debtor) =>
      debtor.name.toLowerCase().includes(term) ||
      debtor.phoneNumber?.toLowerCase().includes(term) ||
      debtor.description?.toLowerCase().includes(term)
  );
};

/**
 * Sort debtors by different criteria
 */
export const sortDebtors = (
  debtors: Debtor[],
  sortBy: "name" | "amount" | "date" = "name",
  order: "asc" | "desc" = "asc"
): Debtor[] => {
  const sorted = [...debtors].sort((a, b) => {
    switch (sortBy) {
      case "amount":
        return (a.amountOwed || 0) - (b.amountOwed || 0);
      case "date":
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case "name":
      default:
        return a.name.localeCompare(b.name);
    }
  });

  return order === "desc" ? sorted.reverse() : sorted;
};

/**
 * Format currency amount
 */
export const formatCurrency = (amount: number): string => {
  return `GH₵ ${amount.toLocaleString()}`;
};

/**
 * Format debtor phone number
 */
export const formatPhoneNumber = (phoneNumber: string): string => {
  // Basic formatting for Ghana phone numbers
  if (!phoneNumber) return "";

  // Remove all non-digits
  const digits = phoneNumber.replace(/\D/g, "");

  // Format as XXX XXX XXXX for 10-digit numbers
  if (digits.length === 10) {
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
  }

  // Return as is if not standard format
  return phoneNumber;
};

/**
 * Calculate total debt amount
 */
export const calculateTotalDebt = (debtors: Debtor[]): number => {
  return debtors.reduce((total, debtor) => total + (debtor.amountOwed || 0), 0);
};

/**
 * Get debtor statistics
 */
export const getDebtorStats = (debtors: Debtor[]) => {
  const total = debtors.length;
  const totalAmount = calculateTotalDebt(debtors);
  const averageAmount = total > 0 ? totalAmount / total : 0;
  const highestDebt = Math.max(...debtors.map(d => d.amountOwed || 0));
  const activeDebtors = debtors.filter(d => (d.amountOwed || 0) > 0).length;

  return {
    total,
    totalAmount,
    averageAmount,
    highestDebt,
    activeDebtors,
    settledDebtors: total - activeDebtors,
  };
};