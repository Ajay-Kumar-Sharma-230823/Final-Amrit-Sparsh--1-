'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Heart, Droplets, AlertTriangle, Users, Shield, Zap } from 'lucide-react';

const pulseKF = `@keyframes mk-pulse{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.15);opacity:0.7}}`;
const glowKF = `@keyframes mk-glow{0%,100%{box-shadow:0 0 20px rgba(239,68,68,0.3)}50%{box-shadow:0 0 40px rgba(239,68,68,0.6)}}`;
const dotKF = `@keyframes mk-dot{0%,100%{opacity:1}50%{opacity:0.4}}`;

type CrowdLevel = 'Safe' | 'Moderate' | 'Critical';

export default function MKDashboard({ onSOS }: { onSOS: () => void }) {
  const [hr, setHr] = useState(74);
  const [bp, setBp] = useState({ s: 128, d: 82 });
  const [crowdLevel, setCrowdLevel] = useState<CrowdLevel>('Moderate');
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const i = setInterval(() => {
      setHr(72 + Math.floor(Math.random() * 8));
      setBp({ s: 125 + Math.floor(Math.random() * 10), d: 78 + Math.floor(Math.random() * 8) });
      const r = Math.random();
      setCrowdLevel(r < 0.3 ? 'Safe' : r < 0.7 ? 'Moderate' : 'Critical');
      setTick(t => t + 1);
    }, 3000);
    return () => clearInterval(i);
  }, []);

  const crowdColor = crowdLevel === 'Safe' ? '#10b981' : crowdLevel === 'Moderate' ? '#f59e0b' : '#ef4444';
  const crowdBg = crowdLevel === 'Safe' ? 'rgba(16,185,129,0.12)' : crowdLevel === 'Moderate' ? 'rgba(245,158,11,0.12)' : 'rgba(239,68,68,0.12)';

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <style>{pulseKF}{glowKF}{dotKF}</style>

      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #451a03, #92400e, #f97316)',
        borderRadius: 24, padding: '28px 32px', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', right: -40, top: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
        <div style={{ position: 'absolute', left: -20, bottom: -30, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
        <div style={{ fontSize: 24, fontWeight: 800, color: 'white', fontFamily: 'Outfit, sans-serif', marginBottom: 4 }}>
          🕉️ MahaKumbh Health Assistant
        </div>
        <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>
          Real-time pilgrim health monitoring & crowd safety intelligence
        </div>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {/* Live Health */}
        <motion.div whileHover={{ y: -4, scale: 1.01 }} className="glass-card" style={{ padding: 22, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -30, right: -20, width: 100, height: 100, borderRadius: '50%', background: 'radial-gradient(circle,rgba(244,63,94,0.15),transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <div style={{ width: 36, height: 36, borderRadius: 12, background: 'rgba(244,63,94,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Heart size={18} color="#f43f5e" />
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Live Health Status</div>
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', animation: 'mk-dot 1.5s ease infinite' }} />
              <span style={{ fontSize: 9, color: '#10b981', fontWeight: 700 }}>LIVE</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ flex: 1, background: 'var(--accent-surface)', borderRadius: 14, padding: '12px 14px' }}>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>Heart Rate</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                <span style={{ fontSize: 26, fontWeight: 900, color: '#f43f5e', fontFamily: 'Space Grotesk, sans-serif' }}>{hr}</span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>BPM</span>
              </div>
              <div style={{ width: 20, height: 20, animation: 'mk-pulse 1s ease infinite', display: 'inline-block', fontSize: 14 }}>❤️</div>
            </div>
            <div style={{ flex: 1, background: 'var(--accent-surface)', borderRadius: 14, padding: '12px 14px' }}>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>Blood Pressure</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                <span style={{ fontSize: 26, fontWeight: 900, color: bp.s > 130 ? '#ef4444' : '#10b981', fontFamily: 'Space Grotesk, sans-serif' }}>{bp.s}/{bp.d}</span>
              </div>
              <span style={{ fontSize: 10, color: bp.s > 130 ? '#ef4444' : 'var(--text-muted)' }}>{bp.s > 130 ? '⚠ Elevated' : '✓ Normal'}</span>
            </div>
          </div>
        </motion.div>

        {/* Crowd Risk */}
        <motion.div whileHover={{ y: -4, scale: 1.01 }} className="glass-card" style={{ padding: 22, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -30, right: -20, width: 100, height: 100, borderRadius: '50%', background: `radial-gradient(circle,${crowdColor}20,transparent 70%)`, pointerEvents: 'none' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <div style={{ width: 36, height: 36, borderRadius: 12, background: crowdBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={18} color={crowdColor} />
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Crowd Risk Level</div>
          </div>
          <div style={{ textAlign: 'center', padding: '12px 0' }}>
            <motion.div key={crowdLevel} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{
              display: 'inline-block', padding: '10px 28px', borderRadius: 16,
              background: crowdBg, border: `2px solid ${crowdColor}40`,
              fontSize: 20, fontWeight: 900, color: crowdColor, fontFamily: 'Outfit, sans-serif',
              boxShadow: `0 0 30px ${crowdColor}20`,
            }}>
              {crowdLevel === 'Safe' && <Shield size={18} style={{ display: 'inline', marginRight: 8, verticalAlign: 'middle' }} />}
              {crowdLevel === 'Critical' && <AlertTriangle size={18} style={{ display: 'inline', marginRight: 8, verticalAlign: 'middle' }} />}
              {crowdLevel}
            </motion.div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 10 }}>
              Estimated: {crowdLevel === 'Safe' ? '~12,000' : crowdLevel === 'Moderate' ? '~45,000' : '~95,000'} pilgrims nearby
            </div>
          </div>
        </motion.div>

        {/* Emergency Access */}
        <motion.div whileHover={{ y: -4, scale: 1.01 }} className="glass-card" style={{ padding: 22, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Emergency Access</div>
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={onSOS}
            style={{
              width: 90, height: 90, borderRadius: '50%',
              background: 'linear-gradient(135deg, #dc2626, #ef4444)',
              border: 'none', cursor: 'pointer', color: 'white',
              fontSize: 18, fontWeight: 900, fontFamily: 'Outfit, sans-serif',
              boxShadow: '0 8px 30px rgba(239,68,68,0.4)',
              animation: 'mk-glow 2s ease infinite',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 2,
            }}
          >
            <Zap size={24} />
            SOS
          </motion.button>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', textAlign: 'center' }}>
            Tap for instant emergency<br />medical assistance
          </div>
        </motion.div>
      </div>

      {/* Quick Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
        {[
          { label: 'Total Pilgrims', value: '8,47,532', emoji: '🙏', color: '#f97316' },
          { label: 'Health Camps', value: '28', emoji: '⛺', color: '#10b981' },
          { label: 'Active Doctors', value: '1,240', emoji: '👨‍⚕️', color: '#3b82f6' },
          { label: 'Ambulances', value: '48', emoji: '🚑', color: '#ef4444' },
          { label: 'Incidents Today', value: '14', emoji: '⚠️', color: '#f59e0b' },
        ].map(s => (
          <motion.div key={s.label} whileHover={{ y: -3 }} className="glass-card" style={{ padding: '14px 12px', textAlign: 'center' }}>
            <div style={{ fontSize: 22, marginBottom: 4 }}>{s.emoji}</div>
            <div style={{ fontSize: 18, fontWeight: 900, color: s.color, fontFamily: 'Space Grotesk, sans-serif' }}>{s.value}</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{s.label}</div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
