"use client";

import React from "react";
import { 
  LayoutDashboard, 
  Briefcase, 
  Users, 
  BarChart3, 
  Sparkles, 
  Settings,
  HelpCircle,
  ShieldAlert
} from "lucide-react";
import { useAppState } from "../context/AppContext";

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  activeTab = "dashboard",
  setActiveTab
}) => {
  const { perspective, candidateTab, setCandidateTab, recruiterTab, setRecruiterTab, user } = useAppState();

  const getMenuItems = () => {
    const items = [];
    if (perspective === "candidate") {
      items.push(
        { id: "explore", label: "Explore Jobs", icon: Briefcase },
        { id: "govt", label: "Govt Jobs Info", icon: BarChart3 },
        { id: "applications", label: "My Applications", icon: Users },
        { id: "profile", label: "Candidate Profile", icon: LayoutDashboard },
        { id: "chats", label: "AI Copilot Chats", icon: Sparkles, badge: "AI" }
      );
    } else if (perspective === "recruiter") {
      items.push(
        { id: "overview", label: "Dashboard Overview", icon: LayoutDashboard },
        { id: "post-job", label: "Post a Job", icon: Sparkles, badge: "NEW" },
        { id: "manage", label: "My Job Listings", icon: Briefcase },
        { id: "chats", label: "Candidate Chats", icon: Users }
      );
    }
    
    // Add admin menu item if user is admin
    if (user?.role === 'admin') {
      items.push({ id: "admin", label: "Admin Panel", icon: ShieldAlert, badge: "SYS" });
    }
    
    return items;
  };

  const menuItems = getMenuItems();
  const activeTabId = perspective === "candidate" ? candidateTab : recruiterTab;
  const setActiveTabId = (id: string) => {
    if (id === 'admin') {
      // route to admin dashboard
      window.location.reload();
      return;
    }
    if (perspective === "candidate") {
      setCandidateTab(id as any);
    } else {
      setRecruiterTab(id as any);
    }
  };

  const getItemColor = (id: string) => {
    switch (id) {
      case 'explore':
      case 'overview':
        return { text: 'text-[#2563EB]', bg: 'bg-[#EFF6FF]', border: 'border-l-[#2563EB]', icon: 'text-[#2563EB]' };
      case 'govt':
      case 'post-job':
        return { text: 'text-[#0D9488]', bg: 'bg-[#F0FDFA]', border: 'border-l-[#0D9488]', icon: 'text-[#0D9488]' };
      case 'applications':
      case 'manage':
        return { text: 'text-[#7C3AED]', bg: 'bg-[#F5F3FF]', border: 'border-l-[#7C3AED]', icon: 'text-[#7C3AED]' };
      case 'profile':
        return { text: 'text-[#EC4899]', bg: 'bg-[#FDF2F8]', border: 'border-l-[#EC4899]', icon: 'text-[#EC4899]' };
      case 'chats':
        return { text: 'text-[#2563EB]', bg: 'bg-[#EFF6FF]', border: 'border-l-[#2563EB]', icon: 'text-[#2563EB]' };
      default:
        return { text: 'text-[#EA580C]', bg: 'bg-[#FFF7ED]', border: 'border-l-[#EA580C]', icon: 'text-[#EA580C]' };
    }
  };

  return (
    <div className="min-h-screen flex w-full relative bg-[#F8FAFC] text-slate-800 overflow-hidden font-sans">
      
      {/* Sidebar - Premium White SaaS Sidebar */}
      <aside className="saas-sidebar w-64 border-r border-[#E5E7EB] bg-white hidden md:flex flex-col fixed top-0 bottom-0 left-0 pt-20 pb-8 px-4 z-40">
        
        {/* Navigation Items */}
        <div className="flex-1 flex flex-col gap-1.5 mt-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTabId === item.id;
            const colors = getItemColor(item.id);
            return (
              <button
                key={item.id}
                onClick={() => setActiveTabId(item.id)}
                className={`w-full flex items-center justify-between px-4 py-3 text-xs font-bold tracking-wide transition-all duration-150 cursor-pointer rounded-xl border-l-4 ${
                  isActive 
                    ? `${colors.text} ${colors.bg} ${colors.border} font-extrabold shadow-sm` 
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-50 border-l-transparent"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={16} className={isActive ? colors.icon : "text-slate-400"} />
                  {item.label}
                </div>
                {item.badge && (
                  <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-full scale-90 ${
                    isActive ? "bg-white/80" : "bg-slate-100 text-slate-500"
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer Support/Settings */}
        <div className="flex flex-col gap-1 border-t border-[#E5E7EB] pt-6">
          <button 
            onClick={() => setActiveTabId('settings')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border-l-4 ${
              activeTabId === 'settings'
                ? 'text-[#EA580C] bg-[#FFF7ED] border-l-[#EA580C] font-extrabold shadow-sm'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50 border-l-transparent'
            }`}
          >
            <Settings size={16} className={activeTabId === 'settings' ? 'text-[#EA580C]' : 'text-slate-400'} />
            Settings
          </button>
          <button 
            onClick={() => setActiveTabId('notifications')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border-l-4 ${
              activeTabId === 'notifications'
                ? 'text-[#2563EB] bg-[#EFF6FF] border-l-[#2563EB] font-extrabold shadow-sm'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50 border-l-transparent'
            }`}
          >
            <HelpCircle size={16} className={activeTabId === 'notifications' ? 'text-[#2563EB]' : 'text-slate-400'} />
            Help & Support
          </button>
        </div>
      </aside>

      {/* Main Dashboard Panel */}
      <main className="saas-main flex-1 md:pl-64 w-full min-h-screen pt-16 md:pt-20 pb-20 md:pb-12 px-4 md:px-8 z-10 flex flex-col relative">
        <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col">
          {children}
        </div>
      </main>

      {/* Unified Mobile Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-md border-t border-[#E5E7EB] z-50 flex md:hidden justify-around items-center px-2 pb-safe shadow-lg">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTabId === item.id;
          const colors = getItemColor(item.id);
          return (
            <button
              key={item.id}
              onClick={() => setActiveTabId(item.id)}
              className="flex flex-col items-center justify-center flex-1 py-1 cursor-pointer transition-colors"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <div className={`p-1.5 rounded-xl transition-all ${isActive ? `${colors.bg} scale-110` : 'text-slate-400'}`}>
                <Icon size={18} className={isActive ? colors.icon : "text-slate-400"} />
              </div>
              <span className={`text-[9px] font-bold mt-0.5 tracking-tight transition-colors ${isActive ? colors.text : 'text-slate-400'}`}>
                {item.label.split(' ')[0]}
              </span>
            </button>
          );
        })}
      </div>

    </div>
  );
};
