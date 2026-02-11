import React, { useState, useEffect } from "react";
import { Project } from "@/entities/Project";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe, Target, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { InvokeLLM } from "@/integrations/Core";
import { FLAGS } from "@/components/common/flags";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { motion } from "framer-motion";

import MarketMap from "../components/market/MarketMap";
import MarketTable from "../components/market/MarketTable";
import ProjectSelector from "../components/creative/ProjectSelector";

export default function MarketFinder() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [scopes, setScopes] = useState(["Global"]); // Initialize with "Global"
  const [manualList, setManualList] = useState("");
  const [deep, setDeep] = useState(false);
  const [results, setResults] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const [isDeepSearchLoading, setIsDeepSearchLoading] = useState(false);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    const data = await Project.list("-created_date");
    setProjects(data);
    if (data.length > 0) {
      setSelectedProject(data[0]);
    }
  };

  const runDeepSearch = async () => {
    setIsDeepSearchLoading(true);
    const productContext = selectedProject ? (selectedProject.document_content || selectedProject.description || selectedProject.product_name) : "";
    const res = await InvokeLLM({
      prompt: `SYSTEM: You are Flux Market Explorer - an expert in granular geographic market research.

PRODUCT CONTEXT: ${productContext}
SCOPES: ${JSON.stringify(scopes)}
MANUAL LOCATIONS: ${manualList}
DEEP SEARCH: ${deep}

CRITICAL INSTRUCTIONS:
1. Research markets at the MOST GRANULAR level possible:
   - For countries: break down to states/provinces/regions
   - For states: break down to cities, LGAs (Local Government Areas), districts
   - For cities: identify specific neighborhoods, zones, districts with high potential
   
2. For each location provide DETAILED analysis:
   - Exact population and demographic breakdown
   - Income levels and economic indicators
   - Internet/mobile penetration rates
   - Local competitors and market saturation
   - Cultural factors affecting adoption
   - Local payment methods and preferences
   - Language/dialect considerations
   - Regulatory environment
   - Infrastructure quality (logistics, internet)
   
3. Include NICHE opportunities:
   - Underserved suburban areas
   - Growing tech hubs
   - University towns
   - Industrial zones
   - Tourist destinations
   - Border regions
   
4. Provide ACTIONABLE data:
   - Best entry strategy for each location
   - Local partnership opportunities
   - Recommended marketing channels
   - Price sensitivity analysis
   - Timing recommendations (seasons, events)

Return 8-12 market opportunities ranked by opportunity_score. Keep responses concise.`,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          markets: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                location_type: { type: "string" },
                country: { type: "string" },
                state_province: { type: "string" },
                opportunity_score: { type: "number" },
                population: { type: "string" },
                target_audience_size: { type: "string" },
                internet_penetration: { type: "string" },
                entry_strategy: { type: "string" },
                marketing_channels: { type: "string" },
                payment_methods: { type: "string" },
                why: { type: "string" },
                confidence: { type: "number" }
              }
            }
          },
          summary: { type: "string" },
          top_recommendation: { type: "string" }
        }
      }
    });
    setResults(res);
    setIsDeepSearchLoading(false);
  };

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-purple-950 dark:to-slate-900">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 mb-4">
            <Globe className="w-4 h-4 text-indigo-500" />
            <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">AI-Powered Discovery</span>
          </div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Market Opportunity Finder
          </h1>
          <p className="text-muted-foreground text-base md:text-lg">
            Discover high-potential markets with AI-powered geographic analysis
          </p>
        </motion.div>

        {projects.length === 0 ? (
          <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-0 shadow-2xl overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Globe className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">No Projects Available</h3>
              <p className="text-muted-foreground mb-6">
                Create a product project first to explore market opportunities
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {/* Project Selector */}
            <ProjectSelector 
              projects={projects}
              selectedProject={selectedProject}
              onSelectProject={setSelectedProject}
            />

            {projects.length > 0 && FLAGS.marketDeepScope && (
              <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-0 shadow-2xl overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
                <CardHeader>
                  <CardTitle className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Scopes & Filters</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Geographic Scope</label>
                      <div className="flex flex-wrap gap-2">
                        {["Neighborhood/District","City/LGA","State/Province","Country","Region/Continent","Global"].map(o=>(
                          <button key={o} onClick={()=>setScopes(prev => prev.includes(o) ? prev.filter(x=>x!==o) : [...prev, o])}
                            className={`px-3 py-1.5 rounded-full border text-sm transition-all ${scopes.includes(o) ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-transparent shadow-md" : "bg-white text-slate-700 hover:border-indigo-300"}`}>
                            {o}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Target Locations (be specific!)</label>
                        <Input 
                          value={manualList} 
                          onChange={e=>setManualList(e.target.value)} 
                          placeholder="e.g., Lagos Nigeria, Texas USA, Bavaria Germany, Bangalore Karnataka India" 
                          className="w-full"
                        />
                        <p className="text-xs text-muted-foreground mt-1">Include country, state, city, or even specific districts for granular research</p>
                      </div>
                      <div className="space-y-3">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <Checkbox checked={deep} onCheckedChange={(v)=>setDeep(!!v)} />
                          <div>
                            <span className="text-sm font-medium">Deep Research Mode</span>
                            <p className="text-xs text-muted-foreground">Include LGAs, districts, suburban areas, niche communities</p>
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>
                  <Button onClick={runDeepSearch} disabled={isDeepSearchLoading} className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white shadow-lg">
                    {isDeepSearchLoading ? "Running AI..." : "Run AI"}
                  </Button>
                  {results?.markets?.length > 0 && (
                    <div className="mt-6 space-y-4">
                      {results.summary && (
                        <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-200">
                          <p className="text-sm text-indigo-800 font-medium">{results.summary}</p>
                          {results.top_recommendation && (
                            <p className="text-sm text-purple-700 mt-2">🎯 <strong>Top Pick:</strong> {results.top_recommendation}</p>
                          )}
                        </div>
                      )}
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm text-slate-600">Showing {showAll ? results.markets.length : Math.min(10, results.markets.length)} of {results.markets.length} markets</div>
                        <button className="text-indigo-600 text-sm font-medium hover:underline" onClick={()=>setShowAll(s=>!s)}>{showAll? "Show less" : "Show all"}</button>
                      </div>
                      <div className="overflow-auto border rounded-xl shadow-sm">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-slate-50">
                              <TableHead className="font-semibold">Location</TableHead>
                              <TableHead className="font-semibold">Type</TableHead>
                              <TableHead className="font-semibold">Score</TableHead>
                              <TableHead className="font-semibold">Population</TableHead>
                              <TableHead className="font-semibold">Target Audience</TableHead>
                              <TableHead className="font-semibold">Entry Strategy</TableHead>
                              <TableHead className="font-semibold">Marketing Channels</TableHead>
                              <TableHead className="font-semibold">Why</TableHead>
                              <TableHead className="font-semibold">Confidence</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {(showAll ? results.markets : results.markets.slice(0,10)).map((m,i)=>(
                              <TableRow key={i} className="hover:bg-slate-50">
                                <TableCell>
                                  <div className="font-medium">{m.name}</div>
                                  {m.parent_region && <div className="text-xs text-muted-foreground">{m.city_lga && `${m.city_lga}, `}{m.state_province && `${m.state_province}, `}{m.country}</div>}
                                </TableCell>
                                <TableCell><Badge variant="outline" className="text-xs">{m.location_type}</Badge></TableCell>
                                <TableCell>
                                  <Badge className={`${m.opportunity_score >= 80 ? 'badge-green' : m.opportunity_score >= 60 ? 'badge-blue' : 'badge-orange'}`}>
                                    {m.opportunity_score}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-sm">{m.population}</TableCell>
                                <TableCell className="text-sm">{m.target_audience_size}</TableCell>
                                <TableCell className="max-w-[200px]">
                                  <p className="text-xs truncate" title={m.entry_strategy}>{m.entry_strategy}</p>
                                </TableCell>
                                <TableCell>
                                  <p className="text-xs truncate max-w-[150px]" title={m.marketing_channels}>{m.marketing_channels}</p>
                                </TableCell>
                                <TableCell className="max-w-[200px]">
                                  <p className="text-xs truncate" title={m.why}>{m.why}</p>
                                </TableCell>
                                <TableCell>
                                  <span className={`text-sm font-medium ${m.confidence >= 80 ? 'text-green-600' : m.confidence >= 60 ? 'text-blue-600' : 'text-orange-600'}`}>
                                    {m.confidence}%
                                  </span>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                      
                      {/* Detailed View for Top Markets */}
                      <div className="mt-6">
                        <h3 className="font-semibold text-lg mb-4">Top Market Deep Dive</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                          {results.markets.slice(0, 4).map((m, i) => (
                            <Card key={i} className="border shadow-sm">
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between mb-3">
                                  <div>
                                    <h4 className="font-semibold text-foreground">{m.name}</h4>
                                    <p className="text-xs text-muted-foreground">{m.location_type} • {m.country}</p>
                                  </div>
                                  <Badge className={`${m.opportunity_score >= 80 ? 'badge-green' : 'badge-blue'}`}>{m.opportunity_score}</Badge>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                                  <div><span className="text-muted-foreground">Population:</span> {m.population}</div>
                                  <div><span className="text-muted-foreground">Target:</span> {m.target_audience_size}</div>
                                  <div><span className="text-muted-foreground">Internet:</span> {m.internet_penetration}</div>
                                  <div><span className="text-muted-foreground">State:</span> {m.state_province}</div>
                                </div>
                                <div className="space-y-2 text-xs">
                                  <div><span className="font-medium">Entry:</span> {m.entry_strategy}</div>
                                  <div><span className="font-medium">Channels:</span> {m.marketing_channels}</div>
                                  <div><span className="font-medium">Payments:</span> {m.payment_methods}</div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {selectedProject && (
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Market Visualization */}
                <MarketMap project={selectedProject} />
                
                {/* Market Data Table */}
                <MarketTable project={selectedProject} />
              </div>
            )}

            <AISuggest />
          </div>
        )}
      </div>
    </div>
  );
}

function AISuggest() {
  const [loading, setLoading] = React.useState(false);
  const [data, setData] = React.useState(null);
  const [targetLocation, setTargetLocation] = React.useState("");
  
  const run = async () => {
    setLoading(true);
    const res = await InvokeLLM({
      prompt: `SYSTEM: You are a granular market research expert. Generate detailed geographic breakdown for market expansion.

TARGET LOCATION: ${targetLocation || "Global - provide comprehensive breakdown"}

INSTRUCTIONS:
1. Break down each region to the most granular level:
   - Continents -> Countries -> States/Provinces -> Major Cities -> Districts/LGAs
2. For each location tier, provide:
   - Population estimates
   - Economic indicators (GDP per capita range)
   - Key industries/sectors
   - Digital adoption level
   - Best entry points
3. Include NICHE areas often overlooked:
   - Emerging tech hubs
   - University cities
   - Industrial corridors
   - Tourist hotspots
   - Border economic zones

Return comprehensive hierarchical data with actionable insights.`,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          personas: { 
            type: "array", 
            items: { 
              type: "object", 
              properties: { 
                name: { type: "string" }, 
                demographics: { type: "string" },
                income_range: { type: "string" },
                digital_behavior: { type: "string" },
                pain_points: { type: "string" },
                best_locations: { type: "array", items: { type: "string" } }
              } 
            } 
          },
          regions: { 
            type: "array", 
            items: { 
              type: "object", 
              properties: { 
                region: { type: "string" },
                total_opportunity: { type: "string" },
                countries: { 
                  type: "array", 
                  items: { 
                    type: "object", 
                    properties: { 
                      name: { type: "string" },
                      population: { type: "string" },
                      gdp_per_capita: { type: "string" },
                      digital_penetration: { type: "string" },
                      states: { 
                        type: "array", 
                        items: { 
                          type: "object",
                          properties: {
                            name: { type: "string" },
                            population: { type: "string" },
                            key_cities: { type: "array", items: { type: "string" } },
                            opportunity_level: { type: "string" }
                          }
                        } 
                      },
                      entry_strategy: { type: "string" }
                    } 
                  } 
                } 
              } 
            } 
          },
          niche_opportunities: {
            type: "array",
            items: {
              type: "object",
              properties: {
                location: { type: "string" },
                type: { type: "string" },
                why: { type: "string" },
                population: { type: "string" }
              }
            }
          }
        }
      }
    });
    setData(res);
    setLoading(false);
  };
  
  return (
    <div className="p-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-0 rounded-2xl shadow-xl">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
        <div>
          <div className="font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent text-lg">AI Geographic Breakdown</div>
          <p className="text-sm text-muted-foreground">Get detailed region → country → state → city hierarchy</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Input 
            value={targetLocation}
            onChange={(e) => setTargetLocation(e.target.value)}
            placeholder="e.g., Nigeria, Southeast Asia, Texas USA"
            className="w-full md:w-64"
          />
          <Button onClick={run} disabled={loading} className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white whitespace-nowrap">
            {loading ? "Researching..." : "Deep Research"}
          </Button>
        </div>
      </div>
      {data && (
        <div className="mt-4 space-y-6">
          {/* Personas Section */}
          <div>
            <h3 className="font-semibold mb-3">Target Personas by Location</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
              {(data.personas || []).map((p,i)=>(
                <Card key={i} className="border">
                  <CardContent className="p-3">
                    <div className="font-medium text-foreground">{p.name}</div>
                    <div className="text-xs text-muted-foreground mt-1 space-y-1">
                      <div><span className="font-medium">Demographics:</span> {p.demographics}</div>
                      <div><span className="font-medium">Income:</span> {p.income_range}</div>
                      <div><span className="font-medium">Digital:</span> {p.digital_behavior}</div>
                      <div><span className="font-medium">Pain Points:</span> {p.pain_points}</div>
                      {p.best_locations?.length > 0 && (
                        <div><span className="font-medium">Best in:</span> {p.best_locations.join(", ")}</div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          
          {/* Regions Hierarchy */}
          <div>
            <h3 className="font-semibold mb-3">Geographic Hierarchy</h3>
            <div className="space-y-4">
              {(data.regions || []).map((r,i)=>(
                <Card key={i} className="border">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="font-semibold text-lg">{r.region}</div>
                      {r.total_opportunity && <Badge className="badge-purple">{r.total_opportunity}</Badge>}
                    </div>
                    <div className="space-y-3">
                      {(r.countries||[]).map((c, j) => (
                        <div key={j} className="pl-4 border-l-2 border-indigo-200">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{c.name}</span>
                            <span className="text-xs text-muted-foreground">Pop: {c.population} • GDP/cap: {c.gdp_per_capita}</span>
                          </div>
                          {c.states?.length > 0 && (
                            <div className="ml-4 mt-2 space-y-1">
                              {c.states.slice(0, 5).map((s, k) => (
                                <div key={k} className="text-sm flex items-start gap-2">
                                  <span className="text-indigo-500">→</span>
                                  <div>
                                    <span className="font-medium">{typeof s === 'string' ? s : s.name}</span>
                                    {typeof s === 'object' && (
                                      <span className="text-xs text-muted-foreground ml-2">
                                        {s.population && `Pop: ${s.population}`}
                                        {s.key_cities?.length > 0 && ` • Cities: ${s.key_cities.join(", ")}`}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ))}
                              {c.states.length > 5 && (
                                <div className="text-xs text-muted-foreground ml-4">+ {c.states.length - 5} more states/regions</div>
                              )}
                            </div>
                          )}
                          {c.entry_strategy && (
                            <div className="mt-2 text-xs text-green-700 bg-green-50 p-2 rounded">
                              <span className="font-medium">Entry Strategy:</span> {c.entry_strategy}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          
          {/* Niche Opportunities */}
          {data.niche_opportunities?.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">🎯 Niche Opportunities</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
                {data.niche_opportunities.map((n, i) => (
                  <Card key={i} className="border bg-amber-50">
                    <CardContent className="p-3">
                      <div className="font-medium text-amber-900">{n.location}</div>
                      <Badge variant="outline" className="text-xs mt-1">{n.type}</Badge>
                      <p className="text-xs text-amber-700 mt-2">{n.why}</p>
                      {n.population && <p className="text-xs text-muted-foreground mt-1">Pop: {n.population}</p>}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}