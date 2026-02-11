import React, { useEffect, useState } from "react";
import { Project } from "@/entities/Project";
import { base44 } from "@/api/base44Client";
import ToolShell from "../components/common/ToolShell";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import ReadMore from "../components/common/ReadMore";
import { Creative } from "@/entities/Creative";
import { motion } from "framer-motion";
import { MessageSquare, Sparkles, FileText, Mail, Copy, Check, Send, Loader2 } from "lucide-react";

export default function CreativeMessaging() {
  const [projects, setProjects] = useState([]);
  const [active, setActive] = useState("creative_engine");
  
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
            <Sparkles className="w-4 h-4 text-indigo-500" />
            <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">AI Content Studio</span>
          </div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Creative & Messaging
          </h1>
          <p className="text-muted-foreground">Generate compelling content and emails with AI</p>
        </motion.div>
        
        <Tabs value={active} onValueChange={setActive} className="space-y-6">
          <TabsList className="flex flex-wrap gap-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-indigo-500/20 p-1 rounded-xl shadow-lg">
            <TabsTrigger value="creative_engine" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">
              <Sparkles className="w-4 h-4 mr-2" />
              Creative Engine
            </TabsTrigger>
            <TabsTrigger value="email_generator" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">
              <Mail className="w-4 h-4 mr-2" />
              Email Generator
            </TabsTrigger>
            <TabsTrigger value="content_hub" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">
              <FileText className="w-4 h-4 mr-2" />
              Content Hub
            </TabsTrigger>
          </TabsList>

          <TabsContent value="creative_engine">
            <ToolShell
              title="Creative Engine 2.0"
              description="Select your product and generate multi-channel creative assets automatically."
              category="creative"
              toolKey="creative_engine_2"
              projectOptions={projects}
              fields={[
                { name: "tone", label: "Tone", type: "select", placeholder: "Select tone", options: [
                  { value: "professional", label: "Professional" },
                  { value: "casual", label: "Casual" },
                  { value: "playful", label: "Playful" },
                  { value: "luxury", label: "Luxury" }
                ]},
                { name: "locales", label: "Locales (comma-separated)", type: "text", placeholder: "e.g., US-English, DE-German" }
              ]}
              onRun={async (values, projectId) => {
                const productSummary = getProjectDescription(projectId);
                const res = await base44.integrations.Core.InvokeLLM({
                  prompt: `SYSTEM: You are Flux Creative Lab 2.0.
INPUT:
Product: ${productSummary}
Tone: ${values.tone}
Locales: ${values.locales}
OUTPUT: 
{
 "differentiation": {"summary": "", "overlaps": [], "uniques": []},
 "localization": [{"locale":"","tips":["",""]}],
 "assets": {
   "ads":[{"channel":"Meta","headline":"","body":"","cta":""}],
   "social_posts":[{"platform":"X","post":""}],
   "email":[{"subject":"","preview":"","body":""}],
   "landing_page":{"headline":"","sections":[{"title":"","copy":""}]}
 }
}
Return JSON only.`,
                  response_json_schema: {
                    type: "object",
                    properties: {
                      differentiation: { type: "object", properties: { summary: { type: "string" }, overlaps: { type: "array", items: { type: "string" } }, uniques: { type: "array", items: { type: "string" } } } },
                      localization: { type: "array", items: { type: "object", properties: { locale: { type: "string" }, tips: { type: "array", items: { type: "string" } } } } },
                      assets: { type: "object", properties: {
                        ads: { type: "array", items: { type: "object", properties: { channel: { type: "string" }, headline: { type: "string" }, body: { type: "string" }, cta: { type: "string" } } } },
                        social_posts: { type: "array", items: { type: "object", properties: { platform: { type: "string" }, post: { type: "string" } } } },
                        email: { type: "array", items: { type: "object", properties: { subject: { type: "string" }, preview: { type: "string" }, body: { type: "string" } } } },
                        landing_page: { type: "object", properties: { headline: { type: "string" }, sections: { type: "array", items: { type: "object", properties: { title: { type: "string" }, copy: { type: "string" } } } } } }
                      } }
                    }
                  }
                });
                return res;
              }}
              renderResult={(data) => (
                <div className="space-y-6">
                  <Card className="border-2 border-purple-100 bg-purple-50/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-purple-500 flex items-center justify-center">
                          <Sparkles className="w-4 h-4 text-white" />
                        </div>
                        Differentiation
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-foreground mb-3">{data.differentiation?.summary}</p>
                      <div className="flex flex-wrap gap-2">
                        {(data.differentiation?.uniques || []).map((u, i) => (
                          <Badge key={i} className="badge-green">{u}</Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <div className="grid md:grid-cols-2 gap-4">
                    {(data.localization || []).map((loc, i) => (
                      <Card key={i} className="border bg-white">
                        <CardContent className="p-4">
                          <Badge className="badge-blue mb-2">{loc.locale}</Badge>
                          <ul className="list-disc pl-5 text-sm text-muted-foreground">
                            {(loc.tips || []).map((t, j) => <li key={j}>{t}</li>)}
                          </ul>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <Card className="border bg-white">
                    <CardHeader>
                      <CardTitle className="text-lg">Generated Assets</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                          <div className="w-6 h-6 rounded bg-orange-500 flex items-center justify-center">
                            <span className="text-white text-xs">AD</span>
                          </div>
                          Ads
                        </h4>
                        <div className="grid md:grid-cols-2 gap-3">
                          {(data.assets?.ads || []).map((ad, i) => (
                            <div key={i} className="p-4 bg-orange-50 rounded-xl border border-orange-100">
                              <Badge className="badge-orange mb-2">{ad.channel}</Badge>
                              <div className="font-semibold text-foreground">{ad.headline}</div>
                              <div className="text-sm text-muted-foreground mt-1">{ad.body}</div>
                              <div className="text-primary text-sm font-medium mt-2">{ad.cta}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-foreground mb-3">Social Posts</h4>
                        <div className="grid md:grid-cols-2 gap-3">
                          {(data.assets?.social_posts || []).map((p, i) => (
                            <div key={i} className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                              <Badge className="badge-blue mb-2">{p.platform}</Badge>
                              <div className="text-sm text-foreground">{p.post}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            />
          </TabsContent>

          <TabsContent value="email_generator">
            <EmailGenerator projects={projects} getProjectDescription={getProjectDescription} />
          </TabsContent>

          <TabsContent value="content_hub">
            <ToolShell
              title="Content Hub"
              description="Select your product and generate a multi-channel content pack."
              category="creative"
              toolKey="content_hub"
              projectOptions={projects}
              fields={[
                { name: "channels", label: "Channels (comma separated)", type: "text", placeholder: "TikTok, Instagram, LinkedIn, Email" }
              ]}
              onRun={async (values, projectId) => {
                const productSummary = getProjectDescription(projectId);
                const res = await base44.integrations.Core.InvokeLLM({
                  prompt: `SYSTEM: You are Flux Content Hub.
Return JSON:
{
 "pack":[{"channel":"","title":"","copy":"","format":"post|script|email","tags":[""]}]
}
INPUT: product=${productSummary}, channels=${values.channels}`,
                  response_json_schema: {
                    type: "object",
                    properties: {
                      pack: { type: "array", items: { type: "object", properties: { channel: { type: "string" }, title: { type: "string" }, copy: { type: "string" }, format: { type: "string" }, tags: { type: "array", items: { type: "string" } } } } }
                    }
                  }
                });
                return res;
              }}
              renderResult={(d) => <ContentPack data={d} />}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function EmailGenerator({ projects, getProjectDescription }) {
  const [projectId, setProjectId] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [recipientRole, setRecipientRole] = useState("");
  const [recipientStatus, setRecipientStatus] = useState("prospect");
  const [emailReason, setEmailReason] = useState("introduction");
  const [additionalContext, setAdditionalContext] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(null);

  useEffect(() => {
    if (projects.length > 0 && !projectId) {
      setProjectId(projects[0].id);
    }
  }, [projects]);

  const generateEmail = async () => {
    if (!projectId) return;
    setLoading(true);
    
    const productDescription = getProjectDescription(projectId);
    const project = projects.find(p => p.id === projectId);
    
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `SYSTEM: You are a professional email copywriter. Generate personalized email content.

PRODUCT/SERVICE: ${productDescription}
PRODUCT NAME: ${project?.product_name || 'Our Product'}

RECIPIENT INFO:
- Name: ${recipientName || 'the recipient'}
- Role/Title: ${recipientRole || 'Decision Maker'}
- Status: ${recipientStatus}
- Email Purpose: ${emailReason}
- Additional Context: ${additionalContext || 'None provided'}

Generate 3 email variations (formal, friendly, persuasive) with:
- subject: compelling subject line
- preview: email preview text
- body: full email body with proper formatting
- cta: clear call-to-action
- follow_up_timing: suggested follow-up timing

Make emails personalized, professional, and action-oriented.`,
      response_json_schema: {
        type: "object",
        properties: {
          emails: {
            type: "array",
            items: {
              type: "object",
              properties: {
                style: { type: "string" },
                subject: { type: "string" },
                preview: { type: "string" },
                body: { type: "string" },
                cta: { type: "string" },
                follow_up_timing: { type: "string" }
              }
            }
          },
          tips: { type: "array", items: { type: "string" } }
        }
      }
    });
    
    setResult(res);
    setLoading(false);
  };

  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopied(index);
    setTimeout(() => setCopied(null), 2000);
  };

  const styleColors = {
    formal: "badge-purple",
    friendly: "badge-teal",
    persuasive: "badge-orange"
  };

  return (
    <Card className="border-0 shadow-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
      <CardHeader className="border-b border-border/50">
        <CardTitle className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg">
            <Mail className="w-5 h-5 text-white" />
          </div>
          <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Email Message Generator</span>
        </CardTitle>
        <p className="text-muted-foreground text-sm">Generate personalized emails based on your product and recipient</p>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-4">
            <div>
              <Label className="font-medium">Select Product</Label>
              <Select value={projectId} onValueChange={setProjectId}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select a product" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.product_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="font-medium">Recipient Name</Label>
              <Input 
                value={recipientName} 
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="e.g., John Smith"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label className="font-medium">Recipient Role/Title</Label>
              <Input 
                value={recipientRole} 
                onChange={(e) => setRecipientRole(e.target.value)}
                placeholder="e.g., Marketing Director"
                className="mt-1"
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <Label className="font-medium">Recipient Status</Label>
              <Select value={recipientStatus} onValueChange={setRecipientStatus}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="prospect">New Prospect</SelectItem>
                  <SelectItem value="warm_lead">Warm Lead</SelectItem>
                  <SelectItem value="demo_scheduled">Demo Scheduled</SelectItem>
                  <SelectItem value="trial_user">Trial User</SelectItem>
                  <SelectItem value="churned">Churned Customer</SelectItem>
                  <SelectItem value="existing_customer">Existing Customer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="font-medium">Email Reason</Label>
              <Select value={emailReason} onValueChange={setEmailReason}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="introduction">Introduction / Cold Outreach</SelectItem>
                  <SelectItem value="follow_up">Follow Up</SelectItem>
                  <SelectItem value="demo_invite">Demo Invitation</SelectItem>
                  <SelectItem value="trial_extension">Trial Extension Offer</SelectItem>
                  <SelectItem value="pricing_discussion">Pricing Discussion</SelectItem>
                  <SelectItem value="reengagement">Re-engagement</SelectItem>
                  <SelectItem value="upsell">Upsell / Cross-sell</SelectItem>
                  <SelectItem value="thank_you">Thank You / Appreciation</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="font-medium">Additional Context (optional)</Label>
              <Textarea 
                value={additionalContext} 
                onChange={(e) => setAdditionalContext(e.target.value)}
                placeholder="Any specific details, pain points, or personalization notes..."
                className="mt-1 min-h-[80px]"
              />
            </div>
          </div>
        </div>
        
        <Button 
          onClick={generateEmail} 
          disabled={loading || !projectId}
          className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white h-12 shadow-lg"
        >
          {loading ? (
            <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Generating Emails...</>
          ) : (
            <><Send className="w-5 h-5 mr-2" /> Generate Email Variations</>
          )}
        </Button>
        
        {result && (
          <div className="mt-8 space-y-6">
            <h3 className="font-semibold text-lg text-foreground">Generated Emails</h3>
            
            <div className="grid gap-4">
              {(result.emails || []).map((email, i) => (
                <Card key={i} className="border-2 hover:border-primary/50 transition-colors">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <Badge className={styleColors[email.style?.toLowerCase()] || "badge-purple"}>
                        {email.style}
                      </Badge>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => copyToClipboard(`Subject: ${email.subject}\n\n${email.body}`, i)}
                      >
                        {copied === i ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                        {copied === i ? "Copied!" : "Copy"}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase">Subject</p>
                      <p className="font-semibold text-foreground">{email.subject}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase">Preview</p>
                      <p className="text-sm text-muted-foreground">{email.preview}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase">Body</p>
                      <div className="text-sm text-foreground whitespace-pre-line bg-slate-50 p-4 rounded-lg mt-1">
                        {email.body}
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t">
                      <div>
                        <span className="text-xs text-muted-foreground">CTA: </span>
                        <span className="text-sm font-medium text-primary">{email.cta}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Follow up: {email.follow_up_timing}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {result.tips?.length > 0 && (
              <Card className="bg-teal-50 border-teal-100">
                <CardContent className="p-4">
                  <h4 className="font-semibold text-teal-800 mb-2">💡 Pro Tips</h4>
                  <ul className="list-disc pl-5 text-sm text-teal-700 space-y-1">
                    {result.tips.map((tip, i) => <li key={i}>{tip}</li>)}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ContentPack({ data }) {
  const saveAll = async () => {
    const items = (data.pack || []).map(p => ({
      project_id: null,
      channel: (p.channel || "linkedin").toLowerCase(),
      format: p.format === "script" ? "video" : "text",
      headline: p.title?.slice(0, 80) || "",
      body_copy: p.copy || "",
      cta: ""
    }));
    if (items.length > 0) await Creative.bulkCreate(items);
    alert("Content saved to Creatives!");
  };
  
  const channelColors = {
    tiktok: "badge-pink",
    instagram: "badge-purple",
    linkedin: "badge-blue",
    twitter: "badge-blue",
    x: "badge-blue",
    email: "badge-teal",
    youtube: "badge-orange"
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground">Generated Content Pack</h3>
        <Button onClick={saveAll} className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-lg">
          Save All to Creatives
        </Button>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {(data.pack || []).map((p, i) => (
          <Card key={i} className="border bg-white hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Badge className={channelColors[p.channel?.toLowerCase()] || "badge-blue"}>
                  {p.channel}
                </Badge>
                <Badge variant="outline">{p.format}</Badge>
              </div>
              <h4 className="font-medium text-foreground mb-2">{p.title}</h4>
              <ReadMore text={p.copy || ""} />
              {p.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {p.tags.map((tag, j) => (
                    <span key={j} className="text-xs text-muted-foreground">#{tag}</span>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}