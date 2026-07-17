"use client";

import { Download } from "lucide-react";

export function FinanceCsvButton({
  csv,
  filename,
}: {
  csv: string;
  filename: string;
}) {
  const handleDownload = () => {
    const blob = new Blob(["\ufeff", csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <button
      type="button"
      onClick={handleDownload}
      className="inline-flex h-10 items-center gap-2 rounded-brand bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700"
    >
      <Download className="h-4 w-4" strokeWidth={2} aria-hidden />
      Exporter CSV
    </button>
  );
}
