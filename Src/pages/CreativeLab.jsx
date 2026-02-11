import React, { useState, useEffect } from "react";
import { Project } from "@/entities/Project";
import { Creative } from "@/entities/Creative";
import { InvokeLLM } from "@/integrations/Core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Palette, Sparkles, Loader2, Copy, Download } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import ProjectSelector from "../components/creative/ProjectSelector";
import CreativeGenerator from "../components/creative/CreativeGenerator";
import CreativeGallery from "../components/creative/CreativeGallery";

export default function CreativeLab() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [creatives, setCreatives] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      loadCreatives();
    }
  }, [selectedProject]);

  const loadProjects = async () => {
    const data = await Project.list("-created_date");
    setProjects(data);
    if (data.length > 0) {
      setSelectedProject(data[0]);
    }
  };

  const loadCreatives = async () => {
    if (selectedProject) {
      const data = await Creative.filter({ project_id: selectedProject.id });
      setCreatives(data);
    }
  };

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
            Creative Lab
          </h1>
          <p className="text-slate-600 text-lg">
            AI-powered ad creative generation and optimization
          </p>
        </div>

        {projects.length === 0 ? (
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Palette className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">No Projects Yet</h3>
              <p className="text-slate-600 mb-6">
                Create a product project first to start generating ad creatives
              </p>
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                Create Project
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {/* Project Selector */}
            <ProjectSelector 
              projects={projects}
              selectedProject={selectedProject}
              onSelectProject={setSelectedProject}
            />

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Generator */}
              <CreativeGenerator 
                project={selectedProject}
                onGenerate={loadCreatives}
                isGenerating={isGenerating}
                setIsGenerating={setIsGenerating}
              />

              {/* Gallery */}
              <CreativeGallery 
                creatives={creatives}
                isGenerating={isGenerating}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}