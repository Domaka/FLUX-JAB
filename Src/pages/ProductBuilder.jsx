import React, { useState } from "react";
import { Project } from "@/entities/Project";
import { Report } from "@/entities/Report";
import { InvokeLLM, UploadFile, ExtractDataFromUploadedFile } from "@/integrations/Core";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  Loader2, 
  Sparkles, 
  Target, 
  Users, 
  TrendingUp, 
  Upload, 
  FileText, 
  Play,
  CheckCircle2,
  AlertCircle,
  Rocket,
  ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ProductBuilder() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    product_name: "",
    product_type: "digital",
    category: "",
    description: "",
    document_content: "",
    document_source: "",
    target_markets: "",
    target_budget: "",
    launch_date: "",
    primary_goal: "",
    price: "",
    currency: "USD",
    signals: ""
  });

  const [isUploading, setIsUploading] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [runProgress, setRunProgress] = useState(0);
  const [runStage, setRunStage] = useState("");
  const [results, setResults] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const { file_url } = await UploadFile({ file });
      
      // Extract text from the file
      const extracted = await ExtractDataFromUploadedFile({
        file_url,
        json_schema: {
          type: "object",
          properties: {
            content: { type: "string", description: "Full text content of the document" },
            title: { type: "string", description: "Document title if present" }
          }
        }
      });

      if (extracted.status === "success" && extracted.output) {
        setFormData(prev => ({
          ...prev,
          document_content: extracted.output.content || "",
          document_source: file.name.endsWith('.pdf') ? 'pdf' : 'docx',
          product_name: extracted.output.title || prev.product_name
        }));
      }
    } catch (error) {
      console.error("Upload error:", error);
    }
    setIsUploading(false);
  };

  const runProject = async () => {
    if (!formData.product_name || (!formData.description && !formData.document_content)) {
      alert("Please provide a product name and description or upload a document.");
      return;
    }

    setIsRunning(true);
    setRunProgress(0);
    setResults(null);

    const content = formData.document_content || formData.description;

    try {
      // Stage 1: Market Fit Analysis
      setRunStage("Analyzing Market Fit...");
      setRunProgress(15);
      
      const marketFitResult = await InvokeLLM({
        prompt: `You are Flux Market Fit Analyzer. Analyze this product and provide comprehensive market fit analysis.

PRODUCT: ${formData.product_name}
TYPE: ${formData.product_type}
CATEGORY: ${formData.category || 'Not specified'}
TARGET MARKETS: ${formData.target_markets || 'Global'}
CONTENT: ${content}

Provide:
1. survey_questions: 10 targeted validation questions (mix of quant and qual)
2. persona_fit_score: 0-100 score for product-market fit
3. personas: 3 buyer personas with name, demographics, pain_points, fit_score
4. feature_confusion: any confusing features with issues and simplified alternatives
5. value_props: 3 compelling value propositions`,
        response_json_schema: {
          type: "object",
          properties: {
            survey_questions: { type: "array", items: { type: "string" } },
            persona_fit_score: { type: "number" },
            personas: { 
              type: "array", 
              items: { 
                type: "object", 
                properties: { 
                  name: { type: "string" }, 
                  demographics: { type: "string" }, 
                  pain_points: { type: "string" }, 
                  fit_score: { type: "number" } 
                } 
              } 
            },
            feature_confusion: { 
              type: "array", 
              items: { 
                type: "object", 
                properties: { 
                  feature: { type: "string" }, 
                  issue: { type: "string" }, 
                  simplified: { type: "string" } 
                } 
              } 
            },
            value_props: { type: "array", items: { type: "string" } }
          }
        }
      });

      setRunProgress(40);

      // Stage 2: Market Opportunities
      setRunStage("Discovering Market Opportunities...");
      
      const marketResult = await InvokeLLM({
        prompt: `You are Flux Market Intelligence. Find top market opportunities.

PRODUCT: ${formData.product_name}
TYPE: ${formData.product_type}
TARGET MARKETS: ${formData.target_markets || 'Global'}
BUDGET: $${formData.target_budget || 'Not specified'}

Provide top 5 geographic markets with:
- country name
- opportunity_score (0-100)
- estimated_cpm (cost per thousand)
- audience_size (e.g., "2.5M", "500K")
- key_channels: best marketing channels for that market`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            markets: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  country: { type: "string" },
                  opportunity_score: { type: "number" },
                  estimated_cpm: { type: "number" },
                  audience_size: { type: "string" },
                  key_channels: { type: "array", items: { type: "string" } }
                }
              }
            },
            keywords: { type: "array", items: { type: "string" } },
            competitors: { 
              type: "array", 
              items: { 
                type: "object", 
                properties: { 
                  name: { type: "string" }, 
                  position: { type: "string" } 
                } 
              } 
            }
          }
        }
      });

      setRunProgress(65);

      // Stage 3: Launch Roadmap
      setRunStage("Building Launch Roadmap...");
      
      const roadmapResult = await InvokeLLM({
        prompt: `You are Flux Launch Planner. Create a comprehensive launch roadmap.

PRODUCT: ${formData.product_name}
TYPE: ${formData.product_type}
LAUNCH DATE: ${formData.launch_date || 'Not specified'}
BUDGET: $${formData.target_budget || 'Not specified'}
GOAL: ${formData.primary_goal || 'awareness'}

Create a launch roadmap with tasks organized by phase (pre_launch, launch, post_launch).
Each task should have: title, owner (role), due_in_days, dependencies, priority.`,
        response_json_schema: {
          type: "object",
          properties: {
            pre_launch: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  owner: { type: "string" },
                  due_in_days: { type: "number" },
                  dependencies: { type: "array", items: { type: "string" } },
                  priority: { type: "string" }
                }
              }
            },
            launch: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  owner: { type: "string" },
                  due_in_days: { type: "number" },
                  dependencies: { type: "array", items: { type: "string" } },
                  priority: { type: "string" }
                }
              }
            },
            post_launch: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  owner: { type: "string" },
                  due_in_days: { type: "number" },
                  dependencies: { type: "array", items: { type: "string" } },
                  priority: { type: "string" }
                }
              }
            }
          }
        }
      });

      setRunProgress(85);

      // Stage 4: Executive Summary
      setRunStage("Generating Executive Summary...");
      
      const summaryResult = await InvokeLLM({
        prompt: `You are Flux Executive Summarizer. Create a compelling executive summary.

PRODUCT: ${formData.product_name}
FIT SCORE: ${marketFitResult.persona_fit_score}/100
TOP MARKETS: ${marketResult.markets?.slice(0, 3).map(m => m.country).join(', ')}
VALUE PROPS: ${marketFitResult.value_props?.join('; ')}

Write a 3-paragraph executive summary that:
1. Describes the product and its market positioning
2. Highlights key opportunities and recommended markets
3. Outlines the recommended launch strategy

Also provide:
- roi_forecast: estimated ROI percentage
- confidence_score: 0-100 confidence in analysis`,
        response_json_schema: {
          type: "object",
          properties: {
            executive_summary: { type: "string" },
            roi_forecast: { type: "number" },
            confidence_score: { type: "number" }
          }
        }
      });

      setRunProgress(100);
      setRunStage("Complete!");

      // Combine all results
      const combinedResults = {
        ...marketFitResult,
        markets: marketResult.markets,
        keywords: marketResult.keywords,
        competitors: marketResult.competitors,
        roadmap: roadmapResult,
        executive_summary: summaryResult.executive_summary,
        roi_forecast: summaryResult.roi_forecast,
        confidence_score: summaryResult.confidence_score
      };

      setResults(combinedResults);
      setStep(3);

    } catch (error) {
      console.error("Run error:", error);
      setRunStage("Error occurred");
    }

    setIsRunning(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const projectData = {
        ...formData,
        name: formData.product_name,
        target_budget: parseFloat(formData.target_budget) || 0,
        price: formData.price ? parseFloat(formData.price) : undefined,
        run_status: "completed",
        last_run_date: new Date().toISOString(),
        ...(results && {
          survey_kit: results.survey_questions,
          persona_fit_score: results.persona_fit_score,
          personas: results.personas,
          feature_confusion: results.feature_confusion,
          value_props: results.value_props,
          keywords: results.keywords,
          competitors: results.competitors,
          top_regions: results.markets,
          executive_summary: results.executive_summary,
          roi_forecast: results.roi_forecast,
          confidence_score: results.confidence_score
        })
      };

      const project = await Project.create(projectData);

      // Create a report
      if (results) {
        await Report.create({
          project_id: project.id,
          type: "full_run",
          title: `${formData.product_name} - Launch Analysis`,
          executive_summary: results.executive_summary,
          content_json: results,
          export_formats: ["json", "csv", "pdf"]
        });
      }

      window.location.href = createPageUrl(`ProjectView?project=${project.id}`);
    } catch (error) {
      console.error("Save error:", error);
    }
    setIsSaving(false);
  };

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-purple-950 dark:to-slate-900">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 mb-4">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">AI-Powered Analysis</span>
          </div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Create Project
          </h1>
          <p className="text-muted-foreground">
            Upload your product document and run AI-powered launch analysis
          </p>
        </motion.div>

        {/* Progress Steps */}
        <div className="flex items-center gap-4 mb-8">
          {[
            { num: 1, label: "Input" },
            { num: 2, label: "Run" },
            { num: 3, label: "Results" }
          ].map((s, i) => (
            <React.Fragment key={s.num}>
              <div className={`flex items-center gap-2 ${step >= s.num ? 'text-primary' : 'text-muted-foreground'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-lg ${
                  step > s.num ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white' : 
                  step === s.num ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border-2 border-indigo-500 text-indigo-600' : 
                  'border-2 border-muted-foreground/30 bg-white dark:bg-slate-800'
                }`}>
                  {step > s.num ? <CheckCircle2 className="w-5 h-5" /> : s.num}
                </div>
                <span className="hidden sm:inline font-medium">{s.label}</span>
              </div>
              {i < 2 && <div className={`flex-1 h-1 rounded-full ${step > s.num ? 'bg-gradient-to-r from-indigo-500 to-purple-500' : 'bg-slate-200 dark:bg-slate-700'}`} />}
            </React.Fragment>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Input */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Document Input */}
                <Card className="border-0 shadow-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm overflow-hidden">
                  <div className="h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 shadow-lg">
                        <FileText className="w-5 h-5 text-white" />
                      </div>
                      <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Product Information</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Product Name *</Label>
                        <Input
                          value={formData.product_name}
                          onChange={(e) => setFormData(prev => ({ ...prev, product_name: e.target.value }))}
                          placeholder="e.g., SaaS Dashboard Pro"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Product Type</Label>
                        <Select value={formData.product_type} onValueChange={(v) => setFormData(prev => ({ ...prev, product_type: v }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="digital">Digital</SelectItem>
                            <SelectItem value="physical">Physical</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <Tabs defaultValue="paste">
                      <TabsList className="w-full">
                        <TabsTrigger value="paste" className="flex-1">Paste Text</TabsTrigger>
                        <TabsTrigger value="upload" className="flex-1">Upload File</TabsTrigger>
                      </TabsList>
                      <TabsContent value="paste" className="mt-4">
                        <div className="space-y-2">
                          <Label>Product Description / Document *</Label>
                          <Textarea
                            value={formData.document_content || formData.description}
                            onChange={(e) => setFormData(prev => ({ 
                              ...prev, 
                              document_content: e.target.value,
                              description: e.target.value,
                              document_source: 'paste'
                            }))}
                            placeholder="Paste your whitepaper, PRD, or product description here..."
                            className="min-h-[200px]"
                          />
                        </div>
                      </TabsContent>
                      <TabsContent value="upload" className="mt-4">
                        <div className="border-2 border-dashed border-border/50 rounded-xl p-8 text-center">
                          <input
                            type="file"
                            accept=".pdf,.docx,.doc,.txt"
                            onChange={handleFileUpload}
                            className="hidden"
                            id="file-upload"
                          />
                          <label htmlFor="file-upload" className="cursor-pointer">
                            {isUploading ? (
                              <Loader2 className="w-12 h-12 mx-auto mb-4 text-primary animate-spin" />
                            ) : (
                              <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                            )}
                            <p className="font-medium text-foreground mb-1">
                              {isUploading ? "Processing..." : "Click to upload"}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              PDF, DOCX, or TXT files
                            </p>
                          </label>
                          {formData.document_source && (
                            <Badge className="mt-4" variant="secondary">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Document loaded
                            </Badge>
                          )}
                        </div>
                      </TabsContent>
                    </Tabs>

                    <div className="space-y-2">
                      <Label>Target Markets</Label>
                      <Input
                        value={formData.target_markets}
                        onChange={(e) => setFormData(prev => ({ ...prev, target_markets: e.target.value }))}
                        placeholder="e.g., US, UK, Germany, Japan"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Project Settings */}
                <Card className="border-0 shadow-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm overflow-hidden">
                  <div className="h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500" />
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg">
                        <Target className="w-5 h-5 text-white" />
                      </div>
                      <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Launch Settings</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Category</Label>
                        <Input
                          value={formData.category}
                          onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                          placeholder="e.g., SaaS, E-commerce"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Primary Goal</Label>
                        <Select value={formData.primary_goal} onValueChange={(v) => setFormData(prev => ({ ...prev, primary_goal: v }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select goal" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="awareness">Awareness</SelectItem>
                            <SelectItem value="leads">Lead Generation</SelectItem>
                            <SelectItem value="sales">Direct Sales</SelectItem>
                            <SelectItem value="trial">Trial/Signup</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Launch Budget ($)</Label>
                        <Input
                          type="number"
                          value={formData.target_budget}
                          onChange={(e) => setFormData(prev => ({ ...prev, target_budget: e.target.value }))}
                          placeholder="e.g., 10000"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Launch Date</Label>
                        <Input
                          type="date"
                          value={formData.launch_date}
                          onChange={(e) => setFormData(prev => ({ ...prev, launch_date: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Product Price</Label>
                        <Input
                          type="number"
                          value={formData.price}
                          onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                          placeholder="e.g., 99"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Currency</Label>
                        <Select value={formData.currency} onValueChange={(v) => setFormData(prev => ({ ...prev, currency: v }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="USD">USD</SelectItem>
                            <SelectItem value="EUR">EUR</SelectItem>
                            <SelectItem value="GBP">GBP</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Early Signals (optional)</Label>
                      <Textarea
                        value={formData.signals}
                        onChange={(e) => setFormData(prev => ({ ...prev, signals: e.target.value }))}
                        placeholder="Waitlist signups, traffic, search trends..."
                        className="min-h-[80px]"
                      />
                    </div>

                    <Button 
                      onClick={() => setStep(2)} 
                      disabled={!formData.product_name || (!formData.description && !formData.document_content)}
                      className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white h-12 shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      Continue to Run Project
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          )}

          {/* Step 2: Run */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card className="border-0 shadow-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm max-w-2xl mx-auto overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
                <CardContent className="p-8 text-center">
                  {!isRunning && !results && (
                    <>
                      <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl animate-pulse">
                        <Rocket className="w-12 h-12 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold text-foreground mb-3">
                        Ready to Analyze
                      </h2>
                      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                        AI will analyze market fit, discover opportunities, build personas, and generate your launch roadmap.
                      </p>
                      <div className="flex gap-4 justify-center">
                        <Button variant="outline" onClick={() => setStep(1)}>
                          Back
                        </Button>
                        <Button onClick={runProject} className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white px-8 shadow-lg hover:shadow-xl transition-all">
                          <Play className="w-5 h-5 mr-2" />
                          Run Project
                        </Button>
                      </div>
                    </>
                  )}

                  {isRunning && (
                    <>
                      <div className="relative w-28 h-28 mx-auto mb-6">
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full animate-spin" style={{ animationDuration: '3s' }} />
                        <div className="absolute inset-1 bg-white dark:bg-slate-900 rounded-full" />
                        <div className="absolute inset-3 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                          <Sparkles className="w-10 h-10 text-white animate-pulse" />
                        </div>
                      </div>
                      <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                        {runStage}
                      </h2>
                      <div className="w-full max-w-md mx-auto mb-4">
                        <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden shadow-inner">
                          <motion.div 
                            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${runProgress}%` }}
                            transition={{ duration: 0.5 }}
                          />
                        </div>
                      </div>
                      <p className="text-muted-foreground font-medium">
                        {runProgress}% complete
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 3: Results */}
          {step === 3 && results && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Executive Summary */}
              <Card className="border-0 shadow-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
                <CardHeader>
                  <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                    <CardTitle className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 shadow-lg">
                        <Sparkles className="w-5 h-5 text-white" />
                      </div>
                      <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Executive Summary</span>
                    </CardTitle>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-indigo-600 border border-indigo-500/30">
                        Fit Score: {results.persona_fit_score}/100
                      </Badge>
                      <Badge className="bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-600 border border-emerald-500/30">
                        ROI Forecast: +{results.roi_forecast}%
                      </Badge>
                      <Badge className="bg-gradient-to-r from-orange-500/20 to-amber-500/20 text-orange-600 border border-orange-500/30">
                        Confidence: {results.confidence_score}%
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground whitespace-pre-line">{results.executive_summary}</p>
                </CardContent>
              </Card>

              <div className="grid lg:grid-cols-2 gap-6">
                {/* Market Opportunities */}
                <Card className="border-0 shadow-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm overflow-hidden">
                  <div className="h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg">
                        <TrendingUp className="w-5 h-5 text-white" />
                      </div>
                      <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Top Markets</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {results.markets?.slice(0, 5).map((market, i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 rounded-xl border border-slate-200 dark:border-slate-600 hover:shadow-md transition-all">
                          <div>
                            <p className="font-semibold text-foreground">{market.country}</p>
                            <p className="text-sm text-muted-foreground">
                              Audience: {market.audience_size} • CPM: ${market.estimated_cpm}
                            </p>
                          </div>
                          <Badge className={`${
                            market.opportunity_score >= 80 ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white' :
                            market.opportunity_score >= 60 ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white' :
                            'bg-gradient-to-r from-slate-400 to-slate-500 text-white'
                          }`}>
                            {market.opportunity_score}/100
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Personas */}
                <Card className="border-0 shadow-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm overflow-hidden">
                  <div className="h-1 bg-gradient-to-r from-pink-500 to-rose-500" />
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 shadow-lg">
                        <Users className="w-5 h-5 text-white" />
                      </div>
                      <span className="bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">Buyer Personas</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {results.personas?.map((persona, i) => (
                        <div key={i} className="p-4 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 rounded-xl border border-slate-200 dark:border-slate-600 hover:shadow-md transition-all">
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-semibold text-foreground">{persona.name}</p>
                            <Badge className="bg-gradient-to-r from-pink-500 to-rose-500 text-white">Fit: {persona.fit_score}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">{persona.demographics}</p>
                          <p className="text-sm text-muted-foreground">Pain: {persona.pain_points}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Survey Kit */}
              <Card className="border-0 shadow-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-amber-500 to-orange-500" />
                <CardHeader>
                  <CardTitle className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">Survey Kit</CardTitle>
                </CardHeader>
                <CardContent>
                  <ol className="list-decimal pl-5 space-y-2">
                    {results.survey_questions?.map((q, i) => (
                      <li key={i} className="text-foreground">{q}</li>
                    ))}
                  </ol>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex justify-center gap-4">
                <Button variant="outline" onClick={() => setStep(2)}>
                  Re-run Analysis
                </Button>
                <Button 
                  onClick={handleSave} 
                  disabled={isSaving}
                  className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white px-8 shadow-lg hover:shadow-xl transition-all"
                >
                  {isSaving ? (
                    <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Saving...</>
                  ) : (
                    <><CheckCircle2 className="w-5 h-5 mr-2" /> Save & View Project</>
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}