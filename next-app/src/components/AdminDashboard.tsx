import React, { useState, useEffect } from 'react';
import { Users, Briefcase, Activity, Shield } from 'lucide-react';
import { useAppState } from '../context/AppContext';

export const AdminDashboard: React.FC = () => {
  const { user, token } = useAppState();
  const [stats, setStats] = useState<any>(null);
  
  useEffect(() => {
    // We can fetch real stats from an admin API if we had one
    // For now we'll just mock some data or use the public stats endpoint
    fetch('/api/visitor/stats')
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(console.error);
  }, []);

  return (
    <div style={{ padding: '40px 20px', maxWidth: '1200px', margin: '80px auto 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
        <Shield size={32} color="#f43f5e" />
        <h1 style={{ fontSize: '28px', color: '#fff', fontWeight: 800 }}>Admin Dashboard</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
        
        {/* Stats Card */}
        <div className="glass-panel" style={{ padding: '24px', borderTop: '4px solid #10b981' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#10b981', marginBottom: '16px' }}>
            <Activity size={24} />
            <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Live Activity</h3>
          </div>
          <div style={{ fontSize: '36px', fontWeight: 800, color: '#fff' }}>
            {stats?.live || 0}
          </div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '12px', marginTop: '8px' }}>Active Users Right Now</div>
        </div>

        {/* Users Card */}
        <div className="glass-panel" style={{ padding: '24px', borderTop: '4px solid #3b82f6' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#3b82f6', marginBottom: '16px' }}>
            <Users size={24} />
            <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Total Registered</h3>
          </div>
          <div style={{ fontSize: '36px', fontWeight: 800, color: '#fff' }}>
            {stats?.registered || 0}
          </div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '12px', marginTop: '8px' }}>Candidates & Recruiters</div>
        </div>

        {/* Total Visits */}
        <div className="glass-panel" style={{ padding: '24px', borderTop: '4px solid #8b5cf6' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#8b5cf6', marginBottom: '16px' }}>
            <Briefcase size={24} />
            <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Total Visits</h3>
          </div>
          <div style={{ fontSize: '36px', fontWeight: 800, color: '#fff' }}>
            {stats?.total || 0}
          </div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '12px', marginTop: '8px' }}>Lifetime Platform Visits</div>
        </div>
      </div>

      <div style={{ marginTop: '40px' }} className="glass-panel">
        <div style={{ padding: '24px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <h2 style={{ fontSize: '20px', color: '#fff', fontWeight: 700 }}>System Status</h2>
        </div>
        <div style={{ padding: '24px' }}>
          <p style={{ color: 'var(--text-secondary)' }}>Welcome to the Hyriq Admin Panel, {user?.name}. Everything is running smoothly.</p>
        </div>
      </div>
    </div>
  );
};
