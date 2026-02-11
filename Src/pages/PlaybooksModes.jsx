import React, { useEffect, useState } from "react";
import { Project } from "@/entities/Project";
import { base44 } from "@/api/base44Client";
import ToolShell from "../components/common/ToolShell";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ReadMore from "../components/common/ReadMore";
import { motion } from "framer-motion";
import { BookOpen, Target, Compass, FileText, BarChart3 } from "lucide-react";

export default function PlaybooksModes() {
  const [projects, setProjects] = useState([]);
  const [active, setActive] = useState("b2b_b2c");
  
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
            <BookOpen className="w-4 h-4 text-indigo-500" />
            <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">Strategy Hub</span>
          </div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Playbooks & Modes
          </h1>
          <p className="text-muted-foreground">Generate tailored go-to-market strategies based on your product</p>
        </motion.div>
        
        <Tabs value={active} onValueChange={setActive} className="space-y-6">
          <TabsList className="flex flex-wrap gap-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-indigo-500/20 p-1 rounded-xl shadow-lg">
            <TabsTrigger value="b2b_b2c" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">
              <Target className="w-4 h-4 mr-2" />
              GTM Playbooks
            </TabsTrigger>
            <TabsTrigger value="frameworks" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">
              <Compass className="w-4 h-4 mr-2" />
              Frameworks
            </TabsTrigger>
            <TabsTrigger value="case_studies" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">
              <FileText className="w-4 h-4 mr-2" />
              Case Studies
            </TabsTrigger>
          </TabsList>

          <TabsContent value="b2b_b2c">
            <ToolShell
              title="Go-to-Market Playbooks"
              description="Select your product to generate tailored B2B or B2C playbooks with tactics and channel mix."
              category="playbook"
              toolKey="b2b_b2c_playbooks"
              projectOptions={projects}
              fields={[
                { name: "mode", label: "Go-to-market Mode", type: "select", placeholder: "Select", options: [
                  { value: "b2b", label: "B2B" }, { value: "b2c", label: "B2C" }
                ]},
                { name: "budget", label: "Budget (USD)", type: "number", placeholder: "10000" },
                { name: "goal", label: "Primary Goal", type: "select", placeholder: "Select goal", options: [
                  { value: "leads", label: "Leads" }, { value: "sales", label: "Sales" }, { value: "trial", label: "Trial/Signup" }
                ]}
              ]}
              onRun={async (values, projectId) => {
                const productContext = getProjectDescription(projectId);
                const project = projects.find(p => p.id === projectId);
                const res = await base44.integrations.Core.InvokeLLM({
                  prompt: `SYSTEM: You are Flux Playbook Builder.

PRODUCT: ${productContext}
PRODUCT TYPE: ${project?.product_type || 'digital'}
GTM MODE: ${values.mode}
BUDGET: $${values.budget || 'Not specified'}
GOAL: ${values.goal}

Build a comprehensive playbook:
1. tactics: specific actionable tactics with why they work and how to execute
2. channels: recommended channel mix with budget percentages
3. cadences: timing and frequency recommendations
4. roi_calc: expected ROI with assumptions

Return JSON.`,
                  response_json_schema: {
                    type: "object",
                    properties: {
                      tactics: { type: "array", items: { type: "object", properties: { name: { type: "string" }, why: { type: "string" }, how: { type: "string" } } } },
                      channels: { type: "array", items: { type: "object", properties: { name: { type: "string" }, budget_pct: { type: "number" } } } },
                      cadences: { type: "array", items: { type: "string" } },
                      roi_calc: { type: "object", properties: { assumptions: { type: "string" }, expected_roi_pct: { type: "number" } } }
                    }
                  }
                });
                return res;
              }}
              renderResult={(data) => (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                      <Target className="w-5 h-5 text-primary" />
                      Core Tactics
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      {(data.tactics || []).map((t, i) => (
                        <Card key={i} className="border bg-white hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <h4 className="font-semibold text-foreground mb-2">{t.name}</h4>
                            <div className="space-y-2 text-sm">
                              <div>
                                <span className="font-medium text-primary">Why: </span>
                                <span className="text-muted-foreground">{t.why}</span>
                              </div>
                              <div>
                                <span className="font-medium text-primary">How: </span>
                                <span className="text-muted-foreground">{t.how}</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                  
                  <Card className="border bg-white">
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-primary" />
                        Channel Mix
                      </h3>
                      <div className="space-y-2">
                        {(data.channels || []).map((c, i) => (
                          <div key={i} className="flex items-center gap-3">
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium">{c.name}</span>
                                <span className="text-sm text-primary font-semibold">{c.budget_pct}%</span>
                              </div>
                              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div 
                                  className="h-full flux-gradient rounded-full" 
                                  style={{ width: `${c.budget_pct}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  
                  {data.cadences?.length > 0 && (
                    <Card className="bg-blue-50 border-blue-100">
                      <CardContent className="p-4">
                        <h4 className="font-semibold text-blue-800 mb-2">📅 Timing & Cadence</h4>
                        <ul className="space-y-1">
                          {data.cadences.map((c, i) => (
                            <li key={i} className="text-sm text-blue-700">• {c}</li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}
                  
                  {data.roi_calc && (
                    <Card className="bg-green-50 border-green-100">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-green-800">Expected ROI</h4>
                          <Badge className="badge-green text-lg px-3">+{data.roi_calc.expected_roi_pct}%</Badge>
                        </div>
                        <p className="text-sm text-green-700">Assumptions: {data.roi_calc.assumptions}</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            />
          </TabsContent>

          <TabsContent value="frameworks">
            <ToolShell
              title="Framework Navigator"
              description="Select your product to auto-generate SWOT, PESTLE, 4Ps, AIDA, and JTBD frameworks."
              category="playbook"
              toolKey="framework_navigator"
              projectOptions={projects}
              fields={[
                { name: "focus", label: "Focus Area (optional)", type: "text", placeholder: "e.g., GTM risks, messaging" }
              ]}
              onRun={async (values, projectId) => {
                const productContext = getProjectDescription(projectId);
                const res = await base44.integrations.Core.InvokeLLM({
                  prompt: `SYSTEM: You are Flux Framework Generator.

PRODUCT: ${productContext}
FOCUS: ${values.focus || 'General analysis'}

Generate comprehensive frameworks:
1. SWOT Analysis
2. PESTLE Analysis
3. 4Ps Marketing Mix
4. AIDA Model
5. Jobs to be Done

Return JSON.`,
                  response_json_schema: {
                    type: "object",
                    properties: {
                      swot: { type: "object", properties: { s: { type: "array", items: { type: "string" } }, w: { type: "array", items: { type: "string" } }, o: { type: "array", items: { type: "string" } }, t: { type: "array", items: { type: "string" } } } },
                      pestle: { type: "object" },
                      four_ps: { type: "object" },
                      aida: { type: "object" },
                      jtbd: { type: "array", items: { type: "object", properties: { job: { type: "string" }, pain: { type: "string" }, gain: { type: "string" } } } }
                    }
                  }
                });
                return res;
              }}
              renderResult={(d) => (
                <div className="space-y-6">
                  {d.swot && (
                    <div>
                      <h3 className="font-semibold text-foreground mb-3">SWOT Analysis</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[
                          { key: "s", label: "Strengths", color: "bg-green-50 border-green-200" },
                          { key: "w", label: "Weaknesses", color: "bg-red-50 border-red-200" },
                          { key: "o", label: "Opportunities", color: "bg-blue-50 border-blue-200" },
                          { key: "t", label: "Threats", color: "bg-orange-50 border-orange-200" }
                        ].map(item => (
                          <Card key={item.key} className={`border-2 ${item.color}`}>
                            <CardContent className="p-3">
                              <h4 className="font-semibold text-sm mb-2">{item.label}</h4>
                              <ul className="text-xs space-y-1">
                                {(d.swot[item.key] || []).map((x, i) => (
                                  <li key={i}>• {x}</li>
                                ))}
                              </ul>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {d.four_ps && (
                    <div>
                      <h3 className="font-semibold text-foreground mb-3">Marketing 4Ps</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {["product", "price", "place", "promotion"].map(p => (
                          <Card key={p} className="border bg-purple-50">
                            <CardContent className="p-3">
                              <h4 className="font-semibold text-sm capitalize mb-2">{p}</h4>
                              <ul className="text-xs space-y-1">
                                {(Array.isArray(d.four_ps[p]) ? d.four_ps[p] : [d.four_ps[p]]).map((x, i) => (
                                  <li key={i}>• {x}</li>
                                ))}
                              </ul>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {d.jtbd?.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-foreground mb-3">Jobs to be Done</h3>
                      <div className="grid md:grid-cols-3 gap-3">
                        {d.jtbd.map((job, i) => (
                          <Card key={i} className="border bg-white">
                            <CardContent className="p-4">
                              <p className="font-medium text-foreground mb-2">"{job.job}"</p>
                              <div className="text-sm space-y-1">
                                <p className="text-red-600">Pain: {job.pain}</p>
                                <p className="text-green-600">Gain: {job.gain}</p>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            />
          </TabsContent>

          <TabsContent value="case_studies">
            <ToolShell
              title="Case Study Insights"
              description="Find real case studies and benchmarks for your market and product type."
              category="playbook"
              toolKey="case_study_insights"
              projectOptions={projects}
              fields={[
                { name: "query", label: "Market/Product Type", type: "text", placeholder: "e.g., B2B SaaS HR, DTC skincare" }
              ]}
              onRun={async (values, projectId) => {
                const productContext = getProjectDescription(projectId);
                const res = await base44.integrations.Core.InvokeLLM({
                  prompt: `SYSTEM: You are Flux Case Study Finder. Search for real, recent case studies.

PRODUCT CONTEXT: ${productContext}
SEARCH QUERY: ${values.query}

Find relevant case studies with actual benchmarks and lessons learned.`,
                  add_context_from_internet: true,
                  response_json_schema: {
                    type: "object",
                    properties: {
                      cases: { type: "array", items: { type: "object", properties: { title: { type: "string" }, company: { type: "string" }, summary: { type: "string" }, benchmark: { type: "object", properties: { ctr: { type: "number" }, cvr: { type: "number" }, cpa: { type: "number" }, roi: { type: "number" } } } } } },
                      lessons: { type: "array", items: { type: "string" } },
                      industry_benchmarks: { type: "object" }
                    }
                  }
                });
                return res;
              }}
              renderResult={(d) => (
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    {(d.cases || []).map((c, i) => (
                      <Card key={i} className="border bg-white hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="font-semibold text-foreground">{c.title}</h4>
                              {c.company && (
                                <p className="text-sm text-muted-foreground">{c.company}</p>
                              )}
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">{c.summary}</p>
                          {c.benchmark && (
                            <div className="flex flex-wrap gap-2">
                              {c.benchmark.ctr > 0 && <Badge className="badge-blue">CTR: {c.benchmark.ctr}%</Badge>}
                              {c.benchmark.cvr > 0 && <Badge className="badge-green">CVR: {c.benchmark.cvr}%</Badge>}
                              {c.benchmark.cpa > 0 && <Badge className="badge-orange">CPA: ${c.benchmark.cpa}</Badge>}
                              {c.benchmark.roi > 0 && <Badge className="badge-purple">ROI: {c.benchmark.roi}%</Badge>}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  
                  {d.lessons?.length > 0 && (
                    <Card className="bg-amber-50 border-amber-100">
                      <CardContent className="p-4">
                        <h4 className="font-semibold text-amber-800 mb-2">💡 Key Lessons</h4>
                        <ul className="space-y-1">
                          {d.lessons.map((l, i) => (
                            <li key={i} className="text-sm text-amber-700">• {l}</li>
                          ))}
                        </ul>
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