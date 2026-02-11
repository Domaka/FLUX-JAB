import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Clock, ArrowRight, CheckCircle2, AlertCircle, Rocket } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

export default function RecentActivity({ projects }) {
  const activities = React.useMemo(() => {
    const items = [];
    
    projects.forEach(project => {
      items.push({
        id: `created-${project.id}`,
        type: 'created',
        project: project.product_name,
        date: new Date(project.created_date),
        icon: Rocket,
        color: 'text-blue-500',
        bgColor: 'bg-blue-500/10'
      });
      
      if (project.status === 'launched') {
        items.push({
          id: `launched-${project.id}`,
          type: 'launched',
          project: project.product_name,
          date: project.launch_date ? new Date(project.launch_date) : new Date(project.updated_date),
          icon: CheckCircle2,
          color: 'text-emerald-500',
          bgColor: 'bg-emerald-500/10'
        });
      }
      
      if (project.updated_date !== project.created_date) {
        items.push({
          id: `updated-${project.id}`,
          type: 'updated',
          project: project.product_name,
          date: new Date(project.updated_date),
          icon: Activity,
          color: 'text-amber-500',
          bgColor: 'bg-amber-500/10'
        });
      }
    });
    
    return items
      .sort((a, b) => b.date - a.date)
      .slice(0, 6);
  }, [projects]);

  const getActivityText = (activity) => {
    switch (activity.type) {
      case 'created':
        return 'Project created';
      case 'launched':
        return 'Successfully launched';
      case 'updated':
        return 'Project updated';
      default:
        return 'Activity';
    }
  };

  return (
    <Card className="border-0 shadow-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500" />
      <CardHeader className="border-b border-border/50 pb-4">
        <CardTitle className="text-lg font-bold text-foreground flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <span className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">Recent Activity</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        {activities.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-secondary/80 flex items-center justify-center">
              <Clock className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">No recent activity</p>
            <p className="text-xs text-muted-foreground/70 mt-1">Create a project to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activities.map((activity, index) => {
              const Icon = activity.icon;
              return (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group flex items-start gap-3 p-3 rounded-xl hover:bg-secondary/50 transition-colors cursor-pointer"
                >
                  <div className={`p-2 rounded-lg ${activity.bgColor} shrink-0`}>
                    <Icon className={`w-4 h-4 ${activity.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {activity.project}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {getActivityText(activity)}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(activity.date, { addSuffix: true })}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}