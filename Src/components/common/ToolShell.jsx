import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Loader2, 
  Save, 
  RefreshCw, 
  Eye, 
  EyeOff, 
  Sparkles, 
  Trash2,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ExportButtons from "./ExportButtons";
import { Artifact } from "@/entities/Artifact";
import AutoTextarea from "./AutoTextarea";
import { FLAGS } from "@/components/common/flags";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

export default function ToolShell({
  title,
  description,
  category,
  toolKey,
  projectOptions = [],
  fields = [],
  defaultValues = {},
  onRun,
  renderResult,
}) {
  const [values, setValues] = React.useState(defaultValues);
  const [projectId, setProjectId] = React.useState(projectOptions[0]?.id || "");
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState(null);
  const [saved, setSaved] = React.useState(false);
  const [userProfile, setUserProfile] = React.useState(null);
  const [regenCount, setRegenCount] = React.useState(0);
  const [showRaw, setShowRaw] = React.useState(false);
  const [isInputOpen, setIsInputOpen] = React.useState(true);

  const storageKey = `flux_${toolKey}_${projectId || "noproj"}`;

  React.useEffect(() => {
    (async () => {
      try {
        const me = await base44.auth.me();
        setUserProfile(me || null);
      } catch (e) {
        setUserProfile(null);
      }
    })();
  }, []);

  React.useEffect(() => {
    if (!FLAGS.persistToolOutputs) return;
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.values) setValues(parsed.values);
        if (parsed.result !== undefined) setResult(parsed.result);
      } catch (e) {
        console.error("Failed to parse saved state:", e);
      }
    }
  }, [projectId, toolKey]);

  React.useEffect(() => {
    if (!FLAGS.persistToolOutputs) return;
    const id = setInterval(() => {
      localStorage.setItem(storageKey, JSON.stringify({ values, result }));
    }, 8000);
    return () => clearInterval(id);
  }, [values, result, storageKey]);

  const handleChange = (name, value) => setValues(prev => ({ ...prev, [name]: value }));

  const run = async () => {
    setSaved(false);
    setLoading(true);
    const out = await onRun(values, projectId, userProfile, regenCount);
    setResult(out);
    setLoading(false);
    setIsInputOpen(false);
  };

  const regenerate = async () => {
    setRegenCount(c => c + 1);
    await run();
  };

  const saveArtifact = async () => {
    if (!result) return;
    await Artifact.create({
      project_id: projectId || undefined,
      category,
      tool_key: toolKey,
      title: `${title} Result`,
      data: result
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const clearOutputs = () => {
    if (!confirm("Clear AI Outputs?")) return;
    setResult(null);
    if (FLAGS.persistToolOutputs) localStorage.setItem(storageKey, JSON.stringify({ values, result: null }));
  };

  const FieldInput = ({ field }) => {
    if (field.type === "textarea") {
      return (
        <div className="space-y-2">
          <Label className="font-medium text-sm text-foreground">{field.label}</Label>
          <AutoTextarea
            value={values[field.name] || ""}
            onChange={(e) => handleChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            className="bg-secondary/50 border-border/50 focus:border-primary/50 transition-colors"
          />
        </div>
      );
    }
    if (field.type === "select") {
      return (
        <div className="space-y-2">
          <Label className="font-medium text-sm text-foreground">{field.label}</Label>
          <Select
            value={values[field.name] || ""}
            onValueChange={(v) => handleChange(field.name, v)}
          >
            <SelectTrigger className="bg-secondary/50 border-border/50">
              <SelectValue placeholder={field.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );
    }
    if (field.type === "number") {
      return (
        <div className="space-y-2">
          <Label className="font-medium text-sm text-foreground">{field.label}</Label>
          <Input
            type="number"
            placeholder={field.placeholder}
            value={values[field.name] ?? ""}
            onChange={(e) => handleChange(field.name, e.target.value)}
            className="bg-secondary/50 border-border/50"
          />
        </div>
      );
    }
    return (
      <div className="space-y-2">
        <Label className="font-medium text-sm text-foreground">{field.label}</Label>
        <Input
          placeholder={field.placeholder}
          value={values[field.name] || ""}
          onChange={(e) => handleChange(field.name, e.target.value)}
          className="bg-secondary/50 border-border/50"
        />
      </div>
    );
  };

  return (
    <Card className="border-0 shadow-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
      <CardHeader className="border-b border-border/50 pb-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 shadow-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">{title}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">{description}</p>
            </div>
          </div>
          {projectOptions.length > 0 && (
            <div className="flex items-center gap-2">
              <Badge className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-indigo-600 border border-indigo-500/30 text-xs">Project</Badge>
              <Select value={projectId} onValueChange={setProjectId}>
                <SelectTrigger className="w-48 bg-white/50 dark:bg-slate-800/50 border-indigo-500/30">
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  {projectOptions.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.product_name || p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="p-4 md:p-6 space-y-6">
        <Collapsible open={isInputOpen} onOpenChange={setIsInputOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between mb-4 text-muted-foreground hover:text-foreground">
              <span className="text-sm font-medium">Input Parameters</span>
              {isInputOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="grid md:grid-cols-2 gap-4 mb-6"
            >
              {fields.map(f => <FieldInput key={f.name} field={f} />)}
            </motion.div>
          </CollapsibleContent>
        </Collapsible>

        <div className="flex flex-wrap items-center gap-3">
          <Button 
            onClick={run} 
            disabled={loading} 
            className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transition-all"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Run AI
              </>
            )}
          </Button>
          
          <Button 
            variant="outline" 
            disabled={!result || loading} 
            onClick={regenerate}
            className="border-border/50"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Regenerate
          </Button>
          
          <Button 
            variant="outline" 
            disabled={!result} 
            onClick={saveArtifact}
            className="border-border/50"
          >
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearOutputs}
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Clear
          </Button>
          
          <ExportButtons data={result || {}} fileName={toolKey} />
          
          <Button 
            variant="ghost" 
            size="sm" 
            disabled={!result} 
            onClick={() => setShowRaw(s => !s)}
          >
            {showRaw ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
            {showRaw ? "Hide" : "Show"} Raw
          </Button>
          
          <AnimatePresence>
            {saved && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="text-emerald-600 text-sm font-medium flex items-center gap-1"
              >
                ✓ Saved
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {result?.clarifications && result.clarifications.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-700 dark:text-amber-400"
          >
            <p className="text-sm font-medium">Clarifications needed:</p>
            <p className="text-sm">{result.clarifications.join(" • ")}</p>
          </motion.div>
        )}

        <div className="mt-4">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-12"
              >
                <div className="relative w-24 h-24">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full animate-spin" style={{ animationDuration: '3s' }} />
                  <div className="absolute inset-1 bg-white dark:bg-slate-900 rounded-full" />
                  <div className="absolute inset-3 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                    <Sparkles className="w-8 h-8 text-white animate-pulse" />
                  </div>
                </div>
                <p className="mt-4 text-muted-foreground font-medium">AI is analyzing your input...</p>
                <div className="flex gap-1 mt-2">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-2 h-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                    />
                  ))}
                </div>
              </motion.div>
            ) : result ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {renderResult ? renderResult(result) : (
                  <div className="p-4 bg-secondary/50 rounded-xl border border-border/50">
                    <pre className={`text-xs overflow-auto ${showRaw ? "max-h-none" : "max-h-64"}`}>
                      {JSON.stringify(result, null, 2)}
                    </pre>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-8 md:p-12 text-center bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-950/30 dark:to-purple-950/30 rounded-2xl border border-dashed border-indigo-500/30"
              >
                <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center">
                  <Sparkles className="w-10 h-10 text-indigo-500/60" />
                </div>
                <p className="text-muted-foreground">
                  Results will appear here after running the AI
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
}