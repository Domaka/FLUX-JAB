import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe, TrendingUp, Users, DollarSign } from "lucide-react";

export default function MarketMap({ project }) {
  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
      <CardHeader className="border-b border-slate-100 pb-4">
        <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Globe className="w-5 h-5 text-emerald-600" />
          Market Opportunity Map
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {/* Placeholder for interactive map - would integrate with a mapping library */}
        <div className="bg-gradient-to-br from-emerald-50 to-blue-50 rounded-xl p-8 mb-6 border-2 border-dashed border-emerald-200">
          <div className="text-center">
            <Globe className="w-16 h-16 text-emerald-600 mx-auto mb-4 opacity-60" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Interactive World Map</h3>
            <p className="text-slate-600 text-sm">
              Geographic visualization of market opportunities would appear here.
              Integration with mapping libraries like Leaflet or Mapbox.
            </p>
          </div>
        </div>

        {/* Top Regions Quick View */}
        {project.top_regions && project.top_regions.length > 0 && (
          <div>
            <h4 className="font-semibold text-slate-900 mb-3">Top Opportunities</h4>
            <div className="grid gap-3">
              {project.top_regions.slice(0, 3).map((region, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <h5 className="font-medium text-slate-900">{region.country}</h5>
                    <p className="text-sm text-slate-600">Audience: {region.audience_size}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-emerald-600">
                      {region.opportunity_score}/100
                    </div>
                    <div className="text-sm text-slate-500">
                      ${region.estimated_cpm} CPM
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-200">
          <div className="text-center">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-xs font-medium text-slate-700">Growth Rate</p>
            <p className="text-sm font-bold text-slate-900">+24%</p>
          </div>
          <div className="text-center">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-xs font-medium text-slate-700">Total Reach</p>
            <p className="text-sm font-bold text-slate-900">2.4M</p>
          </div>
          <div className="text-center">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-xs font-medium text-slate-700">Avg CPA</p>
            <p className="text-sm font-bold text-slate-900">$12.50</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}