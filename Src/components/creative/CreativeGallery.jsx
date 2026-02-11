import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Download, Eye, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const channelColors = {
  facebook: "bg-blue-100 text-blue-800 border-blue-200",
  instagram: "bg-pink-100 text-pink-800 border-pink-200",
  google: "bg-green-100 text-green-800 border-green-200",
  tiktok: "bg-black text-white border-gray-300",
  linkedin: "bg-blue-100 text-blue-900 border-blue-300",
  youtube: "bg-red-100 text-red-800 border-red-200"
};

const performanceIcons = {
  high: { icon: TrendingUp, color: "text-green-600", bg: "bg-green-100" },
  medium: { icon: Minus, color: "text-orange-600", bg: "bg-orange-100" },
  low: { icon: TrendingDown, color: "text-red-600", bg: "bg-red-100" }
};

export default function CreativeGallery({ creatives, isGenerating }) {
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
      <CardHeader className="border-b border-slate-100 pb-6">
        <CardTitle className="text-xl font-bold text-slate-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="w-6 h-6 text-indigo-600" />
            Creative Gallery
          </div>
          <Badge variant="outline" className="text-sm">
            {creatives.length} variants
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <AnimatePresence mode="wait">
          {isGenerating && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-12"
            >
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <div className="w-6 h-6 bg-white rounded-full animate-ping"></div>
              </div>
              <p className="text-slate-600">Creating amazing ad variants...</p>
            </motion.div>
          )}

          {!isGenerating && creatives.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-slate-100 to-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Eye className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No Creatives Yet</h3>
              <p className="text-slate-600">
                Generate your first set of ad creatives to see them here
              </p>
            </motion.div>
          )}

          {!isGenerating && creatives.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              {creatives.map((creative, index) => {
                const PerformanceIcon = performanceIcons[creative.predicted_performance]?.icon || Minus;
                const performanceColor = performanceIcons[creative.predicted_performance]?.color || "text-slate-600";
                const performanceBg = performanceIcons[creative.predicted_performance]?.bg || "bg-slate-100";

                return (
                  <motion.div
                    key={creative.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-slate-50 rounded-xl p-6 border border-slate-200"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Badge className={`${channelColors[creative.channel]} border text-xs`}>
                          {creative.channel}
                        </Badge>
                        <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${performanceBg}`}>
                          <PerformanceIcon className={`w-3 h-3 ${performanceColor}`} />
                          <span className={`text-xs font-medium ${performanceColor}`}>
                            {creative.predicted_performance}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(creative.headline + "\n\n" + creative.body_copy + "\n\n" + creative.cta)}
                          className="p-2"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-semibold text-slate-900 text-lg">
                          {creative.headline}
                        </h4>
                      </div>
                      
                      <div className="text-slate-700">
                        {creative.body_copy}
                      </div>
                      
                      <div className="inline-block">
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 font-medium">
                          {creative.cta}
                        </Badge>
                      </div>
                    </div>

                    {/* Performance Rationale */}
                    {creative.performance_rationale && (
                      <div className="mt-4 p-3 bg-white rounded-lg border border-slate-200">
                        <p className="text-sm text-slate-600">
                          <span className="font-medium">Why this works:</span> {creative.performance_rationale}
                        </p>
                      </div>
                    )}

                    {/* Image Prompt */}
                    {creative.image_prompt && (
                      <div className="mt-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                        <p className="text-sm">
                          <span className="font-medium text-purple-800">Image concept:</span>
                          <span className="text-purple-700"> {creative.image_prompt}</span>
                        </p>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}