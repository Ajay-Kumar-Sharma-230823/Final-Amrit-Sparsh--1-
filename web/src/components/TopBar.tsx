'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store/appStore';
import { Bell, Search, Sun, Moon, Sparkles, AlertCircle, CheckCircle, Info, X } from 'lucide-react';

const themeOptions = [
  { id: 'light' as const, label: '☀️ Light', desc: 'Warm Cream' },
  { id: 'dark' as const, label: '🌙 Dark', desc: 'Pure Black' },
  { id: 'pink' as const, label: '💗 Pink', desc: "Women's Health" },
  { id: 'brown' as const, label: '🏔️ Brown', desc: 'Earthy Warm' },
];

export default function TopBar() {
  const { theme, setTheme, user, alerts, unreadCount, markAlertRead } = useAppStore();
  const [showAlerts, setShowAlerts] = useState(false);
  const [showTheme, setShowTheme] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const themeIcon = theme === 'dark' ? '🌙' : theme === 'pink' ? '💗' : theme === 'brown' ? '🏔️' : '☀️';

  const severityMeta = {
    critical: { icon: <AlertCircle size={13} />, color: 'var(--color-danger)' },
    high: { icon: <AlertCircle size={13} />, color: 'var(--color-warning)' },
    medium: { icon: <Info size={13} />, color: 'var(--text-muted)' },
    low: { icon: <CheckCircle size={13} />, color: 'var(--color-success)' },
  };

  return (
    <header className="topbar">
      {/* Search */}
      <div style={{ flex: 1, maxWidth: 440, display: 'flex', alignItems: 'center', gap: 10, background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 12, padding: '0 14px', height: 40 }}>
        <Search size={15} color="var(--text-muted)" />
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search health records, doctors..."
          className="search-input"
          style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: 13, color: 'var(--text-primary)', padding: 0 }}
        />
        <kbd style={{ background: 'var(--accent-surface)', borderRadius: 6, padding: '2px 7px', fontSize: 10, color: 'var(--text-muted)', fontFamily: 'monospace', border: '1px solid var(--border-color)' }}>
          ⌘K
        </kbd>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: 'auto' }}>
        {/* Theme */}
        <div style={{ position: 'relative' }}>
          <motion.button
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            onClick={() => { setShowTheme(!showTheme); setShowAlerts(false); }}
            style={{
              background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 10,
              padding: '8px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7,
              color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600,
            }}
          >
            <span>{themeIcon}</span>
            <span style={{ fontSize: 12 }}>{theme.charAt(0).toUpperCase() + theme.slice(1)}</span>
          </motion.button>

          <AnimatePresence>
            {showTheme && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.96 }}
                style={{
                  position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                  background: 'var(--bg-card)', border: '1px solid var(--border-color)',
                  borderRadius: 16, padding: 8, zIndex: 200, minWidth: 160,
                  boxShadow: 'var(--shadow-lg)',
                }}
              >
                {themeOptions.map((t) => (
                  <motion.button
                    key={t.id}
                    whileHover={{ x: 4 }}
                    onClick={() => { setTheme(t.id); setShowTheme(false); }}
                    style={{
                      width: '100%', background: theme === t.id ? 'var(--accent-surface)' : 'transparent',
                      border: 'none', borderRadius: 10, padding: '9px 14px', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: 10, textAlign: 'left',
                      color: theme === t.id ? 'var(--accent-primary)' : 'var(--text-secondary)',
                      fontSize: 13, fontWeight: theme === t.id ? 600 : 400,
                    }}
                  >
                    <span>{t.label}</span>
                    <span style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--text-muted)' }}>{t.desc}</span>
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Notifications */}
        <div style={{ position: 'relative' }}>
          <motion.button
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => { setShowAlerts(!showAlerts); setShowTheme(false); }}
            style={{
              background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 10,
              padding: 9, cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'var(--text-secondary)',
              position: 'relative',
            }}
          >
            <Bell size={17} />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute', top: -3, right: -3,
                background: 'var(--color-danger)', color: '#fff',
                borderRadius: '50%', width: 17, height: 17, fontSize: 9, fontWeight: 800,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '2px solid var(--bg-card)',
              }}>{unreadCount}</span>
            )}
          </motion.button>

          <AnimatePresence>
            {showAlerts && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.96 }}
                style={{
                  position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                  background: 'var(--bg-card)', border: '1px solid var(--border-color)',
                  borderRadius: 20, padding: 14, zIndex: 200, width: 340,
                  boxShadow: 'var(--shadow-xl)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>Notifications</div>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{unreadCount} unread</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 280, overflowY: 'auto' }}>
                  {alerts.map((alert) => {
                    const meta = severityMeta[alert.severity];
                    return (
                      <motion.div
                        key={alert.id} whileHover={{ x: 4 }}
                        onClick={() => markAlertRead(alert.id)}
                        style={{
                          background: alert.read ? 'transparent' : 'var(--accent-surface)',
                          border: `1px solid ${alert.read ? 'transparent' : 'var(--border-color)'}`,
                          borderRadius: 12, padding: '10px 12px', cursor: 'pointer',
                          opacity: alert.read ? 0.6 : 1,
                          display: 'flex', gap: 10, alignItems: 'flex-start',
                        }}
                      >
                        <span style={{ color: meta.color, marginTop: 1, flexShrink: 0 }}>{meta.icon}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{alert.title}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2, lineHeight: 1.4 }}>{alert.message}</div>
                        </div>
                        {!alert.read && <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--color-danger)', flexShrink: 0, marginTop: 4 }} />}
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Avatar */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          title={user?.name || 'User'}
          style={{
            width: 37, height: 37, borderRadius: '50%',
            background: user?.primaryColor || 'var(--gradient-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 800, fontSize: 14, cursor: 'pointer',
            boxShadow: 'var(--shadow-sm)', flexShrink: 0,
            position: 'relative',
          }}
        >
          {user?.name?.charAt(0)?.toUpperCase() || 'A'}
          {/* Gender indicator dot */}
          {user?.gender && (
            <span style={{
              position: 'absolute', bottom: -1, right: -1,
              fontSize: 10, lineHeight: 1,
            }}>
              {user.gender === 'female' ? '♀' : user.gender === 'male' ? '♂' : '⚧'}
            </span>
          )}
        </motion.div>
      </div>
    </header>
  );
}
