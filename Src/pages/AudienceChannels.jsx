import React, { useEffect, useState } from "react";
import { Project } from "@/entities/Project";
import { base44 } from "@/api/base44Client";
import ToolShell from "../components/common/ToolShell";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Users, Radio, Clock, Target, TrendingUp } from "lucide-react";

export default function AudienceChannels() {
  const [projects, setProjects] = useState([]);
  const [active, setActive] = useState("personas");

  useEffect(() => {
    Project.list("-created_date").then(setProjects);
    const urlParams = new URLSearchParams(window.location.search);
    const t = urlParams.get("tool");
    if (t) setActive(t);
  }, []);

  const getProjectDescription = (projectId) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return "";
    return project.document_content || project.description || `${project.product_name}: ${project.category || 'product'}`;
  };

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-purple-950 dark:to-slate-900">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 mb-4">
            <Users className="w-4 h-4 text-indigo-500" />
            <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">Audience Intelligence</span>
          </div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Audience & Channels
          </h1>
          <p className="text-muted-foreground">Build personas and discover optimal marketing channels</p>
        </motion.div>
        
        <Tabs value={active} onValueChange={setActive} className="space-y-6">
          <TabsList className="flex flex-wrap gap-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-indigo-500/20 p-1 rounded-xl shadow-lg">
            <TabsTrigger value="personas" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">
              <Users className="w-4 h-4 mr-2" />
              Persona Builder
            </TabsTrigger>
            <TabsTrigger value="channels" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">
              <Radio className="w-4 h-4 mr-2" />
              Channel Recommender
            </TabsTrigger>
          </TabsList>

          <TabsContent value="personas">
            <ToolShell
              title="Persona Builder"
              description="Select your product to generate detailed buyer personas with demographics, interests, and behaviors."
              category="audience"
              toolKey="persona_builder"
              projectOptions={projects}
              fields={[
                { name: "regions", label: "Target Regions (comma-separated)", type: "text", placeholder: "US, DACH, SEA" }
              ]}
              onRun={async (values, projectId, userProfile, regenCount) => {
                const productContext = getProjectDescription(projectId);
                const res = await base44.integrations.Core.InvokeLLM({
                  prompt: `SYSTEM: You are Flux Persona Builder. Create detailed buyer personas based on the product.

PRODUCT: ${productContext}
TARGET REGIONS: ${values.regions || 'Global'}

Generate 3-4 detailed personas with:
- name: persona name/title
- demographics: age, location, income, job title
- interests: hobbies, media consumption, values
- problems: pain points the product solves
- channels: where they spend time online
- time_of_day: best times to reach them
- buying_triggers: what motivates purchase decisions

Return JSON.`,
                  add_context_from_internet: true,
                  response_json_schema: {
                    type: "object",
                    properties: {
                      personas: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            name: { type: "string" },
                            demographics: { type: "string" },
                            interests: { type: "string" },
                            problems: { type: "string" },
                            channels: { type: "string" },
                            time_of_day: { type: "string" },
                            buying_triggers: { type: "string" }
                          }
                        }
                      },
                      notes: { type: "string" }
                    }
                  }
                });
                return res;
              }}
              renderResult={(data) => (
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    {(data.personas || []).map((p, i) => {
                      const colors = ['border-teal-200 bg-teal-50', 'border-blue-200 bg-blue-50', 'border-purple-200 bg-purple-50', 'border-orange-200 bg-orange-50'];
                      return (
                        <Card key={i} className={`border-2 ${colors[i % colors.length]}`}>
                          <CardContent className="p-5">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="w-12 h-12 rounded-full flux-gradient flex items-center justify-center text-white font-bold text-lg">
                                {p.name?.charAt(0) || 'P'}
                              </div>
                              <div>
                                <h3 className="font-bold text-foreground text-lg">{p.name}</h3>
                                <p className="text-sm text-muted-foreground">{p.demographics}</p>
                              </div>
                            </div>
                            
                            <div className="space-y-3 text-sm">
                              <div className="flex items-start gap-2">
                                <Target className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                                <div>
                                  <span className="font-medium text-foreground">Interests:</span>
                                  <p className="text-muted-foreground">{p.interests}</p>
                                </div>
                              </div>
                              
                              <div className="flex items-start gap-2">
                                <TrendingUp className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                                <div>
                                  <span className="font-medium text-foreground">Pain Points:</span>
                                  <p className="text-muted-foreground">{p.problems}</p>
                                </div>
                              </div>
                              
                              <div className="flex items-start gap-2">
                                <Radio className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                <div>
                                  <span className="font-medium text-foreground">Channels:</span>
                                  <p className="text-muted-foreground">{p.channels}</p>
                                </div>
                              </div>
                              
                              <div className="flex items-start gap-2">
                                <Clock className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                <div>
                                  <span className="font-medium text-foreground">Best Times:</span>
                                  <p className="text-muted-foreground">{p.time_of_day}</p>
                                </div>
                              </div>
                              
                              {p.buying_triggers && (
                                <div className="pt-2 border-t border-border/50">
                                  <span className="font-medium text-foreground">Buying Triggers:</span>
                                  <p className="text-muted-foreground">{p.buying_triggers}</p>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                  
                  {data.notes && (
                    <Card className="bg-slate-50 border">
                      <CardContent className="p-4">
                        <p className="text-sm text-muted-foreground">{data.notes}</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            />
          </TabsContent>

          <TabsContent value="channels">
            <ToolShell
              title="Smart Channel Recommender"
              description="Select your product to compare marketing channels on reach, engagement, cost, and ROI."
              category="audience"
              toolKey="channel_recommender"
              projectOptions={projects}
              fields={[
                { name: "channels", label: "Channels to Compare (comma-separated)", type: "text", placeholder: "Facebook, TikTok, LinkedIn, YouTube, Email, PR" },
                { name: "goal", label: "Primary Goal", type: "select", placeholder: "Select", options: [
                  { value: "awareness", label: "Awareness" }, 
                  { value: "leads", label: "Leads" }, 
                  { value: "sales", label: "Sales" }, 
                  { value: "trial", label: "Trial" }
                ]}
              ]}
              onRun={async (values, projectId, userProfile, regenCount) => {
                const productContext = getProjectDescription(projectId);
                const res = await base44.integrations.Core.InvokeLLM({
                  prompt: `SYSTEM: You are Flux Channel Analyst. Compare marketing channels for the product.

PRODUCT: ${productContext}
CHANNELS: ${values.channels || 'Facebook, Instagram, LinkedIn, TikTok, YouTube, Email'}
GOAL: ${values.goal || 'awareness'}

For each channel provide:
- channel: name
- audience_reach: estimated reach potential
- engagement: engagement level and style
- cost_estimate: typical cost range
- pitfalls: common mistakes
- roi_score: 0-100 score for this goal

Also recommend the best overall channel with rationale.`,
                  add_context_from_internet: true,
                  response_json_schema: {
                    type: "object",
                    properties: {
                      comparison: { type: "array", items: { type: "object", properties: {
                        channel: { type: "string" }, 
                        audience_reach: { type: "string" },
                        engagement: { type: "string" }, 
                        cost_estimate: { type: "string" }, 
                        pitfalls: { type: "string" }, 
                        roi_score: { type: "number" }
                      }}},
                      best: { type: "string" },
                      rationale: { type: "string" }
                    }
                  }
                });
                return res;
              }}
              renderResult={(data) => (
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(data.comparison || []).map((c, i) => (
                      <Card key={i} className={`border bg-white hover:shadow-md transition-shadow ${c.channel === data.best ? 'ring-2 ring-primary' : ''}`}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-bold text-foreground">{c.channel}</h4>
                            <Badge className={`${c.roi_score >= 80 ? 'badge-green' : c.roi_score >= 60 ? 'badge-blue' : 'badge-orange'}`}>
                              {c.roi_score}/100
                            </Badge>
                          </div>
                          
                          {c.channel === data.best && (
                            <Badge className="badge-purple mb-3">⭐ Best Choice</Badge>
                          )}
                          
                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="font-medium text-foreground">Reach:</span>
                              <p className="text-muted-foreground">{c.audience_reach}</p>
                            </div>
                            <div>
                              <span className="font-medium text-foreground">Engagement:</span>
                              <p className="text-muted-foreground">{c.engagement}</p>
                            </div>
                            <div>
                              <span className="font-medium text-foreground">Cost:</span>
                              <p className="text-muted-foreground">{c.cost_estimate}</p>
                            </div>
                            <div>
                              <span className="font-medium text-red-600">⚠️ Pitfalls:</span>
                              <p className="text-muted-foreground">{c.pitfalls}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  
                  {data.best && (
                    <Card className="bg-green-50 border-green-200">
                      <CardContent className="p-4">
                        <h4 className="font-bold text-green-800 mb-1">🎯 Recommended: {data.best}</h4>
                        <p className="text-sm text-green-700">{data.rationale}</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}