import React, { useState, useEffect } from "react";
import { Project } from "@/entities/Project";
import { Creative } from "@/entities/Creative";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, Eye, Target, Zap } from "lucide-react";

import AnalyticsOverview from "../components/analytics/AnalyticsOverview";
import PerformanceCharts from "../components/analytics/PerformanceCharts";
import AIInsights from "../components/analytics/AIInsights";

export default function Analytics() {
  const [projects, setProjects] = useState([]);
  const [creatives, setCreatives] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    const [projectsData, creativesData] = await Promise.all([
      Project.list("-created_date"),
      Creative.list("-created_date")
    ]);
    setProjects(projectsData);
    setCreatives(creativesData);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
            Analytics Dashboard
          </h1>
          <p className="text-slate-600 text-lg">
            Real-time insights and AI-powered performance analysis
          </p>
        </div>

        {projects.length === 0 ? (
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">No Data Available</h3>
              <p className="text-slate-600 mb-6">
                Create projects and launch campaigns to see performance analytics
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {/* Overview Stats */}
            <AnalyticsOverview projects={projects} creatives={creatives} />

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Performance Charts */}
              <div className="lg:col-span-2">
                <PerformanceCharts projects={projects} creatives={creatives} />
              </div>

              {/* AI Insights */}
              <div>
                <AIInsights projects={projects} creatives={creatives} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}