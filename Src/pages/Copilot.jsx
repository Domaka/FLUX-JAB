import React from "react";
import { agentSDK } from "@/agents";
import { Project } from "@/entities/Project";
import { SavedItem } from "@/entities/SavedItem";
import { User } from "@/entities/User";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Copilot() {
  const [projects, setProjects] = React.useState([]);
  const [projectId, setProjectId] = React.useState("");
  const [conversation, setConversation] = React.useState(null);
  const [messages, setMessages] = React.useState([]);
  const [input, setInput] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    Project.list("-created_date").then(p => {
      setProjects(p);
      setProjectId(p[0]?.id || "");
    });
  }, []);

  React.useEffect(() => {
    if (!projectId) return;
    // Create or load a conversation per project
    const conv = agentSDK.createConversation({
      agent_name: "flux_growth_copilot",
      metadata: {
        name: "Growth Copilot",
        description: `Project conversation for ${projects.find(x=>x.id===projectId)?.product_name || "Project"}`
      }
    });
    setConversation(conv);
    setMessages(conv.messages || []);
    const unsub = agentSDK.subscribeToConversation(conv.id, (data) => {
      setMessages(data.messages || []);
    });
    return () => unsub && unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const send = async () => {
    if (!conversation || !input) return;
    setLoading(true);
    const proj = projects.find(p => p.id === projectId);
    const me = await User.me().catch(()=>null);
    const context = `CONTEXT:
Project: ${proj?.product_name || ""} | Category: ${proj?.category || ""} | Price: ${proj?.price ? `${proj.price} ${proj.currency||"USD"}` : "N/A"} | Goal: ${proj?.primary_goal||"N/A"}
Instructions: Reply in clean markdown with paragraphs/lists. Format links as [Source: Title](https://...).`;

    await agentSDK.addMessage(conversation, {
      role: "user",
      content: `${context}\n\n${input}`
    });
    setInput("");
    setLoading(false);
  };

  const saveThread = async () => {
    if (!messages.length) return;
    await SavedItem.create({
      project_id: projectId || "",
      tab_name: "Copilot",
      subtab_name: "Growth Copilot",
      title: "Copilot Session",
      content_type: "json",
      content_json: { messages },
      content_text: messages.filter(m=>m.role!=="system").map(m=>`${m.role}: ${m.content}`).join("\n").slice(0, 240),
      metadata: { project_id: projectId }
    });
    alert("Saved to Project View");
  };

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        <Card className="bg-white/80 border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Flux Growth Copilot</span>
              <select value={projectId} onChange={(e)=>setProjectId(e.target.value)} className="border rounded px-2 py-1 text-sm">
                {projects.map(p=><option key={p.id} value={p.id}>{p.product_name}</option>)}
              </select>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-96 overflow-auto p-3 bg-white rounded border">
              {messages.filter(m=>m.role!=="system").map((m,i)=>(
                <div key={i} className={`max-w-[85%] px-3 py-2 rounded-lg mb-2 ${m.role==="user"?"ml-auto bg-blue-600 text-white":"mr-auto bg-slate-100 text-slate-900"}`}>
                  <div className="text-[10px] opacity-70 mb-1">{new Date().toLocaleTimeString()}</div>
                  <ReactMarkdown className="prose prose-sm max-w-none">{m.content}</ReactMarkdown>
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center gap-2">
              <input
                value={input}
                onChange={(e)=>setInput(e.target.value)}
                onKeyDown={(e)=>{ if(e.key==="Enter" && !e.shiftKey){ e.preventDefault(); send(); } }}
                placeholder="Ask strategy, channels, budget, risks…"
                className="flex-1 border rounded px-3 py-2 text-sm"
              />
              <Button onClick={send} disabled={loading}>Send</Button>
              <Button variant="outline" onClick={saveThread}>Save</Button>
            </div>
            <div className="text-xs text-slate-500 mt-2">Copilot routes specialized tasks to sub-agents and summarizes results.</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}