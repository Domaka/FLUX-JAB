import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Copy, Check, FileJson, FileSpreadsheet, FileText } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function ExportButtons({ data, fileName = "export", className = "" }) {
  const [copied, setCopied] = useState(false);

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    triggerDownload(url, `${fileName}.json`);
  };

  const exportCSV = () => {
    let rows = [];
    
    if (Array.isArray(data)) {
      rows = data;
    } else if (data?.rows) {
      rows = data.rows;
    } else if (data?.markets) {
      rows = data.markets;
    } else if (typeof data === 'object') {
      // Convert object to single row
      rows = [data];
    }
    
    if (!rows || rows.length === 0) {
      alert("No data to export as CSV");
      return;
    }
    
    const headers = Object.keys(rows[0]);
    const csv = [
      headers.join(","), 
      ...rows.map(r => headers.map(h => {
        const val = r[h];
        if (val === null || val === undefined) return "";
        if (typeof val === 'object') return JSON.stringify(val);
        return JSON.stringify(String(val));
      }).join(","))
    ].join("\n");
    
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    triggerDownload(url, `${fileName}.csv`);
  };

  const triggerDownload = (url, name) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const exportPDF = () => {
    // Trigger print dialog for PDF
    window.print();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className={className}>
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem onClick={exportJSON}>
          <FileJson className="w-4 h-4 mr-2" />
          JSON
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportCSV}>
          <FileSpreadsheet className="w-4 h-4 mr-2" />
          CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportPDF}>
          <FileText className="w-4 h-4 mr-2" />
          PDF (Print)
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={copyToClipboard}>
          {copied ? <Check className="w-4 h-4 mr-2 text-emerald-500" /> : <Copy className="w-4 h-4 mr-2" />}
          {copied ? "Copied!" : "Copy JSON"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}