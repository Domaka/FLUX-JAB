import React, { useState, useEffect } from "react";
import { Project } from "@/entities/Project";
import { User } from "@/entities/User";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  Plus, 
  Target, 
  Globe, 
  Sparkles, 
  Zap,
  ArrowRight,
  Rocket,
  TrendingUp,
  Play
} from "lucide-react";
import { motion } from "framer-motion";

import ProjectCard from "../components/dashboard/ProjectCard";
import StatsOverview from "../components/dashboard/StatsOverview";
import RecentActivity from "../components/dashboard/RecentActivity";

const base44 = { entities: { Project } };

export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [me, setMe] = useState(null);

  useEffect(() => {
    (async () => {
      try { 
        const u = await User.me(); 
        setMe(u || null); 
      } catch (error) {
        console.error("Failed to load user:", error);
        setMe(null);
      }
      await loadProjects();
    })();
  }, []);

  const loadProjects = async () => {
    setIsLoading(true);
    const data = await Project.list("-created_date");
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let needsRefresh = false;
    for (const p of data) {
      if (p.launch_date) {
        const launchDate = new Date(p.launch_date);
        launchDate.setHours(0, 0, 0, 0);
        if (launchDate < today && p.status !== "launched") {
          await Project.update(p.id, { status: "launched" });
          needsRefresh = true;
        }
      }
    }
    const finalProjects = needsRefresh ? await Project.list("-created_date") : data;
    setProjects(finalProjects);
    setIsLoading(false);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-purple-950 dark:to-slate-900">
      <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4"
        >
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 mb-4">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">Command Center</span>
            </div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2">
              {getGreeting()}, <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">{me?.full_name?.split(' ')[0] || 'there'}</span>
            </h1>
            <p className="text-muted-foreground text-base md:text-lg">
              Your AI-powered launch command center
            </p>
          </div>
          <Link to={createPageUrl("ProductBuilder")}>
            <Button className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-5 py-2.5 h-auto">
              <Plus className="w-5 h-5 mr-2" />
              New Launch
            </Button>
          </Link>
        </motion.div>

        {/* Pricing warning */}
        {projects.some(p => p.status === "launched" && !p.pricing_info) && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-700 dark:text-amber-400 flex items-center gap-3"
          >
            <div className="p-2 bg-amber-500/20 rounded-lg">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <p className="font-medium">Action Required</p>
              <p className="text-sm opacity-80">One or more launched projects are missing pricing information.</p>
            </div>
          </motion.div>
        )}

        {/* Stats Overview */}
        <StatsOverview projects={projects} />

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Projects List */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
              <CardHeader className="border-b border-border/50 pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg md:text-xl font-bold text-foreground flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 shadow-lg">
                      <Target className="w-5 h-5 text-white" />
                    </div>
                    <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Active Projects</span>
                  </CardTitle>
                  <Badge className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-indigo-600 border border-indigo-500/30">
                    {projects.length} total
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-4 md:p-6">
                {isLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-shimmer h-32 rounded-xl" />
                    ))}
                  </div>
                ) : projects.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-12"
                  >
                    <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-3xl flex items-center justify-center shadow-2xl">
                      <Rocket className="w-12 h-12 text-white" />
                    </div>
                    <h3 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">Ready to Launch?</h3>
                    <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                      Create your first project to unlock AI-powered market insights and launch tools
                    </p>
                    <Link to={createPageUrl("ProductBuilder")}>
                      <Button className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white shadow-lg">
                        <Sparkles className="w-4 h-4 mr-2" />
                        Create Your First Project
                      </Button>
                    </Link>
                  </motion.div>
                ) : (
                  <div className="space-y-4">
                    {projects.map((project, index) => (
                      <motion.div
                        key={project.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <ProjectCard project={project} />
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <RecentActivity projects={projects} />
            
            {/* Quick Actions */}
            <Card className="border-0 shadow-2xl overflow-hidden bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-5">
                  <div className="p-2 rounded-xl bg-white/20">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Quick Actions</h3>
                </div>
                <div className="space-y-3">
                  {[
                    { label: "Run Project", icon: Play, page: "ProductBuilder" },
                    { label: "Explore Markets", icon: Globe, page: "MarketFinder" },
                    { label: "Generate Ads", icon: Sparkles, page: "CreativeMessaging" },
                    { label: "View Analytics", icon: TrendingUp, page: "AnalyticsForecasting" },
                  ].map((action, i) => (
                    <Link key={i} to={createPageUrl(action.page)} className="block">
                      <Button 
                        variant="secondary" 
                        className="w-full justify-between bg-white/15 hover:bg-white/25 text-white border-0 h-11"
                      >
                        <span className="flex items-center gap-2">
                          <action.icon className="w-4 h-4" />
                          {action.label}
                        </span>
                        <ArrowRight className="w-4 h-4 opacity-60" />
                      </Button>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}