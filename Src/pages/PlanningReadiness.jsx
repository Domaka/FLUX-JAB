import React, { useEffect, useState } from "react";
import { Project } from "@/entities/Project";
import { InvokeLLM } from "@/integrations/Core";
import ToolShell from "../components/common/ToolShell";
import ComingSoon from "../components/common/ComingSoon";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ChecklistTask } from "@/entities/ChecklistTask";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { AgileTask } from "@/entities/AgileTask";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { ClipboardList, Clock, Kanban, Map } from "lucide-react";

export default function PlanningReadiness() {
  const [projects, setProjects] = useState([]);
  const [active, setActive] = useState("checklist");
  useEffect(() => {
    Project.list("-created_date").then(setProjects);
    const urlParams = new URLSearchParams(window.location.search);
    const t = urlParams.get("tool");
    if (t) setActive(t);
  }, []);

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-2">
            Planning & Readiness
          </h1>
          <p className="text-muted-foreground">Prepare and track your launch with AI-generated checklists</p>
        </motion.div>
        <Tabs value={active} onValueChange={setActive} className="space-y-6">
          <TabsList className="flex flex-wrap gap-2 bg-secondary/50 p-1 rounded-xl">
            <TabsTrigger value="checklist">Launch Checklist</TabsTrigger>
            <TabsTrigger value="timing">Timing Planner</TabsTrigger>
            <TabsTrigger value="agile">Agile Workspace</TabsTrigger>
            <TabsTrigger value="roadmap">Launch Roadmap</TabsTrigger>
          </TabsList>

          <TabsContent value="checklist">
            <ToolShell
              title="Launch Checklist"
              description="AI generates step-by-step tasks across teams with risks and exports."
              category="planning"
              toolKey="launch_checklist"
              projectOptions={projects}
              fields={[
                { name: "product_type", label: "Product Type", type: "select", placeholder: "Select", options: [
                  { value: "digital", label: "Digital" }, { value: "physical", label: "Physical" }
                ]},
                { name: "channels", label: "Primary Channels", type: "textarea", placeholder: "e.g., Meta Ads, Google Search, Influencers" },
                { name: "markets", label: "Target Markets", type: "textarea", placeholder: "e.g., US, DE, AU" }
              ]}
              onRun={async (values) => {
                const res = await InvokeLLM({
                  prompt: `SYSTEM: You are Flux Launch Planner. Create a checklist divided by teams (Marketing, Sales, Ops, Legal) with tasks, owners, due_in_days, and risk_flags. Include a risks array with mitigation tips. Return JSON with {tasks: [{team,title,owner,due_in_days,dependencies?:[] }], risks:[{title,level,mitigation}]}. CONTEXT: ${JSON.stringify(values)}`,
                  response_json_schema: {
                    type: "object",
                    properties: {
                      tasks: { type: "array", items: { type: "object", properties: {
                        team: { type: "string" }, title: { type: "string" }, owner: { type: "string" }, due_in_days: { type: "number" }, dependencies: { type: "array", items: { type: "string" } }
                      } } },
                      risks: { type: "array", items: { type: "object", properties: { title: { type: "string" }, level: { type: "string" }, mitigation: { type: "string" } } } }
                    }
                  }
                });
                return res;
              }}
              renderResult={(data) => (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-2">Tasks by Team</h3>
                    <div className="grid md:grid-cols-2 gap-3">
                      {(data.tasks || []).map((t, i) => (
                        <div key={i} className="p-3 bg-white rounded border">
                          <div className="text-xs uppercase text-slate-500">{t.team}</div>
                          <div className="font-medium text-slate-900">{t.title}</div>
                          <div className="text-sm text-slate-600">Owner: {t.owner} • Due in {t.due_in_days}d</div>
                          {t.dependencies && t.dependencies.length > 0 && (
                            <div className="text-xs text-slate-500 mt-1">Depends on: {t.dependencies.join(", ")}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  {(data.risks || []).length > 0 && (
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-2">Risks</h3>
                      <div className="space-y-2">
                        {data.risks.map((r, i) => (
                          <div key={i} className="p-3 bg-slate-50 rounded border">
                            <div className="font-medium">{r.title} <span className="text-xs text-slate-500">({r.level})</span></div>
                            <div className="text-sm text-slate-700">Mitigation: {r.mitigation}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            />
          </TabsContent>

          <TabsContent value="timing">
            <ToolShell
              title="Timing Planner"
              description="AI suggests optimal launch windows and computes readiness."
              category="planning"
              toolKey="timing_planner"
              projectOptions={projects}
              fields={[
                { name: "seasonality_notes", label: "Seasonality / Constraints", type: "textarea", placeholder: "Holidays, events, vendor timelines…" }
              ]}
              onRun={async (values, projectId) => {
                const tasks = await ChecklistTask.filter({ project_id: projectId });
                const done = tasks.filter(t=>t.status==="done").length;
                const readiness = tasks.length>0 ? Math.round((done/tasks.length)*100) : 20;
                const ai = await InvokeLLM({
                  prompt: `SYSTEM: You are Flux Timing Planner. Suggest best launch window, early/late risks, and buffer plan.
Return:
{"best_date":"YYYY-MM-DD","windows":[{"start":"YYYY-MM-DD","end":"YYYY-MM-DD","reason":""}],"risks":["",""],"buffers":[{"area":"","days":0}]}
INPUT seasonality=${values.seasonality_notes||"N/A"}`,
                  response_json_schema: {
                    type: "object",
                    properties: {
                      best_date: { type: "string" },
                      windows: { type: "array", items: { type: "object", properties: { start: { type: "string" }, end: { type: "string" }, reason: { type: "string" } } } },
                      risks: { type: "array", items: { type: "string" } },
                      buffers: { type: "array", items: { type: "object", properties: { area: { type: "string" }, days: { type: "number" } } } }
                    }
                  }
                });
                return { readiness, ...ai };
              }}
              renderResult={(d) => (
                <div className="space-y-6">
                  <div className="p-4 bg-white border rounded">
                    <div className="font-semibold">Readiness</div>
                    <div className="w-full h-3 bg-slate-200 rounded mt-2 overflow-hidden">
                      <div className="h-3 bg-green-500" style={{width: `${d.readiness||0}%`}} />
                    </div>
                    <div className="text-sm mt-1">{d.readiness}% ready</div>
                  </div>
                  <div className="p-4 bg-slate-50 border rounded">
                    <div className="font-semibold mb-1">Best Launch Date</div>
                    <div className="text-slate-700">{d.best_date}</div>
                  </div>
                  {d.windows?.length>0 && (
                    <div>
                      <div className="font-semibold mb-1">Windows</div>
                      <div className="space-y-2">
                        {d.windows.map((w,i)=>(
                          <div key={i} className="p-3 bg-white border rounded text-sm">
                            {w.start} → {w.end} — {w.reason}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {d.risks?.length>0 && <div className="p-3 bg-amber-50 border rounded text-sm">Risks: {d.risks.join(" • ")}</div>}
                </div>
              )}
            />
          </TabsContent>

          <TabsContent value="agile">
            <AgileBoard />
          </TabsContent>

          <TabsContent value="roadmap">
            <ToolShell
              title="Launch Roadmap"
              description="AI generates a pre/launch/post checklist. Mark tasks done as you go."
              category="planning"
              toolKey="launch_roadmap"
              projectOptions={projects}
              fields={[
                { name: "extra_notes", label: "Extra Inputs (optional)", type: "textarea", placeholder: "Add specifics for smarter checklists" }
              ]}
              onRun={async (values, projectId) => {
                const res = await InvokeLLM({
                  prompt: `SYSTEM: You are Flux Roadmap Builder. Create phases pre_launch, launch, post_launch with tasks and optional due_in_days. Return {pre_launch:[{title,due_in_days}], launch:[{title,due_in_days}], post_launch:[{title,due_in_days}]}. CONTEXT: ${values.extra_notes || "N/A"}`,
                  response_json_schema: {
                    type: "object",
                    properties: {
                      pre_launch: { type: "array", items: { type: "object", properties: { title: { type: "string" }, due_in_days: { type: "number" } } } },
                      launch: { type: "array", items: { type: "object", properties: { title: { type: "string" }, due_in_days: { type: "number" } } } },
                      post_launch: { type: "array", items: { type: "object", properties: { title: { type: "string" }, due_in_days: { type: "number" } } } }
                    }
                  }
                });
                const items = [];
                const now = new Date();
                const phases = ["pre_launch","launch","post_launch"];
                phases.forEach(phase => {
                  (res[phase] || []).forEach(t => {
                    const due = t.due_in_days ? new Date(now.getTime() + t.due_in_days*86400000) : null;
                    items.push({ project_id: projectId, phase, title: t.title, status: "todo", due_date: due ? due.toISOString().slice(0,10) : undefined });
                  });
                });
                if (items.length > 0) await ChecklistTask.bulkCreate(items);
                return { created: items.length, tip: "Tip: Save all data in other tabs for smarter checklists." };
              }}
              renderResult={(data) => (
                <div className="space-y-4">
                  <div className="text-sm text-slate-600">{data.tip}</div>
                  <RoadmapList />
                </div>
              )}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function RoadmapList() {
  const [tasks, setTasks] = React.useState([]);
  React.useEffect(() => { refresh(); }, []);
  const refresh = async () => {
    const all = await ChecklistTask.list("-created_date");
    setTasks(all);
  };
  const toggle = async (t) => {
    await ChecklistTask.update(t.id, { status: t.status === "done" ? "todo" : "done" });
    refresh();
  };
  const phases = ["pre_launch","launch","post_launch"];
  const labels = { pre_launch: "Pre-Launch", launch: "Launch", post_launch: "Post-Launch" };
  return (
    <div className="grid md:grid-cols-3 gap-4">
      {phases.map(ph => (
        <div key={ph} className="p-4 bg-white rounded border">
          <div className="font-semibold mb-2">{labels[ph]}</div>
          <div className="space-y-2">
            {tasks.filter(t => t.phase === ph).map(t => (
              <label key={t.id} className="flex items-start gap-2">
                <Checkbox checked={t.status === "done"} onCheckedChange={() => toggle(t)} />
                <span className={`${t.status === "done" ? "line-through text-slate-400" : ""}`}>{t.title}</span>
              </label>
            ))}
            {tasks.filter(t => t.phase === ph).length === 0 && (
              <div className="text-sm text-slate-500">No tasks yet</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function AgileBoard() {
  const [projectId, setProjectId] = React.useState("");
  const [projects, setProjects] = React.useState([]);
  const [title, setTitle] = React.useState("");
  const [tasks, setTasks] = React.useState([]);
  React.useEffect(()=>{ Project.list("-created_date").then(p=>{setProjects(p); setProjectId(p[0]?.id||"");}); }, []);
  React.useEffect(()=>{ refresh(); }, [projectId]);
  const refresh = async () => {
    if (!projectId) return;
    const data = await AgileTask.filter({ project_id: projectId });
    setTasks(data);
  };
  const add = async () => {
    if (!title) return;
    await AgileTask.create({ project_id: projectId, title, status: "todo" });
    setTitle(""); refresh();
  };
  const move = async (t, to) => { await AgileTask.update(t.id, { status: to }); refresh(); };
  const cols = ["todo","in_progress","done"];
  const label = { todo:"To Do", in_progress:"In Progress", done:"Done" };
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <select value={projectId} onChange={e=>setProjectId(e.target.value)} className="border rounded px-2 py-1">
          {projects.map(p=><option key={p.id} value={p.id}>{p.product_name}</option>)}
        </select>
        <Input placeholder="New task…" value={title} onChange={(e)=>setTitle(e.target.value)} />
        <Button onClick={add}>Add</Button>
      </div>
      <div className="grid md:grid-cols-3 gap-3">
        {cols.map(c=>(
          <div key={c} className="p-3 bg-white border rounded min-h-[260px]">
            <div className="font-semibold mb-2">{label[c]}</div>
            <div className="space-y-2">
              {tasks.filter(t=>t.status===c).map(t=>(
                <div key={t.id} className="p-2 bg-slate-50 border rounded flex items-center justify-between">
                  <div className="text-sm">{t.title}</div>
                  <div className="flex gap-1">
                    {c!=="todo" && <Button size="sm" variant="outline" onClick={()=>move(t,"todo")}>To Do</Button>}
                    {c!=="in_progress" && <Button size="sm" variant="outline" onClick={()=>move(t,"in_progress")}>In Progress</Button>}
                    {c!=="done" && <Button size="sm" variant="outline" onClick={()=>move(t,"done")}>Done</Button>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}