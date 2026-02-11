import React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { InvokeLLM } from "@/integrations/Core";

export default function MarketMentor() {
  const [messages, setMessages] = React.useState([{ role: "system", content: "You are MarketMentor, a helpful marketing tutor." }]);
  const [input, setInput] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const send = async () => {
    if (!input) return;
    const userMsg = { role: "user", content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    const res = await InvokeLLM({
      prompt: `SYSTEM: Act as MarketMentor.\nCHAT HISTORY:\n${messages.filter(m=>m.role!=="system").map(m=>`${m.role.toUpperCase()}: ${m.content}`).join("\n")}\nUSER: ${userMsg.content}\nASSISTANT: Provide a concise, structured answer with tips and resources.`,
      response_json_schema: {
        type: "object",
        properties: {
          answer: { type: "string" },
          resources: { type: "array", items: { type: "string" } }
        }
      }
    });
    setMessages(prev => [...prev, { role: "assistant", content: (res.answer || "") + (res.resources?.length ? `\nResources:\n- ${res.resources.join("\n- ")}` : "") }]);
    setLoading(false);
  };

  return (
    <div className="space-y-3">
      <div className="h-64 overflow-auto bg-white border rounded p-3 text-sm">
        {messages.filter(m=>m.role!=="system").map((m,i)=>(
          <div key={i} className={`mb-2 ${m.role==="user"?"text-slate-900":"text-slate-700"}`}>
            <span className="font-medium">{m.role==="user"?"You":"MarketMentor"}: </span>{m.content}
          </div>
        ))}
      </div>
      <Textarea value={input} onChange={(e)=>setInput(e.target.value)} placeholder="Ask MarketMentor anything…" />
      <Button onClick={send} disabled={loading}>{loading?"Thinking…":"Send"}</Button>
    </div>
  );
}