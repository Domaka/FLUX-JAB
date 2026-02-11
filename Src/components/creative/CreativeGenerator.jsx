import React, { useState } from "react";
import { Creative } from "@/entities/Creative";
import { InvokeLLM } from "@/integrations/Core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Sparkles, Loader2 } from "lucide-react";

const channels = [
  { value: "facebook", label: "Facebook" },
  { value: "instagram", label: "Instagram" },
  { value: "google", label: "Google Ads" },
  { value: "tiktok", label: "TikTok" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "youtube", label: "YouTube" }
];

const tones = [
  { value: "professional", label: "Professional" },
  { value: "casual", label: "Casual & Friendly" },
  { value: "urgent", label: "Urgent" },
  { value: "playful", label: "Playful" },
  { value: "luxury", label: "Luxury" },
  { value: "educational", label: "Educational" }
];

export default function CreativeGenerator({ project, onGenerate, isGenerating, setIsGenerating }) {
  const [selectedChannel, setSelectedChannel] = useState("facebook");
  const [tone, setTone] = useState("professional");
  const [customPrompt, setCustomPrompt] = useState("");

  const handleGenerate = async () => {
    if (!project || !selectedChannel) return;

    setIsGenerating(true);
    try {
      const prompt = `You are Flux Creative Lab. Generate high-performing ad creatives for this campaign:

Product: ${project.product_name}
Description: ${project.description}
Category: ${project.category}
Channel: ${selectedChannel}
Tone: ${tone}
Keywords: ${project.keywords?.join(", ") || "N/A"}
Value Props: ${project.value_props?.join("; ") || "N/A"}
${customPrompt ? `Additional Requirements: ${customPrompt}` : ""}

Generate 4 distinct creative variants optimized for ${selectedChannel}. Each should have:
- Compelling headline (under 50 chars for mobile)
- Body copy appropriate for the channel
- Strong call-to-action
- Performance prediction rationale
- Image generation prompt for visual assets

Consider platform best practices, audience psychology, and conversion optimization.`;

      const result = await InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            creatives: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  headline: { type: "string" },
                  body_copy: { type: "string" },
                  cta: { type: "string" },
                  predicted_performance: { 
                    type: "string",
                    enum: ["low", "medium", "high"]
                  },
                  performance_rationale: { type: "string" },
                  image_prompt: { type: "string" }
                }
              }
            }
          }
        }
      });

      // Save creatives to database
      const creativesToSave = result.creatives?.map(creative => ({
        project_id: project.id,
        channel: selectedChannel,
        format: "text",
        ...creative
      })) || [];

      await Creative.bulkCreate(creativesToSave);
      onGenerate();
      
    } catch (error) {
      console.error("Generation error:", error);
    }
    setIsGenerating(false);
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl h-fit">
      <CardHeader className="border-b border-slate-100 pb-6">
        <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-purple-600" />
          Generate Creatives
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="space-y-2">
          <Label className="font-medium text-slate-700">Target Channel</Label>
          <Select value={selectedChannel} onValueChange={setSelectedChannel}>
            <SelectTrigger className="border-slate-200 focus:border-purple-500">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {channels.map(channel => (
                <SelectItem key={channel.value} value={channel.value}>
                  {channel.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="font-medium text-slate-700">Brand Tone</Label>
          <Select value={tone} onValueChange={setTone}>
            <SelectTrigger className="border-slate-200 focus:border-purple-500">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {tones.map(toneOption => (
                <SelectItem key={toneOption.value} value={toneOption.value}>
                  {toneOption.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="font-medium text-slate-700">Custom Requirements (Optional)</Label>
          <Textarea
            placeholder="e.g., Focus on sustainability, include discount offer, emphasize urgency..."
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            className="min-h-20 border-slate-200 focus:border-purple-500"
          />
        </div>

        <Button 
          onClick={handleGenerate}
          disabled={!project || !selectedChannel || isGenerating}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 shadow-lg hover:shadow-xl transition-all duration-200"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Generating Creatives...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 mr-2" />
              Generate 4 Variants
            </>
          )}
        </Button>

        {project && (
          <div className="bg-slate-50 rounded-lg p-4 text-sm">
            <h4 className="font-medium text-slate-900 mb-2">Using Project Data:</h4>
            <p className="text-slate-600 mb-1">
              <span className="font-medium">Product:</span> {project.product_name}
            </p>
            <p className="text-slate-600 mb-1">
              <span className="font-medium">Category:</span> {project.category}
            </p>
            {project.keywords && project.keywords.length > 0 && (
              <p className="text-slate-600">
                <span className="font-medium">Keywords:</span> {project.keywords.slice(0, 3).join(", ")}
                {project.keywords.length > 3 && "..."}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}