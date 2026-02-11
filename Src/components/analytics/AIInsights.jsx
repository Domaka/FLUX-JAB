import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { InvokeLLM } from "@/integrations/Core";
import { Brain, Loader2, TrendingUp, AlertCircle, Lightbulb } from "lucide-react";

export default function AIInsights({ projects, creatives }) {
  const [insights, setInsights] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (projects.length > 0 || creatives.length > 0) {
      generateInsights();
    }
  }, [projects, creatives]);

  const generateInsights = async () => {
    if (isGenerating) return;
    
    setIsGenerating(true);
    try {
      // Prepare data for analysis
      const projectSummary = projects.map(p => ({
        product: p.product_name,
        category: p.category,
        status: p.status,
        budget: p.target_budget,
        roi_forecast: p.roi_forecast,
        top_regions: p.top_regions?.slice(0, 2)
      }));

      const creativeSummary = creatives.map(c => ({
        channel: c.channel,
        performance: c.predicted_performance
      }));

      const result = await InvokeLLM({
        prompt: `You are Flux AI Analyst. Analyze this marketing portfolio data and provide actionable insights.

Projects: ${JSON.stringify(projectSummary)}
Creatives: ${JSON.stringify(creativeSummary)}

Generate 5 key insights with:
1. A clear finding/observation
2. Impact level (high/medium/low)
3. Specific actionable recommendation
4. Confidence score (0-100)

Focus on: performance patterns, optimization opportunities, market trends, budget allocation, channel effectiveness.`,
        response_json_schema: {
          type: "object",
          properties: {
            insights: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  finding: { type: "string" },
                  impact: { 
                    type: "string",
                    enum: ["high", "medium", "low"]
                  },
                  recommendation: { type: "string" },
                  confidence: { type: "number" }
                }
              }
            }
          }
        }
      });

      setInsights(result.insights || []);
    } catch (error) {
      console.error("Error generating insights:", error);
      // Fallback insights
      setInsights([
        {
          title: "Channel Performance Analysis",
          finding: "Your creative distribution shows strong potential",
          impact: "medium",
          recommendation: "Continue creating diverse content across multiple channels",
          confidence: 75
        }
      ]);
    }
    setIsGenerating(false);
  };

  const impactColors = {
    high: "bg-red-100 text-red-800 border-red-200",
    medium: "bg-orange-100 text-orange-800 border-orange-200",
    low: "bg-blue-100 text-blue-800 border-blue-200"
  };

  const impactIcons = {
    high: AlertCircle,
    medium: TrendingUp,
    low: Lightbulb
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
      <CardHeader className="border-b border-slate-100 pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Brain className="w-5 h-5 text-indigo-600" />
            AI Insights
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={generateInsights}
            disabled={isGenerating}
            className="text-xs"
          >
            {isGenerating ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              "Refresh"
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {isGenerating && insights.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <p className="text-slate-600">Analyzing your data...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {insights.map((insight, index) => {
              const ImpactIcon = impactIcons[insight.impact] || Lightbulb;
              
              return (
                <div key={index} className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                  <div className="flex items-start gap-3">
                    <div className={`${impactColors[insight.impact].replace('text-', 'text-').replace('bg-', 'bg-')} p-2 rounded-lg flex-shrink-0`}>
                      <ImpactIcon className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-slate-900 text-sm">{insight.title}</h4>
                        <Badge className={`${impactColors[insight.impact]} border text-xs`}>
                          {insight.impact}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-700 mb-2">{insight.finding}</p>
                      <p className="text-sm text-indigo-700 font-medium">{insight.recommendation}</p>
                      <div className="mt-2 flex items-center gap-1">
                        <span className="text-xs text-slate-500">Confidence:</span>
                        <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-indigo-500 rounded-full"
                            style={{ width: `${insight.confidence}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-slate-500">{insight.confidence}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}