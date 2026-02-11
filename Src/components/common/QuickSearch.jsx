import React, { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  Search, 
  Command, 
  ArrowRight,
  PanelsTopLeft,
  ClipboardList,
  MessageSquare,
  LineChart,
  ShieldAlert,
  BookOpen,
  Rocket
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const tools = [
  { label: "Market & Product Fit — Stress Test", page: "MarketProductFit", tool: "stress", icon: PanelsTopLeft },
  { label: "Planning — Launch Checklist", page: "PlanningReadiness", tool: "checklist", icon: ClipboardList },
  { label: "Creative — Creative Engine 2.0", page: "CreativeMessaging", tool: "creative_engine", icon: MessageSquare },
  { label: "Analytics — Demand Forecast", page: "AnalyticsForecasting", tool: "forecast", icon: LineChart },
  { label: "Risk — Risk Radar", page: "RiskSimulation", tool: "risk_radar", icon: ShieldAlert },
  { label: "Playbooks — B2B vs B2C", page: "PlaybooksModes", tool: "b2b_b2c", icon: BookOpen },
  { label: "Post-Launch — Feedback Monitor", page: "PostLaunch", tool: "feedback_monitor", icon: Rocket }
];

export default function QuickSearch() {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  
  const filtered = tools.filter(t => 
    t.label.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 5);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const go = (t) => {
    navigate(createPageUrl(`${t.page}?tool=${t.tool}`));
    setQuery("");
    setIsFocused(false);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e) => {
    if (!query) return;
    
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && filtered[selectedIndex]) {
      e.preventDefault();
      go(filtered[selectedIndex]);
    } else if (e.key === "Escape") {
      setQuery("");
      inputRef.current?.blur();
    }
  };

  return (
    <div className="relative w-full max-w-md">
      <div className={`relative transition-all duration-300 ${isFocused ? 'ring-2 ring-primary/30' : ''} rounded-xl`}>
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          ref={inputRef}
          placeholder="Search tools..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          onKeyDown={handleKeyDown}
          className="pl-10 pr-20 h-10 bg-secondary/50 border-border/50 focus:border-primary/50 rounded-xl"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-1 text-xs text-muted-foreground">
          <kbd className="px-1.5 py-0.5 bg-secondary rounded border border-border/50 font-mono">⌘</kbd>
          <kbd className="px-1.5 py-0.5 bg-secondary rounded border border-border/50 font-mono">K</kbd>
        </div>
      </div>
      
      <AnimatePresence>
        {query && isFocused && (
          <motion.div 
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 mt-2 w-full bg-card rounded-xl border border-border/50 shadow-xl overflow-hidden"
          >
            {filtered.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                <Search className="w-5 h-5 mx-auto mb-2 opacity-50" />
                No matching tools found
              </div>
            ) : (
              <div className="py-2">
                {filtered.map((t, i) => {
                  const Icon = t.icon;
                  return (
                    <button
                      key={i}
                      onClick={() => go(t)}
                      onMouseEnter={() => setSelectedIndex(i)}
                      className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors ${
                        i === selectedIndex 
                          ? 'bg-primary/10 text-primary' 
                          : 'text-foreground hover:bg-secondary/80'
                      }`}
                    >
                      <div className={`p-2 rounded-lg ${
                        i === selectedIndex ? 'bg-primary/20' : 'bg-secondary'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="flex-1 text-sm font-medium truncate">{t.label}</span>
                      <ArrowRight className={`w-4 h-4 transition-transform ${
                        i === selectedIndex ? 'translate-x-0 opacity-100' : '-translate-x-2 opacity-0'
                      }`} />
                    </button>
                  );
                })}
              </div>
            )}
            <div className="px-4 py-2 border-t border-border/50 bg-secondary/30">
              <p className="text-xs text-muted-foreground flex items-center gap-2">
                <kbd className="px-1 py-0.5 bg-secondary rounded text-[10px] font-mono">↑↓</kbd>
                Navigate
                <kbd className="px-1 py-0.5 bg-secondary rounded text-[10px] font-mono ml-2">↵</kbd>
                Open
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}