import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  ExternalLink, 
  TrendingUp, 
  Calendar, 
  DollarSign, 
  Trash2, 
  MoreHorizontal,
  ChevronRight,
  Sparkles
} from "lucide-react";
import { format } from "date-fns";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Project } from "@/entities/Project";

const statusConfig = {
  idea: { 
    label: "Idea", 
    color: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    dot: "bg-blue-500"
  },
  mvp: { 
    label: "MVP", 
    color: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
    dot: "bg-indigo-500"
  },
  prototype: { 
    label: "Prototype", 
    color: "bg-purple-500/10 text-purple-600 border-purple-500/20",
    dot: "bg-purple-500"
  },
  product_ready: { 
    label: "Ready", 
    color: "bg-teal-500/10 text-teal-600 border-teal-500/20",
    dot: "bg-teal-500"
  },
  launched: { 
    label: "Launched", 
    color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    dot: "bg-emerald-500"
  },
  growth: { 
    label: "Growth", 
    color: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    dot: "bg-amber-500"
  },
  scaling: { 
    label: "Scaling", 
    color: "bg-slate-500/10 text-slate-600 border-slate-500/20",
    dot: "bg-slate-500"
  }
};

export default function ProjectCard({ project }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const updateStatus = async (v) => {
    await Project.update(project.id, { status: v });
    window.location.reload();
  };

  const remove = async () => {
    if (!confirm("Are you sure you want to delete this project?")) return;
    setIsDeleting(true);
    await Project.delete(project.id);
    window.location.reload();
  };

  const status = statusConfig[project.status] || statusConfig.idea;

  return (
    <div className={`group relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl p-5 md:p-6 border border-indigo-500/20 hover:border-indigo-500/40 hover:shadow-xl transition-all duration-300 ${isDeleting ? 'opacity-50' : ''}`}>
      {/* Status indicator line */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-t-2xl`} />
      
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-3">
            <h3 className="text-lg md:text-xl font-bold text-foreground truncate group-hover:text-primary transition-colors">
              {project.product_name}
            </h3>
            <Badge className={`${status.color} border text-xs font-medium shrink-0`}>
              <span className={`w-1.5 h-1.5 rounded-full ${status.dot} mr-1.5`} />
              {status.label}
            </Badge>
          </div>
          
          <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
            {project.description || "No description provided"}
          </p>
          
          <div className="flex flex-wrap gap-3 md:gap-4 text-sm">
            {project.target_budget > 0 && (
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <div className="p-1 rounded-md bg-emerald-500/10">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <span className="font-medium">${project.target_budget?.toLocaleString()}</span>
              </div>
            )}
            {project.launch_date && (
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <div className="p-1 rounded-md bg-blue-500/10">
                  <Calendar className="w-3.5 h-3.5 text-blue-600" />
                </div>
                <span>{format(new Date(project.launch_date), "MMM d, yyyy")}</span>
              </div>
            )}
            {project.roi_forecast > 0 && (
              <div className="flex items-center gap-1.5 text-emerald-600 font-medium">
                <div className="p-1 rounded-md bg-emerald-500/10">
                  <TrendingUp className="w-3.5 h-3.5" />
                </div>
                <span>+{project.roi_forecast}% ROI</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex flex-col gap-2 items-end shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem asChild>
                <Link to={createPageUrl(`ProjectView?project=${project.id}`)} className="flex items-center">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Details
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={remove} className="text-destructive focus:text-destructive">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Project
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Select value={project.status} onValueChange={updateStatus}>
            <SelectTrigger className="w-32 h-8 text-xs border-border/50 bg-secondary/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(statusConfig).map(([key, config]) => (
                <SelectItem key={key} value={key} className="text-xs">
                  <span className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${config.dot}`} />
                    {config.label}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Link to={createPageUrl(`ProjectView?project=${project.id}`)}>
            <Button size="sm" className="h-8 px-3 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-md hover:shadow-lg transition-shadow">
              Open
              <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </Link>
        </div>
      </div>
      
      {project.top_regions && project.top_regions.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border/50">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <h4 className="font-medium text-xs text-muted-foreground uppercase tracking-wide">Top Markets</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {project.top_regions.slice(0, 4).map((region, index) => (
              <Badge 
                key={index} 
                variant="secondary" 
                className="text-xs bg-secondary/80 hover:bg-secondary transition-colors"
              >
                {region.country}
                <span className="ml-1.5 text-primary font-semibold">{region.opportunity_score}</span>
              </Badge>
            ))}
            {project.top_regions.length > 4 && (
              <Badge variant="secondary" className="text-xs bg-secondary/50">
                +{project.top_regions.length - 4} more
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  );
}