import React from "react";
import { cn } from "@/shared/utils/utils";
import { Card } from "@/shared/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";

interface Column {
  key: string;
  label: string;
  align?: "left" | "center" | "right";
  render?: (value: any, row: any) => React.ReactNode;
}

interface DataTableProps {
  columns: Column[];
  data: any[];
  emptyMessage?: string;
  emptyIcon?: React.ReactNode;
}

const alignClass = (align?: Column["align"]) =>
  align === "center"
    ? "text-center"
    : align === "right"
      ? "text-right"
      : "text-left";

export default function DataTable({
  columns,
  data,
  emptyMessage = "No data available",
  emptyIcon,
}: DataTableProps) {
  if (!data || data.length === 0) {
    return (
      <Card className="flex flex-col items-center justify-center gap-3 py-12 text-center">
        {emptyIcon}
        <h3 className="text-base font-medium text-muted-foreground">
          {emptyMessage}
        </h3>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden p-0">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead
                  key={column.key}
                  className={cn("whitespace-nowrap", alignClass(column.align))}
                >
                  {column.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, index) => (
              <TableRow key={row.id ?? index}>
                {columns.map((column) => (
                  <TableCell
                    key={column.key}
                    className={alignClass(column.align)}
                  >
                    {column.render
                      ? column.render(row[column.key], row)
                      : row[column.key]}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
