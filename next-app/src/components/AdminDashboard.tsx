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
    <div className="max-w-7xl mx-auto w-full px-4 py-8 mt-4 font-sans text-slate-800">
      {/* Main Container Glass Wrapper */}
      <div className="bg-gradient-to-br from-indigo-50/50 via-slate-50/80 to-blue-50/50 border border-slate-200/40 rounded-3xl p-6 shadow-xl shadow-slate-100/50 backdrop-blur-xl">
        
        {/* Header Console Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 pb-6 border-b border-slate-200/50">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-2xl text-indigo-600 shadow-sm shadow-indigo-100/20">
              <Shield size={28} />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight">Admin System Console</h1>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">Platform Verification & Moderation Gateways</p>
            </div>
          </div>

          {/* Premium Tab Navigation */}
          <div className="flex bg-white/80 backdrop-blur-md p-1 rounded-full border border-slate-200/50 shadow-sm gap-1 w-full md:w-auto overflow-x-auto">
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
                className={`px-4 py-2 rounded-full text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                  adminTab === tab.id 
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' 
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* OVERVIEW TAB */}
        {adminTab === 'overview' && (
          <div className="flex flex-col gap-6 w-full">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Live activity */}
              <div className="bg-white/60 backdrop-blur-md border border-slate-200/40 p-6 rounded-3xl relative overflow-hidden shadow-sm hover:shadow-md transition-all border-l-4 border-emerald-500">
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-full pointer-events-none" />
                <div className="flex items-center gap-3 text-emerald-600 mb-4">
                  <Activity size={20} className="animate-pulse" />
                  <h3 className="text-xs font-black uppercase tracking-wider">Live Activity</h3>
                </div>
                <div className="text-4xl font-black text-slate-800 tracking-tight">{stats.live}</div>
                <p className="text-[10px] text-slate-400 mt-1.5 font-bold uppercase tracking-wide">Active users on platform</p>
              </div>

              {/* Users Registered */}
              <div className="bg-white/60 backdrop-blur-md border border-slate-200/40 p-6 rounded-3xl relative overflow-hidden shadow-sm hover:shadow-md transition-all border-l-4 border-indigo-500">
                <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-bl-full pointer-events-none" />
                <div className="flex items-center gap-3 text-indigo-600 mb-4">
                  <Users size={20} />
                  <h3 className="text-xs font-black uppercase tracking-wider">Total Registered</h3>
                </div>
                <div className="text-4xl font-black text-slate-800 tracking-tight">{stats.registered}</div>
                <p className="text-[10px] text-slate-400 mt-1.5 font-bold uppercase tracking-wide">Verified User Profiles</p>
              </div>

              {/* Total Visits */}
              <div className="bg-white/60 backdrop-blur-md border border-slate-200/40 p-6 rounded-3xl relative overflow-hidden shadow-sm hover:shadow-md transition-all border-l-4 border-cyan-500">
                <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-bl-full pointer-events-none" />
                <div className="flex items-center gap-3 text-cyan-600 mb-4">
                  <Briefcase size={20} />
                  <h3 className="text-xs font-black uppercase tracking-wider">Total Job Searches</h3>
                </div>
                <div className="text-4xl font-black text-slate-800 tracking-tight">{stats.total}</div>
                <p className="text-[10px] text-slate-400 mt-1.5 font-bold uppercase tracking-wide">Accumulated page requests</p>
              </div>
            </div>

            {/* System status details */}
            <div className="bg-white/70 backdrop-blur-md border border-slate-200/40 rounded-3xl p-6 shadow-sm">
              <h3 className="text-sm font-black text-slate-800 border-b border-slate-100 pb-3.5 mb-4 flex items-center gap-2">
                <CheckCircle size={18} className="text-emerald-500" /> Platform Diagnostics
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-bold">
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-center p-4 bg-white/40 rounded-2xl border border-slate-200/30 shadow-sm">
                    <span className="text-slate-400">Database Engine</span>
                    <span className="text-emerald-600 font-extrabold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Healthy (Prisma DB)
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-white/40 rounded-2xl border border-slate-200/30 shadow-sm">
                    <span className="text-slate-400">Security Gateways</span>
                    <span className="text-emerald-600 font-extrabold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span> WAF Active & Secure
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-center p-4 bg-white/40 rounded-2xl border border-slate-200/30 shadow-sm">
                    <span className="text-slate-400">API Gateway Version</span>
                    <span className="text-indigo-600 font-extrabold">v1.2.0 (NextJS Native)</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-white/40 rounded-2xl border border-slate-200/30 shadow-sm">
                    <span className="text-slate-400">Automated Seed Status</span>
                    <span className="text-blue-600 font-extrabold">Active (Sync Normal)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VERIFY COMPANIES TAB */}
        {adminTab === 'companies' && (
          <div className="bg-white/70 backdrop-blur-md border border-slate-200/40 rounded-3xl p-6 shadow-sm">
            <h3 className="text-sm font-black text-slate-800 border-b border-slate-100 pb-3.5 mb-5">
              🏢 Employer Workspace Verifications
            </h3>
            <div className="flex flex-col gap-4">
              {companies.map(company => (
                <div key={company.id} className="p-5 bg-white/40 border border-slate-200/30 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-white/80 transition-all shadow-sm">
                  <div style={{ textAlign: 'left' }}>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-black text-slate-800">{company.name}</h4>
                      {company.isVerified ? (
                        <span className="bg-emerald-50 text-emerald-600 border border-emerald-200/50 text-[10px] font-black px-2.5 py-0.5 rounded-full select-none">
                          Verified
                        </span>
                      ) : (
                        <span className="bg-amber-50 text-amber-600 border border-amber-200/50 text-[10px] font-black px-2.5 py-0.5 rounded-full select-none">
                          Pending Verification
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 leading-normal font-bold">
                      📍 {company.location} • Sector: {company.sector} • Website: <a href={company.website} target="_blank" className="text-indigo-600 hover:text-indigo-800 transition-colors">{company.website}</a>
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {!company.isVerified ? (
                      <button 
                        onClick={() => handleVerifyCompany(company.id, true)}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer border-none shadow-sm"
                      >
                        <CheckCircle size={14} /> Approve Workspace
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleVerifyCompany(company.id, false)}
                        className="bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200/50 font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
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
          <div className="bg-white/70 backdrop-blur-md border border-slate-200/40 rounded-3xl p-6 shadow-sm">
            <h3 className="text-sm font-black text-slate-800 border-b border-slate-100 pb-3.5 mb-5">
              💼 Job Moderation & Spam Vetting
            </h3>
            <div className="flex flex-col gap-4">
              {jobs && jobs.map(job => (
                <div key={job.id} className="p-5 bg-white/40 border border-slate-200/30 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-white/80 transition-all shadow-sm">
                  <div style={{ textAlign: 'left' }}>
                    <h4 className="text-sm font-black text-slate-800">{job.title}</h4>
                    <p className="text-[11px] text-slate-400 mt-1 leading-normal font-bold">
                      Company: <span className="text-slate-600">{job.companyName}</span> • 📍 {job.location} • Mode: {job.mode} • Type: {job.type}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        if (confirm(`Are you sure you want to flag and delete "${job.title}"?`)) {
                          deleteJob(job.id);
                        }
                      }}
                      className="bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200/50 font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <ShieldAlert size={14} /> Flag & Delete
                    </button>
                  </div>
                </div>
              ))}
              {(!jobs || jobs.length === 0) && (
                <p className="text-slate-400 text-xs font-bold py-8 text-center">No jobs available for moderation.</p>
              )}
            </div>
          </div>
        )}

        {/* PAYMENTS TAB */}
        {adminTab === 'payments' && (
          <div className="bg-white/70 backdrop-blur-md border border-slate-200/40 rounded-3xl p-6 shadow-sm">
            <h3 className="text-sm font-black text-slate-800 border-b border-slate-100 pb-3.5 mb-5">
              💳 Premium Subscriptions & Billing Audits
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs font-bold text-slate-700">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider text-[10px] font-black">
                    <th className="py-3 px-4">Transaction ID</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">User Email</th>
                    <th className="py-3 px-4">Selected Plan</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {transactions.map(txn => (
                    <tr key={txn.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-4 font-mono text-indigo-600 font-extrabold">{txn.id}</td>
                      <td className="py-3 px-4 text-slate-400 font-medium">{txn.date}</td>
                      <td className="py-3 px-4 text-slate-800">{txn.email}</td>
                      <td className="py-3 px-4 text-slate-600">{txn.plan}</td>
                      <td className="py-3 px-4 text-indigo-600 font-black">{txn.amount}</td>
                      <td className="py-3 px-4">
                        <span className="bg-emerald-50 text-emerald-600 border border-emerald-200/50 text-[10px] font-black px-2.5 py-0.5 rounded-full">
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
          <div className="bg-white/70 backdrop-blur-md border border-slate-200/40 rounded-3xl p-6 shadow-sm">
            <h3 className="text-sm font-black text-slate-800 border-b border-slate-100 pb-3.5 mb-5">
              📜 Security System Audit Logs
            </h3>
            <div className="flex flex-col gap-2.5 font-mono text-[11px]">
              {auditLogs.map((log, index) => (
                <div key={log.id || index} className="p-3.5 bg-white/40 border border-slate-200/30 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-2 shadow-sm hover:bg-white/80 transition-all" style={{ textAlign: 'left' }}>
                  <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-slate-400 font-semibold">[{log.timestamp}]</span>
                    <span className="text-indigo-600 font-black">{log.actor}</span>
                    <span className="text-slate-600 font-bold">{log.action}</span>
                  </div>
                  <span className="text-slate-400 font-semibold">IP: {log.ip}</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
