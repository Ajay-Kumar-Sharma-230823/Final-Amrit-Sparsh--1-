'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { useAppStore, User } from '@/store/appStore';
import {
  Heart, Activity, Droplets, TrendingUp, TrendingDown, Minus,
  Calendar, ChevronRight, FileText, Wifi, Clock, Brain,
  Download, Eye, Smartphone, Moon, Zap, AlertTriangle,
  CheckCircle, Star, ArrowUpRight,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';

/* ═══════════════ DATA ═══════════════ */
const heartData = [
  { t: '6am', v: 68 }, { t: '8am', v: 72 }, { t: '10am', v: 75 },
  { t: '12pm', v: 80 }, { t: '2pm', v: 73 }, { t: '4pm', v: 71 },
  { t: '6pm', v: 70 }, { t: '8pm', v: 69 }, { t: '10pm', v: 67 },
];
const bpData = [
  { d: 'Mon', s: 122, di: 78 }, { d: 'Tue', s: 125, di: 80 }, { d: 'Wed', s: 128, di: 82 },
  { d: 'Thu', s: 130, di: 84 }, { d: 'Fri', s: 128, di: 83 }, { d: 'Sat', s: 126, di: 81 }, { d: 'Sun', s: 124, di: 79 },
];
const sleepData = [
  { d: 'Mon', h: 7.5 }, { d: 'Tue', h: 6.8 }, { d: 'Wed', h: 8.2 },
  { d: 'Thu', h: 5.5 }, { d: 'Fri', h: 7.0 }, { d: 'Sat', h: 8.5 }, { d: 'Sun', h: 1.5 },
];
const phoneData = [
  { d: 'Mon', h: 4.2 }, { d: 'Tue', h: 5.1 }, { d: 'Wed', h: 3.8 },
  { d: 'Thu', h: 6.2 }, { d: 'Fri', h: 5.5 }, { d: 'Sat', h: 7.1 }, { d: 'Sun', h: 4.8 },
];

const metricRows = [
  [
    { id: 'hr', label: 'Heart Rate', value: '74', unit: 'BPM', icon: '❤️', color: '#f43f5e', bg: 'rgba(244,63,94,0.12)', trend: 'stable', sub: 'Normal range', prog: 74 },
    { id: 'sleep', label: 'Sleep', value: '1h 28m', unit: 'Poor', icon: '🛌', color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)', trend: 'down', sub: '12 Apr · Below avg', prog: 22 },
    { id: 'spo2', label: 'Blood Oxygen', value: '98', unit: '%', icon: '💧', color: '#f97316', bg: 'rgba(249,115,22,0.12)', trend: 'stable', sub: 'Healthy range', prog: 98 },
  ],
  [
    { id: 'bp', label: 'Blood Pressure', value: '128/82', unit: 'mmHg', icon: '🩸', color: '#ef4444', bg: 'rgba(239,68,68,0.12)', trend: 'up', sub: 'Slightly elevated', prog: 65 },
    { id: 'weight', label: 'Weight', value: '65.0', unit: 'kg', icon: '⚖️', color: '#10b981', bg: 'rgba(16,185,129,0.12)', trend: 'up', sub: 'BMI 22.4 — Normal', prog: 55 },
    { id: 'temp', label: 'Temperature', value: '36.8', unit: '°C', icon: '🌡️', color: '#06b6d4', bg: 'rgba(6,182,212,0.12)', trend: 'stable', sub: 'Normal body temp', prog: 60 },
  ],
];

const upcoming = [
  {
    label: 'Dr. Priya Sharma', sub: 'Cardiology Consultation', time: 'Tomorrow, 10:00 AM',
    emoji: '👩‍⚕️', status: 'confirmed', badge: '#10b981',
    date: 'Apr 15, 2026', apptTime: '10:00 AM – 10:30 AM', token: 'T-007',
    hospital: 'Amrit Sparsh Heart Care Centre',
    hospitalAddress: 'Block 4, Medical Campus, Raipur, C.G. 492001',
    availability: 'Mon – Sat: 10:00 AM – 3:00 PM',
    doctorContact: '+91 98765 43210',
    hospitalContact: '+91 771 234 5678',
    mapsUrl: 'https://maps.google.com/?q=Amrit+Sparsh+Heart+Care+Centre+Raipur',
    note: 'Bring previous ECG and BP log report.',
  },
  {
    label: 'Amlodipine 5mg', sub: 'Daily Medication', time: 'Today, 2:00 PM',
    emoji: '💊', status: 'pending', badge: '#f59e0b',
    date: 'Apr 14, 2026', apptTime: '2:00 PM', token: 'MED-03',
    hospital: 'Amrit Sparsh Pharmacy',
    hospitalAddress: 'Ground Floor, OPD Block, Raipur, C.G.',
    availability: 'Open 24×7',
    doctorContact: '+91 98765 11111',
    hospitalContact: '+91 771 234 0001',
    mapsUrl: 'https://maps.google.com/?q=Amrit+Sparsh+Pharmacy+Raipur',
    note: 'Refill for 30 days. Carry prescription.',
  },
  {
    label: 'Annual Body Checkup', sub: 'Full Screening Panel', time: 'Apr 15, 9:00 AM',
    emoji: '🏥', status: 'confirmed', badge: '#10b981',
    date: 'Apr 15, 2026', apptTime: '9:00 AM – 11:00 AM', token: 'CHK-021',
    hospital: 'Amrit Sparsh Diagnostic Centre',
    hospitalAddress: 'Block 2, Lab Wing, Medical Campus, Raipur, C.G.',
    availability: 'Mon – Sat: 7:00 AM – 2:00 PM',
    doctorContact: '+91 98765 22222',
    hospitalContact: '+91 771 234 0002',
    mapsUrl: 'https://maps.google.com/?q=Amrit+Sparsh+Diagnostic+Centre+Raipur',
    note: 'Fasting for 10 hours required. Carry ID proof.',
  },
  {
    label: 'Blood Test — CBC', sub: 'Pathology Lab, Block B', time: 'Apr 18, 7:30 AM',
    emoji: '🧪', status: 'scheduled', badge: '#6366f1',
    date: 'Apr 18, 2026', apptTime: '7:30 AM – 8:00 AM', token: 'LAB-14',
    hospital: 'Amrit Sparsh Pathology Lab',
    hospitalAddress: 'Block B, Ground Floor, Medical Campus, Raipur, C.G.',
    availability: 'Mon – Sat: 6:00 AM – 12:00 PM',
    doctorContact: '+91 98765 33333',
    hospitalContact: '+91 771 234 0003',
    mapsUrl: 'https://maps.google.com/?q=Amrit+Sparsh+Pathology+Lab+Raipur',
    note: 'Fasting required. Bring previous CBC report if available.',
  },
];

const reports = [
  { id: 'r1', title: 'Complete Blood Count', date: 'Apr 10, 2026', doctor: 'Dr. Mehta', status: 'Normal', statusColor: '#10b981', icon: '🧬', size: '1.7 MB', file: '/ajayreport1.pdf', tag: 'Haematology', gradFrom: '#10b981', gradTo: '#34d399' },
  { id: 'r2', title: 'Chest X-Ray Report', date: 'Mar 28, 2026', doctor: 'Dr. Sharma', status: 'Review Needed', statusColor: '#f59e0b', icon: '🫁', size: '0.6 MB', file: '/ajayreport2.pdf', tag: 'Radiology', gradFrom: '#f59e0b', gradTo: '#fbbf24' },
  { id: 'r3', title: 'Lipid Profile Test', date: 'Mar 15, 2026', doctor: 'Dr. Patel', status: 'Borderline', statusColor: '#f97316', icon: '💊', size: '1.1 MB', file: '/ajayreport3.pdf', tag: 'Biochemistry', gradFrom: '#f97316', gradTo: '#fb923c' },
  { id: 'r4', title: 'ECG Report', date: 'Feb 22, 2026', doctor: 'Dr. Priya', status: 'Normal', statusColor: '#10b981', icon: '📈', size: '0.3 MB', file: '/ajayreport4.pdf', tag: 'Cardiology', gradFrom: '#06b6d4', gradTo: '#38bdf8' },
];

const aiInsights = [
  { icon: '🫀', color: '#f43f5e', title: 'Elevated BP Pattern', desc: 'Your systolic pressure has been 125–130 for 5 days. Recommend reducing sodium intake and scheduling a cardiology follow-up.' },
  { icon: '😴', color: '#8b5cf6', title: 'Sleep Deficit Detected', desc: 'Only 1h 28min last night. Cumulative sleep debt of ~8 hrs this week. Consider consistent sleep schedule.' },
  { icon: '📱', color: '#f97316', title: 'Screen Time Alert', desc: '7.1 hrs phone usage yesterday — above your 5hr goal. Blue light exposure may be impacting your sleep quality.' },
  { icon: '✅', color: '#10b981', title: 'Blood Oxygen Optimal', desc: 'SpO₂ at 98% — excellent respiratory health. Keep up with your breathing exercises.' },
];

const containerVariants: Variants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.07 } } };
const itemVariants: Variants = { hidden: { opacity: 0, y: 24, scale: 0.97 }, visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', damping: 18, stiffness: 120 } } };

/* ═══ Responsive CSS injection ═══ */
const DASH_CSS = `
.dash-grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  align-items: stretch;
}
/* Credit-card ratio container */
.card-ratio-wrap {
  width: 100%;
  max-width: 440px;
  margin: 0 auto;
  aspect-ratio: 1.586 / 1;
  position: relative;
}
/* Hover-flip on desktop */
@media (hover: hover) {
  .card-flip-scene:hover .card-flip-inner {
    transform: rotateY(180deg) !important;
  }
}
.dash-watch-card {
  background: linear-gradient(160deg,#0b0b18 0%,#0e0e20 100%);
  border-radius: 24px;
  border: 1px solid rgba(255,255,255,0.07);
  box-shadow: 0 24px 60px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.06);
  padding: 28px 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 28px;
  position: relative;
  overflow: hidden;
}
@media (max-width: 900px) {
  .dash-grid-2 { grid-template-columns: 1fr; }
  .dash-watch-card { flex-direction: column; }
}
`;

/* ═══════════════ QR CODE ═══════════════ */
function QRCode({ size = 96, light = 'rgba(255,255,255,0.9)', dark = 'transparent' }: { size?: number; light?: string; dark?: string }) {
  const cell = size / 13;
  const pattern = [
    [1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1], [1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 1, 0],
    [1, 0, 1, 1, 1, 0, 1, 0, 0, 1, 0, 0, 1], [1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 0],
    [1, 0, 1, 1, 1, 0, 1, 0, 0, 1, 0, 1, 1], [1, 0, 0, 0, 0, 0, 1, 0, 1, 1, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1], [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0],
    [1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 1], [0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1],
    [1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 0], [0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1],
    [1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 0, 1, 1],
  ];
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {pattern.map((row, r) => row.map((v, c) =>
        <rect key={`${r}-${c}`} x={c * cell + 0.5} y={r * cell + 0.5} width={cell - 1} height={cell - 1} rx={1.5}
          fill={v ? light : dark} />
      ))}
    </svg>
  );
}

/* ═══════════════ 3D IDENTITY CARD ═══════════════ */
function IdentityCard({ user }: { user: User | null | undefined }) {
  const [flipped, setFlipped] = useState(false);

  const uid = useMemo(() => `AS-${String(Date.now()).slice(-8).toUpperCase()}`, []);

  // ── Card inner styles (pure CSS flip, zero mouse tracking) ──
  const cardInnerStyle: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    height: '100%',
    transformStyle: 'preserve-3d',
    transition: 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
    transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
  };


  return (
    <div className="card-ratio-wrap" style={{ cursor: 'pointer' }} onClick={() => setFlipped(f => !f)}>
      {/* Outer wrapper: credit-card aspect ratio + perspective */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, perspective: 1200 }}>
        {/* ── INNER CARD (the only element that rotates) ── */}
        <div style={cardInnerStyle}>

          {/* ═══ FRONT FACE ═══ */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 20,
            backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', overflow: 'hidden',
            background: 'linear-gradient(135deg, #3B1074 0%, #5B21B6 30%, #7C3AED 65%, #9333EA 100%)',
            padding: '20px 24px',
            boxShadow: '0 40px 80px rgba(109,40,217,0.55), 0 16px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.25)',
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            zIndex: 2,
          }}>
            {/* Decorative shimmer grid */}
            <div style={{
              position: 'absolute', inset: 0, borderRadius: 20,
              backgroundImage: `linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)`,
              backgroundSize: '24px 24px', pointerEvents: 'none'
            }} />
            {/* Orb top-right */}
            <div style={{ position: 'absolute', top: -50, right: -30, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle,rgba(255,255,255,0.12) 0%,transparent 70%)', pointerEvents: 'none' }} />
            {/* Bottom edge glow */}
            <div style={{ position: 'absolute', bottom: 0, left: '8%', right: '8%', height: 1, background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.35),transparent)', pointerEvents: 'none' }} />
            {/* Diagonal shimmer */}
            <div style={{ position: 'absolute', inset: 0, borderRadius: 20, background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.05) 50%, transparent 60%)', pointerEvents: 'none' }} />

            {/* ROW 1 — Brand + Photo */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 2 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 900, letterSpacing: '0.18em', color: 'white', textTransform: 'uppercase', fontFamily: 'Space Grotesk, sans-serif', textShadow: '0 2px 10px rgba(0,0,0,0.4)' }}>Amrit Sparsh</div>
                <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.14em', marginTop: 2, textTransform: 'uppercase' }}>Health Identity Card</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Wifi size={15} color="rgba(255,255,255,0.6)" />
                <div style={{ width: 52, height: 52, borderRadius: '50%', border: '2.5px solid rgba(255,255,255,0.45)', overflow: 'hidden', boxShadow: '0 6px 20px rgba(0,0,0,0.5), 0 0 16px rgba(147,51,234,0.5)' }}>
                  <img src="/founder.jpeg" alt={user?.name || 'User'} style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={e => {
                      const t = e.target as HTMLImageElement;
                      t.style.display = 'none';
                      t.parentElement!.style.background = user?.primaryColor || '#6D28D9';
                      t.parentElement!.innerHTML = `<div style='width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:800;color:#fff'>${(user?.name || 'A').charAt(0)}</div>`;
                    }}
                  />
                </div>
              </div>
            </div>

            {/* ROW 2 — Chip + card number dots */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, position: 'relative', zIndex: 2 }}>
              <div style={{ width: 42, height: 32, borderRadius: 6, flexShrink: 0, background: 'linear-gradient(135deg, #C8960C 0%, #F4C430 45%, #C8960C 100%)', boxShadow: '0 3px 12px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.5)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: '33%', left: 0, right: 0, height: 1, background: 'rgba(100,70,0,0.2)' }} />
                <div style={{ position: 'absolute', top: '66%', left: 0, right: 0, height: 1, background: 'rgba(100,70,0,0.2)' }} />
                <div style={{ position: 'absolute', top: 0, bottom: 0, left: '40%', width: 1, background: 'rgba(100,70,0,0.2)' }} />
              </div>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                {[0, 1, 2, 3].map(g => (
                  <div key={g} style={{ display: 'flex', gap: 3 }}>
                    {g < 3
                      ? [0, 1, 2, 3].map(d => <div key={d} style={{ width: 4.5, height: 4.5, borderRadius: '50%', background: 'rgba(255,255,255,0.65)' }} />)
                      : <span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.85)', letterSpacing: '0.1em' }}>2026</span>
                    }
                  </div>
                ))}
              </div>
            </div>

            {/* ROW 3 — Name + Joined */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', position: 'relative', zIndex: 2 }}>
              <div>
                <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 2 }}>Card Holder</div>
                <div style={{ fontSize: 15, fontWeight: 800, color: 'white', letterSpacing: '0.06em', textTransform: 'uppercase', fontFamily: 'Space Grotesk, sans-serif', textShadow: '0 2px 8px rgba(0,0,0,0.35)', lineHeight: 1.1 }}>
                  {user?.name || 'Your Name'}
                </div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>
                  {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Patient'}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 2 }}>Joined</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'white' }}>Apr 12, 2026</div>
                <div style={{ fontSize: 7, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 3 }}>* Amrit Premium</div>
              </div>
            </div>

            {/* Hint */}
            <div style={{ position: 'absolute', bottom: 6, left: '50%', transform: 'translateX(-50%)', fontSize: 7, color: 'rgba(255,255,255,0.2)', whiteSpace: 'nowrap', zIndex: 2 }}>
              Click to flip for QR
            </div>
          </div>{/* END FRONT */}

          {/* ═══ BACK FACE — QR only here, correct orientation ═══ */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 20,
            backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', overflow: 'hidden',
            background: 'linear-gradient(135deg, #080614 0%, #1a1445 40%, #2d1b6e 70%, #150f38 100%)',
            transform: 'rotateY(180deg)',
            boxShadow: '0 40px 80px rgba(0,0,0,0.85), inset 0 1px 0 rgba(255,255,255,0.07)',
          }}>
            {/* Magnetic stripe */}
            <div style={{ position: 'absolute', top: 36, left: 0, right: 0, height: 38, background: 'rgba(0,0,0,0.6)' }} />
            {/* Centered QR content */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 10, position: 'relative', zIndex: 2 }}>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.14em', textTransform: 'uppercase', marginTop: 24 }}>
                Scan to Share Health Profile
              </div>
              <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 16, padding: 12, border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
                <QRCode size={90} />
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: 'white', letterSpacing: '0.2em', fontFamily: 'monospace' }}>{uid}</div>
                <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', marginTop: 3, letterSpacing: '0.06em' }}>UNIQUE HEALTH ID - ABHA CERTIFIED</div>
              </div>
            </div>
            <div style={{ position: 'absolute', bottom: 6, right: 12, fontSize: 7, color: 'rgba(255,255,255,0.2)' }}>Click to flip</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════ HEALTH SCORE GAUGE ═══════════════ */
function HealthGaugeCard({ score }: { score: number }) {
  const [anim, setAnim] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [displayScore, setDisplayScore] = useState(score);

  useEffect(() => {
    const t = setTimeout(() => setAnim(score), 600);
    return () => clearTimeout(t);
  }, [score]);

  const handleRefresh = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRefreshing(true);
    setAnim(0);
    setTimeout(() => {
      const jitter = Math.floor(Math.random() * 5) - 2;
      setDisplayScore(Math.max(0, Math.min(100, score + jitter)));
      setAnim(Math.max(0, Math.min(100, score + jitter)));
      setRefreshing(false);
    }, 900);
  };

  // Gauge SVG constants — larger viewBox so score text never clips
  const W = 260, H = 160, CX = 130, CY = 140, R = 100;
  const label = displayScore < 40 ? 'Poor' : displayScore < 60 ? 'Fair' : displayScore < 80 ? 'Good' : 'Excellent';
  const color = displayScore < 40 ? '#ef4444' : displayScore < 60 ? '#f59e0b' : displayScore < 80 ? '#10b981' : '#3b82f6';
  const bgColor = displayScore < 40 ? 'rgba(239,68,68,0.08)' : displayScore < 60 ? 'rgba(245,158,11,0.08)' : displayScore < 80 ? 'rgba(16,185,129,0.08)' : 'rgba(59,130,246,0.08)';

  return (
    <div style={{ padding: '28px 24px', display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between', gap: 18, boxSizing: 'border-box' }}>

      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 9, height: 9, borderRadius: '50%', background: color, boxShadow: `0 0 10px ${color}` }} />
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase', flex: 1 }}>Health Score</div>
        <div style={{ fontSize: 10, fontWeight: 600, color: color, background: bgColor, padding: '3px 10px', borderRadius: 20, border: `1px solid ${color}30`, marginRight: 6 }}>{label}</div>
        {/* Refresh button */}
        <motion.button
          onClick={handleRefresh}
          animate={{ rotate: refreshing ? 360 : 0 }}
          transition={{ duration: refreshing ? 0.8 : 0, ease: 'linear', repeat: refreshing ? Infinity : 0 }}
          style={{
            width: 30, height: 30, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.12)',
            background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: 'var(--text-muted)', flexShrink: 0,
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          }}
        >
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
          </svg>
        </motion.button>
      </div>

      {/* Gauge — overflow:visible so score text never clips */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
        <div style={{ position: 'relative', width: '100%', maxWidth: W, overflow: 'visible' }}>
          <svg
            width="100%" viewBox={`0 0 ${W} ${H}`}
            style={{ overflow: 'visible', display: 'block' }}
          >
            <defs>
              <linearGradient id="arcGrad2" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#ef4444" />
                <stop offset="35%" stopColor="#f59e0b" />
                <stop offset="70%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>
              <filter id="gaugeGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="5" result="coloredBlur" />
                <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
              <filter id="numGlow" x="-10%" y="-10%" width="120%" height="120%">
                <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>

            {/* Track */}
            <path d={`M ${CX - R},${CY} A ${R},${R} 0 0,1 ${CX + R},${CY}`}
              fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={18} strokeLinecap="round" />

            {/* Colored arc */}
            <motion.path
              d={`M ${CX - R},${CY} A ${R},${R} 0 0,1 ${CX + R},${CY}`}
              fill="none" stroke="url(#arcGrad2)" strokeWidth={18} strokeLinecap="round"
              pathLength={100}
              initial={{ pathLength: 0 }} animate={{ pathLength: anim / 100 }}
              transition={{ duration: 1.8, ease: 'easeOut' }}
              filter="url(#gaugeGlow)"
            />

            {/* Tick marks */}
            {[0, 25, 50, 75, 100].map((pct, i) => {
              const angle = -180 + pct * 1.8;
              const rad = angle * Math.PI / 180;
              return <line key={i}
                x1={CX + (R - 10) * Math.cos(rad)} y1={CY + (R - 10) * Math.sin(rad)}
                x2={CX + (R + 3) * Math.cos(rad)} y2={CY + (R + 3) * Math.sin(rad)}
                stroke="rgba(255,255,255,0.2)" strokeWidth={2} strokeLinecap="round" />;
            })}

            {/* Needle */}
            <motion.g
              initial={{ rotate: -90 }} animate={{ rotate: -90 + anim * 1.8 }}
              style={{ transformOrigin: `${CX}px ${CY}px` }}
              transition={{ duration: 1.8, ease: 'easeOut' }}
            >
              <line x1={CX} y1={CY + 6} x2={CX} y2={CY - R + 18} stroke={color} strokeWidth={4} strokeLinecap="round" />
              <circle cx={CX} cy={CY} r={10} fill={color} filter="url(#gaugeGlow)" />
              <circle cx={CX} cy={CY} r={4} fill="white" />
            </motion.g>

            {/* Score — positioned below center, overflow:visible ensures no clip */}
            <text x={CX} y={CY + 10}
              textAnchor="middle" dominantBaseline="middle"
              fill="var(--text-primary)"
              fontFamily="Space Grotesk, sans-serif" fontSize={52} fontWeight={900}
              filter="url(#numGlow)"
            >{anim}</text>
            <text x={CX} y={CY + 44}
              textAnchor="middle"
              fill={color}
              fontFamily="Inter, sans-serif" fontSize={12} fontWeight={700} letterSpacing={3}
            >/100</text>
          </svg>
        </div>
      </div>

      {/* Sub-stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, width: '100%' }}>
        {[
          { emoji: '🔥', val: '371', sub: 'kcal', color: '#f97316' },
          { emoji: '👟', val: '2.5k', sub: 'steps', color: '#10b981' },
          { emoji: '💤', val: '7hr', sub: 'target', color: '#8b5cf6' },
        ].map(s => (
          <div key={s.emoji} style={{
            textAlign: 'center', padding: '11px 6px', borderRadius: 14,
            background: `linear-gradient(135deg, ${s.color}12, var(--accent-surface))`,
            border: `1px solid ${s.color}22`,
            boxShadow: `0 4px 12px ${s.color}12`,
          }}>
            <div style={{ fontSize: 18, marginBottom: 3 }}>{s.emoji}</div>
            <div style={{ fontSize: 14, fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1, fontFamily: 'Space Grotesk, sans-serif' }}>{s.val}</div>
            <div style={{ fontSize: 8, color: 'var(--text-muted)', marginTop: 3, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Alert */}
      <div style={{
        padding: '10px 14px', borderRadius: 14,
        background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.18)',
        display: 'flex', alignItems: 'flex-start', gap: 8,
      }}>
        <span style={{ fontSize: 13, flexShrink: 0, marginTop: 1 }}>⚠️</span>
        <div style={{ fontSize: 10, color: 'var(--text-muted)', lineHeight: 1.6 }}>
          Minor BP concern detected.{' '}
          <span style={{ color: '#f59e0b', fontWeight: 600 }}>Consider a cardiology consult.</span>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════ METRIC CARD ═══════════════ */
function MetricCard({ m }: { m: typeof metricRows[0][0] }) {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div variants={itemVariants}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      style={{
        position: 'relative', borderRadius: 22, padding: '22px 20px',
        background: hovered
          ? `linear-gradient(135deg, ${m.bg.replace('0.12', '0.22')}, var(--bg-card))`
          : 'var(--bg-card)',
        border: `1.5px solid ${hovered ? m.color + '44' : 'var(--border-color)'}`,
        boxShadow: hovered
          ? `0 20px 50px ${m.color}22, 0 4px 16px rgba(0,0,0,0.15)`
          : 'var(--shadow-sm)',
        cursor: 'pointer', overflow: 'hidden',
        transition: 'all 0.28s cubic-bezier(0.16,1,0.3,1)',
        transform: hovered ? 'translateY(-6px) scale(1.02)' : 'none',
      }}
    >
      {/* Floating glow blob */}
      <div style={{
        position: 'absolute', top: -30, right: -20, width: 120, height: 120, borderRadius: '50%',
        background: `radial-gradient(circle, ${m.color}18 0%, transparent 70%)`,
        pointerEvents: 'none', transition: 'all 0.3s',
        opacity: hovered ? 1 : 0.5,
      }} />

      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, position: 'relative', zIndex: 1 }}>
        <div style={{
          width: 42, height: 42, borderRadius: 14, background: m.bg,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
          boxShadow: `0 4px 14px ${m.color}30`,
        }}>{m.icon}</div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px',
          borderRadius: 30, background: `${m.color}14`, border: `1px solid ${m.color}28`,
        }}>
          {m.trend === 'up' && <TrendingUp size={11} color={m.color} />}
          {m.trend === 'down' && <TrendingDown size={11} color={m.color} />}
          {m.trend === 'stable' && <Minus size={11} color="var(--text-muted)" />}
          <span style={{ fontSize: 10, fontWeight: 700, color: m.trend === 'stable' ? 'var(--text-muted)' : m.color }}>
            {m.trend}
          </span>
        </div>
      </div>

      {/* Value */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
          <span style={{ fontSize: 28, fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.03em', fontFamily: 'Space Grotesk, sans-serif', lineHeight: 1 }}>
            {m.value}
          </span>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>{m.unit}</span>
        </div>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginTop: 4 }}>{m.label}</div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{m.sub}</div>
      </div>

      {/* Progress bar */}
      <div style={{ marginTop: 16, position: 'relative', zIndex: 1 }}>
        <div style={{ height: 5, borderRadius: 8, background: 'var(--accent-surface)', overflow: 'hidden' }}>
          <motion.div
            initial={{ width: 0 }} animate={{ width: `${m.prog}%` }}
            transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
            style={{ height: '100%', borderRadius: 8, background: `linear-gradient(90deg, ${m.color}, ${m.color}88)`, boxShadow: `0 0 8px ${m.color}40` }}
          />
        </div>
      </div>
    </motion.div>
  );
}

/* ═══════════════ CUSTOM TOOLTIPS ═══════════════ */
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 12, padding: '10px 14px', boxShadow: 'var(--shadow-lg)' }}>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>{label}</div>
      {payload.map((p: any) => (
        <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.color }} />
          {p.name}: <span style={{ color: p.color }}>{p.value}{p.name === 'SpO2' ? '%' : p.name === 'BPM' ? '' : ''}</span>
        </div>
      ))}
    </div>
  );
};

/* ═══════════════ SMART WATCH 3D ═══════════════ */
function RingArc({ cx, cy, r, pct, color, strokeWidth = 8, delay = 0, id }: {
  cx: number; cy: number; r: number; pct: number; color: string; strokeWidth?: number; delay?: number; id: string;
}) {
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - pct);
  return (
    <>
      <circle cx={cx} cy={cy} r={r} fill="none"
        stroke={`${color}18`} strokeWidth={strokeWidth} strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cy})`} />
      <style>{`@keyframes ring-${id}{from{stroke-dashoffset:${circ}}to{stroke-dashoffset:${offset}}}`}</style>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={color}
        strokeWidth={strokeWidth} strokeLinecap="round"
        strokeDasharray={circ} strokeDashoffset={offset}
        transform={`rotate(-90 ${cx} ${cy})`}
        style={{ filter: `drop-shadow(0 0 10px ${color})`, animation: `ring-${id} 2s cubic-bezier(0.16,1,0.3,1) ${delay}s both` }}
      />
    </>
  );
}

function SmartWatch() {
  const [, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick(n => n + 1), 1000);
    return () => clearInterval(t);
  }, []);
  const d = new Date();
  const hh = d.getHours().toString().padStart(2, '0');
  const mm = d.getMinutes().toString().padStart(2, '0');
  const ss = d.getSeconds().toString().padStart(2, '0');
  const dow = d.toLocaleDateString('en-IN', { weekday: 'short' }).toUpperCase();
  const day = d.getDate();

  const stats = [
    { id: 'bp', color: '#ff3b5c', icon: '🩸', label: 'Blood Pressure', val: '128/82', unit: 'mmHg', sub: '⚠ Slightly Elevated', pct: 0.65 },
    { id: 'st', color: '#30d158', icon: '👟', label: 'Steps Today', val: '2,517', unit: 'steps', sub: '42% of 6,000 goal', pct: 0.42 },
    { id: 'sl', color: '#bf5af2', icon: '💤', label: 'Sleep', val: '1h 28m', unit: '', sub: 'Poor quality', pct: 0.18 },
  ];

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Wearable Summary</div>
      {/* Main card — fills full height */}
      <div className="dash-watch-card" style={{ flex: 1 }}>
        {/* Glow blobs */}
        <div style={{ position: 'absolute', top: -50, left: -50, width: 220, height: 220, borderRadius: '50%', background: 'radial-gradient(circle,rgba(255,59,92,0.10),transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle,rgba(191,90,242,0.08),transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.07),transparent)', borderRadius: 24 }} />

        {/* ── 3D WATCH FACE — perfectly centred, no lean ── */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '16px 0', flex: '0 0 auto',
        }}>
          <motion.div
            whileHover={{ scale: 1.04 }}
            transition={{ type: 'spring', stiffness: 300, damping: 22 }}
            style={{
              transformStyle: 'preserve-3d',
              position: 'relative',
              display: 'inline-block',
            }}>
            {/* TOP BAND */}
            <div style={{
              width: 56, height: 30, margin: '0 auto',
              background: 'linear-gradient(180deg,#222244 0%,#14142a 100%)',
              borderRadius: '8px 8px 0 0',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)',
            }}>
              <div style={{ margin: '6px 18px', height: 'calc(100% - 12px)', borderLeft: '1px solid rgba(255,255,255,0.05)', borderRight: '1px solid rgba(255,255,255,0.05)' }} />
            </div>
            {/* BEZEL */}
            <div style={{
              width: 260, height: 260, borderRadius: 70,
              background: 'linear-gradient(145deg,#3c3c60 0%,#20203a 40%,#18182e 100%)',
              padding: 5,
              boxShadow: [
                '0 50px 100px rgba(0,0,0,1)',
                '18px 18px 0 rgba(0,0,0,0.65)',
                '20px 20px 0 rgba(0,0,0,0.35)',
                'inset 0 3px 4px rgba(255,255,255,0.22)',
                'inset 0 -3px 4px rgba(0,0,0,0.75)',
              ].join(','),
            }}>
              {/* SCREEN */}
              <div style={{
                width: '100%', height: '100%', borderRadius: 66,
                background: 'radial-gradient(ellipse at 30% 20%,#1a1a38,#080810)',
                position: 'relative', overflow: 'hidden',
                boxShadow: 'inset 0 0 60px rgba(0,0,0,0.9)',
              }}>
                {/* Glare */}
                <div style={{ position: 'absolute', top: 0, left: '12%', right: '12%', height: 3, background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.14),transparent)', borderRadius: '0 0 4px 4px', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', top: '6%', left: '8%', width: '32%', height: '18%', background: 'radial-gradient(ellipse,rgba(255,255,255,0.04),transparent)', borderRadius: '50%', transform: 'rotate(-25deg)', pointerEvents: 'none' }} />
                {/* Rings SVG */}
                <svg width={250} height={250} viewBox="0 0 250 250" style={{ position: 'absolute', inset: 0 }}>
                  {/* Track rings */}
                  <circle cx={125} cy={125} r={110} fill="none" stroke="rgba(255,59,92,0.14)" strokeWidth={11} transform="rotate(-90 125 125)" />
                  <circle cx={125} cy={125} r={94} fill="none" stroke="rgba(48,209,88,0.14)" strokeWidth={11} transform="rotate(-90 125 125)" />
                  <circle cx={125} cy={125} r={78} fill="none" stroke="rgba(191,90,242,0.14)" strokeWidth={11} transform="rotate(-90 125 125)" />
                  {/* Animated fills */}
                  <style>{`
                    @keyframes wr1{from{stroke-dashoffset:${(2 * Math.PI * 110).toFixed(1)}}to{stroke-dashoffset:${(2 * Math.PI * 110 * 0.35).toFixed(1)}}}
                    @keyframes wr2{from{stroke-dashoffset:${(2 * Math.PI * 94).toFixed(1)}}to{stroke-dashoffset:${(2 * Math.PI * 94 * 0.58).toFixed(1)}}}
                    @keyframes wr3{from{stroke-dashoffset:${(2 * Math.PI * 78).toFixed(1)}}to{stroke-dashoffset:${(2 * Math.PI * 78 * 0.82).toFixed(1)}}}
                  `}</style>
                  <circle cx={125} cy={125} r={110} fill="none" stroke="#ff3b5c" strokeWidth={11} strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 110} strokeDashoffset={2 * Math.PI * 110 * 0.35}
                    transform="rotate(-90 125 125)"
                    style={{ filter: 'drop-shadow(0 0 12px #ff3b5c)', animation: 'wr1 2.2s cubic-bezier(0.16,1,0.3,1) 0.1s both' }} />
                  <circle cx={125} cy={125} r={94} fill="none" stroke="#30d158" strokeWidth={11} strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 94} strokeDashoffset={2 * Math.PI * 94 * 0.58}
                    transform="rotate(-90 125 125)"
                    style={{ filter: 'drop-shadow(0 0 12px #30d158)', animation: 'wr2 2.2s cubic-bezier(0.16,1,0.3,1) 0.35s both' }} />
                  <circle cx={125} cy={125} r={78} fill="none" stroke="#bf5af2" strokeWidth={11} strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 78} strokeDashoffset={2 * Math.PI * 78 * 0.82}
                    transform="rotate(-90 125 125)"
                    style={{ filter: 'drop-shadow(0 0 12px #bf5af2)', animation: 'wr3 2.2s cubic-bezier(0.16,1,0.3,1) 0.6s both' }} />
                </svg>
                {/* Clock */}
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.28)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>AMRIT SPARSH</div>
                  <div style={{ fontSize: 52, fontWeight: 900, color: '#fff', fontFamily: 'Space Grotesk,monospace', letterSpacing: '-0.03em', lineHeight: 1, textShadow: '0 0 50px rgba(255,255,255,0.15)' }}>{hh}:{mm}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em' }}>{dow}, {day} APR</div>
                  <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.15)', letterSpacing: '0.18em', fontFamily: 'monospace' }}>{ss}</div>
                </div>
              </div>
            </div>
            {/* BOTTOM BAND */}
            <div style={{
              width: 56, height: 30, margin: '0 auto',
              background: 'linear-gradient(180deg,#14142a 0%,#222244 100%)',
              borderRadius: '0 0 8px 8px',
              boxShadow: 'inset 0 -1px 0 rgba(255,255,255,0.04)',
            }}>
              <div style={{ margin: '6px 18px', height: 'calc(100% - 12px)', borderLeft: '1px solid rgba(255,255,255,0.04)', borderRight: '1px solid rgba(255,255,255,0.04)' }} />
            </div>
            {/* CROWN */}
            <div style={{ position: 'absolute', right: -10, top: '43%', width: 9, height: 40, borderRadius: 4, background: 'linear-gradient(90deg,#505078,#30304a,#20203a)', boxShadow: '6px 0 18px rgba(0,0,0,0.8),inset 0 1px 0 rgba(255,255,255,0.1)', transform: 'translateZ(3px)' }} />
            <div style={{ position: 'absolute', right: -9, top: '32%', width: 7, height: 20, borderRadius: 3, background: 'linear-gradient(90deg,#454566,#252540)', boxShadow: '4px 0 10px rgba(0,0,0,0.6)' }} />
            {/* 3D right-edge face */}
            <div style={{ position: 'absolute', right: -14, top: 30, bottom: 30, width: 14, background: 'linear-gradient(180deg,#18182c,#0e0e1c)', boxShadow: 'inset -1px 0 0 rgba(0,0,0,0.6)', borderRadius: '0 4px 4px 0', transform: 'rotateY(90deg)', transformOrigin: 'left' }} />
            {/* Bottom shadow */}
            <div style={{ position: 'absolute', bottom: -20, left: '20%', right: '20%', height: 18, borderRadius: '50%', background: 'radial-gradient(ellipse,rgba(0,0,0,0.85),transparent 70%)', filter: 'blur(12px)', pointerEvents: 'none' }} />
          </motion.div>
        </div>

        {/* ── 3 STAT CARDS (stacked vertically) ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {stats.map((s, i) => (
            <motion.div key={s.id}
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.14, type: 'spring', damping: 18 }}
              whileHover={{ x: -4, scale: 1.02 }}
              style={{
                padding: '12px 14px', borderRadius: 16,
                background: `linear-gradient(135deg,${s.color}18,rgba(255,255,255,0.02))`,
                border: `1px solid ${s.color}35`,
                boxShadow: `0 6px 18px ${s.color}15`,
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12,
                transition: 'all 0.25s cubic-bezier(0.34,1.56,0.64,1)',
              }}
            >
              {/* Mini ring */}
              <div style={{ position: 'relative', width: 40, height: 40, flexShrink: 0 }}>
                <svg width={40} height={40} viewBox="0 0 40 40">
                  <circle cx={20} cy={20} r={16} fill="none" stroke={`${s.color}20`} strokeWidth={5} transform="rotate(-90 20 20)" />
                  <style>{`@keyframes sr${i}{from{stroke-dashoffset:${(2 * Math.PI * 16).toFixed(2)}}to{stroke-dashoffset:${(2 * Math.PI * 16 * (1 - s.pct)).toFixed(2)}}}`}</style>
                  <circle cx={20} cy={20} r={16} fill="none" stroke={s.color} strokeWidth={5} strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 16}
                    strokeDashoffset={2 * Math.PI * 16 * (1 - s.pct)}
                    transform="rotate(-90 20 20)"
                    style={{ filter: `drop-shadow(0 0 5px ${s.color})`, animation: `sr${i} 2s ease-out ${0.5 + i * 0.2}s both` }}
                  />
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>{s.icon}</div>
              </div>
              {/* Value + label */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 7, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 2 }}>{s.label}</div>
                <div style={{ fontSize: 18, fontWeight: 900, color: '#fff', fontFamily: 'Space Grotesk,sans-serif', lineHeight: 1 }}>{s.val}</div>
                {s.unit && <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', marginTop: 1 }}>{s.unit}</div>}
                <div style={{ fontSize: 8, color: `${s.color}cc`, marginTop: 3 }}>{s.sub}</div>
              </div>
              {/* Pct badge */}
              <div style={{ fontSize: 12, fontWeight: 800, color: s.color, flexShrink: 0 }}>{Math.round(s.pct * 100)}%</div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}


/* ═══════════════ PDF VIEWER MODAL ═══════════════ */
type Report = typeof reports[0];

function PDFViewerModal({ report, onClose }: { report: Report | null; onClose: () => void }) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  if (!report) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="pdf-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(16px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '20px',
        }}
      >
        <motion.div
          key="pdf-panel"
          initial={{ opacity: 0, scale: 0.9, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 40 }}
          transition={{ type: 'spring', damping: 22, stiffness: 180 }}
          onClick={e => e.stopPropagation()}
          style={{
            width: '100%', maxWidth: 960, height: '92vh',
            background: 'var(--bg-card)',
            borderRadius: 28, overflow: 'hidden',
            border: '1px solid var(--border-color)',
            boxShadow: '0 50px 120px rgba(0,0,0,0.9), 0 0 0 1px rgba(255,255,255,0.04)',
            display: 'flex', flexDirection: 'column',
            position: 'relative',
          }}
        >
          {/* Top accent bar */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: `linear-gradient(90deg,${report.gradFrom},${report.gradTo})`, zIndex: 2 }} />

          {/* Header */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 14, padding: '20px 24px 18px',
            borderBottom: '1px solid var(--border-color)',
            background: 'var(--accent-surface)',
            position: 'relative', zIndex: 1,
          }}>
            <div style={{
              width: 50, height: 50, borderRadius: 16, flexShrink: 0,
              background: `${report.statusColor}18`,
              border: `1.5px solid ${report.statusColor}35`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26,
              boxShadow: `0 6px 20px ${report.statusColor}20`,
            }}>{report.icon}</div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'Space Grotesk, sans-serif', letterSpacing: '-0.01em' }}>{report.title}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>{report.date}</span><span style={{ opacity: 0.35 }}>·</span>
                <span>{report.doctor}</span><span style={{ opacity: 0.35 }}>·</span>
                <span>{report.tag}</span><span style={{ opacity: 0.35 }}>·</span>
                <span>{report.size}</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {/* Status badge */}
              <div style={{ fontSize: 11, fontWeight: 700, padding: '5px 13px', borderRadius: 10, background: `${report.statusColor}18`, color: report.statusColor, border: `1px solid ${report.statusColor}30`, whiteSpace: 'nowrap' }}>
                {report.status === 'Normal' ? '✅ ' : report.status === 'Review Needed' ? '🔍 ' : '⚠️ '}{report.status}
              </div>
              {/* Download */}
              <a href={report.file} download={report.file.split('/').pop()} style={{ textDecoration: 'none' }}>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700,
                    color: '#06b6d4', background: 'rgba(6,182,212,0.12)',
                    border: '1px solid rgba(6,182,212,0.28)', borderRadius: 11,
                    padding: '9px 16px', cursor: 'pointer',
                  }}><Download size={14} /> Save PDF
                </motion.button>
              </a>
              {/* Close */}
              <motion.button whileHover={{ scale: 1.08, background: 'rgba(239,68,68,0.12)' }} whileTap={{ scale: 0.92 }}
                onClick={onClose}
                style={{
                  width: 38, height: 38, borderRadius: 11, border: '1px solid var(--border-color)',
                  background: 'var(--bg-card)', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--text-muted)', fontSize: 16, fontWeight: 700,
                  transition: 'all 0.2s',
                }}>✕
              </motion.button>
            </div>
          </div>

          {/* PDF iframe */}
          <div style={{ flex: 1, position: 'relative', background: '#1a1a2e' }}>
            <iframe
              src={`${report.file}#toolbar=1&navpanes=0&scrollbar=1`}
              style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
              title={report.title}
            />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ═══════════════ APPOINTMENT MODAL ═══════════════ */
type Appointment = typeof upcoming[0];

function AppointmentModal({ appt, onClose, userMobile }: { appt: Appointment | null; onClose: () => void; userMobile?: string }) {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  useEffect(() => { setSent(false); setError(''); }, [appt]);

  if (!appt) return null;

  const statusColors: Record<string, string> = { confirmed: '#10b981', pending: '#f59e0b', scheduled: '#6366f1' };
  const sc = statusColors[appt.status] || '#10b981';

  const buildMessage = () =>
    `🏥 *Amrit Sparsh — Appointment Details*

` +
    `👤 *Patient:* Ajay Kumar Sharma
` +
    `📋 *Appointment:* ${appt.label}
` +
    `🏫 *Hospital:* ${appt.hospital}
` +
    `📍 *Address:* ${appt.hospitalAddress}
` +
    `📅 *Date:* ${appt.date}
` +
    `⏰ *Time:* ${appt.apptTime}
` +
    `🎫 *Token No.:* ${appt.token}
` +
    `🕐 *Doctor Available:* ${appt.availability}

` +
    `📞 *Doctor Contact:* ${appt.doctorContact}
` +
    `📞 *Hospital Contact:* ${appt.hospitalContact}

` +
    `🗺️ *How to visit (Google Maps):*
${appt.mapsUrl}

` +
    `📝 *Note:* ${appt.note}

` +
    `_– Amrit Sparsh Healthcare Platform_`;

  const handleShare = async () => {
    const mobile = userMobile || '';
    if (!mobile) { setError('No mobile number linked to your account.'); return; }
    setSending(true); setError('');
    try {
      const res = await fetch('/api/send-whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile, message: buildMessage() }),
      });
      const json = await res.json();
      if (json.success) { setSent(true); }
      else { setError('WhatsApp send failed. Please try again.'); }
    } catch { setError('Network error. Please try again.'); }
    finally { setSending(false); }
  };

  return (
    <AnimatePresence>
      <motion.div
        key="appt-overlay"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(0,0,0,0.80)', backdropFilter: 'blur(14px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
        }}
      >
        <motion.div
          key="appt-panel"
          initial={{ opacity: 0, scale: 0.88, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.88, y: 50 }}
          transition={{ type: 'spring', damping: 22, stiffness: 180 }}
          onClick={e => e.stopPropagation()}
          style={{
            width: '100%', maxWidth: 540,
            background: 'var(--bg-card)',
            borderRadius: 28, overflow: 'hidden',
            border: '1px solid var(--border-color)',
            boxShadow: '0 50px 120px rgba(0,0,0,0.85), 0 0 0 1px rgba(255,255,255,0.04)',
            position: 'relative',
          }}
        >
          {/* Top accent */}
          <div style={{ height: 4, background: `linear-gradient(90deg,${sc},${sc}88)` }} />

          {/* Header */}
          <div style={{ padding: '22px 24px 18px', borderBottom: '1px solid var(--border-color)', background: 'var(--accent-surface)', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
            <div style={{ width: 52, height: 52, borderRadius: 16, background: `${sc}18`, border: `1.5px solid ${sc}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0, boxShadow: `0 6px 20px ${sc}20` }}>
              {appt.emoji}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'Space Grotesk, sans-serif' }}>{appt.label}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>{appt.sub}</div>
              <div style={{ marginTop: 6, display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: `${sc}18`, color: sc, border: `1px solid ${sc}30` }}>
                {appt.status === 'confirmed' ? '✅' : appt.status === 'pending' ? '⏳' : '📅'} {appt.status.charAt(0).toUpperCase() + appt.status.slice(1)}
              </div>
            </div>
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={onClose}
              style={{ width: 36, height: 36, borderRadius: 10, border: '1px solid var(--border-color)', background: 'var(--bg-card)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 16, fontWeight: 700, flexShrink: 0 }}>✕
            </motion.button>
          </div>

          {/* Body */}
          <div style={{ padding: '22px 24px' }}>

            {/* Info grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 18 }}>
              {[
                { icon: '🏫', label: 'Hospital', val: appt.hospital },
                { icon: '📅', label: 'Date', val: appt.date },
                { icon: '⏰', label: 'Appointment Time', val: appt.apptTime },
                { icon: '🎫', label: 'Token Number', val: appt.token },
                { icon: '🕐', label: 'Doctor Available', val: appt.availability },
                { icon: '📍', label: 'Address', val: appt.hospitalAddress },
              ].map(row => (
                <div key={row.label} style={{
                  padding: '12px 14px', borderRadius: 14,
                  background: 'var(--accent-surface)',
                  border: '1px solid var(--border-color)',
                }}>
                  <div style={{ fontSize: 9, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>{row.icon} {row.label}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.4 }}>{row.val}</div>
                </div>
              ))}
            </div>

            {/* Contact row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
              <a href={`tel:${appt.doctorContact}`} style={{ textDecoration: 'none' }}>
                <div style={{ padding: '10px 14px', borderRadius: 12, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', cursor: 'pointer' }}>
                  <div style={{ fontSize: 9, color: '#10b981', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 3 }}>📞 Doctor</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>{appt.doctorContact}</div>
                </div>
              </a>
              <a href={`tel:${appt.hospitalContact}`} style={{ textDecoration: 'none' }}>
                <div style={{ padding: '10px 14px', borderRadius: 12, background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', cursor: 'pointer' }}>
                  <div style={{ fontSize: 9, color: '#6366f1', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 3 }}>🏥 Hospital</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>{appt.hospitalContact}</div>
                </div>
              </a>
            </div>

            {/* Google Maps */}
            <a href={appt.mapsUrl} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', display: 'block', marginBottom: 16 }}>
              <motion.div whileHover={{ scale: 1.02 }} style={{
                padding: '11px 16px', borderRadius: 12,
                background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.22)',
                display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
              }}>
                <span style={{ fontSize: 20 }}>🗺️</span>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#f59e0b' }}>How to visit — Google Maps</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>Tap to open directions</div>
                </div>
                <ArrowUpRight size={14} color="#f59e0b" style={{ marginLeft: 'auto' }} />
              </motion.div>
            </a>

            {/* Note */}
            <div style={{ padding: '10px 14px', borderRadius: 12, background: 'rgba(6,182,212,0.06)', border: '1px solid rgba(6,182,212,0.18)', marginBottom: 18 }}>
              <div style={{ fontSize: 9, color: '#06b6d4', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 3 }}>📝 Note</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.6 }}>{appt.note}</div>
            </div>

            {/* WhatsApp Share */}
            {sent ? (
              <div style={{ textAlign: 'center', padding: '14px', borderRadius: 14, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', color: '#10b981', fontSize: 13, fontWeight: 700 }}>
                ✅ Appointment details sent on WhatsApp!
              </div>
            ) : (
              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                onClick={handleShare}
                disabled={sending}
                style={{
                  width: '100%', padding: '14px', borderRadius: 14, border: 'none',
                  background: sending ? 'rgba(37,211,102,0.3)' : 'linear-gradient(135deg,#25d366,#128c7e)',
                  color: 'white', fontSize: 14, fontWeight: 800, cursor: sending ? 'wait' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  boxShadow: '0 8px 24px rgba(37,211,102,0.3)',
                  letterSpacing: '0.01em',
                }}
              >
                <span style={{ fontSize: 20 }}>💬</span>
                {sending ? 'Sending on WhatsApp…' : 'Share Details on WhatsApp'}
              </motion.button>
            )}
            {error && <div style={{ textAlign: 'center', marginTop: 10, fontSize: 11, color: '#ef4444' }}>⚠️ {error}</div>}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}


export default function DashboardModule() {
  const { user } = useAppStore();
  const healthScore = 78;
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible"
      style={{ display: 'flex', flexDirection: 'column', gap: 24 }}
    >
      {/* Inject responsive CSS */}
      <style>{DASH_CSS}</style>

      {/* ═══ ROW 1: NAMASTE | HEALTH CARD — equal 1fr 1fr ═══ */}
      <div className="dash-grid-2">

        {/* ── NAMASTE PANEL ── */}
        <motion.div variants={itemVariants} style={{
          background: 'var(--gradient-primary)', borderRadius: 24,
          padding: '28px 28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 14,
          overflow: 'hidden', position: 'relative', boxShadow: 'var(--shadow-xl)',
          minHeight: 280,
        }}>
          <div style={{ position: 'absolute', top: -50, right: 80, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundImage: `linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)`, backgroundSize: '32px 32px', pointerEvents: 'none', borderRadius: 24 }} />

          {/* Photo + Greeting */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, position: 'relative', zIndex: 1 }}>
            <div style={{ width: 60, height: 60, borderRadius: '50%', overflow: 'hidden', border: '2.5px solid rgba(255,255,255,0.35)', boxShadow: '0 6px 20px rgba(0,0,0,0.35)', flexShrink: 0 }}>
              <img src="/founder.jpeg" alt={user?.name || 'User'} style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={e => {
                  const t = e.target as HTMLImageElement;
                  t.style.display = 'none';
                  t.parentElement!.style.background = user?.primaryColor || '#6D28D9';
                  t.parentElement!.innerHTML = `<div style='width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:800;color:#fff'>${(user?.name || 'A').charAt(0)}</div>`;
                }}
              />
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', fontWeight: 500 }}>
                {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
              </div>
              <div style={{ fontSize: 26, fontWeight: 900, color: 'white', letterSpacing: '-0.02em', fontFamily: 'Space Grotesk, sans-serif', lineHeight: 1.1 }}>
                Namaste, {user?.name?.split(' ')[0] || 'User'} 🙏
              </div>
            </div>
          </div>

          {/* Summary */}
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.78)', lineHeight: 1.65, position: 'relative', zIndex: 1 }}>
            Your <strong style={{ color: 'white' }}>Health Profile Summary</strong> — BP slightly elevated for 3 days.
            {user?.diseases?.length ? ` Managing: ${user.diseases.slice(0, 2).join(', ')}.` : ''} AI flagged 2 items today.
          </div>

          {/* Chips */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>
            {[
              { k: '🆔 ABHA', v: user?.abhaId || 'Not linked' },
              { k: '🩸 Blood', v: user?.bloodGroup || 'O+' },
              { k: '💚 Score', v: `${healthScore}/100` },
              { k: '🏥 Role', v: user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Patient' },
              { k: '📍', v: user?.institute || 'Amrit Sparsh' },
            ].map(chip => (
              <div key={chip.k} style={{
                background: 'rgba(255,255,255,0.13)', backdropFilter: 'blur(10px)',
                borderRadius: 10, padding: '7px 14px', border: '1px solid rgba(255,255,255,0.2)',
              }}>
                <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.06em', marginBottom: 2 }}>{chip.k}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'white' }}>{chip.v}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── IDENTITY CARD — fills same height as Namaste ── */}
        <motion.div variants={itemVariants} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Health Identity Card
          </div>
          {/* Card takes remaining height */}
          <div style={{ flex: 1, minHeight: 256 }}>
            <IdentityCard user={user} />
          </div>
          <div style={{ fontSize: 9, color: 'var(--text-muted)', textAlign: 'center', opacity: 0.4 }}>
            🖱 Hover = 3D tilt · Click = QR flip
          </div>
        </motion.div>
      </div>{/* ── END ROW 1 ── */}

      {/* ═══ ROW 2: WATCH | HEALTH SCORE — equal 1fr 1fr ═══ */}
      <div className="dash-grid-2">

        {/* ── WATCH ── */}
        <motion.div variants={itemVariants} style={{ display: 'flex', flexDirection: 'column' }}>
          <SmartWatch />
        </motion.div>

        {/* ── HEALTH SCORE ── */}
        <motion.div variants={itemVariants} style={{
          borderRadius: 24, overflow: 'hidden', position: 'relative',
          background: 'linear-gradient(160deg, var(--bg-card) 0%, var(--accent-surface) 100%)',
          border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-md)',
          display: 'flex', flexDirection: 'column',
        }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: 'linear-gradient(90deg,#ef4444,#f59e0b,#10b981,#3b82f6)', borderRadius: '24px 24px 0 0', boxShadow: '0 2px 12px rgba(16,185,129,0.3)' }} />
          <div style={{ flex: 1 }}><HealthGaugeCard score={healthScore} /></div>
        </motion.div>
      </div>

      {/* ═══ ROW 3: AI ANALYSIS (full width) ═══ */}
      <motion.div variants={itemVariants}
        style={{
          background: 'var(--bg-card)', borderRadius: 24,
          border: '1px solid var(--border-color)', padding: '24px 28px',
          boxShadow: 'var(--shadow-md)', position: 'relative', overflow: 'hidden',
        }}
      >
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg,#6366f1,#8b5cf6,#a855f7)', borderRadius: '24px 24px 0 0' }} />
        <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle,rgba(99,102,241,0.08) 0%,transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{ width: 40, height: 40, borderRadius: 13, background: 'rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(99,102,241,0.25)' }}>
            <Brain size={18} color="#6366f1" />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'Space Grotesk, sans-serif' }}>AI Health Analysis</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>Based on your health data today — {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
          {aiInsights.map((ins, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              whileHover={{ scale: 1.02, y: -2 }}
              style={{
                padding: '14px 16px', borderRadius: 18,
                background: `linear-gradient(135deg, ${ins.color}10 0%, var(--accent-surface) 100%)`,
                border: `1.5px solid ${ins.color}28`,
                cursor: 'pointer',
                boxShadow: `0 4px 16px ${ins.color}14`,
                transition: 'all 0.22s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <div style={{ width: 30, height: 30, borderRadius: 10, background: `${ins.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>{ins.icon}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3 }}>{ins.title}</div>
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5 }}>{ins.desc}</div>
            </motion.div>
          ))}
        </div>

      </motion.div>

      {/* ═══ ROW 3: METRIC CARDS 3+3 ═══ */}
      {metricRows.map((row, ri) => (
        <motion.div key={ri} variants={itemVariants}>
          {ri === 0 && (
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 14 }}>
              Live Health Metrics
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 18 }}>
            {row.map(m => <MetricCard key={m.id} m={m} />)}
          </div>
          {ri === 0 && <div style={{ height: 4 }} />}
        </motion.div>
      ))}

      {/* ═══ ROW 4: 4 CHARTS ═══ */}
      <motion.div variants={itemVariants}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 14 }}>
          Health Trends
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 18 }}>

          {/* Heart Rate */}
          <div style={{ background: 'var(--bg-card)', borderRadius: 22, border: '1px solid var(--border-color)', padding: '20px', boxShadow: 'var(--shadow-sm)', overflow: 'hidden', position: 'relative' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg,#f43f5e,#fb7185)', borderRadius: '22px 22px 0 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Heart Rate</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Today's log</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 22, fontWeight: 900, color: '#f43f5e', fontFamily: 'Space Grotesk,sans-serif' }}>72</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>BPM avg</div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={110}>
              <AreaChart data={heartData} margin={{ top: 0, right: 0, left: -28, bottom: 0 }}>
                <defs>
                  <linearGradient id="hrGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="2 4" stroke="var(--border-color)" vertical={false} />
                <XAxis dataKey="t" tick={{ fill: 'var(--text-muted)', fontSize: 9 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 9 }} axisLine={false} tickLine={false} domain={[60, 90]} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="v" name="BPM" stroke="#f43f5e" strokeWidth={2.5} fill="url(#hrGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Blood Pressure */}
          <div style={{ background: 'var(--bg-card)', borderRadius: 22, border: '1px solid var(--border-color)', padding: '20px', boxShadow: 'var(--shadow-sm)', overflow: 'hidden', position: 'relative' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg,#ef4444,#f56565)', borderRadius: '22px 22px 0 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Blood Pressure</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>7-day view</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 18, fontWeight: 900, color: '#ef4444', fontFamily: 'Space Grotesk,sans-serif' }}>128/82</div>
                <div style={{ fontSize: 10, color: '#f59e0b' }}>⚠ Elevated</div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={110}>
              <LineChart data={bpData} margin={{ top: 0, right: 0, left: -28, bottom: 0 }}>
                <CartesianGrid strokeDasharray="2 4" stroke="var(--border-color)" vertical={false} />
                <XAxis dataKey="d" tick={{ fill: 'var(--text-muted)', fontSize: 9 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 9 }} axisLine={false} tickLine={false} />
                <ReferenceLine y={120} stroke="#10b98160" strokeDasharray="3 4" label={{ value: 'Normal', fill: '#10b981', fontSize: 8 }} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="s" name="Systolic" stroke="#ef4444" strokeWidth={2} dot={{ r: 3, fill: '#ef4444' }} />
                <Line type="monotone" dataKey="di" name="Diastolic" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3, fill: '#f59e0b' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Sleep */}
          <div style={{ background: 'var(--bg-card)', borderRadius: 22, border: '1px solid var(--border-color)', padding: '20px', boxShadow: 'var(--shadow-sm)', overflow: 'hidden', position: 'relative' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg,#7c3aed,#a78bfa)', borderRadius: '22px 22px 0 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Sleep</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Weekly hours</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 18, fontWeight: 900, color: '#7c3aed', fontFamily: 'Space Grotesk,sans-serif' }}>1h 28m</div>
                <div style={{ fontSize: 10, color: '#ef4444' }}>⬇ Poor last night</div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={110}>
              <BarChart data={sleepData} margin={{ top: 0, right: 0, left: -28, bottom: 0 }}>
                <CartesianGrid strokeDasharray="2 4" stroke="var(--border-color)" vertical={false} />
                <XAxis dataKey="d" tick={{ fill: 'var(--text-muted)', fontSize: 9 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 9 }} axisLine={false} tickLine={false} />
                <ReferenceLine y={8} stroke="#10b98155" strokeDasharray="3 3" label={{ value: 'Goal 8h', fill: '#10b981', fontSize: 8 }} />
                <Tooltip content={<CustomTooltip />} />
                <defs>
                  <linearGradient id="sleepGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#7c3aed" stopOpacity={0.3} />
                  </linearGradient>
                </defs>
                <Bar dataKey="h" name="Hours" fill="url(#sleepGrad)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Phone Usage */}
          <div style={{ background: 'var(--bg-card)', borderRadius: 22, border: '1px solid var(--border-color)', padding: '20px', boxShadow: 'var(--shadow-sm)', overflow: 'hidden', position: 'relative' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg,#f97316,#fb923c)', borderRadius: '22px 22px 0 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Smartphone size={14} color="#f97316" /> Phone Usage
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Daily hours (bar)</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 18, fontWeight: 900, color: '#f97316', fontFamily: 'Space Grotesk,sans-serif' }}>7.1h</div>
                <div style={{ fontSize: 10, color: '#ef4444' }}>⬆ Above goal 5h</div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={110}>
              <BarChart data={phoneData} margin={{ top: 0, right: 0, left: -28, bottom: 0 }}>
                <CartesianGrid strokeDasharray="2 4" stroke="var(--border-color)" vertical={false} />
                <XAxis dataKey="d" tick={{ fill: 'var(--text-muted)', fontSize: 9 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 9 }} axisLine={false} tickLine={false} />
                <ReferenceLine y={5} stroke="#10b98155" strokeDasharray="3 3" label={{ value: 'Goal 5h', fill: '#10b981', fontSize: 8 }} />
                <Tooltip content={<CustomTooltip />} />
                <defs>
                  <linearGradient id="phoneGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f97316" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#f97316" stopOpacity={0.3} />
                  </linearGradient>
                </defs>
                <Bar dataKey="h" name="Hours" fill="url(#phoneGrad)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

        </div>
      </motion.div>

      {/* ═══ ROW 5: REPORTS + UPCOMING ═══ */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: 22 }}>

        {/* ══ MEDICAL REPORTS — premium card grid ══ */}
        <motion.div variants={itemVariants} style={{
          background: 'var(--bg-card)', borderRadius: 24,
          border: '1px solid var(--border-color)', padding: '28px',
          boxShadow: 'var(--shadow-md)', position: 'relative', overflow: 'hidden',
        }}>
          {/* Top gradient bar */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: 'linear-gradient(90deg,#06b6d4,#6366f1,#8b5cf6)', borderRadius: '24px 24px 0 0' }} />
          {/* Ambient glow */}
          <div style={{ position: 'absolute', top: -60, right: -60, width: 240, height: 240, borderRadius: '50%', background: 'radial-gradient(circle,rgba(6,182,212,0.07) 0%,transparent 70%)', pointerEvents: 'none' }} />

          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(6,182,212,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(6,182,212,0.2)' }}>
                <FileText size={20} color="#06b6d4" />
              </div>
              <div>
                <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'Space Grotesk,sans-serif' }}>Medical Reports</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>4 documents · Click any card to open PDF</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ fontSize: 10, fontWeight: 600, padding: '4px 10px', borderRadius: 20, background: 'rgba(16,185,129,0.12)', color: '#10b981', border: '1px solid rgba(16,185,129,0.25)' }}>2 Normal</div>
              <div style={{ fontSize: 10, fontWeight: 600, padding: '4px 10px', borderRadius: 20, background: 'rgba(245,158,11,0.12)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.25)' }}>1 Review</div>
              <div style={{ fontSize: 10, fontWeight: 600, padding: '4px 10px', borderRadius: 20, background: 'rgba(249,115,22,0.12)', color: '#f97316', border: '1px solid rgba(249,115,22,0.25)' }}>1 Border</div>
            </div>
          </div>

          {/* 2×2 Card Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {reports.map((r, i) => (
              <motion.div key={r.id}
                initial={{ opacity: 0, y: 18, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.1 + i * 0.08, type: 'spring', damping: 18, stiffness: 120 }}
                whileHover={{ y: -4, scale: 1.02, boxShadow: `0 20px 48px ${r.statusColor}20` }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedReport(r)}
                style={{
                  position: 'relative', borderRadius: 20, overflow: 'hidden',
                  background: `linear-gradient(140deg, ${r.statusColor}0d 0%, var(--accent-surface) 100%)`,
                  border: `1.5px solid ${r.statusColor}28`,
                  cursor: 'pointer',
                  transition: 'box-shadow 0.3s',
                }}
              >
                {/* Top gradient accent */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg,${r.gradFrom},${r.gradTo})`, borderRadius: '20px 20px 0 0' }} />

                {/* Card body */}
                <div style={{ padding: '20px 20px 16px' }}>
                  {/* Top row: icon + badge */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                    <div style={{
                      width: 52, height: 52, borderRadius: 16,
                      background: `linear-gradient(135deg,${r.statusColor}22,${r.statusColor}0a)`,
                      border: `1.5px solid ${r.statusColor}30`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 26, boxShadow: `0 8px 24px ${r.statusColor}18`,
                    }}>{r.icon}</div>
                    <div style={{
                      fontSize: 10, fontWeight: 700, padding: '4px 11px', borderRadius: 20,
                      background: `${r.statusColor}18`, color: r.statusColor,
                      border: `1px solid ${r.statusColor}35`,
                      display: 'flex', alignItems: 'center', gap: 4,
                    }}>
                      {r.status === 'Normal' ? '✅' : r.status === 'Review Needed' ? '🔍' : '⚠️'} {r.status}
                    </div>
                  </div>

                  {/* Report name */}
                  <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'Space Grotesk,sans-serif', lineHeight: 1.3, marginBottom: 6 }}>{r.title}</div>

                  {/* Meta */}
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: 3, marginBottom: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 9, letterSpacing: '0.06em', textTransform: 'uppercase', color: r.statusColor, fontWeight: 700 }}>{r.tag}</span>
                      <span style={{ opacity: 0.35 }}>·</span>
                      <span>{r.size}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span>👨‍⚕️ {r.doctor}</span>
                      <span style={{ opacity: 0.35 }}>·</span>
                      <span>📅 {r.date}</span>
                    </div>
                  </div>

                  {/* Action row */}
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <motion.button
                      whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.95 }}
                      onClick={e => { e.stopPropagation(); setSelectedReport(r); }}
                      style={{
                        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                        fontSize: 11, fontWeight: 700, color: 'white',
                        background: `linear-gradient(135deg,${r.gradFrom},${r.gradTo})`,
                        border: 'none', borderRadius: 11, padding: '9px 0',
                        cursor: 'pointer', boxShadow: `0 6px 16px ${r.statusColor}30`,
                      }}>
                      <Eye size={13} /> Open Report
                    </motion.button>
                    <a href={r.file} download={r.file.split('/').pop()} onClick={e => e.stopPropagation()} style={{ textDecoration: 'none' }}>
                      <motion.button
                        whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
                        style={{
                          width: 36, height: 36, borderRadius: 11, border: `1px solid ${r.statusColor}35`,
                          background: `${r.statusColor}12`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          cursor: 'pointer', color: r.statusColor,
                        }}><Download size={14} />
                      </motion.button>
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Footer hint */}
          <div style={{ textAlign: 'center', marginTop: 16, fontSize: 10, color: 'var(--text-muted)', opacity: 0.5 }}>
            🔒 Secured · Click card to view full PDF · Press Esc to close
          </div>
        </motion.div>

        {/* PDF Modal */}
        <PDFViewerModal report={selectedReport} onClose={() => setSelectedReport(null)} />

        {/* Upcoming */}
        <motion.div variants={itemVariants} style={{
          background: 'var(--bg-card)', borderRadius: 24,
          border: '1px solid var(--border-color)', padding: '28px',
          boxShadow: 'var(--shadow-md)', position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg,#10b981,#34d399)', borderRadius: '24px 24px 0 0' }} />

          {/* Header — no Add button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 22 }}>
            <div style={{ width: 40, height: 40, borderRadius: 13, background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Calendar size={18} color="#10b981" />
            </div>
            <div>
              <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'Space Grotesk,sans-serif' }}>Upcoming</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>4 events scheduled · Tap to view details</div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {upcoming.map((item, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ x: -4, scale: 1.01, boxShadow: `0 12px 32px ${item.badge}18` }}
                onClick={() => setSelectedAppt(item)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14, padding: '15px 16px',
                  background: 'var(--accent-surface)', borderRadius: 18,
                  border: '1px solid var(--border-color)', cursor: 'pointer',
                  position: 'relative', overflow: 'hidden',
                  transition: 'all 0.22s',
                }}
              >
                <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 4, borderRadius: '0 18px 18px 0', background: item.badge }} />
                <div style={{
                  width: 44, height: 44, borderRadius: 14, flexShrink: 0,
                  background: 'var(--bg-card)', border: '1px solid var(--border-color)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
                  boxShadow: 'var(--shadow-sm)',
                }}>{item.emoji}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{item.label}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{item.sub}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 5 }}>
                    <Clock size={10} color="var(--accent-primary)" />
                    <span style={{ fontSize: 10, color: 'var(--accent-primary)', fontWeight: 600 }}>{item.time}</span>
                    <span style={{ fontSize: 9, color: 'var(--text-muted)', opacity: 0.5, marginLeft: 4 }}>· 🎫 {item.token}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 8, background: `${item.badge}18`, color: item.badge, border: `1px solid ${item.badge}30`, textAlign: 'center' }}>
                    {item.status}
                  </div>
                  <ChevronRight size={14} color="var(--text-muted)" />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Appointment Detail Modal */}
      <AppointmentModal
        appt={selectedAppt}
        onClose={() => setSelectedAppt(null)}
        userMobile={user?.phone || ''}
      />

    </motion.div>
  );
}
