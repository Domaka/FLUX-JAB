import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { BarChart3, ArrowUpRight } from "lucide-react";

const getScoreColor = (score) => {
  if (score >= 80) return "bg-green-100 text-green-800 border-green-200";
  if (score >= 60) return "bg-yellow-100 text-yellow-800 border-yellow-200";
  return "bg-red-100 text-red-800 border-red-200";
};

export default function MarketTable({ project }) {
  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
      <CardHeader className="border-b border-slate-100 pb-4">
        <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-600" />
          Market Analysis Data
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {project.top_regions && project.top_regions.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="font-semibold">Country</TableHead>
                  <TableHead className="font-semibold">Opportunity Score</TableHead>
                  <TableHead className="font-semibold">Audience Size</TableHead>
                  <TableHead className="font-semibold">Est. CPM</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {project.top_regions.map((region, index) => (
                  <TableRow key={index} className="hover:bg-slate-50 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {index + 1}
                        </div>
                        <span className="font-medium">{region.country}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${getScoreColor(region.opportunity_score)} border font-medium`}>
                        {region.opportunity_score}/100
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <span>{region.audience_size}</span>
                        <ArrowUpRight className="w-3 h-3 text-green-600" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-sm">${region.estimated_cpm}</span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-6 h-6 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No Market Data Available</h3>
            <p className="text-slate-600">
              This project doesn't have market analysis data yet. 
              Try enriching it in the Product Builder.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}