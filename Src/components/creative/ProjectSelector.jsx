import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Package, Calendar, DollarSign } from "lucide-react";
import { format } from "date-fns";

const statusColors = {
  discovery: "bg-blue-100 text-blue-800",
  strategy: "bg-purple-100 text-purple-800", 
  live: "bg-green-100 text-green-800",
  analyzing: "bg-orange-100 text-orange-800",
  completed: "bg-gray-100 text-gray-800"
};

export default function ProjectSelector({ projects, selectedProject, onSelectProject }) {
  const handleProjectChange = (projectId) => {
    const project = projects.find(p => p.id === projectId);
    onSelectProject(project);
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-600" />
              Select Project
            </h3>
            <Select 
              value={selectedProject?.id || ""} 
              onValueChange={handleProjectChange}
            >
              <SelectTrigger className="border-slate-200 focus:border-blue-500">
                <SelectValue placeholder="Choose a project to create ads for" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    <div className="flex items-center gap-2">
                      <span>{project.product_name}</span>
                      <Badge className={`${statusColors[project.status]} text-xs`}>
                        {project.status}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedProject && (
            <div className="flex-1 bg-slate-50 rounded-lg p-4">
              <h4 className="font-medium text-slate-900 mb-2">{selectedProject.product_name}</h4>
              <p className="text-sm text-slate-600 mb-3">{selectedProject.description}</p>
              
              <div className="flex flex-wrap gap-3 text-xs">
                <div className="flex items-center gap-1 text-slate-500">
                  <DollarSign className="w-3 h-3" />
                  ${selectedProject.target_budget?.toLocaleString() || "N/A"}
                </div>
                {selectedProject.launch_date && (
                  <div className="flex items-center gap-1 text-slate-500">
                    <Calendar className="w-3 h-3" />
                    {format(new Date(selectedProject.launch_date), "MMM d")}
                  </div>
                )}
                <Badge className={`${statusColors[selectedProject.status]} text-xs`}>
                  {selectedProject.status}
                </Badge>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}