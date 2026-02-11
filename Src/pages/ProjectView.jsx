import React, { useEffect, useState } from "react";
import { Project } from "@/entities/Project";
import { Report } from "@/entities/Report";
import { SavedItem } from "@/entities/SavedItem";
import { Creative } from "@/entities/Creative";
import { ChecklistTask } from "@/entities/ChecklistTask";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "react-router-dom";
import { format } from "date-fns";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import {
  FileText,
  Users,
  Globe,
  TrendingUp,
  CheckCircle2,
  Download,
  Share2,
  RefreshCw,
  Sparkles,
  Target,
  AlertCircle,
  Trash2,
  Copy,
  ExternalLink
} from "lucide-react";

export default function ProjectView() {
  const [project, setProject] = useState(null);
  const [report, setReport] = useState(null);
  const [items, setItems] = useState([]);
  const [creatives, setCreatives] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");
  const location = useLocation();
  const urlParams = new URLSearchParams(location.search);
  const projectId = urlParams.get("project");

  useEffect(() => {
    loadData();
  }, [projectId]);

  const loadData = async () => {
    if (!projectId) return;
    const projects = await Project.list();
    const p = projects.find(x => x.id === projectId) || null;
    setProject(p);
    
    const reports = await Report.filter({ project_id: projectId });
    setReport(reports[0] || null);
    
    setItems(await SavedItem.filter({ project_id: projectId }));
    setCreatives(await Creative.filter({ project_id: projectId }));
    setTasks(await ChecklistTask.filter({ project_id: projectId }));
  };

  const exportToJSON = () => {
    const data = {
      project,
      report: report?.content_json,
      items,
      creatives,
      tasks
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project?.product_name || 'project'}-export.json`;
    a.click();
  };

  const exportToCSV = () => {
    // Export markets as CSV
    const markets = project?.top_regions || [];
    const csv = [
      ['Country', 'Opportunity Score', 'Audience Size', 'Estimated CPM'].join(','),
      ...markets.map(m => [m.country, m.opportunity_score, m.audience_size, m.estimated_cpm].join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project?.product_name || 'project'}-markets.csv`;
    a.click();
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  if (!project) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading project...</p>
        </div>
      </div>
    );
  }

  const statusColors = {
    idea: "bg-blue-500/10 text-blue-600",
    mvp: "bg-indigo-500/10 text-indigo-600",
    prototype: "bg-purple-500/10 text-purple-600",
    product_ready: "bg-teal-500/10 text-teal-600",
    launched: "bg-emerald-500/10 text-emerald-600",
    growth: "bg-amber-500/10 text-amber-600",
    scaling: "bg-slate-500/10 text-slate-600"
  };

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-0 shadow-xl flux-glass">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                      {project.product_name}
                    </h1>
                    <Badge className={statusColors[project.status]}>
                      {project.status}
                    </Badge>
                    {project.product_type && (
                      <Badge variant="secondary">{project.product_type}</Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground mb-3">{project.description}</p>
                  
                  <div className="flex flex-wrap gap-4 text-sm">
                    {project.launch_date && (
                      <span className="text-muted-foreground">
                        Launch: {format(new Date(project.launch_date), "MMM d, yyyy")}
                      </span>
                    )}
                    {project.target_budget > 0 && (
                      <span className="text-muted-foreground">
                        Budget: ${project.target_budget.toLocaleString()}
                      </span>
                    )}
                    {project.persona_fit_score > 0 && (
                      <span className="text-primary font-medium">
                        Fit Score: {project.persona_fit_score}/100
                      </span>
                    )}
                    {project.roi_forecast > 0 && (
                      <span className="text-emerald-600 font-medium">
                        ROI: +{project.roi_forecast}%
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={exportToJSON}>
                    <Download className="w-4 h-4 mr-1" /> JSON
                  </Button>
                  <Button variant="outline" size="sm" onClick={exportToCSV}>
                    <Download className="w-4 h-4 mr-1" /> CSV
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => window.print()}>
                    <FileText className="w-4 h-4 mr-1" /> PDF
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-secondary/50 p-1 rounded-xl">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="personas">Personas</TabsTrigger>
            <TabsTrigger value="markets">Markets</TabsTrigger>
            <TabsTrigger value="roadmap">Roadmap</TabsTrigger>
            <TabsTrigger value="assets">Assets</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 mt-6">
            {/* Executive Summary */}
            {project.executive_summary && (
              <Card className="border-0 shadow-xl flux-glass">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    Executive Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground whitespace-pre-line">{project.executive_summary}</p>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="mt-4"
                    onClick={() => copyToClipboard(project.executive_summary)}
                  >
                    <Copy className="w-4 h-4 mr-1" /> Copy
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Value Props */}
            {project.value_props?.length > 0 && (
              <Card className="border-0 shadow-xl flux-glass">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary" />
                    Value Propositions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    {project.value_props.map((prop, i) => (
                      <div key={i} className="p-4 bg-secondary/50 rounded-xl">
                        <div className="w-8 h-8 flux-gradient rounded-lg flex items-center justify-center text-white font-bold mb-3">
                          {i + 1}
                        </div>
                        <p className="text-foreground">{prop}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Survey Kit */}
            {project.survey_kit?.length > 0 && (
              <Card className="border-0 shadow-xl flux-glass">
                <CardHeader>
                  <CardTitle>Survey Kit</CardTitle>
                </CardHeader>
                <CardContent>
                  <ol className="list-decimal pl-5 space-y-2">
                    {project.survey_kit.map((q, i) => (
                      <li key={i} className="text-foreground">{q}</li>
                    ))}
                  </ol>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="mt-4"
                    onClick={() => copyToClipboard(project.survey_kit.join('\n'))}
                  >
                    <Copy className="w-4 h-4 mr-1" /> Copy All
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Feature Confusion */}
            {project.feature_confusion?.length > 0 && (
              <Card className="border-0 shadow-xl flux-glass">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-amber-500" />
                    Feature Confusion Detector
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {project.feature_confusion.map((item, i) => (
                      <div key={i} className="p-4 bg-secondary/50 rounded-xl">
                        <p className="font-medium text-foreground mb-1">{item.feature}</p>
                        <p className="text-sm text-destructive mb-2">Issue: {item.issue}</p>
                        <p className="text-sm text-emerald-600">Simplified: {item.simplified}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Personas Tab */}
          <TabsContent value="personas" className="mt-6">
            <Card className="border-0 shadow-xl flux-glass">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    Buyer Personas
                  </CardTitle>
                  {project.persona_fit_score > 0 && (
                    <Badge className="bg-primary/10 text-primary">
                      Overall Fit: {project.persona_fit_score}/100
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {project.personas?.length > 0 ? (
                  <div className="grid md:grid-cols-3 gap-4">
                    {project.personas.map((persona, i) => (
                      <div key={i} className="p-5 bg-secondary/50 rounded-xl">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-bold text-foreground text-lg">{persona.name}</h3>
                          <Badge variant="secondary">Fit: {persona.fit_score}</Badge>
                        </div>
                        <div className="space-y-2 text-sm">
                          <p className="text-muted-foreground">{persona.demographics}</p>
                          <div className="pt-2 border-t border-border/50">
                            <p className="font-medium text-foreground mb-1">Pain Points:</p>
                            <p className="text-muted-foreground">{persona.pain_points}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">No personas generated yet. Run the project analysis to create personas.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Markets Tab */}
          <TabsContent value="markets" className="mt-6">
            <Card className="border-0 shadow-xl flux-glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-primary" />
                  Market Opportunities
                </CardTitle>
              </CardHeader>
              <CardContent>
                {project.top_regions?.length > 0 ? (
                  <div className="space-y-3">
                    {project.top_regions.map((market, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-secondary/50 rounded-xl">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 flux-gradient rounded-lg flex items-center justify-center text-white font-bold">
                            {i + 1}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{market.country}</p>
                            <p className="text-sm text-muted-foreground">
                              Audience: {market.audience_size} • CPM: ${market.estimated_cpm}
                            </p>
                          </div>
                        </div>
                        <Badge className={`text-lg px-3 py-1 ${
                          market.opportunity_score >= 80 ? 'bg-emerald-500/10 text-emerald-600' :
                          market.opportunity_score >= 60 ? 'bg-amber-500/10 text-amber-600' :
                          'bg-slate-500/10 text-slate-600'
                        }`}>
                          {market.opportunity_score}/100
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">No market data yet. Run the project analysis to discover opportunities.</p>
                )}
              </CardContent>
            </Card>

            {/* Keywords & Competitors */}
            <div className="grid md:grid-cols-2 gap-6 mt-6">
              {project.keywords?.length > 0 && (
                <Card className="border-0 shadow-xl flux-glass">
                  <CardHeader>
                    <CardTitle>Keywords</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {project.keywords.map((kw, i) => (
                        <Badge key={i} variant="secondary">{kw}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {project.competitors?.length > 0 && (
                <Card className="border-0 shadow-xl flux-glass">
                  <CardHeader>
                    <CardTitle>Competitors</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {project.competitors.map((comp, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                          <span className="font-medium text-foreground">{comp.name}</span>
                          <span className="text-sm text-muted-foreground">{comp.position}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Roadmap Tab */}
          <TabsContent value="roadmap" className="mt-6">
            <Card className="border-0 shadow-xl flux-glass">
              <CardHeader>
                <CardTitle>Launch Roadmap</CardTitle>
              </CardHeader>
              <CardContent>
                {tasks.length > 0 ? (
                  <div className="grid md:grid-cols-3 gap-4">
                    {['pre_launch', 'launch', 'post_launch'].map(phase => (
                      <div key={phase} className="p-4 bg-secondary/50 rounded-xl">
                        <h3 className="font-bold text-foreground mb-3 capitalize">
                          {phase.replace('_', '-')}
                        </h3>
                        <div className="space-y-2">
                          {tasks.filter(t => t.phase === phase).map(task => (
                            <div key={task.id} className={`p-3 bg-card rounded-lg border border-border/50 ${task.status === 'done' ? 'opacity-60' : ''}`}>
                              <div className="flex items-center gap-2">
                                {task.status === 'done' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                                <span className={task.status === 'done' ? 'line-through text-muted-foreground' : 'text-foreground'}>
                                  {task.title}
                                </span>
                              </div>
                            </div>
                          ))}
                          {tasks.filter(t => t.phase === phase).length === 0 && (
                            <p className="text-sm text-muted-foreground">No tasks</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">No roadmap tasks yet. Go to Planning & Readiness to generate a roadmap.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Assets Tab */}
          <TabsContent value="assets" className="space-y-6 mt-6">
            {/* Creatives */}
            <Card className="border-0 shadow-xl flux-glass">
              <CardHeader>
                <CardTitle>Creatives</CardTitle>
              </CardHeader>
              <CardContent>
                {creatives.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-4">
                    {creatives.map(c => (
                      <div key={c.id} className="p-4 bg-secondary/50 rounded-xl">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary">{c.channel}</Badge>
                          <Badge variant="outline">{c.format}</Badge>
                        </div>
                        <p className="font-medium text-foreground">{c.headline}</p>
                        <p className="text-sm text-muted-foreground mt-1">{c.body_copy}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">No creatives saved. Go to Creative & Messaging to generate content.</p>
                )}
              </CardContent>
            </Card>

            {/* Saved Items */}
            <Card className="border-0 shadow-xl flux-glass">
              <CardHeader>
                <CardTitle>Saved Items</CardTitle>
              </CardHeader>
              <CardContent>
                {items.length > 0 ? (
                  <div className="space-y-3">
                    {items.map(item => (
                      <div key={item.id} className="p-4 bg-secondary/50 rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">{item.tab_name}</Badge>
                            <span className="font-medium text-foreground">{item.title}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(item.created_date), "MMM d, h:mm a")}
                          </span>
                        </div>
                        {item.content_text && (
                          <p className="text-sm text-muted-foreground line-clamp-2">{item.content_text}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">No saved items yet.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}