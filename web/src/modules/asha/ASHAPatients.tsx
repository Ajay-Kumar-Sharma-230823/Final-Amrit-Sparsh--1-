'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Baby, Activity, AlertTriangle, Mic, WifiOff, CheckCircle, ChevronRight, TrendingUp, TrendingDown, Minus, Thermometer, X } from 'lucide-react';

export interface Patient {
  id: string; name: string; age: number; village: string; condition: string;
  lastVisit: string; priority: 'low' | 'medium' | 'high' | 'critical';
  synced: boolean; type: 'pregnancy' | 'tb' | 'chronic' | 'child' | 'general';
  vitals: { hr: number; bp: string; temp: number; spo2: number };
  trendData: number[];
  riskScore: number;
}

export const patientsData: Patient[] = [
  { id: 'P1', name: 'Sunita Devi', age: 28, village: 'Rampur', condition: 'Pregnant — 7th month, high BP', lastVisit: '2 days ago', priority: 'critical', synced: true, type: 'pregnancy', vitals: { hr: 92, bp: '140/90', temp: 37.2, spo2: 96 }, trendData: [130, 135, 138, 142, 140], riskScore: 82 },
  { id: 'P2', name: 'Ram Prasad', age: 45, village: 'Khera', condition: 'TB Treatment — Month 4', lastVisit: '5 days ago', priority: 'critical', synced: true, type: 'tb', vitals: { hr: 78, bp: '118/75', temp: 37.8, spo2: 94 }, trendData: [37.5, 37.8, 38.1, 37.6, 37.8], riskScore: 75 },
  { id: 'P3', name: 'Geeta Kumari', age: 34, village: 'Dhanipur', condition: 'Anemia follow-up', lastVisit: '1 week ago', priority: 'high', synced: false, type: 'chronic', vitals: { hr: 82, bp: '105/68', temp: 36.8, spo2: 97 }, trendData: [9.2, 9.5, 9.8, 10.1, 10.3], riskScore: 55 },
  { id: 'P4', name: 'Kavita Singh', age: 24, village: 'Rampur', condition: 'Post-natal care', lastVisit: '3 days ago', priority: 'medium', synced: false, type: 'pregnancy', vitals: { hr: 74, bp: '120/78', temp: 36.9, spo2: 98 }, trendData: [120, 118, 122, 119, 120], riskScore: 30 },
  { id: 'P5', name: 'Meena Devi', age: 30, village: 'Rampur', condition: 'High-risk pregnancy — 8th month', lastVisit: '6 days ago', priority: 'critical', synced: true, type: 'pregnancy', vitals: { hr: 96, bp: '148/95', temp: 37.4, spo2: 95 }, trendData: [140, 142, 145, 148, 148], riskScore: 90 },
  { id: 'P6', name: 'Kamla Devi', age: 55, village: 'Khera', condition: 'TB suspected — needs screening', lastVisit: '10 days ago', priority: 'high', synced: true, type: 'tb', vitals: { hr: 85, bp: '125/82', temp: 38.2, spo2: 93 }, trendData: [37.8, 38.0, 38.2, 38.1, 38.2], riskScore: 68 },
];

const priorityColor = { low: '#10b981', medium: '#f59e0b', high: '#f97316', critical: '#ef4444' };
const typeIcon = { pregnancy: '🤰', tb: '🫁', chronic: '💊', child: '👶', general: '🩺' };

function MiniSparkline({ data, color, w = 60, h = 24 }: { data: number[]; color: string; w?: number; h?: number }) {
  const max = Math.max(...data), min = Math.min(...data), range = max - min || 1;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * (h - 4)}`).join(' ');
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={(data.length - 1) / (data.length - 1) * w} cy={h - ((data[data.length - 1] - min) / range) * (h - 4)} r={2.5} fill={color} />
    </svg>
  );
}

function HealthRing({ score, color, size = 44 }: { score: number; color: string; size?: number }) {
  const r = (size - 8) / 2, circ = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={`${color}18`} strokeWidth={4} />
      <motion.circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={4}
        strokeLinecap="round" strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: circ * (1 - score / 100) }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ filter: `drop-shadow(0 0 4px ${color}60)` }}
      />
      <text x={size / 2} y={size / 2 + 1} textAnchor="middle" dominantBaseline="middle"
        fill={color} fontSize={11} fontWeight={800} fontFamily="Space Grotesk, sans-serif">{score}</text>
    </svg>
  );
}

export default function ASHAPatients({ onSelectPatient, selectedId }: { onSelectPatient: (p: Patient) => void; selectedId: string | null }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Patient Health Cards</div>
        <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{patientsData.length} patients · Priority sorted</div>
      </div>

      {patientsData.map((p, idx) => {
        const pc = priorityColor[p.priority];
        const isExpanded = expandedId === p.id;
        const isSelected = selectedId === p.id;
        return (
          <motion.div key={p.id}
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.06 }}
            whileHover={{ y: -2, scale: 1.005 }}
            onClick={() => { onSelectPatient(p); setExpandedId(isExpanded ? null : p.id); }}
            style={{
              background: isSelected ? `linear-gradient(135deg, ${pc}08, var(--bg-card))` : 'var(--bg-card)',
              border: `1.5px solid ${isSelected ? pc + '50' : 'var(--border-color)'}`,
              borderRadius: 16, padding: '14px 16px', cursor: 'pointer',
              boxShadow: isSelected ? `0 4px 20px ${pc}15` : 'var(--shadow-xs)',
              transition: 'all 0.25s cubic-bezier(0.16,1,0.3,1)',
              position: 'relative', overflow: 'hidden',
            }}
          >
            {/* Glow accent */}
            <div style={{ position: 'absolute', top: 0, left: 0, width: 3, height: '100%', background: pc, borderRadius: '3px 0 0 3px' }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {/* Health Ring */}
              <HealthRing score={p.riskScore} color={pc} />

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{p.name}</span>
                  <span style={{ fontSize: 14 }}>{typeIcon[p.type]}</span>
                  {!p.synced && (
                    <motion.span animate={{ opacity: [1, 0.5, 1] }} transition={{ repeat: Infinity, duration: 2 }}
                      style={{ fontSize: 8, fontWeight: 700, background: '#f59e0b18', color: '#f59e0b', padding: '1px 6px', borderRadius: 4, display: 'flex', alignItems: 'center', gap: 3 }}>
                      <WifiOff size={8} /> OFFLINE
                    </motion.span>
                  )}
                </div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>
                  Age {p.age} · {p.village} · {p.condition}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                  <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>Last: {p.lastVisit}</span>
                  <MiniSparkline data={p.trendData} color={pc} />
                </div>
              </div>

              {/* Priority badge */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                <span style={{ fontSize: 9, fontWeight: 800, padding: '2px 8px', borderRadius: 6, background: `${pc}15`, color: pc, border: `1px solid ${pc}30` }}>
                  {p.priority.toUpperCase()}
                </span>
                <ChevronRight size={14} color="var(--text-muted)" style={{ transform: isExpanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
              </div>
            </div>

            {/* Expanded vitals */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                  style={{ overflow: 'hidden', marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                    {[
                      { label: 'Heart Rate', val: `${p.vitals.hr}`, unit: 'BPM', color: '#f43f5e', icon: '❤️' },
                      { label: 'Blood Pressure', val: p.vitals.bp, unit: 'mmHg', color: p.vitals.bp.split('/').map(Number)[0] > 130 ? '#ef4444' : '#10b981', icon: '🩸' },
                      { label: 'Temperature', val: `${p.vitals.temp}°`, unit: 'C', color: p.vitals.temp > 37.5 ? '#f59e0b' : '#10b981', icon: '🌡️' },
                      { label: 'SpO2', val: `${p.vitals.spo2}%`, unit: '', color: p.vitals.spo2 < 95 ? '#ef4444' : '#10b981', icon: '💧' },
                    ].map(v => (
                      <div key={v.label} style={{ background: 'var(--accent-surface)', borderRadius: 10, padding: '8px 10px', textAlign: 'center' }}>
                        <div style={{ fontSize: 12, marginBottom: 2 }}>{v.icon}</div>
                        <div style={{ fontSize: 15, fontWeight: 900, color: v.color, fontFamily: 'Space Grotesk, sans-serif' }}>{v.val}</div>
                        <div style={{ fontSize: 8, color: 'var(--text-muted)', marginTop: 1 }}>{v.label}</div>
                      </div>
                    ))}
                  </div>
                  <button style={{
                    marginTop: 10, width: '100%', padding: '8px', borderRadius: 10, border: 'none',
                    background: 'var(--gradient-primary)', color: 'white', fontSize: 11, fontWeight: 700, cursor: 'pointer',
                  }}>📋 Record Visit</button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}
