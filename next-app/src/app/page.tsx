"use client";

import { useAppState } from "@/context/AppContext";
import { LandingPage } from "@/components/LandingPage";
import Navbar from "@/components/Navbar";
import { AuthPage } from "@/components/AuthPage";
import { CandidateDashboard } from "@/components/CandidateDashboard";
import { RecruiterDashboard } from "@/components/RecruiterDashboard";
import { AdminDashboard } from "@/components/AdminDashboard";

export default function Home() {
  const { perspective, token, login } = useAppState();

  const renderMainContent = () => {
    if (perspective === 'visitor') {
      return <LandingPage />;
    }

    if (!token) {
      return (
        <AuthPage 
          onLogin={login} 
          onSignup={async () => {}} // Legacy signup not fully imported, but not needed here if AuthPage handles it internally or if we pass a stub
        />
      );
    }

    if (perspective === 'candidate') {
      return <CandidateDashboard />;
    }

    if (perspective === 'recruiter') {
      return <RecruiterDashboard />;
    }

    if (perspective === 'admin') {
      return <AdminDashboard />;
    }

    return <LandingPage />;
  };

  return (
    <main className="flex min-h-screen flex-col relative">
      <Navbar />
      {renderMainContent()}
    </main>
  );
}
