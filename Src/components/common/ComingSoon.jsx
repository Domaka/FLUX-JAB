import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

export default function ComingSoon({ title, note }) {
  return (
    <Card className="bg-white/70 backdrop-blur-sm border-0 shadow">
      <CardContent className="p-8 text-center">
        <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full flex items-center justify-center">
          <Sparkles className="w-6 h-6 text-indigo-600" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-1">{title}</h3>
        <p className="text-slate-600 text-sm">{note || "This tool will be available soon."}</p>
      </CardContent>
    </Card>
  );
}