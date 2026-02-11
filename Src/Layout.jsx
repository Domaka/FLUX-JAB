import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  LayoutDashboard, 
  PanelsTopLeft, 
  ClipboardList, 
  MessageSquare, 
  LineChart, 
  ShieldAlert, 
  BookOpen, 
  Rocket,
  Zap,
  Home as HomeIcon,
  Users,
  Lightbulb,
  FileSearch,
  Globe,
  ChevronLeft,
  ChevronRight,
  Moon,
  Sun,
  Bell,
  Settings,
  LogOut
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarProvider,
  SidebarTrigger,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import QuickSearch from "./components/common/QuickSearch";
import ChatWidget from "./components/common/ChatWidget";
import { Branding } from "@/entities/Branding";
import { base44 } from "@/api/base44Client";

const navigationItems = [
  { title: "Home", url: createPageUrl("Home"), icon: HomeIcon, badge: null },
  { title: "Dashboard", url: createPageUrl("Dashboard"), icon: LayoutDashboard, badge: null },
  { title: "Market & Product Fit", url: createPageUrl("MarketProductFit"), icon: PanelsTopLeft, badge: null },
  { title: "Market Explorer", url: createPageUrl("MarketFinder"), icon: Globe, badge: "AI" },
  { title: "Audience & Channels", url: createPageUrl("AudienceChannels"), icon: Users, badge: null },
  { title: "Creative & Messaging", url: createPageUrl("CreativeMessaging"), icon: MessageSquare, badge: null },
  { title: "Resources", url: createPageUrl("Resources"), icon: FileSearch, badge: null },
  { title: "Analytics & Forecasting", url: createPageUrl("AnalyticsForecasting"), icon: LineChart, badge: null },
  { title: "Risk & Simulation", url: createPageUrl("RiskSimulation"), icon: ShieldAlert, badge: null },
  { title: "Playbooks & Modes", url: createPageUrl("PlaybooksModes"), icon: BookOpen, badge: null },
  { title: "Post-Launch", url: createPageUrl("PostLaunch"), icon: Rocket, badge: null }
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [branding, setBranding] = useState(null);
  const [user, setUser] = useState(null);
  const [isDark, setIsDark] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    (async () => {
      const b = await Branding.list();
      setBranding(b[0] || null);
      
      const iconUrl = (b[0]?.logo_url) || "";
      if (iconUrl) {
        let link = document.querySelector("link[rel='icon']");
        if (!link) {
          link = document.createElement("link");
          link.rel = "icon";
          document.head.appendChild(link);
        }
        link.href = iconUrl;
      }

      try {
        const me = await base44.auth.me();
        setUser(me);
      } catch (e) {
        setUser(null);
      }
    })();
  }, []);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const handleLogout = async () => {
    await base44.auth.logout();
  };

  return (
    <TooltipProvider>
      <SidebarProvider>
        <div className="min-h-screen flex w-full flux-gradient-soft dark:flux-gradient-dark">
          <Sidebar className="border-r border-indigo-500/20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
            <SidebarHeader className="border-b border-indigo-500/20 p-4">
              <div className="flex items-center gap-3">
                {branding?.logo_url ? (
                  <div className="relative">
                    <img 
                      src={branding.logo_url} 
                      alt="Brand" 
                      className="w-11 h-11 rounded-xl object-contain shadow-lg bg-white/80 dark:bg-white/10 p-1" 
                    />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full border-2 border-white dark:border-slate-800" />
                  </div>
                ) : (
                  <div className="relative">
                    <div className="w-11 h-11 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                      <Zap className="w-6 h-6 text-white" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full border-2 border-white dark:border-slate-800" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h2 className="font-bold text-xl bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent truncate">
                    {branding?.app_name || "Flux"}
                  </h2>
                  <p className="text-xs text-muted-foreground font-medium">Launch OS v2.0</p>
                </div>
              </div>
            </SidebarHeader>
            
            <SidebarContent className="p-3">
              <SidebarGroup>
                <SidebarGroupLabel className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-3 mb-2">
                  Workspace
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu className="space-y-1">
                    {navigationItems.map((item, index) => {
                      const isActive = location.pathname === item.url;
                      return (
                        <SidebarMenuItem key={item.title}>
                          <Tooltip delayDuration={0}>
                            <TooltipTrigger asChild>
                              <SidebarMenuButton 
                                asChild 
                                className={`group relative transition-all duration-300 rounded-xl px-3 py-2.5 ${
                                  isActive 
                                    ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-lg' 
                                    : 'text-muted-foreground hover:text-foreground hover:bg-gradient-to-r hover:from-indigo-500/10 hover:to-purple-500/10'
                                }`}
                                style={{
                                  animationDelay: `${index * 30}ms`
                                }}
                              >
                                <Link to={item.url} className="flex items-center gap-3">
                                  <item.icon className={`w-[18px] h-[18px] flex-shrink-0 transition-transform duration-200 ${isActive ? '' : 'group-hover:scale-110'}`} />
                                  <span className="font-medium text-sm truncate">{item.title}</span>
                                  {item.badge && (
                                    <Badge className="ml-auto text-[10px] px-1.5 py-0 h-5 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-indigo-600 border border-indigo-500/30">
                                      {item.badge}
                                    </Badge>
                                  )}
                                </Link>
                              </SidebarMenuButton>
                            </TooltipTrigger>
                            <TooltipContent side="right" className="flux-tooltip">
                              {item.title}
                            </TooltipContent>
                          </Tooltip>
                        </SidebarMenuItem>
                      );
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="border-t border-indigo-500/20 p-3">
              {user && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-gradient-to-r hover:from-indigo-500/10 hover:to-purple-500/10 transition-colors">
                      <Avatar className="w-9 h-9 border-2 border-indigo-500/30">
                        <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white text-sm font-bold">
                          {user.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 text-left min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {user.full_name || 'User'}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {user.email}
                        </p>
                      </div>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </SidebarFooter>
          </Sidebar>

          <main className="flex-1 flex flex-col min-h-screen">
            <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-indigo-500/20 px-4 md:px-6 py-3">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <SidebarTrigger className="md:hidden hover:bg-secondary p-2 rounded-lg transition-colors" />
                  <QuickSearch />
                </div>
                
                <div className="flex items-center gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="rounded-xl hover:bg-secondary"
                        onClick={() => setIsDark(!isDark)}
                      >
                        {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Toggle theme</TooltipContent>
                  </Tooltip>
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="rounded-xl hover:bg-secondary relative">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Notifications</TooltipContent>
                  </Tooltip>

                  {user && (
                    <div className="hidden md:flex items-center gap-2 pl-2 border-l border-indigo-500/20">
                      <Avatar className="w-8 h-8 border border-indigo-500/30">
                        <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white text-xs font-bold">
                          {user.full_name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium text-foreground">
                        {user.full_name?.split(' ')[0] || 'User'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </header>

            <div className="flex-1 overflow-auto">
              <div className="animate-fade-in">
                {children}
              </div>
            </div>
            
            <ChatWidget />
          </main>
        </div>
      </SidebarProvider>
    </TooltipProvider>
  );
}