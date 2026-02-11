import React, { useEffect, useState } from "react";
import { Project } from "@/entities/Project";
import { base44 } from "@/api/base44Client";
import ToolShell from "../components/common/ToolShell";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, Legend, BarChart, Bar } from "recharts";
import { motion } from "framer-motion";
import { LineChart as LineChartIcon, BarChart3, PieChart as PieChartIcon, TrendingUp, DollarSign } from "lucide-react";

export default function AnalyticsForecasting() {
  const [projects, setProjects] = useState([]);
  const [active, setActive] = useState("forecast");
  
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
            <LineChartIcon className="w-4 h-4 text-indigo-500" />
            <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">AI Insights</span>
          </div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Analytics & Forecasting
          </h1>
          <p className="text-muted-foreground">Data-driven insights and predictive analytics for your launch</p>
        </motion.div>
        
        <Tabs value={active} onValueChange={setActive} className="space-y-6">
          <TabsList className="flex flex-wrap gap-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-indigo-500/20 p-1 rounded-xl shadow-lg">
            <TabsTrigger value="forecast" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">
              <TrendingUp className="w-4 h-4 mr-2" />
              Demand Forecast
            </TabsTrigger>
            <TabsTrigger value="kpi" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">
              <BarChart3 className="w-4 h-4 mr-2" />
              KPI Dashboard
            </TabsTrigger>
            <TabsTrigger value="budget" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">
              <DollarSign className="w-4 h-4 mr-2" />
              Budget Optimizer
            </TabsTrigger>
          </TabsList>

          <TabsContent value="forecast">
            <ToolShell
              title="Demand Forecast"
              description="Select your product to generate adoption curves and demand scenarios."
              category="analytics"
              toolKey="demand_forecast"
              projectOptions={projects}
              fields={[
                { name: "signals", label: "Early Signals (optional)", type: "textarea", placeholder: "Signups, waitlist size, traffic, search trends..." },
                { name: "horizon_weeks", label: "Forecast Horizon (weeks)", type: "number", placeholder: "12" }
              ]}
              onRun={async (values, projectId) => {
                const productContext = getProjectDescription(projectId);
                const project = projects.find(p => p.id === projectId);
                const res = await base44.integrations.Core.InvokeLLM({
                  prompt: `SYSTEM: You are Flux Forecaster. Build a demand forecast.

PRODUCT: ${productContext}
SIGNALS: ${values.signals || project?.signals || 'No early signals provided'}
HORIZON: ${values.horizon_weeks || 12} weeks

Generate:
1. curve: weekly adoption forecast
2. scenarios: best, base, worst case projections
3. key_drivers: factors affecting adoption
4. recommendations: how to improve forecasted numbers`,
                  response_json_schema: {
                    type: "object",
                    properties: {
                      curve: { type: "array", items: { type: "object", properties: { week: { type: "number" }, adopters: { type: "number" } } } },
                      scenarios: { type: "object", properties: {
                        best: { type: "array", items: { type: "object", properties: { week: { type: "number" }, adopters: { type: "number" } } } },
                        base: { type: "array", items: { type: "object", properties: { week: { type: "number" }, adopters: { type: "number" } } } },
                        worst: { type: "array", items: { type: "object", properties: { week: { type: "number" }, adopters: { type: "number" } } } }
                      }},
                      key_drivers: { type: "array", items: { type: "string" } },
                      recommendations: { type: "array", items: { type: "string" } }
                    }
                  }
                });
                return res;
              }}
              renderResult={(data) => (
                <div className="space-y-6">
                  <Card className="border bg-white">
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-foreground mb-3">Adoption Curve</h3>
                      <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="week" type="number" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            {data.scenarios?.best && (
                              <Line data={data.scenarios.best} type="monotone" dataKey="adopters" name="Best" stroke="#22c55e" strokeWidth={2} dot={false} />
                            )}
                            {data.scenarios?.base && (
                              <Line data={data.scenarios.base} type="monotone" dataKey="adopters" name="Base" stroke="#6366f1" strokeWidth={2} dot={false} />
                            )}
                            {data.scenarios?.worst && (
                              <Line data={data.scenarios.worst} type="monotone" dataKey="adopters" name="Worst" stroke="#ef4444" strokeWidth={2} dot={false} />
                            )}
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    {data.key_drivers?.length > 0 && (
                      <Card className="bg-blue-50 border-blue-100">
                        <CardContent className="p-4">
                          <h4 className="font-semibold text-blue-800 mb-2">📊 Key Drivers</h4>
                          <ul className="space-y-1">
                            {data.key_drivers.map((d, i) => (
                              <li key={i} className="text-sm text-blue-700">• {d}</li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    )}
                    
                    {data.recommendations?.length > 0 && (
                      <Card className="bg-green-50 border-green-100">
                        <CardContent className="p-4">
                          <h4 className="font-semibold text-green-800 mb-2">💡 Recommendations</h4>
                          <ul className="space-y-1">
                            {data.recommendations.map((r, i) => (
                              <li key={i} className="text-sm text-green-700">• {r}</li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              )}
            />
          </TabsContent>

          <TabsContent value="kpi">
            <ToolShell
              title="KPI Dashboard"
              description="Select your product to generate KPI visualizations and metrics."
              category="analytics"
              toolKey="kpi_dashboard"
              projectOptions={projects}
              fields={[
                { name: "date_range", label: "Date Range", type: "text", placeholder: "e.g., last 30 days" },
                { name: "channels", label: "Channels (optional)", type: "text", placeholder: "facebook, instagram, linkedin" }
              ]}
              onRun={async (values, projectId) => {
                const productContext = getProjectDescription(projectId);
                const res = await base44.integrations.Core.InvokeLLM({
                  prompt: `SYSTEM: You are Flux KPI Builder. Generate realistic KPI data for the product.

PRODUCT: ${productContext}
DATE RANGE: ${values.date_range || 'last 30 days'}
CHANNELS: ${values.channels || 'all'}

Generate:
1. timeseries: daily traffic and conversions
2. by_channel: performance by channel
3. funnel: conversion funnel metrics
4. insights: key observations`,
                  response_json_schema: {
                    type: "object",
                    properties: {
                      timeseries: { type: "array", items: { type: "object", properties: { date: { type: "string" }, traffic: { type: "number" }, conversions: { type: "number" } } } },
                      by_channel: { type: "array", items: { type: "object", properties: { channel: { type: "string" }, ctr: { type: "number" }, cvr: { type: "number" }, spend: { type: "number" }, revenue: { type: "number" } } } },
                      funnel: { type: "object", properties: { impressions: { type: "number" }, clicks: { type: "number" }, signups: { type: "number" }, payers: { type: "number" } } },
                      insights: { type: "array", items: { type: "string" } }
                    }
                  }
                });
                return res;
              }}
              renderResult={(d) => (
                <div className="space-y-6">
                  <Card className="border bg-white">
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-foreground mb-3">Traffic & Conversions</h3>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={d.timeseries || []}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="traffic" stroke="#3b82f6" name="Traffic" />
                            <Line type="monotone" dataKey="conversions" stroke="#22c55e" name="Conversions" />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="border bg-white">
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-foreground mb-3">Channel Performance</h3>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={d.by_channel || []}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="channel" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="ctr" fill="#6366f1" name="CTR %" />
                            <Bar dataKey="cvr" fill="#10b981" name="CVR %" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {d.funnel && (
                    <div className="grid grid-cols-4 gap-3">
                      {Object.entries(d.funnel).map(([k, v]) => (
                        <Card key={k} className="border bg-white">
                          <CardContent className="p-4 text-center">
                            <p className="text-xs uppercase text-muted-foreground mb-1">{k}</p>
                            <p className="text-2xl font-bold text-foreground">{v.toLocaleString()}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                  
                  {d.insights?.length > 0 && (
                    <Card className="bg-amber-50 border-amber-100">
                      <CardContent className="p-4">
                        <h4 className="font-semibold text-amber-800 mb-2">💡 Key Insights</h4>
                        <ul className="space-y-1">
                          {d.insights.map((insight, i) => (
                            <li key={i} className="text-sm text-amber-700">• {insight}</li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            />
          </TabsContent>

          <TabsContent value="budget">
            <ToolShell
              title="Budget Optimizer"
              description="Select your product to get AI-recommended budget allocation and ROI forecast."
              category="analytics"
              toolKey="budget_optimizer"
              projectOptions={projects}
              fields={[
                { name: "current_spend", label: "Current Budget by Channel (JSON)", type: "textarea", placeholder: '{"facebook": 2000, "instagram": 1500, "linkedin": 1200}' },
                { name: "goal", label: "Primary Goal", type: "select", placeholder: "Select", options: [
                  { value: "leads", label: "Leads" },
                  { value: "sales", label: "Sales" },
                  { value: "trial", label: "Trial/Signup" }
                ]}
              ]}
              onRun={async (values, projectId) => {
                const productContext = getProjectDescription(projectId);
                const project = projects.find(p => p.id === projectId);
                const res = await base44.integrations.Core.InvokeLLM({
                  prompt: `SYSTEM: You are Flux Budget Optimizer.

PRODUCT: ${productContext}
TOTAL BUDGET: $${project?.target_budget || 'Not specified'}
CURRENT SPEND: ${values.current_spend || 'Not specified'}
GOAL: ${values.goal || 'leads'}

Generate:
1. recommended: optimized budget allocation by channel
2. alerts: potential issues or opportunities
3. roi_forecast: low, base, high ROI projections`,
                  response_json_schema: {
                    type: "object",
                    properties: {
                      recommended: { type: "array", items: { type: "object", properties: { channel: { type: "string" }, budget: { type: "number" }, rationale: { type: "string" } } } },
                      alerts: { type: "array", items: { type: "string" } },
                      roi_forecast: { type: "object", properties: { low: { type: "number" }, base: { type: "number" }, high: { type: "number" } } }
                    }
                  }
                });
                return res;
              }}
              renderResult={(d) => {
                const colors = ["#3b82f6", "#6366f1", "#10b981", "#f59e0b", "#ef4444", "#06b6d4"];
                const pieData = (d.recommended || []).map(r => ({ name: r.channel, value: r.budget }));
                const total = pieData.reduce((sum, item) => sum + item.value, 0);
                
                return (
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <Card className="border bg-white">
                        <CardContent className="p-4">
                          <h3 className="font-semibold text-foreground mb-3">Budget Distribution</h3>
                          <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={80} label>
                                  {pieData.map((entry, index) => (
                                    <Cell key={`c-${index}`} fill={colors[index % colors.length]} />
                                  ))}
                                </Pie>
                                <Legend />
                                <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                          <p className="text-center text-sm text-muted-foreground mt-2">
                            Total: ${total.toLocaleString()}
                          </p>
                        </CardContent>
                      </Card>
                      
                      <div className="space-y-3">
                        {(d.recommended || []).map((r, i) => (
                          <Card key={i} className="border bg-white">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-medium text-foreground">{r.channel}</span>
                                <Badge className="badge-blue">${r.budget.toLocaleString()}</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">{r.rationale}</p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                    
                    {d.alerts?.length > 0 && (
                      <Card className="bg-amber-50 border-amber-100">
                        <CardContent className="p-4">
                          <h4 className="font-semibold text-amber-800 mb-2">⚠️ Alerts</h4>
                          <ul className="space-y-1">
                            {d.alerts.map((a, i) => (
                              <li key={i} className="text-sm text-amber-700">• {a}</li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    )}
                    
                    {d.roi_forecast && (
                      <div className="grid grid-cols-3 gap-4">
                        {[
                          { key: 'low', label: 'Conservative', color: 'border-red-200 bg-red-50 text-red-800' },
                          { key: 'base', label: 'Expected', color: 'border-blue-200 bg-blue-50 text-blue-800' },
                          { key: 'high', label: 'Optimistic', color: 'border-green-200 bg-green-50 text-green-800' }
                        ].map(item => (
                          <Card key={item.key} className={`border-2 ${item.color}`}>
                            <CardContent className="p-4 text-center">
                              <p className="text-xs uppercase mb-1">{item.label}</p>
                              <p className="text-3xl font-bold">{d.roi_forecast[item.key]}%</p>
                              <p className="text-xs mt-1">ROI</p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}