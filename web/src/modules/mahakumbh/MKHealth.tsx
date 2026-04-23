'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, Droplets, Activity, Brain, TrendingUp, TrendingDown, Minus, Thermometer, Wind, Zap } from 'lucide-react';

const hrHistory = [68, 72, 75, 80, 73, 71, 70, 69, 74, 76, 72, 70];
const bpHistory = [
  { t: 'Mon', s: 122, d: 78 }, { t: 'Tue', s: 125, d: 80 }, { t: 'Wed', s: 128, d: 82 },
  { t: 'Thu', s: 130, d: 84 }, { t: 'Fri', s: 128, d: 83 }, { t: 'Sat', s: 126, d: 81 }, { t: 'Sun', s: 124, d: 79 },
];

function MiniLineChart({ data, color, height = 50 }: { data: number[]; color: string; height?: number }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 100;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${height - ((v - min) / range) * (height - 8)}`).join(' ');
  const areaPoints = points + ` ${w},${height} 0,${height}`;
  return (
    <svg width="100%" height={height} viewBox={`0 0 ${w} ${height}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id={`lg-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.3} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill={`url(#lg-${color.replace('#','')})`} />
      <polyline points={points} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function MKHealth() {
  const [hr, setHr] = useState(74);
  const [hydration, setHydration] = useState(65);
  const [fatigue, setFatigue] = useState(42);
  const [liveHr, setLiveHr] = useState<number[]>(hrHistory);

  useEffect(() => {
    const i = setInterval(() => {
      const newHr = 68 + Math.floor(Math.random() * 16);
      setHr(newHr);
      setHydration(55 + Math.floor(Math.random() * 30));
      setFatigue(30 + Math.floor(Math.random() * 40));
      setLiveHr(prev => [...prev.slice(1), newHr]);
    }, 2500);
    return () => clearInterval(i);
  }, []);

  const metrics = [
    { id: 'hr', label: 'Heart Rate', value: hr.toString(), unit: 'BPM', icon: <Heart size={18} />, color: '#f43f5e', bg: 'rgba(244,63,94,0.12)', trend: 'stable' as const, sub: hr > 80 ? '⚠ Above normal' : '✓ Normal range', chartData: liveHr },
    { id: 'bp', label: 'Blood Pressure', value: '128/82', unit: 'mmHg', icon: <Activity size={18} />, color: '#ef4444', bg: 'rgba(239,68,68,0.12)', trend: 'up' as const, sub: '⚠ Slightly elevated', chartData: bpHistory.map(b => b.s) },
    { id: 'hydration', label: 'Hydration Level', value: `${hydration}%`, unit: '', icon: <Droplets size={18} />, color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', trend: hydration < 60 ? 'down' as const : 'stable' as const, sub: hydration < 60 ? '⚠ Drink water now' : '✓ Adequate', chartData: [60, 65, 58, 72, 68, 55, hydration] },
    { id: 'fatigue', label: 'Fatigue Index', value: `${fatigue}%`, unit: '', icon: <Zap size={18} />, color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', trend: fatigue > 60 ? 'up' as const : 'stable' as const, sub: fatigue > 60 ? '⚠ Rest recommended' : '✓ Manageable', chartData: [35, 40, 38, 45, 50, 42, fatigue] },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 30, height: 30, borderRadius: 10, background: 'rgba(244,63,94,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Heart size={16} color="#f43f5e" />
        </div>
        Pilgrim Health Monitoring
        <span style={{ marginLeft: 'auto', fontSize: 10, color: '#10b981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', animation: 'mk-dot 1.5s ease infinite' }} /> PILGRIM MODE
        </span>
      </div>

      {/* Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
        {metrics.map(m => (
          <motion.div key={m.id} whileHover={{ y: -4, scale: 1.01 }} className="glass-card" style={{ padding: 20, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -20, right: -10, width: 80, height: 80, borderRadius: '50%', background: `radial-gradient(circle,${m.color}15,transparent 70%)`, pointerEvents: 'none' }} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 12, background: m.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: m.color }}>
                  {m.icon}
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>{m.label}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{m.sub}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 10, fontWeight: 700, color: m.trend === 'up' ? '#ef4444' : m.trend === 'down' ? '#3b82f6' : 'var(--text-muted)', background: `${m.color}12`, padding: '3px 8px', borderRadius: 8 }}>
                {m.trend === 'up' ? <TrendingUp size={10} /> : m.trend === 'down' ? <TrendingDown size={10} /> : <Minus size={10} />}
                {m.trend}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 10, position: 'relative', zIndex: 1 }}>
              <span style={{ fontSize: 32, fontWeight: 900, color: m.color, fontFamily: 'Space Grotesk, sans-serif', lineHeight: 1 }}>{m.value}</span>
              {m.unit && <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{m.unit}</span>}
            </div>
            <MiniLineChart data={m.chartData} color={m.color} />
          </motion.div>
        ))}
      </div>

      {/* BP Trend Chart */}
      <div className="glass-card" style={{ padding: 22 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 14 }}>📊 BP Trend (7 Days)</div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 120 }}>
          {bpHistory.map((b, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{ fontSize: 9, color: b.s > 128 ? '#ef4444' : 'var(--text-muted)', fontWeight: 700 }}>{b.s}</div>
              <motion.div initial={{ height: 0 }} animate={{ height: `${(b.s / 140) * 100}%` }} transition={{ delay: i * 0.1, duration: 0.6 }}
                style={{ width: '100%', borderRadius: 6, background: `linear-gradient(180deg, ${b.s > 128 ? '#ef4444' : '#10b981'}, ${b.s > 128 ? '#ef444440' : '#10b98140'})`, minHeight: 10 }} />
              <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>{b.t}</div>
            </div>
          ))}
        </div>
        <div style={{ height: 1, background: 'var(--border-color)', margin: '12px 0' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 10, color: 'var(--text-muted)' }}>
          <div style={{ width: 10, height: 10, borderRadius: 2, background: '#10b981' }} /> Normal
          <div style={{ width: 10, height: 10, borderRadius: 2, background: '#ef4444', marginLeft: 8 }} /> Elevated
        </div>
      </div>

      {/* AI Insight */}
      <motion.div whileHover={{ scale: 1.01 }} className="glass-card" style={{ padding: 20, display: 'flex', gap: 14, alignItems: 'flex-start', border: '1px solid rgba(139,92,246,0.2)' }}>
        <div style={{ width: 42, height: 42, borderRadius: 14, background: 'rgba(139,92,246,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 20 }}>🤖</div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#8b5cf6', marginBottom: 4 }}>AI Health Insight</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Based on your vitals: <strong>You may be dehydrated</strong>. Your heart rate is slightly elevated and hydration level is at {hydration}%.
            Drink at least 500ml water in the next 30 minutes. Avoid direct sun exposure. A nearby health camp is <strong>0.3 km</strong> away.
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
