import React, { useEffect, useState } from "react";
import { Project } from "@/entities/Project";
import { InvokeLLM } from "@/integrations/Core";
import ToolShell from "../components/common/ToolShell";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

import MarketMentor from "../components/learning/MarketMentor";
import { ChecklistTask } from "@/entities/ChecklistTask";
import { Rocket } from "lucide-react";

// Simple ReadMore component for text truncation
const ReadMore = ({ text, maxLength = 150 }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const showReadMore = text && text.length > maxLength;
  const displayedText = showReadMore && !isExpanded ? `${text.substring(0, maxLength)}...` : text;

  if (!text) return null;

  return (
    <div className="text-sm">
      <p className="whitespace-pre-wrap">{displayedText}</p>
      {showReadMore && (
        <button onClick={() => setIsExpanded(!isExpanded)} className="text-blue-600 text-sm underline mt-1">
          {isExpanded ? "Read Less" : "Read More"}
        </button>
      )}
    </div>
  );
};


export default function PostLaunch() {
  const [projects, setProjects] = useState([]);
  const [active, setActive] = useState("feedback_monitor");
  useEffect(() => {
    Project.list("-created_date").then(setProjects);
    const urlParams = new URLSearchParams(window.location.search);
    const t = urlParams.get("tool");
    if (t) setActive(t);
  }, []);

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-purple-950 dark:to-slate-900">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 mb-4">
            <Rocket className="w-4 h-4 text-indigo-500" />
            <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">Optimization Hub</span>
          </div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">Post-Launch Optimization</h1>
          <p className="text-muted-foreground">Monitor feedback, run experiments, and iterate on your launch</p>
        </div>
        <Tabs value={active} onValueChange={setActive} className="space-y-6">
          <TabsList className="flex flex-wrap gap-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-indigo-500/20 p-1 rounded-xl shadow-lg">
            <TabsTrigger value="feedback_monitor" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">Feedback Monitor</TabsTrigger>
            <TabsTrigger value="pivot_engine" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">Pivot Engine</TabsTrigger>
            <TabsTrigger value="experiments" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">Experimentation Sandbox</TabsTrigger>
            <TabsTrigger value="learning_hub" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">Learning Hub</TabsTrigger>
          </TabsList>

          <TabsContent value="feedback_monitor">
            <ToolShell
              title="Feedback Monitor"
              description="Summarize reviews/tickets and flag recurring issues with actions."
              category="post_launch"
              toolKey="feedback_monitor"
              projectOptions={projects}
              fields={[
                { name: "reviews", label: "Customer Feedback (paste)", type: "textarea", placeholder: "Paste reviews, support tickets, NPS comments…" }
              ]}
              onRun={async (values) => {
                const res = await InvokeLLM({
                  prompt: `SYSTEM: You are Flux Feedback Monitor. Summarize and categorize feedback.
Return:
{"themes":[{"topic":"","frequency":0,"sample":""}],"issues":[{"issue":"","severity":"high|medium|low","action":""}],"sentiment":{"positive":0,"neutral":0,"negative":0}} 
INPUT: ${values.reviews}`,
                  response_json_schema: {
                    type: "object",
                    properties: {
                      themes: { type: "array", items: { type: "object", properties: { topic: { type: "string" }, frequency: { type: "number" }, sample: { type: "string" } } } },
                      issues: { type: "array", items: { type: "object", properties: { issue: { type: "string" }, severity: { type: "string" }, action: { type: "string" } } } },
                      sentiment: { type: "object", properties: { positive: { type: "number" }, neutral: { type: "number" }, negative: { type: "number" } } }
                    }
                  }
                });
                return res;
              }}
              renderResult={(data) => (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-2">Top Themes</h3>
                    <div className="grid md:grid-cols-2 gap-3">
                      {(data.themes || []).map((t, i) => (
                        <div key={i} className="p-3 bg-white border rounded">
                          <div className="font-medium">{t.topic}</div>
                          <div className="text-sm text-slate-600">Mentions: {t.frequency}</div>
                          <div className="text-xs text-slate-500 mt-1">Sample: {t.sample}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Issues & Actions</h3>
                    <div className="space-y-2">
                      {(data.issues || []).map((i, idx) => (
                        <div key={idx} className="p-3 bg-slate-50 border rounded">
                          <div className="font-medium">{i.issue} <span className="text-xs text-slate-500">({i.severity})</span></div>
                          <div className="text-sm text-slate-700">Action: {i.action}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  {data.sentiment && (
                    <div className="p-3 bg-white border rounded">
                      <div className="font-medium mb-2">Sentiment</div>
                      <div className="text-sm">👍 {data.sentiment.positive}% • 😐 {data.sentiment.neutral}% • 👎 {data.sentiment.negative}%</div>
                    </div>
                  )}
                </div>
              )}
            />
          </TabsContent>

          <TabsContent value="pivot_engine">
            <ToolShell
              title="Pivot Engine"
              description="AI suggests pivots based on feedback and performance."
              category="post_launch"
              toolKey="pivot_engine"
              projectOptions={projects}
              fields={[
                { name: "signals", label: "Signals (feedback/performance)", type: "textarea", placeholder: "Paste reviews, KPI notes, channel performance…" }
              ]}
              onRun={async (values, projectId) => {
                const res = await InvokeLLM({
                  prompt: `SYSTEM: You are Flux Pivot Engine.
Return:
{"pivots":[{"idea":"","impact":"low|medium|high","confidence":0,"steps":["",""]}]}
INPUT: ${values.signals}`,
                  response_json_schema: {
                    type: "object",
                    properties: {
                      pivots: { type: "array", items: { type: "object", properties: { idea: { type: "string" }, impact: { type: "string" }, confidence: { type: "number" }, steps: { type: "array", items: { type: "string" } } } } }
                    }
                  }
                });
                return { projectId, ...res };
              }}
              renderResult={(d)=>(
                <div className="space-y-3">
                  {(d.pivots||[]).map((p,i)=>(
                    <div key={i} className="p-3 bg-white border rounded">
                      <div className="font-semibold">{p.idea}</div>
                      <div className="text-xs text-slate-500">Impact: {p.impact} • Confidence: {p.confidence}%</div>
                      <ul className="list-disc pl-5 text-sm mt-1">{(p.steps||[]).map((s,j)=><li key={j}>{s}</li>)}</ul>
                      <button className="text-blue-600 text-sm underline mt-1" onClick={async ()=>{
                        const items = (p.steps||[]).map(s=>({ project_id: d.projectId, phase: "post_launch", title: s, status: "todo" }));
                        if (items.length>0) {
                          try {
                            await ChecklistTask.bulkCreate(items);
                            alert("Steps added to Checklist!"); // Provide user feedback
                          } catch (error) {
                            console.error("Failed to add checklist items:", error);
                            alert("Failed to add steps to Checklist."); // Provide error feedback
                          }
                        }
                      }}>Add steps to Checklist</button>
                    </div>
                  ))}
                </div>
              )}
            />
          </TabsContent>

          <TabsContent value="experiments">
            <ToolShell
              title="Experimentation Sandbox"
              description="AI proposes experiments with predicted outcomes."
              category="post_launch"
              toolKey="experimentation_sandbox"
              projectOptions={projects}
              fields={[
                { name: "constraints", label: "Constraints (budget, team, risk)", type: "textarea", placeholder: "Budget caps, channels, risk tolerance" }
              ]}
              onRun={async (values) => {
                const res = await InvokeLLM({
                  prompt: `SYSTEM: You are Flux Experiment Designer.
Return:
{"experiments":[{"name":"","hypothesis":"","design":"","metric":"","predicted_uplift_pct":0}],"notes":""}
INPUT: ${values.constraints||"N/A"}`,
                  response_json_schema: {
                    type: "object",
                    properties: {
                      experiments: { type: "array", items: { type: "object", properties: { name: { type: "string" }, hypothesis: { type: "string" }, design: { type: "string" }, metric: { type: "string" }, predicted_uplift_pct: { type: "number" } } } },
                      notes: { type: "string" }
                    }
                  }
                });
                return res;
              }}
              renderResult={(d)=>(
                <div className="space-y-3">
                  {(d.experiments||[]).map((e,i)=>(
                    <div key={i} className="p-3 bg-white border rounded">
                      <div className="font-semibold">{e.name}</div>
                      <div className="text-sm">Hypothesis: {e.hypothesis}</div>
                      <ReadMore text={`Design: ${e.design}\nMetric: ${e.metric}\nPredicted uplift: ${e.predicted_uplift_pct}%`} />
                    </div>
                  ))}
                  {d.notes && <div className="p-3 bg-slate-50 border rounded text-sm">{d.notes}</div>}
                </div>
              )}
            />
          </TabsContent>

          <TabsContent value="learning_hub">
            <div className="grid md:grid-cols-2 gap-6">
              <ToolShell
                title="Marketing Modules"
                description="Generate a concise lesson plan on any topic."
                category="post_launch"
                toolKey="learning_modules"
                projectOptions={projects}
                fields={[
                  { name: "topic", label: "Topic", type: "text", placeholder: "e.g., Landing page CRO" }
                ]}
                onRun={async (values) => {
                  const res = await InvokeLLM({
                    prompt: `SYSTEM: Produce a short course outline with modules, key concepts, and exercises.
Return: {"modules":[{"title":"","bullets":["",""]}]}
TOPIC: ${values.topic}`,
                    response_json_schema: {
                      type: "object",
                      properties: {
                        modules: { type: "array", items: { type: "object", properties: { title: { type: "string" }, bullets: { type: "array", items: { type: "string" } } } } }
                      }
                    }
                  });
                  return res;
                }}
                renderResult={(d)=>(
                  <div className="space-y-3">
                    {(d.modules||[]).map((m,i)=>(
                      <div key={i} className="p-3 bg-white border rounded">
                        <div className="font-semibold">{m.title}</div>
                        <ul className="list-disc pl-5 text-sm">{(m.bullets||[]).map((b,j)=><li key={j}>{b}</li>)}</ul>
                      </div>
                    ))}
                  </div>
                )}
              />
              <div className="bg-white/80 backdrop-blur-sm border-0 shadow-xl p-6 rounded-xl">
                <div className="font-semibold mb-2">MarketMentor (Chat)</div>
                <MarketMentor />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}