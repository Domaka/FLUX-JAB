import React from "react";
import { Button } from "@/components/ui/button";

export default function ReadMore({ text = "", maxChars = 160, className = "" }) {
  const [expanded, setExpanded] = React.useState(false);
  if (!text) return null;
  const isLong = text.length > maxChars;
  const display = expanded || !isLong ? text : text.slice(0, maxChars) + "…";
  return (
    <div className={className}>
      <div className="whitespace-pre-wrap text-sm text-slate-700">{display}</div>
      {isLong && (
        <Button variant="ghost" size="sm" onClick={() => setExpanded(v => !v)} className="mt-1 px-0">
          {expanded ? "Show Less" : "Read More"}
        </Button>
      )}
    </div>
  );
}