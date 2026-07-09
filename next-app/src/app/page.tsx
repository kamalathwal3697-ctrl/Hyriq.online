"use client";

import { useState, useEffect } from "react";
import { useAppState } from "@/context/AppContext";
import { LandingPage } from "@/components/LandingPage";
import Navbar from "@/components/Navbar";
import { AuthPage } from "@/components/AuthPage";
import { CandidateDashboard } from "@/components/CandidateDashboard";
import { RecruiterDashboard } from "@/components/RecruiterDashboard";
import { AdminDashboard } from "@/components/AdminDashboard";
import { DashboardLayout } from "@/components/DashboardLayout";

export default function Home() {
  const { perspective, token, login, signup } = useAppState();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const renderMainContent = () => {
    if (perspective === 'visitor') {
      return <LandingPage />;
    }

    if (!token) {
      return (
        <AuthPage 
          onLogin={login} 
          onSignup={signup}
        />
      );
    }

    if (perspective === 'candidate') {
      return (
        <DashboardLayout>
          <CandidateDashboard />
        </DashboardLayout>
      );
    }

    if (perspective === 'recruiter') {
      return (
        <DashboardLayout>
          <RecruiterDashboard />
        </DashboardLayout>
      );
    }

    if (perspective === 'admin') {
      return (
        <DashboardLayout>
          <AdminDashboard />
        </DashboardLayout>
      );
    }

    return <LandingPage />;
  };

  // Prevent server-client HTML hydration mismatches
  if (!isMounted) {
    return (
      <main className="flex min-h-screen flex-col relative bg-[#0f172a]">
        <Navbar />
        <LandingPage />
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col relative bg-[#0f172a]">
      <Navbar />
      {renderMainContent()}
    </main>
  );
}
