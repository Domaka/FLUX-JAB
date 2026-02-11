import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";
import { User } from "@/entities/User";
import { FLAGS } from "@/components/common/flags";
import { homeCards } from "@/components/home/cardsConfig";
import { motion, AnimatePresence } from "framer-motion";
import {
  Globe, LayoutDashboard, PanelsTopLeft, ClipboardList, MessageSquare,
  LineChart, ShieldAlert, BookOpen, Rocket, ArrowRight, Sparkles, Zap,
  Play, ChevronRight
} from "lucide-react";
import Footer from "@/components/common/Footer";

const slides = [
  { 
    quote: "Launch boldly. Iterate faster. Win sustainably.", 
    subtitle: "Your AI-powered command center for product launches",
    bg: "from-violet-600 via-purple-600 to-indigo-600" 
  },
  { 
    quote: "Great products don't just launch—they learn.", 
    subtitle: "Continuous optimization powered by real-time insights",
    bg: "from-fuchsia-600 via-pink-600 to-rose-600" 
  },
  { 
    quote: "Right market, right message, right time.", 
    subtitle: "AI-driven market intelligence at your fingertips",
    bg: "from-cyan-600 via-teal-600 to-emerald-600" 
  }
];

const iconMap = {
  Globe, LayoutDashboard, PanelsTopLeft, ClipboardList, 
  MessageSquare, LineChart, ShieldAlert, BookOpen, Rocket
};

export default function Home() {
  const [index, setIndex] = useState(0);
  const [me, setMe] = useState(null);
  const [branding, setBranding] = useState(null);

  useEffect(() => {
    const id = setInterval(() => setIndex(i => (i + 1) % slides.length), 5000);
    (async () => {
      try {
        const u = await User.me();
        setMe(u);
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      }

      try {
        const { Branding } = await import("@/entities/Branding");
        const b = await Branding.list();
        setBranding(b[0] || null);
      } catch (error) {
        console.error("Failed to fetch branding data:", error);
      }
    })();
    return () => clearInterval(id);
  }, []);

  const s = slides[index];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-purple-950 dark:to-slate-900">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8 space-y-8 md:space-y-12">
        {/* Hero Section */}
        <motion.div 
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className={`relative rounded-3xl overflow-hidden shadow-2xl`}
        >
          <div className={`absolute inset-0 bg-gradient-to-r ${s.bg}`} />
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1639322537228-f710d846310a?w=1920')] bg-cover bg-center opacity-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          
          <div className="relative px-6 md:px-12 py-12 md:py-20">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="max-w-3xl"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-white/90 text-sm mb-6">
                <Sparkles className="w-4 h-4" />
                {me?.full_name ? `Welcome back, ${me.full_name.split(' ')[0]}` : "Welcome to Flux"}
              </div>
              
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
                {s.quote}
              </h1>
              <p className="text-lg md:text-xl text-white/80 mb-8 max-w-2xl">
                {s.subtitle}
              </p>
              
              <div className="flex flex-wrap gap-4">
                <Link to={createPageUrl("ProductBuilder")}>
                  <Button size="lg" className="bg-white text-slate-900 hover:bg-white/90 shadow-xl h-12 px-6">
                    <Rocket className="w-5 h-5 mr-2" />
                    Start New Launch
                  </Button>
                </Link>
                <Link to={createPageUrl("Dashboard")}>
                  <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 h-12 px-6">
                    View Dashboard
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              </div>
            </motion.div>
            
            {/* Slide indicators */}
            <div className="absolute bottom-6 right-6 md:bottom-8 md:right-12 flex gap-2">
              {slides.map((_, i) => (
                <button 
                  key={i} 
                  onClick={() => setIndex(i)} 
                  className={`transition-all duration-300 rounded-full ${
                    i === index 
                      ? "w-8 h-2 bg-white" 
                      : "w-2 h-2 bg-white/40 hover:bg-white/60"
                  }`} 
                />
              ))}
            </div>
          </div>
        </motion.div>

        {/* Video Section */}
        {branding?.video_url && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl overflow-hidden border border-border/50 bg-card shadow-xl"
          >
            <div className="relative">
              <video 
                src={branding.video_url} 
                controls={false} 
                autoPlay 
                muted 
                loop 
                playsInline 
                className="w-full h-56 md:h-72 object-cover" 
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                <Button size="lg" className="rounded-full w-16 h-16 bg-white/90 hover:bg-white text-slate-900">
                  <Play className="w-6 h-6 ml-1" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Feature Cards */}
        {FLAGS.homepageCards && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {homeCards.map((c, idx) => {
              const Icon = iconMap[c.icon] || LayoutDashboard;
              return (
                <motion.div
                  key={c.key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Link to={createPageUrl(c.key)}>
                    <Card className="group h-full border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm overflow-hidden">
                      <div className="h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 group-hover:from-indigo-500 group-hover:to-purple-500 transition-all">
                            <Icon className="w-6 h-6 text-indigo-600 group-hover:text-white transition-colors" />
                          </div>
                          {c.badge && (
                            <span className="text-xs font-medium bg-accent/20 text-accent px-2.5 py-1 rounded-full">
                              {c.badge}
                            </span>
                          )}
                        </div>
                        <h3 className="text-lg font-bold text-foreground mb-2 group-hover:bg-gradient-to-r group-hover:from-indigo-600 group-hover:to-purple-600 group-hover:bg-clip-text group-hover:text-transparent transition-colors">
                          {c.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          {c.summary}
                        </p>
                        <p className="text-xs text-muted-foreground/80 mb-4 line-clamp-2">
                          {c.description}
                        </p>
                        <div className="flex items-center text-primary font-medium text-sm group-hover:gap-2 transition-all">
                          Open
                          <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-0 shadow-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
            <CardContent className="p-8 md:p-12">
              <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                <div className="text-center lg:text-left">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 text-indigo-600 text-sm font-medium mb-4">
                    <Zap className="w-4 h-4" />
                    Powered by AI
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
                    Flux — Product-to-Market Launch OS
                  </h2>
                  <p className="text-muted-foreground max-w-xl">
                    Discover markets, generate creatives, build roadmaps, and analyze performance — all in one intelligent workspace.
                  </p>
                </div>
                <Link to={createPageUrl("ProductBuilder")}>
                  <Button size="lg" className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl h-12 px-8">
                    <Sparkles className="w-5 h-5 mr-2" />
                    Create Project
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <Footer />
      </div>
    </div>
  );
}