"use client";

import React from "react";
import { 
  LayoutDashboard, 
  Briefcase, 
  Users, 
  BarChart3, 
  Sparkles, 
  Settings,
  HelpCircle
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
  const { perspective, candidateTab, setCandidateTab, recruiterTab, setRecruiterTab } = useAppState();

  const getMenuItems = () => {
    if (perspective === "candidate") {
      return [
        { id: "explore", label: "Explore Jobs", icon: Briefcase },
        { id: "govt", label: "Govt Jobs Info", icon: BarChart3 },
        { id: "applications", label: "My Applications", icon: Users },
        { id: "profile", label: "Candidate Profile", icon: LayoutDashboard },
        { id: "chats", label: "AI Copilot Chats", icon: Sparkles, badge: "AI" }
      ];
    } else {
      return [
        { id: "overview", label: "Dashboard Overview", icon: LayoutDashboard },
        { id: "post-job", label: "Post a Job", icon: Sparkles, badge: "NEW" },
        { id: "manage", label: "My Job Listings", icon: Briefcase },
        { id: "chats", label: "Candidate Chats", icon: Users }
      ];
    }
  };

  const menuItems = getMenuItems();
  const activeTabId = perspective === "candidate" ? candidateTab : recruiterTab;
  const setActiveTabId = (id: string) => {
    if (perspective === "candidate") {
      setCandidateTab(id as any);
    } else {
      setRecruiterTab(id as any);
    }
  };

  return (
    <div className="min-h-screen flex w-full relative">
      {/* Sidebar - Floating Glass Effect */}
      <aside className="w-64 glass-sidebar hidden md:flex flex-col fixed top-0 bottom-0 left-0 pt-28 pb-8 px-4 z-40">
        
        {/* Navigation Items */}
        <div className="flex-1 flex flex-col gap-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTabId === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTabId(item.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all duration-300 ${
                  isActive 
                    ? "bg-[#6366f1]/10 text-[#6366f1] border border-[#6366f1]/20 shadow-[0_4px_12px_rgba(99,102,241,0.05)]" 
                    : "text-slate-500 hover:text-slate-800 hover:bg-white/30 border border-transparent"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={16} className={isActive ? "text-[#6366f1]" : "text-slate-400"} />
                  {item.label}
                </div>
                {item.badge && (
                  <span className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full scale-90">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer Support/Settings */}
        <div className="flex flex-col gap-1 border-t border-white/30 pt-6">
          <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-white/30 transition-all">
            <Settings size={16} className="text-slate-400" />
            Settings
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-white/30 transition-all">
            <HelpCircle size={16} className="text-slate-400" />
            Help & Support
          </button>
        </div>
      </aside>

      {/* Main Dashboard Panel */}
      <main className="flex-1 md:pl-64 w-full min-h-screen pt-28 pb-12 px-6 lg:px-8 z-10 flex flex-col">
        <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col">
          {children}
        </div>
      </main>
    </div>
  );
};
