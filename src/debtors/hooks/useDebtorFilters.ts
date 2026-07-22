import { useState, useMemo } from "react";
import type { Debtor } from "@/shared/types/debtor";
import { filterDebtors, sortDebtors } from "@/debtors/utils/debtorUtils";

export const useDebtorFilters = (debtors: Debtor[] = []) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "amount" | "date">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const filteredAndSortedDebtors = useMemo(() => {
    const filtered = filterDebtors(debtors, searchTerm);
    return sortDebtors(filtered, sortBy, sortOrder);
  }, [debtors, searchTerm, sortBy, sortOrder]);

  const clearFilters = () => {
    setSearchTerm("");
    setSortBy("name");
    setSortOrder("asc");
  };

  return {
    searchTerm,
    setSearchTerm,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    filteredDebtors: filteredAndSortedDebtors,
    hasFilters: searchTerm.trim() !== "" || sortBy !== "name" || sortOrder !== "asc",
    clearFilters,
  };
};