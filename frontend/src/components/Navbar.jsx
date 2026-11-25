import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { notificationApi } from '../services/api';
import { Bell, Menu, Check, User, Sparkles, Building2, ShieldCheck, X } from 'lucide-react';

export default function Navbar({ pageTitle, toggleSidebar }) {
  const { user, role, quickLogin } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [switchingRole, setSwitchingRole] = useState(false);

  const fetchNotifications = async () => {
    try {
      const res = await notificationApi.getMy();
      if (res.success) {
        setNotifications(res.notifications || []);
        setUnreadCount(res.unreadCount || 0);
      }
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 20000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleMarkRead = async (id) => {
    try {
      await notificationApi.markRead(id);
      fetchNotifications();
    } catch (e) {}
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllRead();
      fetchNotifications();
    } catch (e) {}
  };

  const handleQuickSwitch = async (newRole) => {
    setSwitchingRole(true);
    try {
      await quickLogin(newRole);
    } catch (e) {
      console.error(e);
    } finally {
      setSwitchingRole(false);
    }
  };

  return (
    <header className="top-navbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          onClick={toggleSidebar}
          style={{ display: 'none' }}
          className="lg:hidden icon-btn"
          title="Toggle Navigation"
        >
          <Menu size={20} />
        </button>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '800', lineHeight: 1.2 }}>{pageTitle}</h2>
          <p style={{ fontSize: '0.8rem', color: '#64748b' }}>University Placement & Corporate Relations Portal</p>
        </div>
      </div>

      <div className="navbar-actions">
        {/* Role Switcher Pill Bar for Demo */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.35rem',
          backgroundColor: '#f1f5f9',
          padding: '0.25rem 0.4rem',
          borderRadius: '9999px',
          border: '1px solid #e2e8f0'
        }}>
          <span style={{ fontSize: '0.72rem', fontWeight: '700', color: '#64748b', padding: '0 0.4rem' }}>
            DEMO ROLE:
          </span>
          <button
            onClick={() => handleQuickSwitch('student')}
            disabled={switchingRole}
            style={{
              padding: '0.25rem 0.65rem',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: '600',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: role === 'student' ? '#2563eb' : 'transparent',
              color: role === 'student' ? '#ffffff' : '#475569',
              transition: 'all 0.15s ease'
            }}
          >
            Student
          </button>
          <button
            onClick={() => handleQuickSwitch('recruiter')}
            disabled={switchingRole}
            style={{
              padding: '0.25rem 0.65rem',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: '600',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: role === 'recruiter' ? '#2563eb' : 'transparent',
              color: role === 'recruiter' ? '#ffffff' : '#475569',
              transition: 'all 0.15s ease'
            }}
          >
            Recruiter
          </button>
          <button
            onClick={() => handleQuickSwitch('admin')}
            disabled={switchingRole}
            style={{
              padding: '0.25rem 0.65rem',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: '600',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: role === 'admin' ? '#2563eb' : 'transparent',
              color: role === 'admin' ? '#ffffff' : '#475569',
              transition: 'all 0.15s ease'
            }}
          >
            Admin
          </button>
        </div>

        {/* Notification Bell */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowNotifMenu(!showNotifMenu)}
            className="icon-btn"
            title="Notifications"
          >
            <Bell size={19} />
            {unreadCount > 0 && <span className="notif-pulse" />}
          </button>

          {showNotifMenu && (
            <div className="dropdown-menu" style={{ width: '360px', padding: '0' }}>
              <div style={{
                padding: '0.85rem 1rem',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: '#f8fafc',
                borderRadius: '0.75rem 0.75rem 0 0'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>Notifications</span>
                  {unreadCount > 0 && (
                    <span style={{
                      backgroundColor: '#ef4444',
                      color: '#ffffff',
                      fontSize: '0.7rem',
                      fontWeight: '700',
                      padding: '0.1rem 0.45rem',
                      borderRadius: '9999px'
                    }}>
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    style={{ background: 'none', border: 'none', fontSize: '0.75rem', color: '#2563eb', fontWeight: '600', cursor: 'pointer' }}
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div style={{ maxHeight: '340px', overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                    No notifications yet.
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => !n.is_read && handleMarkRead(n.id)}
                      style={{
                        padding: '0.85rem 1rem',
                        borderBottom: '1px solid #f1f5f9',
                        backgroundColor: n.is_read ? '#ffffff' : '#f0f7ff',
                        cursor: n.is_read ? 'default' : 'pointer',
                        transition: 'background-color 0.15s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
                        <h4 style={{ fontSize: '0.825rem', fontWeight: '700', color: '#0f172a' }}>{n.title}</h4>
                        {!n.is_read && (
                          <span style={{ width: '8px', height: '8px', borderRadius: '9999px', backgroundColor: '#2563eb', flexShrink: 0, marginTop: '4px' }} />
                        )}
                      </div>
                      <p style={{ fontSize: '0.785rem', color: '#475569', marginTop: '0.2rem', lineHeight: '1.4' }}>
                        {n.message}
                      </p>
                      <span style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.35rem', display: 'block' }}>
                        {new Date(n.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
