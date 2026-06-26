import React from 'react';
import { AppStateProvider, useAppState } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { CandidateDashboard } from './components/CandidateDashboard';
import { RecruiterDashboard } from './components/RecruiterDashboard';
import { AuthPage } from './components/AuthPage';
import './App.css';

const AppContent: React.FC = () => {
  const { perspective, token, login, signup } = useAppState();

  const renderMainContent = () => {
    if (perspective === 'visitor') {
      return <LandingPage />;
    }

    // Require authentication for candidate/recruiter workspaces
    if (!token) {
      return <AuthPage onLogin={login} onSignup={signup} />;
    }

    // Authenticated views
    if (perspective === 'candidate') {
      return <CandidateDashboard />;
    }

    if (perspective === 'recruiter') {
      return <RecruiterDashboard />;
    }

    return <LandingPage />;
  };

  return (
    <div className="app-container">
      <Navbar />
      
      <main style={{ flex: 1 }}>
        {renderMainContent()}
      </main>

      {/* Modern Gen-Z Minimalist Footer */}
      <footer style={{
        borderTop: '1px solid var(--border-color)',
        padding: '32px 0',
        textAlign: 'center',
        background: 'rgba(5, 3, 10, 0.4)',
        marginTop: 'auto'
      }}>
        <div className="container">
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', fontWeight: 500 }}>
            Hyriq © {new Date().getFullYear()} • Find Your Vibe. Land Your Career.
          </p>
          <p style={{ color: 'rgba(255, 255, 255, 0.15)', fontSize: '11px', marginTop: '6px' }}>
            Zero resume spam, zero ghost jobs. Real-time direct chat for modern workplaces.
          </p>
        </div>
      </footer>
    </div>
  );
};

function App() {
  return (
    <AppStateProvider>
      <AppContent />
    </AppStateProvider>
  );
}

export default App;
