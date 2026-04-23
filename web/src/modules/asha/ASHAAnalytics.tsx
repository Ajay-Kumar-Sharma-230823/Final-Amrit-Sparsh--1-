'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, AlertTriangle, Syringe, Activity, Brain, Users, Baby, ShieldAlert } from 'lucide-react';

function AnimatedBar({ value, max, color, delay = 0 }: { value: number; max: number; color: string; delay?: number }) {
  return (
    <div style={{ height: 8, borderRadius: 6, background: 'var(--accent-surface)', overflow: 'hidden' }}>
      <motion.div initial={{ width: 0 }} animate={{ width: `${(value / max) * 100}%` }}
        transition={{ delay, duration: 1, ease: 'easeOut' }}
        style={{ height: '100%', borderRadius: 6, background: `linear-gradient(90deg, ${color}, ${color}88)`, boxShadow: `0 0 8px ${color}30` }}
      />
    </div>
  );
}

function LiveCounter({ value, color }: { value: number; color: string }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let frame: number;
    const start = performance.now();
    const duration = 1200;
    const animate = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      setDisplay(Math.round(progress * value));
      if (progress < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [value]);
  return <span style={{ fontSize: 28, fontWeight: 900, color, fontFamily: 'Space Grotesk, sans-serif', lineHeight: 1 }}>{display}</span>;
}

const vaccines = [
  { name: 'BCG', completed: 48, total: 62, color: '#10b981' },
  { name: 'OPV Dose 3', completed: 32, total: 45, color: '#3b82f6' },
  { name: 'Pentavalent', completed: 28, total: 35, color: '#8b5cf6' },
  { name: 'TT Booster', completed: 22, total: 40, color: '#f59e0b' },
  { name: 'MR Vaccine', completed: 35, total: 39, color: '#ec4899' },
];

const diseaseData = [
  { month: 'Jan', cases: 12 }, { month: 'Feb', cases: 18 }, { month: 'Mar', cases: 15 },
  { month: 'Apr', cases: 22 }, { month: 'May', cases: 19 }, { month: 'Jun', cases: 25 },
];

const aiAlerts = [
  { icon: '🤰', severity: 'critical', msg: '3 high-risk pregnancies detected in Rampur — immediate attention required', time: '2 min ago' },
  { icon: '🫁', severity: 'high', msg: 'TB patient Ram Prasad missed last visit — 5 days overdue', time: '15 min ago' },
  { icon: '💉', severity: 'medium', msg: '8 children due for OPV Dose 3 this week', time: '1 hr ago' },
  { icon: '🩸', severity: 'low', msg: 'Geeta Kumari hemoglobin improving — 9.2 → 10.3 g/dL', time: '3 hrs ago' },
];

const severityColor = { critical: '#ef4444', high: '#f97316', medium: '#f59e0b', low: '#10b981' };

export default function ASHAAnalytics() {
  const [tick, setTick] = useState(0);
  useEffect(() => { const i = setInterval(() => setTick(t => t + 1), 5000); return () => clearInterval(i); }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Quick Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
        {[
          { label: 'Total Patients', value: 47, color: '#3b82f6', icon: <Users size={16} /> },
          { label: 'Critical Cases', value: 3, color: '#ef4444', icon: <ShieldAlert size={16} /> },
          { label: 'Pregnancies', value: 8, color: '#ec4899', icon: <Baby size={16} /> },
          { label: 'Due Vaccines', value: 23, color: '#f59e0b', icon: <Syringe size={16} /> },
        ].map((s, i) => (
          <motion.div key={s.label} whileHover={{ y: -2 }} className="glass-card" style={{ padding: '14px 12px', textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 6, color: s.color }}>{s.icon}</div>
            <LiveCounter value={s.value} color={s.color} />
            <div style={{ fontSize: 9, color: 'var(--text-muted)', marginTop: 4 }}>{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Vaccination Progress */}
      <div className="glass-card" style={{ padding: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Syringe size={14} color="var(--accent-primary)" /> Vaccination Progress
        </div>
        {vaccines.map((v, i) => (
          <div key={v.name} style={{ marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 11 }}>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{v.name}</span>
              <span style={{ color: v.color, fontWeight: 700 }}>{v.completed}/{v.total}</span>
            </div>
            <AnimatedBar value={v.completed} max={v.total} color={v.color} delay={i * 0.15} />
          </div>
        ))}
      </div>

      {/* Disease Spread Trend */}
      <div className="glass-card" style={{ padding: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Activity size={14} color="#ef4444" /> Disease Spread Trend
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 80 }}>
          {diseaseData.map((d, i) => (
            <div key={d.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
              <span style={{ fontSize: 8, color: d.cases > 20 ? '#ef4444' : 'var(--text-muted)', fontWeight: 700 }}>{d.cases}</span>
              <motion.div initial={{ height: 0 }} animate={{ height: `${(d.cases / 30) * 60}px` }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                style={{
                  width: '100%', borderRadius: 4,
                  background: `linear-gradient(180deg, ${d.cases > 20 ? '#ef4444' : d.cases > 15 ? '#f59e0b' : '#10b981'}, transparent)`,
                }}
              />
              <span style={{ fontSize: 8, color: 'var(--text-muted)' }}>{d.month}</span>
            </div>
          ))}
        </div>
      </div>

      {/* AI Insights */}
      <div className="glass-card" style={{ padding: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Brain size={14} color="#8b5cf6" /> AI Health Insights
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {aiAlerts.map((alert, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
              style={{
                display: 'flex', alignItems: 'flex-start', gap: 10, padding: '8px 10px', borderRadius: 10,
                background: `${severityColor[alert.severity as keyof typeof severityColor]}08`,
                border: `1px solid ${severityColor[alert.severity as keyof typeof severityColor]}20`,
              }}>
              <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>{alert.icon}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11, color: 'var(--text-primary)', fontWeight: 500, lineHeight: 1.4 }}>{alert.msg}</div>
                <div style={{ fontSize: 9, color: 'var(--text-muted)', marginTop: 2 }}>{alert.time}</div>
              </div>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: severityColor[alert.severity as keyof typeof severityColor], flexShrink: 0, marginTop: 5 }} />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
