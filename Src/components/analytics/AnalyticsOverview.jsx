import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Target, Eye, Zap, Users, Globe } from "lucide-react";

export default function AnalyticsOverview({ projects, creatives }) {
  const activeProjects = projects.filter(p => p.status === 'live').length;
  const totalCreatives = creatives.length;
  const highPerformers = creatives.filter(c => c.predicted_performance === 'high').length;
  const avgROI = projects.length > 0 ? 
    projects.reduce((sum, p) => sum + (p.roi_forecast || 0), 0) / projects.length : 0;
  
  // Count unique channels
  const uniqueChannels = new Set(creatives.map(c => c.channel)).size;
  
  // Count unique regions
  const uniqueRegions = new Set();
  projects.forEach(p => {
    p.top_regions?.forEach(r => uniqueRegions.add(r.country));
  });

  const metrics = [
    {
      title: "Active Campaigns",
      value: activeProjects.toString(),
      icon: Target,
      color: "text-blue-600",
      bg: "bg-blue-100",
      trend: "+12%"
    },
    {
      title: "Total Creatives",
      value: totalCreatives.toString(),
      icon: Eye,
      color: "text-purple-600",
      bg: "bg-purple-100",
      trend: "+8%"
    },
    {
      title: "High Performers",
      value: highPerformers.toString(),
      icon: TrendingUp,
      color: "text-green-600", 
      bg: "bg-green-100",
      trend: "+15%"
    },
    {
      title: "Avg ROI Forecast",
      value: `${avgROI.toFixed(0)}%`,
      icon: Zap,
      color: "text-orange-600",
      bg: "bg-orange-100",
      trend: "+5%"
    },
    {
      title: "Active Channels",
      value: uniqueChannels.toString(),
      icon: Users,
      color: "text-indigo-600",
      bg: "bg-indigo-100"
    },
    {
      title: "Markets",
      value: uniqueRegions.size.toString(),
      icon: Globe,
      color: "text-emerald-600",
      bg: "bg-emerald-100"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
      {metrics.map((metric, index) => (
        <Card key={index} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`${metric.bg} p-3 rounded-xl`}>
                <metric.icon className={`w-6 h-6 ${metric.color}`} />
              </div>
              {metric.trend && (
                <span className="text-green-600 text-sm font-medium">{metric.trend}</span>
              )}
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 mb-1">{metric.value}</p>
              <p className="text-sm text-slate-600">{metric.title}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}