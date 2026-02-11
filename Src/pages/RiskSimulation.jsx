import React, { useEffect, useState } from "react";
import { Project } from "@/entities/Project";
import { base44 } from "@/api/base44Client";
import ToolShell from "../components/common/ToolShell";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ReadMore from "../components/common/ReadMore";
import { motion } from "framer-motion";
import { Shield, AlertTriangle, TrendingDown, Zap } from "lucide-react";

export default function RiskSimulation() {
  const [projects, setProjects] = useState([]);
  const [active, setActive] = useState("risk_radar");
  
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
            <Shield className="w-4 h-4 text-indigo-500" />
            <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">Risk Management</span>
          </div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Risk & Simulation
          </h1>
          <p className="text-muted-foreground">Identify risks and model scenarios for your launch</p>
        </motion.div>
        
        <Tabs value={active} onValueChange={setActive} className="space-y-6">
          <TabsList className="flex flex-wrap gap-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-indigo-500/20 p-1 rounded-xl shadow-lg">
            <TabsTrigger value="risk_radar" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">
              <Shield className="w-4 h-4 mr-2" />
              Risk Radar
            </TabsTrigger>
            <TabsTrigger value="simulator" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">
              <Zap className="w-4 h-4 mr-2" />
              Scenario Simulator
            </TabsTrigger>
          </TabsList>

          <TabsContent value="risk_radar">
            <ToolShell
              title="Risk Radar"
              description="Select your product to identify high-risk areas and get mitigation strategies."
              category="risk"
              toolKey="risk_radar"
              projectOptions={projects}
              fields={[
                { name: "budget", label: "Budget (USD)", type: "number", placeholder: "50000" },
                { name: "supply_chain", label: "Supply Chain Notes", type: "textarea", placeholder: "Vendors, lead times, dependencies…" },
                { name: "compliance", label: "Compliance Areas", type: "textarea", placeholder: "GDPR, COPPA, medical claims…" }
              ]}
              onRun={async (values, projectId) => {
                const productContext = getProjectDescription(projectId);
                const res = await base44.integrations.Core.InvokeLLM({
                  prompt: `SYSTEM: You are Flux Risk Radar. Analyze the product and inputs to identify risks.

PRODUCT: ${productContext}

INPUT:
- Budget: $${values.budget || 'Not specified'}
- Supply Chain: ${values.supply_chain || 'Not specified'}
- Compliance: ${values.compliance || 'Not specified'}

Create:
1. heatmap: array of risk areas with severity (high/medium/low), rationale, and actions
2. global_trends: relevant market trends that could impact the launch
3. mitigation_plan: specific mitigation tasks with owner and timeline

Return JSON only.`,
                  response_json_schema: {
                    type: "object",
                    properties: {
                      heatmap: { type: "array", items: { type: "object", properties: { area: { type: "string" }, severity: { type: "string" }, rationale: { type: "string" }, actions: { type: "array", items: { type: "string" } } } } },
                      global_trends: { type: "array", items: { type: "string" } },
                      mitigation_plan: { type: "array", items: { type: "object", properties: { risk: { type: "string" }, owner: { type: "string" }, due_in_days: { type: "number" } } } }
                    }
                  }
                });
                return res;
              }}
              renderResult={(data) => (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-orange-500" />
                      Risk Heatmap
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      {(data.heatmap || []).map((h, i) => {
                        const severityColors = {
                          high: "border-red-200 bg-red-50",
                          medium: "border-orange-200 bg-orange-50",
                          low: "border-green-200 bg-green-50"
                        };
                        const badgeColors = {
                          high: "badge-pink",
                          medium: "badge-orange",
                          low: "badge-green"
                        };
                        return (
                          <Card key={i} className={`border-2 ${severityColors[h.severity] || 'border-slate-200'}`}>
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-semibold text-foreground">{h.area}</span>
                                <Badge className={badgeColors[h.severity] || 'badge-blue'}>
                                  {h.severity}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-3">{h.rationale}</p>
                              <div className="space-y-1">
                                {(h.actions || []).map((a, j) => (
                                  <div key={j} className="flex items-start gap-2 text-sm">
                                    <span className="text-primary">→</span>
                                    <span>{a}</span>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                  
                  {data.global_trends?.length > 0 && (
                    <Card className="bg-blue-50 border-blue-100">
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                          <TrendingDown className="w-5 h-5" />
                          Global Trend Monitor
                        </h3>
                        <ul className="space-y-1">
                          {data.global_trends.map((t, i) => (
                            <li key={i} className="text-sm text-blue-700 flex items-start gap-2">
                              <span>•</span> {t}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}
                  
                  {data.mitigation_plan?.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-foreground mb-3">Mitigation Plan</h3>
                      <div className="space-y-2">
                        {data.mitigation_plan.map((m, i) => (
                          <Card key={i} className="border bg-white">
                            <CardContent className="p-4 flex items-center justify-between">
                              <div>
                                <p className="font-medium text-foreground">{m.risk}</p>
                                <p className="text-sm text-muted-foreground">Owner: {m.owner}</p>
                              </div>
                              <Badge variant="outline">Due in {m.due_in_days}d</Badge>
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

          <TabsContent value="simulator">
            <ToolShell
              title="Scenario Simulator"
              description="Select your product and model what-if scenarios to prepare for different outcomes."
              category="risk"
              toolKey="real_world_simulator"
              projectOptions={projects}
              fields={[
                { name: "scenario", label: "Scenario Focus", type: "select", placeholder: "Select", options: [
                  { value: "supply_chain", label: "Supply Chain Disruption" },
                  { value: "competitor_pricing", label: "Competitor Price Drop" },
                  { value: "regulation", label: "Regulation Change" },
                  { value: "market_shift", label: "Market Demand Shift" },
                  { value: "economic_downturn", label: "Economic Downturn" }
                ]},
                { name: "notes", label: "Additional Context", type: "textarea", placeholder: "Add specific concerns or constraints" }
              ]}
              onRun={async (values, projectId) => {
                const productContext = getProjectDescription(projectId);
                const res = await base44.integrations.Core.InvokeLLM({
                  prompt: `SYSTEM: You are Flux Scenario Simulator. Model different outcomes for the product launch.

PRODUCT: ${productContext}
SCENARIO: ${values.scenario}
NOTES: ${values.notes || 'None'}

Create best/base/worst case scenarios with realistic metrics and actionable mitigation strategies.`,
                  response_json_schema: {
                    type: "object",
                    properties: {
                      scenarios: { type: "array", items: { type: "object", properties: { name: { type: "string" }, revenue: { type: "number" }, cpa: { type: "number" }, conversion_rate: { type: "number" }, notes: { type: "string" } } } },
                      actions: { type: "array", items: { type: "string" } },
                      early_warning_signs: { type: "array", items: { type: "string" } }
                    }
                  }
                });
                return res;
              }}
              renderResult={(d) => (
                <div className="space-y-6">
                  <div className="grid md:grid-cols-3 gap-4">
                    {(d.scenarios || []).map((s, i) => {
                      const colors = {
                        best: "border-green-200 bg-green-50",
                        base: "border-blue-200 bg-blue-50",
                        worst: "border-red-200 bg-red-50"
                      };
                      const badgeColors = {
                        best: "badge-green",
                        base: "badge-blue",
                        worst: "badge-pink"
                      };
                      return (
                        <Card key={i} className={`border-2 ${colors[s.name?.toLowerCase()] || 'border-slate-200'}`}>
                          <CardContent className="p-4">
                            <Badge className={`${badgeColors[s.name?.toLowerCase()] || 'badge-blue'} mb-3`}>
                              {s.name} Case
                            </Badge>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Revenue</span>
                                <span className="font-semibold text-foreground">${s.revenue?.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">CPA</span>
                                <span className="font-semibold text-foreground">${s.cpa}</span>
                              </div>
                              {s.conversion_rate && (
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Conversion</span>
                                  <span className="font-semibold text-foreground">{s.conversion_rate}%</span>
                                </div>
                              )}
                            </div>
                            {s.notes && (
                              <p className="text-sm text-muted-foreground mt-3 pt-3 border-t">
                                {s.notes}
                              </p>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                  
                  {d.early_warning_signs?.length > 0 && (
                    <Card className="bg-amber-50 border-amber-100">
                      <CardContent className="p-4">
                        <h4 className="font-semibold text-amber-800 mb-2">⚠️ Early Warning Signs</h4>
                        <ul className="space-y-1">
                          {d.early_warning_signs.map((sign, i) => (
                            <li key={i} className="text-sm text-amber-700">• {sign}</li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}
                  
                  {d.actions?.length > 0 && (
                    <Card className="bg-white border">
                      <CardContent className="p-4">
                        <h4 className="font-semibold text-foreground mb-2">Mitigation Strategies</h4>
                        <ul className="space-y-1">
                          {d.actions.map((a, i) => (
                            <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                              <span className="text-primary">→</span> {a}
                            </li>
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