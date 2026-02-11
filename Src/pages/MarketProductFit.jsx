import React, { useEffect, useState } from "react";
import { Project } from "@/entities/Project";
import { base44 } from "@/api/base44Client";
import ToolShell from "../components/common/ToolShell";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar } from "recharts";
import ReadMore from "../components/common/ReadMore";
import { motion } from "framer-motion";
import { Target, DollarSign, Sparkles, AlertCircle, CheckCircle2 } from "lucide-react";

export default function MarketProductFit() {
  const [projects, setProjects] = useState([]);
  const [active, setActive] = useState("stress");
  
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
            <Target className="w-4 h-4 text-indigo-500" />
            <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">AI Validation</span>
          </div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Market & Product Fit
          </h1>
          <p className="text-muted-foreground">Validate your product-market alignment with AI-powered analysis</p>
        </motion.div>
        
        <Tabs value={active} onValueChange={setActive} className="space-y-6">
          <TabsList className="flex flex-wrap gap-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-indigo-500/20 p-1 rounded-xl shadow-lg">
            <TabsTrigger value="stress" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">
              <Target className="w-4 h-4 mr-2" />
              Stress Test
            </TabsTrigger>
            <TabsTrigger value="pricing" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">
              <DollarSign className="w-4 h-4 mr-2" />
              Pricing
            </TabsTrigger>
            <TabsTrigger value="value" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">
              <Sparkles className="w-4 h-4 mr-2" />
              Value Optimizer
            </TabsTrigger>
          </TabsList>

          <TabsContent value="stress">
            <ToolShell
              title="Stress Test"
              description="Select your product to generate a survey kit, check persona alignment, and detect confusing features."
              category="market_fit"
              toolKey="stress_test"
              projectOptions={projects}
              fields={[
                { name: "personas", label: "Target Personas (optional)", type: "textarea", placeholder: "Describe your target personas or leave blank to auto-generate" },
                { name: "target_location", label: "Target Location (be specific!)", type: "text", placeholder: "e.g., Lagos Nigeria, California USA, Bavaria Germany, Maharashtra India" }
              ]}
              onRun={async (values, projectId) => {
                const productContext = getProjectDescription(projectId);
                const res = await base44.integrations.Core.InvokeLLM({
                  prompt: `SYSTEM: You are Flux Stress Tester with deep geographic market expertise. Analyze the product for the SPECIFIC location provided.

PRODUCT: ${productContext}
PERSONAS: ${values.personas || "Auto-generate based on product and location"}
TARGET LOCATION: ${values.target_location || "Global - but provide regional insights"}

CRITICAL: Provide location-specific analysis:
1) survey_questions: array of 10 targeted questions localized for the target market (include local pain points, cultural considerations, local payment preferences, language nuances)
2) persona_alignment: object with:
   - similarity_score (0-100) 
   - gaps (array) - specific to the location
   - local_adaptations_needed (array) - what needs to change for this market
   - cultural_considerations (array)
3) confusion_detector: array of {feature, issue, simplified_alternative, local_alternative} - consider local terminology and preferences
4) market_specific_insights: object with:
   - local_competitors (array)
   - price_sensitivity (string)
   - preferred_channels (array)
   - regulatory_notes (string)
   - language_considerations (string)

Return JSON only.`,
                  response_json_schema: {
                    type: "object",
                    properties: {
                      survey_questions: { type: "array", items: { type: "string" } },
                      persona_alignment: { 
                        type: "object", 
                        properties: { 
                          similarity_score: { type: "number" }, 
                          gaps: { type: "array", items: { type: "string" } },
                          local_adaptations_needed: { type: "array", items: { type: "string" } },
                          cultural_considerations: { type: "array", items: { type: "string" } }
                        } 
                      },
                      confusion_detector: { type: "array", items: { type: "object", properties: { feature: { type: "string" }, issue: { type: "string" }, simplified_alternative: { type: "string" }, local_alternative: { type: "string" } } } },
                      market_specific_insights: {
                        type: "object",
                        properties: {
                          local_competitors: { type: "array", items: { type: "string" } },
                          price_sensitivity: { type: "string" },
                          preferred_channels: { type: "array", items: { type: "string" } },
                          regulatory_notes: { type: "string" },
                          language_considerations: { type: "string" }
                        }
                      }
                    }
                  }
                });
                return res;
              }}
              renderResult={(data) => (
                <div className="space-y-6">
                  <Card className="border bg-white">
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-primary" />
                        Survey Questions
                      </h3>
                      <ol className="list-decimal pl-5 space-y-2 text-muted-foreground">
                        {(data.survey_questions || []).map((q, i) => (
                          <li key={i} className="text-foreground">{q}</li>
                        ))}
                      </ol>
                    </CardContent>
                  </Card>
                  
                  {data.persona_alignment && (
                    <Card className={`border-2 ${data.persona_alignment.similarity_score >= 70 ? 'border-green-200 bg-green-50' : data.persona_alignment.similarity_score >= 50 ? 'border-amber-200 bg-amber-50' : 'border-red-200 bg-red-50'}`}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-foreground">Persona Fit Score</h3>
                          <Badge className={`${data.persona_alignment.similarity_score >= 70 ? 'badge-green' : data.persona_alignment.similarity_score >= 50 ? 'badge-orange' : 'badge-pink'} text-lg px-3`}>
                            {data.persona_alignment.similarity_score}/100
                          </Badge>
                        </div>
                        {data.persona_alignment.gaps?.length > 0 && (
                          <div className="mt-3">
                            <p className="text-sm font-medium text-foreground mb-1">Gaps to Address:</p>
                            <ul className="text-sm text-muted-foreground space-y-1">
                              {data.persona_alignment.gaps.map((gap, i) => (
                                <li key={i}>• {gap}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}
                  
                  {data.confusion_detector?.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-orange-500" />
                        Feature Confusion Detector
                      </h3>
                      <div className="grid md:grid-cols-2 gap-3">
                        {data.confusion_detector.map((c, i) => (
                          <Card key={i} className="border bg-white">
                            <CardContent className="p-4">
                              <p className="font-medium text-foreground mb-2">{c.feature}</p>
                              <p className="text-sm text-red-600 mb-1">
                                <span className="font-medium">Issue:</span> {c.issue}
                              </p>
                              <p className="text-sm text-green-600">
                                <span className="font-medium">Simplified:</span> {c.simplified_alternative}
                              </p>
                              {c.local_alternative && (
                                <p className="text-sm text-blue-600 mt-1">
                                  <span className="font-medium">Local Alternative:</span> {c.local_alternative}
                                </p>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {data.persona_alignment?.local_adaptations_needed?.length > 0 && (
                    <Card className="border-2 border-blue-200 bg-blue-50">
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-blue-800 mb-2">🌍 Local Adaptations Needed</h3>
                        <ul className="text-sm text-blue-700 space-y-1">
                          {data.persona_alignment.local_adaptations_needed.map((a, i) => <li key={i}>• {a}</li>)}
                        </ul>
                      </CardContent>
                    </Card>
                  )}
                  
                  {data.persona_alignment?.cultural_considerations?.length > 0 && (
                    <Card className="border-2 border-purple-200 bg-purple-50">
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-purple-800 mb-2">🎭 Cultural Considerations</h3>
                        <ul className="text-sm text-purple-700 space-y-1">
                          {data.persona_alignment.cultural_considerations.map((c, i) => <li key={i}>• {c}</li>)}
                        </ul>
                      </CardContent>
                    </Card>
                  )}
                  
                  {data.market_specific_insights && (
                    <Card className="border bg-white">
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-foreground mb-3">📍 Market-Specific Insights</h3>
                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                          {data.market_specific_insights.local_competitors?.length > 0 && (
                            <div>
                              <span className="font-medium text-foreground">Local Competitors:</span>
                              <p className="text-muted-foreground">{data.market_specific_insights.local_competitors.join(", ")}</p>
                            </div>
                          )}
                          {data.market_specific_insights.price_sensitivity && (
                            <div>
                              <span className="font-medium text-foreground">Price Sensitivity:</span>
                              <p className="text-muted-foreground">{data.market_specific_insights.price_sensitivity}</p>
                            </div>
                          )}
                          {data.market_specific_insights.preferred_channels?.length > 0 && (
                            <div>
                              <span className="font-medium text-foreground">Preferred Channels:</span>
                              <p className="text-muted-foreground">{data.market_specific_insights.preferred_channels.join(", ")}</p>
                            </div>
                          )}
                          {data.market_specific_insights.regulatory_notes && (
                            <div>
                              <span className="font-medium text-foreground">Regulatory Notes:</span>
                              <p className="text-muted-foreground">{data.market_specific_insights.regulatory_notes}</p>
                            </div>
                          )}
                          {data.market_specific_insights.language_considerations && (
                            <div className="md:col-span-2">
                              <span className="font-medium text-foreground">Language Considerations:</span>
                              <p className="text-muted-foreground">{data.market_specific_insights.language_considerations}</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            />
          </TabsContent>

          <TabsContent value="pricing">
            <ToolShell
              title="Pricing & Positioning"
              description="Select your product to get AI-generated pricing tiers, positioning, and elasticity simulation."
              category="market_fit"
              toolKey="pricing_positioning"
              projectOptions={projects}
              fields={[
                { name: "target_location", label: "Target Location (be specific!)", type: "text", placeholder: "e.g., Lagos Nigeria, Texas USA, Karnataka India" },
                { name: "competitors", label: "Competitors (optional)", type: "textarea", placeholder: "List competitors for comparison" },
                { name: "price_points", label: "Price Options (comma separated)", type: "text", placeholder: "e.g., 19, 29, 49, 99" },
                { name: "currency", label: "Currency", type: "text", placeholder: "USD, NGN, INR, EUR, etc." }
              ]}
              onRun={async (values, projectId) => {
                const productContext = getProjectDescription(projectId);
                const res = await base44.integrations.Core.InvokeLLM({
                  prompt: `SYSTEM: You are Flux Pricing Strategist with deep LOCAL market expertise.

PRODUCT: ${productContext}
TARGET LOCATION: ${values.target_location || 'Global'}
COMPETITORS: ${values.competitors || 'Not specified - research local competitors'}
PRICE POINTS: ${values.price_points || 'Suggest optimal for target location'}
CURRENCY: ${values.currency || 'Local currency of target location'}

CRITICAL: Provide LOCATION-SPECIFIC pricing analysis:
1. Research local purchasing power, average income levels, and price expectations
2. Identify local competitors and their pricing
3. Consider local payment methods and preferences
4. Account for local taxes, duties, and regulatory costs
5. Adjust for local currency volatility if applicable

Generate:
1. tiers: 3 pricing tiers with names, prices in LOCAL CURRENCY, USD equivalent, and rationale specific to the target market
2. positioning: key positioning statements localized for the market
3. elasticity: price vs adoption curve data adjusted for local purchasing power
4. local_insights: object with local_competitors_prices, payment_methods, tax_considerations, currency_notes
5. notes: strategic recommendations for entering this specific market`,
                  add_context_from_internet: !!values.competitors,
                  response_json_schema: {
                    type: "object",
                    properties: {
                      tiers: { type: "array", items: { type: "object", properties: { name: { type: "string" }, recommended_price: { type: "number" }, local_price: { type: "string" }, usd_equivalent: { type: "string" }, rationale: { type: "string" } } } },
                      positioning: { type: "array", items: { type: "string" } },
                      elasticity: { type: "array", items: { type: "object", properties: { price: { type: "number" }, expected_adoption_pct: { type: "number" } } } },
                      local_insights: { 
                        type: "object", 
                        properties: { 
                          local_competitors_prices: { type: "array", items: { type: "object", properties: { competitor: { type: "string" }, price_range: { type: "string" } } } },
                          payment_methods: { type: "array", items: { type: "string" } },
                          tax_considerations: { type: "string" },
                          currency_notes: { type: "string" },
                          purchasing_power_index: { type: "string" }
                        } 
                      },
                      notes: { type: "string" }
                    }
                  }
                });
                return res;
              }}
              renderResult={(d) => (
                <div className="space-y-6">
                  <div className="grid md:grid-cols-3 gap-4">
                    {(d.tiers || []).map((t, i) => {
                      const tierColors = ['border-blue-200 bg-blue-50', 'border-purple-200 bg-purple-50', 'border-orange-200 bg-orange-50'];
                      return (
                        <Card key={i} className={`border-2 ${tierColors[i] || 'border-slate-200'}`}>
                          <CardContent className="p-4 text-center">
                            <Badge className={`${i === 0 ? 'badge-blue' : i === 1 ? 'badge-purple' : 'badge-orange'} mb-3`}>
                              {t.name}
                            </Badge>
                            <div className="text-3xl font-bold text-foreground mb-1">
                              {t.local_price || `$${t.recommended_price}`}
                            </div>
                            {t.usd_equivalent && (
                              <div className="text-sm text-muted-foreground mb-2">≈ {t.usd_equivalent}</div>
                            )}
                            <p className="text-sm text-muted-foreground">{t.rationale}</p>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                  
                  {d.local_insights && (
                    <Card className="border bg-gradient-to-r from-indigo-50 to-purple-50">
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-foreground mb-3">📍 Local Market Insights</h3>
                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                          {d.local_insights.purchasing_power_index && (
                            <div>
                              <span className="font-medium">Purchasing Power Index:</span>
                              <p className="text-muted-foreground">{d.local_insights.purchasing_power_index}</p>
                            </div>
                          )}
                          {d.local_insights.payment_methods?.length > 0 && (
                            <div>
                              <span className="font-medium">Popular Payment Methods:</span>
                              <p className="text-muted-foreground">{d.local_insights.payment_methods.join(", ")}</p>
                            </div>
                          )}
                          {d.local_insights.tax_considerations && (
                            <div>
                              <span className="font-medium">Tax Considerations:</span>
                              <p className="text-muted-foreground">{d.local_insights.tax_considerations}</p>
                            </div>
                          )}
                          {d.local_insights.currency_notes && (
                            <div>
                              <span className="font-medium">Currency Notes:</span>
                              <p className="text-muted-foreground">{d.local_insights.currency_notes}</p>
                            </div>
                          )}
                        </div>
                        {d.local_insights.local_competitors_prices?.length > 0 && (
                          <div className="mt-4">
                            <span className="font-medium">Local Competitor Prices:</span>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {d.local_insights.local_competitors_prices.map((c, i) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  {c.competitor}: {c.price_range}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}
                  
                  <Card className="border bg-white">
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-foreground mb-3">Elasticity Simulation</h3>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={(d.elasticity || []).map(x => ({ price: x.price, adoption: x.expected_adoption_pct }))}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="price" />
                            <YAxis />
                            <Tooltip />
                            <Line type="monotone" dataKey="adoption" stroke="#6366f1" strokeWidth={2} dot />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {d.positioning?.length > 0 && (
                    <Card className="bg-purple-50 border-purple-100">
                      <CardContent className="p-4">
                        <h4 className="font-semibold text-purple-800 mb-2">Positioning Statements</h4>
                        <ul className="space-y-1">
                          {d.positioning.map((p, i) => (
                            <li key={i} className="text-sm text-purple-700">• {p}</li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}
                  
                  {d.notes && (
                    <p className="text-sm text-muted-foreground italic">{d.notes}</p>
                  )}
                </div>
              )}
            />
          </TabsContent>

          <TabsContent value="value">
            <ToolShell
              title="Value Optimizer"
              description="Select your product to get feature-benefit mapping, value perception heatmap, and recommendations."
              category="market_fit"
              toolKey="value_optimizer"
              projectOptions={projects}
              fields={[
                { name: "features", label: "Key Features (comma separated)", type: "text", placeholder: "Feature A, Feature B, Feature C" },
                { name: "competitor_values", label: "Competitor Value Props (optional)", type: "textarea", placeholder: "Paste competitor slogans/claims for comparison" }
              ]}
              onRun={async (values, projectId) => {
                const productContext = getProjectDescription(projectId);
                const res = await base44.integrations.Core.InvokeLLM({
                  prompt: `SYSTEM: You are Flux Value Optimizer.

PRODUCT: ${productContext}
FEATURES: ${values.features || 'Extract from product description'}
COMPETITOR VALUES: ${values.competitor_values || 'Not provided'}

Generate:
1. feature_benefits: map each feature to customer benefits and competitive advantage
2. value_heatmap: perception score (0-100) for each feature
3. recommendations: what to emphasize, improve, or drop`,
                  response_json_schema: {
                    type: "object",
                    properties: {
                      feature_benefits: { type: "array", items: { type: "object", properties: { feature: { type: "string" }, benefit: { type: "string" }, vs_competitors: { type: "string" } } } },
                      value_heatmap: { type: "array", items: { type: "object", properties: { feature: { type: "string" }, perception_score: { type: "number" } } } },
                      recommendations: { type: "object", properties: { emphasize: { type: "array", items: { type: "string" } }, improve: { type: "array", items: { type: "string" } }, drop: { type: "array", items: { type: "string" } } } }
                    }
                  }
                });
                return res;
              }}
              renderResult={(d) => (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-foreground mb-3">Feature → Benefit Mapping</h3>
                    <div className="grid md:grid-cols-2 gap-3">
                      {(d.feature_benefits || []).map((r, i) => (
                        <Card key={i} className="border bg-white">
                          <CardContent className="p-4">
                            <h4 className="font-medium text-foreground mb-2">{r.feature}</h4>
                            <p className="text-sm text-muted-foreground mb-1">
                              <span className="font-medium text-green-600">Benefit:</span> {r.benefit}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              <span className="font-medium">vs Competitors:</span> {r.vs_competitors}
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                  
                  <Card className="border bg-white">
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-foreground mb-3">Value Perception Heatmap</h3>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={d.value_heatmap || []} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" domain={[0, 100]} />
                            <YAxis type="category" dataKey="feature" width={120} />
                            <Tooltip />
                            <Bar dataKey="perception_score" fill="#22c55e" radius={[0, 4, 4, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {d.recommendations && (
                    <div className="grid md:grid-cols-3 gap-4">
                      <Card className="border-2 border-green-200 bg-green-50">
                        <CardContent className="p-4">
                          <h4 className="font-semibold text-green-800 mb-2">✓ Emphasize</h4>
                          <ul className="text-sm text-green-700 space-y-1">
                            {(d.recommendations.emphasize || []).map((x, i) => <li key={i}>• {x}</li>)}
                          </ul>
                        </CardContent>
                      </Card>
                      <Card className="border-2 border-amber-200 bg-amber-50">
                        <CardContent className="p-4">
                          <h4 className="font-semibold text-amber-800 mb-2">↑ Improve</h4>
                          <ul className="text-sm text-amber-700 space-y-1">
                            {(d.recommendations.improve || []).map((x, i) => <li key={i}>• {x}</li>)}
                          </ul>
                        </CardContent>
                      </Card>
                      <Card className="border-2 border-red-200 bg-red-50">
                        <CardContent className="p-4">
                          <h4 className="font-semibold text-red-800 mb-2">✕ Consider Dropping</h4>
                          <ul className="text-sm text-red-700 space-y-1">
                            {(d.recommendations.drop || []).map((x, i) => <li key={i}>• {x}</li>)}
                          </ul>
                        </CardContent>
                      </Card>
                    </div>
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