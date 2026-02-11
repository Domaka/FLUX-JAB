import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, X, Send, Save, Sparkles, Bot, User as UserIcon, Minimize2 } from "lucide-react";
import { InvokeLLM } from "@/integrations/Core";
import { Project } from "@/entities/Project";
import { SavedItem } from "@/entities/SavedItem";
import { User } from "@/entities/User";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [projects, setProjects] = useState([]);
  const [projectId, setProjectId] = useState("");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const storageKey = `flux_chat_${projectId || "noproj"}`;

  useEffect(() => {
    Project.list("-created_date").then(p => { 
      setProjects(p); 
      setProjectId(p[0]?.id || ""); 
    });
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try { setMessages(JSON.parse(saved)); } catch {}
    } else {
      setMessages([{ 
        role: "system", 
        content: "You are MarketMentor, a helpful AI assistant specialized in product launches, marketing strategy, and growth tactics." 
      }]);
    }
  }, [projectId]);

  useEffect(() => {
    const id = setInterval(() => {
      localStorage.setItem(storageKey, JSON.stringify(messages));
    }, 6000);
    return () => clearInterval(id);
  }, [messages, storageKey]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    if (!input.trim()) return;
    const userMsg = { role: "user", content: input, ts: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    let context = "";
    const proj = projects.find(x => x.id === projectId);
    if (proj) {
      context = `PROJECT: name=${proj.product_name}; category=${proj.category}; goal=${proj.primary_goal}; price=${proj.price?proj.price+" "+(proj.currency||"USD"):"N/A"}`;
    }

    const res = await InvokeLLM({
      prompt: `SYSTEM: Act as MarketMentor. Reply in clean Markdown (paragraphs, lists).
- Format links as [Source: Title](https://url).
- No stray symbols, code fences, or raw JSON.
- Keep answers concise and readable.
CONTEXT:
${context}
CHAT:
${messages.filter(m=>m.role!=="system").map(m=>`${m.role.toUpperCase()} (${m.ts||""}): ${m.content}`).join("\n")}
USER: ${userMsg.content}
ASSISTANT:`,
      add_context_from_internet: true
    });

    const content = typeof res === "string" ? res : (res.reply || JSON.stringify(res));
    const assistantMsg = { role: "assistant", content, ts: new Date().toISOString() };
    setMessages(prev => [...prev, assistantMsg]);
    setLoading(false);
  };

  const saveThread = async () => {
    const me = await User.me().catch(()=>null);
    await SavedItem.create({
      user_id: me?.id || "",
      project_id: projectId || "",
      tab_name: "Learning Hub",
      subtab_name: "MarketMentor",
      title: "Chat session",
      content_type: "text",
      content_text: messages.filter(m=>m.role!=="system").map(m=>`${m.role}: ${m.content}`).join("\n").slice(0, 240),
      content_json: { messages }
    });
    alert("Chat saved to Project");
  };

  const clearChat = () => {
    if (!confirm("Clear chat history?")) return;
    setMessages([{ 
      role: "system", 
      content: "You are MarketMentor, a helpful AI assistant." 
    }]);
    localStorage.removeItem(storageKey);
  };

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-2xl"
            aria-label="Open MarketMentor"
          >
            <MessageSquare className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 z-50 w-[400px] max-w-[calc(100vw-48px)] bg-card rounded-2xl shadow-2xl border border-border/50 overflow-hidden flux-glass dark:flux-glass-dark"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-gradient-to-r from-primary/5 to-accent/5">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-sm">MarketMentor</h3>
                  <p className="text-xs text-muted-foreground">AI Launch Assistant</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <select 
                  value={projectId} 
                  onChange={(e) => setProjectId(e.target.value)} 
                  className="text-xs border rounded-lg px-2 py-1.5 bg-secondary/50 border-border/50 focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option value="">No project</option>
                  {projects.map(p => <option key={p.id} value={p.id}>{p.product_name}</option>)}
                </select>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setOpen(false)} 
                  className="h-8 w-8 rounded-lg"
                >
                  <Minimize2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <div className="h-80 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-transparent to-secondary/10">
              {messages.filter(m => m.role !== "system").map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    m.role === "user" 
                      ? "bg-indigo-500/20" 
                      : "bg-gradient-to-br from-indigo-500 to-purple-500"
                  }`}>
                    {m.role === "user" 
                      ? <UserIcon className="w-4 h-4 text-primary" />
                      : <Bot className="w-4 h-4 text-white" />
                    }
                  </div>
                  <div className={`max-w-[80%] ${m.role === "user" ? "text-right" : ""}`}>
                    <div className={`px-4 py-2.5 rounded-2xl ${
                      m.role === "user" 
                        ? "bg-primary text-primary-foreground rounded-tr-sm" 
                        : "bg-secondary/80 text-foreground rounded-tl-sm"
                    }`}>
                      <div className="text-sm">
                        {m.role === "assistant" ? (
                          <ReactMarkdown className="prose prose-sm max-w-none dark:prose-invert prose-p:my-1 prose-li:my-0">
                            {m.content}
                          </ReactMarkdown>
                        ) : (
                          m.content
                        )}
                      </div>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1 px-1">
                      {new Date(m.ts || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </motion.div>
              ))}
              
              {loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-3"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-secondary/80 rounded-2xl rounded-tl-sm px-4 py-3">
                    <div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className="w-2 h-2 rounded-full bg-primary/60"
                          animate={{ opacity: [0.4, 1, 0.4] }}
                          transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-border/50 bg-card">
              <div className="flex items-center gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { 
                    if (e.key === "Enter" && !e.shiftKey) { 
                      e.preventDefault(); 
                      send(); 
                    } 
                  }}
                  placeholder="Ask about markets, channels, strategy..."
                  className="flex-1 bg-secondary/50 border border-border/50 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <Button 
                  onClick={send} 
                  disabled={loading || !input.trim()}
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white h-10 px-4"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex items-center justify-between mt-3">
                <button 
                  onClick={clearChat}
                  className="text-xs text-muted-foreground hover:text-destructive transition-colors"
                >
                  Clear chat
                </button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={saveThread}
                  className="text-xs h-7"
                >
                  <Save className="w-3 h-3 mr-1" />
                  Save thread
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}