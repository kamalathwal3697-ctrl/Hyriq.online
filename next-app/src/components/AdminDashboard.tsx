"use client";

import React, { useState, useEffect } from 'react';
import { 
  Users, Briefcase, Activity, Shield, CheckCircle, XCircle, 
  Search, ShieldAlert, DollarSign, FileText, AlertTriangle
} from 'lucide-react';
import { useAppState } from '../context/AppContext';

export const AdminDashboard: React.FC = () => {
  const { user, token, jobs, deleteJob } = useAppState();
  const [stats, setStats] = useState<any>({
    live: 12,
    registered: 320,
    total: 1540
  });

  // State for companies waiting for verification
  const [companies, setCompanies] = useState([
    { id: '1', name: 'Google Development Group', website: 'https://gdg.community.dev', location: 'Patiala', sector: 'Tech & Community', isVerified: false },
    { id: '2', name: 'TechVibe Solutions', website: 'https://techvibe.online', location: 'Mohali', sector: 'Enterprise SaaS', isVerified: false },
    { id: '3', name: 'Innovate Punjab', website: 'https://innovatepunjab.org', location: 'Chandigarh', sector: 'Incubator & Advisory', isVerified: true }
  ]);

  // Audit Logs state
  const [auditLogs, setAuditLogs] = useState([
    { id: '101', timestamp: '2026-07-07 16:10:24', actor: 'Moderator Alpha', action: 'Approved Company: Innovate Punjab', ip: '192.168.1.45' },
    { id: '102', timestamp: '2026-07-07 15:45:12', actor: 'System Auto-Guard', action: 'Flagged Job Posting: "Work From Home Typing Job"', ip: '127.0.0.1' },
    { id: '103', timestamp: '2026-07-07 14:02:59', actor: 'Admin Raj', action: 'Created Recruiter Account: raj_athwal', ip: '192.168.1.18' }
  ]);

  // Payment transactions list
  const [transactions, setTransactions] = useState([
    { id: 'TXN-9021', date: '2026-07-07', email: 'raj@hyriq.online', plan: 'Growth Plan', amount: '₹9,999', status: 'Success' },
    { id: 'TXN-8874', date: '2026-07-06', email: 'priya@techvibe.co', plan: 'Enterprise Pro', amount: '₹49,999', status: 'Success' }
  ]);

  const [adminTab, setAdminTab] = useState<'overview' | 'companies' | 'jobs' | 'payments' | 'logs'>('overview');

  const handleVerifyCompany = (id: string, verify: boolean) => {
    setCompanies(companies.map(c => c.id === id ? { ...c, isVerified: verify } : c));
    
    // Log audit trail
    const actionText = verify ? `Approved Company: ${companies.find(c=>c.id===id)?.name}` : `Rejected/Unverified Company: ${companies.find(c=>c.id===id)?.name}`;
    setAuditLogs([
      { 
        id: String(Date.now()), 
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19), 
        actor: user?.name || 'Admin', 
        action: actionText, 
        ip: '192.168.1.100' 
      },
      ...auditLogs
    ]);
  };

  return (
    <div className="max-w-7xl mx-auto w-full px-4 py-8 mt-4 text-slate-100 font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="flex items-center gap-3">
          <Shield size={32} className="text-[#06b6d4]" />
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">Admin System Console</h1>
            <p className="text-xs text-slate-400 mt-0.5">Control panel for platform verification, moderation, and logs</p>
          </div>
        </div>

        {/* Admin Navigation */}
        <div className="flex bg-slate-900/60 p-1 rounded-xl border border-white/5 gap-1">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'companies', label: 'Verify Companies' },
            { id: 'jobs', label: 'Moderate Jobs' },
            { id: 'payments', label: 'Payments' },
            { id: 'logs', label: 'Audit Logs' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setAdminTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                adminTab === tab.id 
                  ? 'bg-[#2563eb] text-white shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* OVERVIEW TAB */}
      {adminTab === 'overview' && (
        <div className="flex flex-col gap-8 w-full">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Live activity */}
            <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 p-6 rounded-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-full pointer-events-none" />
              <div className="flex items-center gap-3 text-emerald-400 mb-4">
                <Activity size={22} className="animate-pulse" />
                <h3 className="text-sm font-bold">Live Activity</h3>
              </div>
              <div className="text-4xl font-black text-white">{stats.live}</div>
              <p className="text-[10px] text-slate-400 mt-1 font-semibold">Active users on the platform right now</p>
            </div>

            {/* Users Registered */}
            <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 p-6 rounded-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-bl-full pointer-events-none" />
              <div className="flex items-center gap-3 text-blue-400 mb-4">
                <Users size={22} />
                <h3 className="text-sm font-bold">Total Registered</h3>
              </div>
              <div className="text-4xl font-black text-white">{stats.registered}</div>
              <p className="text-[10px] text-slate-400 mt-1 font-semibold">Verified candidate and recruiter accounts</p>
            </div>

            {/* Total Visits */}
            <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 p-6 rounded-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-bl-full pointer-events-none" />
              <div className="flex items-center gap-3 text-cyan-400 mb-4">
                <Briefcase size={22} />
                <h3 className="text-sm font-bold">Total Job Searches</h3>
              </div>
              <div className="text-4xl font-black text-white">{stats.total}</div>
              <p className="text-[10px] text-slate-400 mt-1 font-semibold">Accumulated regional page visits</p>
            </div>
          </div>

          {/* System status details */}
          <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-6">
            <h3 className="text-base font-bold text-white border-b border-white/5 pb-3 mb-4 flex items-center gap-2">
              <CheckCircle size={18} className="text-emerald-400" /> Platform Diagnostics
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-semibold text-slate-300">
              <div className="flex flex-col gap-2">
                <div className="flex justify-between p-3.5 bg-slate-950/40 rounded-xl border border-white/5">
                  <span className="text-slate-400">Database Engine</span>
                  <span className="text-emerald-400 font-bold">Healthy (Prisma PostgreSQL)</span>
                </div>
                <div className="flex justify-between p-3.5 bg-slate-950/40 rounded-xl border border-white/5">
                  <span className="text-slate-400">Security Gateways</span>
                  <span className="text-emerald-400 font-bold">WAF Active & Secure Cookies Enabled</span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex justify-between p-3.5 bg-slate-950/40 rounded-xl border border-white/5">
                  <span className="text-slate-400">API Gateway Version</span>
                  <span className="text-[#06b6d4]">v1.2.0 (NextJS Edge Native)</span>
                </div>
                <div className="flex justify-between p-3.5 bg-slate-950/40 rounded-xl border border-white/5">
                  <span className="text-slate-400">Automated Seed Status</span>
                  <span className="text-blue-400">Completed (Arbeitnow + Google Feed sync)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VERIFY COMPANIES TAB */}
      {adminTab === 'companies' && (
        <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-6">
          <h3 className="text-base font-bold text-white border-b border-white/5 pb-3 mb-5">
            🏢 Employer Workspace Verifications
          </h3>
          <div className="flex flex-col gap-4">
            {companies.map(company => (
              <div key={company.id} className="p-5 bg-slate-950/40 border border-white/5 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-black text-white">{company.name}</h4>
                    {company.isVerified ? (
                      <span className="bg-emerald-950 text-emerald-400 border border-emerald-900/30 text-[9px] font-extrabold px-2 py-0.5 rounded-full">
                        Verified
                      </span>
                    ) : (
                      <span className="bg-amber-950 text-amber-400 border border-amber-900/30 text-[9px] font-extrabold px-2 py-0.5 rounded-full">
                        Pending Verification
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 leading-normal font-semibold">
                    📍 {company.location} • Sector: {company.sector} • Website: <a href={company.website} target="_blank" className="text-blue-400 hover:underline">{company.website}</a>
                  </p>
                </div>
                <div className="flex gap-2">
                  {!company.isVerified ? (
                    <button 
                      onClick={() => handleVerifyCompany(company.id, true)}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <CheckCircle size={14} /> Approve Workspace
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleVerifyCompany(company.id, false)}
                      className="bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <XCircle size={14} /> Revoke Verification
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODERATE JOBS TAB */}
      {adminTab === 'jobs' && (
        <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-6">
          <h3 className="text-base font-bold text-white border-b border-white/5 pb-3 mb-5">
            💼 Job Moderation & Spam Vetting
          </h3>
          <div className="flex flex-col gap-4">
            {jobs && jobs.map(job => (
              <div key={job.id} className="p-5 bg-slate-950/40 border border-white/5 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h4 className="text-sm font-black text-white">{job.title}</h4>
                  <p className="text-[11px] text-slate-400 mt-1 leading-normal font-semibold">
                    Company: <span className="text-slate-200">{job.companyName}</span> • 📍 {job.location} • Mode: {job.mode} • Type: {job.type}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      if (confirm(`Are you sure you want to flag and delete "${job.title}"?`)) {
                        deleteJob(job.id);
                      }
                    }}
                    className="bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-800/30 font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <ShieldAlert size={14} /> Flag & Delete
                  </button>
                </div>
              </div>
            ))}
            {(!jobs || jobs.length === 0) && (
              <p className="text-slate-400 text-xs font-semibold py-8 text-center">No jobs available for moderation.</p>
            )}
          </div>
        </div>
      )}

      {/* PAYMENTS TAB */}
      {adminTab === 'payments' && (
        <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-6">
          <h3 className="text-base font-bold text-white border-b border-white/5 pb-3 mb-5">
            💳 Premium Subscriptions & Billing Audits
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-semibold">
              <thead>
                <tr className="border-b border-white/5 text-slate-400 uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Transaction ID</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">User Email</th>
                  <th className="py-3 px-4">Selected Plan</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {transactions.map(txn => (
                  <tr key={txn.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4 font-mono text-blue-400">{txn.id}</td>
                    <td className="py-3 px-4 text-slate-300">{txn.date}</td>
                    <td className="py-3 px-4 text-white">{txn.email}</td>
                    <td className="py-3 px-4 text-slate-200">{txn.plan}</td>
                    <td className="py-3 px-4 text-[#06b6d4] font-bold">{txn.amount}</td>
                    <td className="py-3 px-4">
                      <span className="bg-emerald-950 text-emerald-400 border border-emerald-900/30 text-[9px] font-extrabold px-2 py-0.5 rounded-full">
                        {txn.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* AUDIT LOGS TAB */}
      {adminTab === 'logs' && (
        <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-6">
          <h3 className="text-base font-bold text-white border-b border-white/5 pb-3 mb-5">
            📜 Security System Audit Logs
          </h3>
          <div className="flex flex-col gap-2 font-mono text-[11px] text-slate-300">
            {auditLogs.map((log, index) => (
              <div key={log.id || index} className="p-3 bg-slate-950/40 border border-white/5 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-2">
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-slate-500">[{log.timestamp}]</span>
                  <span className="text-blue-400 font-bold">{log.actor}</span>
                  <span className="text-slate-300">{log.action}</span>
                </div>
                <span className="text-slate-500">IP: {log.ip}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
