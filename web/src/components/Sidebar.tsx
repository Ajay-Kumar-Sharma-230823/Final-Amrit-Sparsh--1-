'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store/appStore';
import {
  Info, LayoutDashboard, Heart, Shield, MapPin, AlertTriangle,
  CreditCard, Users, Settings, PanelLeftClose, Activity, Stethoscope,
} from 'lucide-react';

export const navItems = [
  { id: 'about', label: 'About Us', icon: Info },
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'health', label: 'My Health', icon: Heart },
  { id: 'mdr', label: 'MDR Command', icon: Shield },
  { id: 'mahakumbh', label: 'MahaKumbh Version', icon: MapPin },
  { id: 'emergency', label: 'Emergency SOS', icon: AlertTriangle },
  { id: 'medical', label: 'Medical Services', icon: Stethoscope },
  { id: 'abha', label: 'ABHA', icon: CreditCard },
  { id: 'asha', label: 'ASHA', icon: Users },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  const { activeModule, setActiveModule, sidebarCollapsed, toggleSidebar, user } = useAppStore();

  return (
    <motion.aside
      animate={{ width: sidebarCollapsed ? 72 : 264 }}
      transition={{ type: 'spring', damping: 22, stiffness: 200 }}
      style={{
        background: 'var(--sidebar-bg)',
        height: '100vh',
        position: 'fixed',
        left: 0, top: 0,
        display: 'flex',
        flexDirection: 'column',
        zIndex: 100,
        overflow: 'hidden',
        borderRight: '1px solid var(--border-color)',
      }}
    >
      {/* ── Header: Logo + Collapse Button ── */}
      <div style={{
        padding: '16px 12px',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        justifyContent: sidebarCollapsed ? 'center' : 'space-between',
        minHeight: 68,
      }}>
        {/* Logo group */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden', flex: 1 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 11, flexShrink: 0,
            background: 'var(--gradient-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: 'var(--shadow-sm)',
          }}>
            <Activity color="white" size={19} />
          </div>

          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.18 }}
                style={{ overflow: 'hidden' }}
              >
                <div style={{
                  fontFamily: 'Outfit, sans-serif',
                  fontWeight: 800, fontSize: 14.5, letterSpacing: '-0.01em',
                  color: 'var(--text-primary)', lineHeight: 1.1, whiteSpace: 'nowrap',
                }}>
                  Amrit Sparsh
                </div>
                <div style={{
                  fontSize: 9.5, color: 'var(--text-muted)',
                  letterSpacing: '0.08em', marginTop: 2,
                  textTransform: 'uppercase', whiteSpace: 'nowrap',
                }}>
                  AI Healthcare Platform
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Collapse / Expand Button ── */}
        <motion.button
          whileHover={{ scale: 1.1, backgroundColor: 'var(--accent-surface)' }}
          whileTap={{ scale: 0.9 }}
          onClick={toggleSidebar}
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          style={{
            flexShrink: 0,
            width: 32, height: 32,
            borderRadius: 9,
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--text-muted)',
          }}
        >
          <motion.div
            animate={{ rotate: sidebarCollapsed ? 180 : 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <PanelLeftClose size={16} />
          </motion.div>
        </motion.button>
      </div>

      {/* ── Nav Items ── */}
      <nav style={{
        flex: 1, padding: '16px 12px',
        overflowY: 'auto',
        display: 'flex', flexDirection: 'column', gap: 6,
      }}>
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = activeModule === item.id;

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.04, type: 'spring', damping: 20 }}
            >
              <motion.button
                whileHover={{ scale: sidebarCollapsed ? 1.05 : 1.02, x: sidebarCollapsed ? 0 : 4 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setActiveModule(item.id)}
                className={`nav-box ${isActive ? 'active' : ''}`}
                style={{ justifyContent: sidebarCollapsed ? 'center' : 'flex-start' }}
              >
                <Icon size={18} style={{ flexShrink: 0 }} strokeWidth={isActive ? 2.5 : 2} />

                <AnimatePresence>
                  {!sidebarCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      style={{
                        overflow: 'hidden', whiteSpace: 'nowrap',
                        fontSize: 14, fontWeight: isActive ? 600 : 500,
                      }}
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>

                {/* SOS Badge */}
                {item.id === 'emergency' && !sidebarCollapsed && (
                  <span style={{
                    marginLeft: 'auto', background: 'var(--color-danger)',
                    color: '#fff', borderRadius: 999, padding: '1px 7px',
                    fontSize: 9, fontWeight: 800,
                  }}>
                    SOS
                  </span>
                )}
              </motion.button>
            </motion.div>
          );
        })}
      </nav>

      {/* ── User Profile Footer ── */}
      <AnimatePresence>
        {!sidebarCollapsed && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ padding: '12px 14px', borderTop: '1px solid var(--border-color)' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
                background: user?.primaryColor || 'var(--gradient-primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontWeight: 800, fontSize: 13,
              }}>
                {user?.name?.charAt(0)?.toUpperCase() || 'A'}
              </div>
              <div style={{ overflow: 'hidden', flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user?.name || 'User'}
                  {user?.gender === 'female' ? ' ♀' : user?.gender === 'male' ? ' ♂' : ''}
                </div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                  {user?.role || 'Healthcare User'}{user?.institute ? ` · ${user.institute}` : ''}
                </div>
              </div>
            </div>
            <div style={{ fontSize: 9.5, color: 'var(--text-muted)', textAlign: 'center', marginTop: 8, opacity: 0.5 }}>
              Amrit Sparsh v1.0 • 2025
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.aside>
  );
}
