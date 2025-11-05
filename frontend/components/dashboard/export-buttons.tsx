"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { downloadAuthenticatedFile } from "@/lib/download";

interface ExportButtonsProps {
  startDate: string;
  endDate: string;
}

export function ExportButtons({ startDate, endDate }: ExportButtonsProps) {
  const [isExportingSales, setIsExportingSales] = useState(false);
  const [isExportingInventory, setIsExportingInventory] = useState(false);

  const periodSlug = startDate === endDate ? startDate : `${startDate}_to_${endDate}`;

  const handleExportSales = async () => {
    setIsExportingSales(true);
    try {
      const path = `/admin/reports/sales/export?start_date=${startDate}&end_date=${endDate}&format=csv`;
      await downloadAuthenticatedFile(path, `sales-report_${periodSlug}.csv`);
    } catch (error) {
      console.error("Failed to export sales report:", error);
      alert(error instanceof Error ? error.message : "Failed to download sales report. Please try again.");
    } finally {
      setIsExportingSales(false);
    }
  };

  const handleExportInventory = async () => {
    setIsExportingInventory(true);
    try {
      const path = `/admin/reports/inventory/export?format=csv`;
      await downloadAuthenticatedFile(path, `inventory-report_${endDate}.csv`);
    } catch (error) {
      console.error("Failed to export inventory report:", error);
      alert(error instanceof Error ? error.message : "Failed to download inventory report. Please try again.");
    } finally {
      setIsExportingInventory(false);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        size="sm"
        variant="outline"
        className="border-slate-300 text-slate-900"
        onClick={handleExportSales}
        disabled={isExportingSales}
      >
        <Download className="mr-2 h-4 w-4" />
        {isExportingSales ? "Exporting..." : "Export sales (CSV)"}
      </Button>
      <Button
        size="sm"
        variant="outline"
        className="border-slate-300 text-slate-900"
        onClick={handleExportInventory}
        disabled={isExportingInventory}
      >
        <Download className="mr-2 h-4 w-4" />
        {isExportingInventory ? "Exporting..." : "Export inventory (CSV)"}
      </Button>
    </div>
  );
}
