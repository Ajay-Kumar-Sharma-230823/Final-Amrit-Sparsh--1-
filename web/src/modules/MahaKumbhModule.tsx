'use client';

import React, { useState, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, AlertTriangle, Map, Heart, Stethoscope, Pill, Users,
} from 'lucide-react';

const MKDashboard = lazy(() => import('./mahakumbh/MKDashboard'));
const MKEmergency = lazy(() => import('./mahakumbh/MKEmergency'));
const MKMap = lazy(() => import('./mahakumbh/MKMap'));
const MKHealth = lazy(() => import('./mahakumbh/MKHealth'));
const MKMedical = lazy(() => import('./mahakumbh/MKMedical'));
const MKPharmacy = lazy(() => import('./mahakumbh/MKPharmacy'));
const MKFamily = lazy(() => import('./mahakumbh/MKFamily'));

const tabs = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, emoji: '🏠' },
  { id: 'emergency', label: 'Emergency SOS', icon: AlertTriangle, emoji: '🚨' },
  { id: 'map', label: 'Crowd Map', icon: Map, emoji: '🗺️' },
  { id: 'health', label: 'Health Monitor', icon: Heart, emoji: '❤️' },
  { id: 'medical', label: 'Doctors', icon: Stethoscope, emoji: '👨‍⚕️' },
  { id: 'pharmacy', label: 'Pharmacy', icon: Pill, emoji: '💊' },
  { id: 'family', label: 'Family Alert', icon: Users, emoji: '👨‍👩‍👧' },
];

const Loader = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
    {[1, 2].map(i => (
      <div key={i} className="shimmer" style={{ height: i === 1 ? 120 : 200, borderRadius: 20 }} />
    ))}
  </div>
);

const MK_CSS = `
@keyframes mk-pulse{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.15);opacity:0.7}}
@keyframes mk-glow{0%,100%{box-shadow:0 0 20px rgba(239,68,68,0.3)}50%{box-shadow:0 0 40px rgba(239,68,68,0.6)}}
@keyframes mk-dot{0%,100%{opacity:1}50%{opacity:0.4}}
@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
.mk-tab{display:flex;align-items:center;gap:6px;padding:8px 16px;border-radius:12px;border:1px solid transparent;
  background:transparent;cursor:pointer;font-size:12px;font-weight:600;color:var(--text-muted);
  transition:all 0.25s cubic-bezier(0.34,1.56,0.64,1);white-space:nowrap}
.mk-tab:hover{background:var(--accent-surface);color:var(--text-secondary);transform:translateY(-1px)}
.mk-tab.active{background:var(--accent-surface);color:var(--accent-primary);border-color:var(--border-strong);
  box-shadow:var(--shadow-sm)}
@media(max-width:900px){
  .mk-tabs-row{flex-wrap:wrap!important}
  .mk-content-grid-2{grid-template-columns:1fr!important}
  .mk-content-grid-4{grid-template-columns:repeat(2,1fr)!important}
  .mk-content-grid-5{grid-template-columns:repeat(2,1fr)!important}
  .mk-stat-grid{grid-template-columns:1fr!important}
}
@media(max-width:600px){
  .mk-content-grid-4{grid-template-columns:1fr!important}
  .mk-content-grid-5{grid-template-columns:1fr!important}
}
`;

export default function MahaKumbhModule() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const goToEmergency = () => setActiveTab('emergency');
  const goToDashboard = () => setActiveTab('dashboard');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <style>{MK_CSS}</style>

      {/* Tab Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, overflowX: 'auto', paddingBottom: 4 }} className="mk-tabs-row">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <motion.button
              key={tab.id}
              whileTap={{ scale: 0.97 }}
              onClick={() => setActiveTab(tab.id)}
              className={`mk-tab ${isActive ? 'active' : ''}`}
            >
              <Icon size={14} strokeWidth={isActive ? 2.5 : 2} />
              {tab.label}
            </motion.button>
          );
        })}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          <Suspense fallback={<Loader />}>
            {activeTab === 'dashboard' && <MKDashboard onSOS={goToEmergency} />}
            {activeTab === 'emergency' && <MKEmergency onBack={goToDashboard} />}
            {activeTab === 'map' && <MKMap />}
            {activeTab === 'health' && <MKHealth />}
            {activeTab === 'medical' && <MKMedical />}
            {activeTab === 'pharmacy' && <MKPharmacy />}
            {activeTab === 'family' && <MKFamily />}
          </Suspense>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
