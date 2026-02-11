import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Save, TrendingUp, Globe, Target, Users, Tag } from "lucide-react";

export default function EnrichmentResults({ data, onSave, isSaving }) {
  return (
    <div className="space-y-6">
      {/* ROI Forecast */}
      <Card className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 shadow-xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold mb-1">ROI Forecast</h3>
              <p className="text-green-100 text-sm">AI-powered prediction</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">+{data.roi_forecast}%</div>
              <div className="flex items-center gap-1 text-green-100 text-sm">
                <TrendingUp className="w-4 h-4" />
                Confidence: {data.confidence_score}%
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Keywords */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
        <CardHeader className="border-b border-slate-100 pb-4">
          <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Tag className="w-5 h-5 text-blue-600" />
            Marketing Keywords
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-2">
            {data.keywords?.map((keyword, index) => (
              <Badge key={index} variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                {keyword}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Markets */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
        <CardHeader className="border-b border-slate-100 pb-4">
          <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Globe className="w-5 h-5 text-indigo-600" />
            Top Markets
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {data.top_regions?.map((region, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div>
                  <h4 className="font-semibold text-slate-900">{region.country}</h4>
                  <p className="text-sm text-slate-600">Audience: {region.audience_size}</p>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-indigo-600">
                    {region.opportunity_score}/100
                  </div>
                  <p className="text-sm text-slate-500">
                    ~${region.estimated_cpm} CPM
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Competitors */}
      {data.competitors && data.competitors.length > 0 && (
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader className="border-b border-slate-100 pb-4">
            <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-600" />
              Competitive Landscape
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              {data.competitors.map((competitor, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <span className="font-medium text-slate-900">{competitor.name}</span>
                  <Badge variant="outline" className="text-sm">
                    {competitor.position}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Value Props */}
      {data.value_props && data.value_props.length > 0 && (
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader className="border-b border-slate-100 pb-4">
            <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Target className="w-5 h-5 text-orange-600" />
              Key Value Propositions
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              {data.value_props.map((prop, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-orange-600 text-sm font-bold">{index + 1}</span>
                  </div>
                  <p className="text-slate-700">{prop}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Save Button */}
      <Button 
        onClick={onSave}
        disabled={isSaving}
        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3 shadow-lg hover:shadow-xl transition-all duration-200"
      >
        {isSaving ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
            Saving Project...
          </>
        ) : (
          <>
            <Save className="w-5 h-5 mr-2" />
            Save & Continue
          </>
        )}
      </Button>
    </div>
  );
}