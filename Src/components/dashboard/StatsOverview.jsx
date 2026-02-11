import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Target, TrendingUp, Globe, Zap, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { motion } from "framer-motion";

export default function StatsOverview({ projects }) {
  const activeProjects = projects.filter(p => p.status === 'launched').length;
  const totalBudget = projects.reduce((sum, p) => sum + (p.target_budget || 0), 0);
  const avgROI = projects.length > 0 ? 
    projects.reduce((sum, p) => sum + (p.roi_forecast || 0), 0) / projects.length : 0;
  const uniqueRegions = new Set();
  projects.forEach(p => {
    p.top_regions?.forEach(r => uniqueRegions.add(r.country));
  });

  const stats = [
    {
      title: "Active Launches",
      value: activeProjects.toString(),
      change: "+2 this week",
      trend: "up",
      icon: Target,
      gradient: "from-violet-500 to-purple-600",
      bgGradient: "from-violet-500/10 to-purple-600/10",
      iconBg: "bg-violet-500/20"
    },
    {
      title: "Total Budget",
      value: `$${(totalBudget / 1000).toFixed(0)}k`,
      change: "+12% allocated",
      trend: "up",
      icon: TrendingUp, 
      gradient: "from-emerald-500 to-teal-600",
      bgGradient: "from-emerald-500/10 to-teal-600/10",
      iconBg: "bg-emerald-500/20"
    },
    {
      title: "Avg ROI Forecast",
      value: projects.length > 0 ? `+${avgROI.toFixed(0)}%` : "0%",
      change: projects.length > 0 ? "Based on projections" : "No data yet",
      trend: projects.length > 0 ? "up" : "neutral",
      icon: Zap,
      gradient: "from-amber-500 to-orange-600",
      bgGradient: "from-amber-500/10 to-orange-600/10",
      iconBg: "bg-amber-500/20"
    },
    {
      title: "Markets Explored",
      value: uniqueRegions.size.toString(),
      change: "Active regions",
      trend: "neutral",
      icon: Globe,
      gradient: "from-blue-500 to-indigo-600",
      bgGradient: "from-blue-500/10 to-indigo-600/10",
      iconBg: "bg-blue-500/20"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {stats.map((stat, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1, duration: 0.4 }}
        >
          <Card className={`relative overflow-hidden border-0 shadow-2xl hover:shadow-xl transition-all duration-300 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm`}>
            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.gradient}`} />
            {/* Decorative gradient overlay */}
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.gradient} opacity-10 rounded-full -translate-y-1/2 translate-x-1/2`} />
            
            <CardContent className="p-5 md:p-6 relative">
              <div className="flex items-start justify-between mb-4">
                <div className={`${stat.iconBg} p-3 rounded-xl`}>
                  <stat.icon className="w-5 h-5 text-current" />
                </div>
                {stat.trend !== "neutral" && (
                  <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                    stat.trend === "up" 
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" 
                      : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                  }`}>
                    {stat.trend === "up" ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  </div>
                )}
              </div>
              
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">{stat.title}</p>
                <p className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-2">{stat.change}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}