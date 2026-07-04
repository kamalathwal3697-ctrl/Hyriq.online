import React, { useState, useEffect } from 'react';
import { Bell, MessageCircle, Briefcase, CheckCircle, Eye, Trash2 } from 'lucide-react';
import { useAppState } from '../context/AppContext';

const isMobileLayout = () => {
  const isPortrait = window.innerHeight > window.innerWidth;
  return window.innerWidth <= 767 || (window.innerWidth <= 1024 && isPortrait);
};

interface Notification {
  id: string;
  type: 'message' | 'status' | 'application' | 'system';
  title: string;
  body: string;
  timestamp: string;
  read: boolean;
  jobId?: string;
  jobTitle?: string;
}

export const NotificationsPage: React.FC = () => {
  const { applications, user, jobs } = useAppState();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const isMobile = isMobileLayout();

  // Derive notifications from applications data
  useEffect(() => {
    const derived: Notification[] = [];

    applications.forEach(app => {
      const job = jobs.find(j => j.id === app.jobId);
      const jobTitle = job?.title || 'Unknown Position';

      // Status change notifications
      if (app.status !== 'Applied') {
        derived.push({
          id: `status-${app.id}-${app.status}`,
          type: 'status',
          title: `Application ${app.status}`,
          body: `Your application for "${jobTitle}" has been ${app.status.toLowerCase()}.`,
          timestamp: app.appliedDate,
          read: false,
          jobId: app.jobId,
          jobTitle
        });
      }

      // Chat message notifications
      if (app.chatHistory && app.chatHistory.length > 0) {
        const latestMsg = app.chatHistory[app.chatHistory.length - 1];
        if (latestMsg.sender !== user?.role) {
          derived.push({
            id: `msg-${app.id}-${latestMsg.id}`,
            type: 'message',
            title: `New message from ${latestMsg.sender === 'candidate' ? 'Job Seeker' : 'Recruiter'}`,
            body: latestMsg.text.length > 80 ? latestMsg.text.substring(0, 80) + '...' : latestMsg.text,
            timestamp: latestMsg.timestamp,
            read: false,
            jobId: app.jobId,
            jobTitle
          });
        }
      }
    });

    // Add system notifications
    derived.push({
      id: 'system-welcome',
      type: 'system',
      title: 'Welcome to Hyriq',
      body: 'Your account is set up and ready. Start exploring opportunities!',
      timestamp: new Date().toISOString(),
      read: true
    });

    derived.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    setNotifications(derived);
  }, [applications, jobs, user]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const toggleRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: !n.read } : n));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const filteredNotifications = filter === 'unread'
    ? notifications.filter(n => !n.read)
    : notifications;

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'message': return <MessageCircle size={18} />;
      case 'status': return <CheckCircle size={18} />;
      case 'application': return <Briefcase size={18} />;
      case 'system': return <Bell size={18} />;
      default: return <Bell size={18} />;
    }
  };

  const getIconBg = (type: Notification['type']) => {
    switch (type) {
      case 'message': return 'rgba(99, 102, 241, 0.15)';
      case 'status': return 'rgba(245, 158, 11, 0.15)';
      case 'application': return 'rgba(16, 185, 129, 0.15)';
      case 'system': return 'rgba(139, 92, 246, 0.15)';
      default: return 'rgba(255, 255, 255, 0.06)';
    }
  };

  const getIconColor = (type: Notification['type']) => {
    switch (type) {
      case 'message': return '#818cf8';
      case 'status': return '#f59e0b';
      case 'application': return '#10b981';
      case 'system': return '#8b5cf6';
      default: return '#fff';
    }
  };

  const formatTime = (ts: string) => {
    const now = new Date();
    const d = new Date(ts);
    const diffMs = now.getTime() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHr = Math.floor(diffMs / 3600000);
    const diffDay = Math.floor(diffMs / 86400000);

    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHr < 24) return `${diffHr}h ago`;
    if (diffDay < 7) return `${diffDay}d ago`;
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="container" style={{ maxWidth: '720px', margin: '0 auto', padding: isMobile ? '16px' : '32px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%)',
            border: '1px solid rgba(99, 102, 241, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#818cf8'
          }}>
            <Bell size={20} />
          </div>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#fff', margin: 0 }}>Notifications</h2>
            {unreadCount > 0 && (
              <span style={{ fontSize: '12px', color: '#818cf8', fontWeight: 600 }}>{unreadCount} unread</span>
            )}
          </div>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="btn btn-ghost"
            style={{
              fontSize: '12px',
              fontWeight: 600,
              color: '#818cf8',
              padding: '6px 14px',
              borderRadius: '8px',
              border: '1px solid rgba(99, 102, 241, 0.2)',
              background: 'rgba(99, 102, 241, 0.06)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s'
            }}
          >
            <Eye size={13} />
            Mark all read
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '20px',
        background: 'rgba(0, 0, 0, 0.2)',
        border: '1px solid var(--border-color)',
        padding: '4px',
        borderRadius: '12px'
      }}>
        {[
          { id: 'all' as const, label: 'All', count: notifications.length },
          { id: 'unread' as const, label: 'Unread', count: unreadCount }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            style={{
              flex: 1,
              padding: '8px 16px',
              borderRadius: '10px',
              border: 'none',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
              background: filter === tab.id ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
              color: filter === tab.id ? '#818cf8' : 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            {tab.label}
            {tab.count > 0 && (
              <span style={{
                fontSize: '10px',
                fontWeight: 700,
                background: filter === tab.id ? 'rgba(99, 102, 241, 0.25)' : 'rgba(255,255,255,0.06)',
                padding: '2px 7px',
                borderRadius: '10px',
                minWidth: '20px',
                textAlign: 'center'
              }}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <div className="glass-panel" style={{
          padding: '48px 24px',
          textAlign: 'center',
          borderRadius: '16px'
        }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: 'rgba(255,255,255,0.04)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            color: 'var(--text-muted)'
          }}>
            <Bell size={24} />
          </div>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', margin: '0 0 8px' }}>All caught up</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
            {filter === 'unread' ? 'No unread notifications.' : 'You have no notifications yet.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {filteredNotifications.map(notif => (
            <div
              key={notif.id}
              className="glass-panel"
              style={{
                padding: isMobile ? '14px' : '16px',
                borderRadius: '14px',
                display: 'flex',
                gap: '12px',
                alignItems: 'flex-start',
                cursor: 'pointer',
                transition: 'all 0.2s',
                background: notif.read ? 'rgba(255,255,255,0.01)' : 'rgba(99, 102, 241, 0.03)',
                borderLeft: notif.read ? '3px solid transparent' : '3px solid #818cf8'
              }}
              onClick={() => toggleRead(notif.id)}
            >
              {/* Icon */}
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '12px',
                background: getIconBg(notif.type),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: getIconColor(notif.type),
                flexShrink: 0
              }}>
                {getIcon(notif.type)}
              </div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '4px' }}>
                  <h4 style={{
                    fontSize: '13px',
                    fontWeight: 700,
                    color: notif.read ? 'var(--text-secondary)' : '#fff',
                    margin: 0,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {notif.title}
                  </h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500, whiteSpace: 'nowrap' }}>
                      {formatTime(notif.timestamp)}
                    </span>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteNotification(notif.id); }}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        padding: '2px',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        transition: 'color 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
                      onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
                <p style={{
                  fontSize: '12px',
                  color: 'var(--text-secondary)',
                  margin: 0,
                  lineHeight: '1.5',
                  opacity: notif.read ? 0.6 : 0.8
                }}>
                  {notif.body}
                </p>
                {notif.jobTitle && (
                  <span style={{
                    display: 'inline-block',
                    fontSize: '10px',
                    fontWeight: 600,
                    color: 'var(--text-muted)',
                    background: 'rgba(255,255,255,0.04)',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    marginTop: '6px'
                  }}>
                    {notif.jobTitle}
                  </span>
                )}
              </div>

              {/* Unread indicator */}
              {!notif.read && (
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#818cf8',
                  flexShrink: 0,
                  marginTop: '4px'
                }} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
