'use client';

import React, { Suspense, lazy, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { useAppStore } from '@/store/appStore';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import AICharacterWidget from '@/components/AICharacterWidget';
import ThreeBackground from '@/components/ThreeBackground';
import { navItems } from '@/components/Sidebar';
import { Info, LayoutDashboard, Heart, Shield, MapPin, AlertTriangle, CreditCard, Users, Settings } from 'lucide-react';

// Lazy-load modules
const DashboardModule = lazy(() => import('@/modules/DashboardModule'));
const AboutModule = lazy(() => import('@/modules/AboutModule'));
const EmergencyModule = lazy(() => import('@/modules/EmergencyModule'));
const MDRModule = lazy(() => import('@/modules/MDRModule'));
const AIDoctorModule = lazy(() => import('@/modules/AIDoctorModule'));
const ABHAModule = lazy(() => import('@/modules/ABHAModule'));
const ASHAModule = lazy(() => import('@/modules/ASHAModule'));
const MahaKumbhModule = lazy(() => import('@/modules/MahaKumbhModule'));
const MyHealthModule = lazy(() => import('@/modules/MyHealthModule'));
const MedicalServicesModule = lazy(() => import('@/modules/MedicalServicesModule'));

const ModuleSkeleton = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
    {[1, 2, 3].map(i => (
      <div key={i} className="shimmer" style={{ height: i === 1 ? 130 : 210, borderRadius: 20 }} />
    ))}
  </div>
);

const ComingSoon = ({ title, emoji }: { title: string; emoji: string }) => (
  <motion.div
    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 20, textAlign: 'center' }}
  >
    <div style={{ fontSize: 72 }}>{emoji}</div>
    <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'Outfit, sans-serif' }}>{title}</div>
    <div style={{ fontSize: 14, color: 'var(--text-muted)', maxWidth: 380, lineHeight: 1.7 }}>
      This module is coming in the next release. Stay tuned!
    </div>
    <div style={{ background: 'var(--gradient-primary)', borderRadius: 12, padding: '10px 24px', color: 'white', fontWeight: 700, fontSize: 13 }}>
      🚀 Coming Soon
    </div>
  </motion.div>
);

const moduleMap: Record<string, React.ReactNode> = {
  about: <AboutModule />,
  dashboard: <DashboardModule />,
  health: <MyHealthModule />,
  medical: <MedicalServicesModule />,
  mdr: <MDRModule />,
  mahakumbh: <MahaKumbhModule />,
  emergency: <EmergencyModule />,
  abha: <ABHAModule />,
  asha: <ASHAModule />,
  settings: <ComingSoon title="Settings" emoji="⚙️" />,
};

/* ── Mobile bottom nav items (5 primary) ── */
const mobileNavItems = [
  { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
  { id: 'health', label: 'Health', icon: Heart },
  { id: 'emergency', label: 'SOS', icon: AlertTriangle },
  { id: 'abha', label: 'ABHA', icon: CreditCard },
  { id: 'about', label: 'About', icon: Info },
];

export default function AppLayout() {
  const { theme, sidebarCollapsed, activeModule, setActiveModule } = useAppStore();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const sidebarW = sidebarCollapsed ? 72 : 264;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <ThreeBackground />

      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'var(--bg-card)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-md)',
            borderRadius: 12,
            fontSize: 13,
          },
        }}
      />

      {/* Desktop Sidebar */}
      <div className="desktop-only">
        <Sidebar />
      </div>

      {/* Main content */}
      <motion.main
        animate={{ marginLeft: sidebarW }}
        transition={{ type: 'spring', damping: 22, stiffness: 200 }}
        className="desktop-only"
        style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}
      >
        <TopBar />
        <div style={{ flex: 1, padding: '24px 28px 28px', overflowY: 'auto' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeModule}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22 }}
            >
              <Suspense fallback={<ModuleSkeleton />}>
                {moduleMap[activeModule] ?? <ComingSoon title="Page Not Found" emoji="🔍" />}
              </Suspense>
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.main>

      {/* Mobile Layout */}
      <div style={{ display: 'none' }} className="mobile-layout">
        <TopBar />
        <div style={{ padding: '16px 16px 80px', overflowY: 'auto', minHeight: '100vh' }}>
          <AnimatePresence mode="wait">
            <motion.div key={activeModule} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Suspense fallback={<ModuleSkeleton />}>
                {moduleMap[activeModule] ?? <ComingSoon title="Page Not Found" emoji="🔍" />}
              </Suspense>
            </motion.div>
          </AnimatePresence>
        </div>
        {/* Mobile Bottom Nav */}
        <div className="mobile-bottom-nav">
          {mobileNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeModule === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveModule(item.id)}
                style={{
                  flex: 1, background: 'none', border: 'none', cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  gap: 3, color: isActive ? 'var(--accent-primary)' : 'var(--text-muted)',
                  fontSize: 9, fontWeight: isActive ? 700 : 400,
                }}
              >
                <Icon size={item.id === 'emergency' ? 24 : 20} />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      <AICharacterWidget />
    </div>
  );
}
