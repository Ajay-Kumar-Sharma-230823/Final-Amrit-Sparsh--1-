'use client';

import React, { useState, useEffect, useRef, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Plus, Search, Filter, RefreshCw, Send, X, ChevronDown,
  ChevronRight, AlertTriangle, Shield, Activity, Users, Microscope,
  FileText, Bed, Camera, MessageSquare, Radio, Brain, MapPin, Bell,
  Clock, CheckCircle, Eye, Download, Upload, Wifi, User, Zap,
  TrendingUp, BarChart2, Layers, Lock, Info, Star,
} from 'lucide-react';
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  RadarChart, PolarGrid, PolarAngleAxis, Radar, PieChart, Pie, Cell,
} from 'recharts';
import { useAppStore } from '@/store/appStore';

/* ═══════════════════════════════════════════════════
   THEME-AWARE DESIGN TOKENS
   Light  → crisp white, soft surfaces, dark text
   Dark   → deep navy, glass surfaces, light text
   Pink   → same as light with pink accents inherited
═══════════════════════════════════════════════════ */
type TokenMap = typeof LIGHT_TOKENS;

const LIGHT_TOKENS = {
  /* Backgrounds */
  pageBg:      '#F7F8FC',
  white:       '#FFFFFF',
  surface:     '#F0F2F8',
  surfaceAlt:  '#E8EBF4',
  glass:       'rgba(255,255,255,0.88)',
  heroBg:      'linear-gradient(135deg, #1E3A5F 0%, #1A1040 60%, #0F2038 100%)',
  heroText:    'rgba(255,255,255,0.62)',
  heroSubtext: 'rgba(255,255,255,0.42)',

  /* Brand — vivid in both themes */
  blue:        '#2563EB',
  blueSoft:    '#EFF6FF',
  purple:      '#7C3AED',
  purpleSoft:  '#F5F3FF',
  teal:        '#0891B2',
  tealSoft:    '#F0FDFF',

  /* Status */
  red:         '#DC2626',
  redSoft:     '#FEF2F2',
  amber:       '#D97706',
  amberSoft:   '#FFFBEB',
  green:       '#059669',
  greenSoft:   '#F0FDF4',

  /* Text */
  txt:         '#111827',
  txtSec:      '#6B7280',
  txtMuted:    '#9CA3AF',

  /* Border */
  border:      'rgba(0,0,0,0.07)',
  borderMd:    'rgba(0,0,0,0.11)',

  /* Shadow */
  shadowSm:    '0 1px 4px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
  shadowMd:    '0 4px 16px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.05)',
  shadowLg:    '0 12px 40px rgba(0,0,0,0.10), 0 3px 8px rgba(0,0,0,0.06)',
  shadowXl:    '0 24px 64px rgba(0,0,0,0.12), 0 6px 16px rgba(0,0,0,0.07)',

  /* Network graph */
  netBgFrom:   '#FAFBFF',
  netBgTo:     '#F0F2F8',
  gridLine:    'rgba(0,0,0,0.06)',
  nodeTxt:     '#111827',

  /* Chart */
  chartAxis:   '#9CA3AF',
  chartGrid:   'rgba(0,0,0,0.06)',
  tooltipBg:   '#FFFFFF',
  tooltipBorder:'rgba(0,0,0,0.08)',

  /* Misc */
  isDark:      false,
  scanLine:    '#0891B2',
  cameraFeedBg:'#0D1729',
};

const DARK_TOKENS: TokenMap = {
  /* Backgrounds */
  pageBg:      '#0B0F1A',
  white:       '#111827',
  surface:     '#1A2035',
  surfaceAlt:  '#222C42',
  glass:       'rgba(17,24,39,0.88)',
  heroBg:      'linear-gradient(135deg, #0D1829 0%, #100A28 60%, #080E18 100%)',
  heroText:    'rgba(255,255,255,0.72)',
  heroSubtext: 'rgba(255,255,255,0.38)',

  /* Brand — slightly brighter for dark bg contrast */
  blue:        '#3B82F6',
  blueSoft:    'rgba(59,130,246,0.15)',
  purple:      '#8B5CF6',
  purpleSoft:  'rgba(139,92,246,0.15)',
  teal:        '#22D3EE',
  tealSoft:    'rgba(34,211,238,0.12)',

  /* Status */
  red:         '#EF4444',
  redSoft:     'rgba(239,68,68,0.15)',
  amber:       '#F59E0B',
  amberSoft:   'rgba(245,158,11,0.15)',
  green:       '#10B981',
  greenSoft:   'rgba(16,185,129,0.12)',

  /* Text */
  txt:         '#F1F5F9',
  txtSec:      '#94A3B8',
  txtMuted:    '#64748B',

  /* Border */
  border:      'rgba(255,255,255,0.08)',
  borderMd:    'rgba(255,255,255,0.13)',

  /* Shadow */
  shadowSm:    '0 1px 4px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.3)',
  shadowMd:    '0 4px 16px rgba(0,0,0,0.5), 0 1px 3px rgba(0,0,0,0.4)',
  shadowLg:    '0 12px 40px rgba(0,0,0,0.60), 0 3px 8px rgba(0,0,0,0.5)',
  shadowXl:    '0 24px 64px rgba(0,0,0,0.70), 0 6px 16px rgba(0,0,0,0.6)',

  /* Network graph */
  netBgFrom:   '#0D1520',
  netBgTo:     '#080F1A',
  gridLine:    'rgba(255,255,255,0.04)',
  nodeTxt:     '#F1F5F9',

  /* Chart */
  chartAxis:   '#64748B',
  chartGrid:   'rgba(255,255,255,0.05)',
  tooltipBg:   '#1A2035',
  tooltipBorder:'rgba(255,255,255,0.1)',

  /* Misc */
  isDark:      true,
  scanLine:    '#22D3EE',
  cameraFeedBg:'#060D18',
};

/* React context so all sub-components share the same T without prop-drilling */
const ThemeCtx = createContext<TokenMap>(LIGHT_TOKENS);
const useT = () => useContext(ThemeCtx);

function useThemeTokens(): TokenMap {
  const theme = useAppStore(s => s.theme);
  return theme === 'dark' ? DARK_TOKENS : LIGHT_TOKENS;
}

/* ── Keep legacy top-level T for static helpers (non-component functions) ── */
/* These are overridden at render time via the ThemeCtx / useT() hook        */
const T = LIGHT_TOKENS;

/* ── Inject keyframes once ── */
const MDR_CSS = `
@keyframes mdrPulse {
  0%,100% { transform: scale(1); opacity: 1; }
  50%     { transform: scale(1.18); opacity: 0.5; }
}
@keyframes mdrSlideUp {
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes mdrTickerScroll {
  0%   { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
@keyframes mdrScan {
  0%   { top: -2px; opacity: 0.7; }
  100% { top: 100%; opacity: 0; }
}
@keyframes mdrFloat {
  0%,100% { transform: translateY(0px); }
  50%     { transform: translateY(-6px); }
}
@keyframes mdrRing {
  0%   { transform: translate(-50%,-50%) scale(0.5); opacity: 0.6; }
  100% { transform: translate(-50%,-50%) scale(2.5); opacity: 0; }
}
@keyframes mdrShimmerLight {
  0%   { background-position: -400px 0; }
  100% { background-position: 400px 0; }
}
.mdr-pulse-dot { animation: mdrPulse 1.6s ease-in-out infinite; }
.mdr-float     { animation: mdrFloat 4s ease-in-out infinite; }
.mdr-ticker    { animation: mdrTickerScroll 32s linear infinite; }
.mdr-shimmer {
  background: linear-gradient(90deg, #f0f2f8 25%, #e8eaf2 50%, #f0f2f8 75%);
  background-size: 400px 100%;
  animation: mdrShimmerLight 1.4s infinite;
}
[data-theme='dark'] .mdr-shimmer {
  background: linear-gradient(90deg, #1a2035 25%, #222c42 50%, #1a2035 75%);
  background-size: 400px 100%;
  animation: mdrShimmerLight 1.4s infinite;
}
`;

/* ═══ DATA ═══ */
const patients = [
  { id: 'P001', name: 'Ramesh Kumar',  age: 54, ward: 'ICU-A',   status: 'positive', risk: 9.2, contacts: 12, since: '2d', gender: 'M', badge: 'XDR',     admitted: '2026-04-18' },
  { id: 'P002', name: 'Priya Sharma',  age: 38, ward: 'Ward-B3', status: 'suspect',  risk: 6.8, contacts: 7,  since: '1d', gender: 'F', badge: 'MDR-TB',  admitted: '2026-04-19' },
  { id: 'P003', name: 'Ajay Singh',    age: 61, ward: 'ICU-B',   status: 'positive', risk: 8.9, contacts: 9,  since: '3d', gender: 'M', badge: 'CRE',     admitted: '2026-04-17' },
  { id: 'P004', name: 'Sita Devi',     age: 45, ward: 'Ward-C1', status: 'suspect',  risk: 5.4, contacts: 4,  since: '12h', gender: 'F', badge: 'ESBL',   admitted: '2026-04-20' },
  { id: 'P005', name: 'Vikram Rao',    age: 72, ward: 'Ward-D2', status: 'positive', risk: 8.1, contacts: 15, since: '4d', gender: 'M', badge: 'MDR',     admitted: '2026-04-16' },
  { id: 'P006', name: 'Anita Verma',   age: 29, ward: 'Ward-A2', status: 'clear',    risk: 1.2, contacts: 2,  since: '6h', gender: 'F', badge: 'Clear',   admitted: '2026-04-20' },
  { id: 'P007', name: 'Mohan Gupta',   age: 66, ward: 'ICU-A',   status: 'suspect',  risk: 7.3, contacts: 11, since: '2d', gender: 'M', badge: 'MRSA',    admitted: '2026-04-18' },
];

const labResults = [
  { id: 'L001', patient: 'Ramesh Kumar',  test: 'MRSA Culture',  bacteria: 'S. aureus (MRSA)',   resistance: 'Critical', status: 'critical', date: '2026-04-20', ward: 'ICU-A',   resist: 96 },
  { id: 'L002', patient: 'Priya Sharma',  test: 'MDR-TB PCR',    bacteria: 'M. tuberculosis',    resistance: 'High',     status: 'warning',  date: '2026-04-20', ward: 'Ward-B3', resist: 78 },
  { id: 'L003', patient: 'Ajay Singh',    test: 'CRE Screen',    bacteria: 'K. pneumoniae',      resistance: 'Critical', status: 'critical', date: '2026-04-19', ward: 'ICU-B',   resist: 94 },
  { id: 'L004', patient: 'Sita Devi',     test: 'Blood Culture', bacteria: 'E. coli (ESBL)',     resistance: 'Medium',   status: 'warning',  date: '2026-04-19', ward: 'Ward-C1', resist: 55 },
  { id: 'L005', patient: 'Vikram Rao',    test: 'Urine C&S',     bacteria: 'P. aeruginosa',      resistance: 'High',     status: 'critical', date: '2026-04-18', ward: 'Ward-D2', resist: 81 },
];

const newsFeedItems = [
  { id: 1, time: '20:41', event: 'New CRE case confirmed — ICU-B, Bed 3', severity: 'critical', ward: 'ICU-B', tag: 'New Case' },
  { id: 2, time: '20:15', event: 'AI flagged 3 new exposure contacts in Ward-B3', severity: 'warning', ward: 'Ward-B3', tag: 'AI Alert' },
  { id: 3, time: '19:52', event: 'MDR-TB risk score increased 18% in 2 hours', severity: 'warning', ward: 'Global', tag: 'Risk Update' },
  { id: 4, time: '19:30', event: 'LabSync completed — 5 new results loaded', severity: 'info', ward: 'Lab', tag: 'LabSync' },
  { id: 5, time: '18:55', event: 'ICU-A quarantine protocol auto-activated', severity: 'critical', ward: 'ICU-A', tag: 'Protocol' },
  { id: 6, time: '18:22', event: 'Dr. Mehra reviewed exposure chain for P001', severity: 'info', ward: 'ICU-A', tag: 'Review' },
  { id: 7, time: '17:40', event: 'PPE compliance dropped to 76% — Ward-D2', severity: 'warning', ward: 'Ward-D2', tag: 'Compliance' },
  { id: 8, time: '17:10', event: 'MDR-TB batch screening: 12 patients cleared', severity: 'info', ward: 'OPD', tag: 'Screening' },
  { id: 9, time: '16:30', event: 'Visitor P001 contact logged — 18 min exposure', severity: 'warning', ward: 'ICU-A', tag: 'Contact' },
  { id: 10, time: '15:50', event: 'New resistance profile uploaded — MRSA strain B', severity: 'info', ward: 'Lab', tag: 'Lab' },
];

const trendData = [
  { time: '00:00', risk: 22, cases: 4  }, { time: '04:00', risk: 28, cases: 5  },
  { time: '08:00', risk: 68, cases: 12 }, { time: '12:00', risk: 82, cases: 18 },
  { time: '16:00', risk: 91, cases: 22 }, { time: '20:00', risk: 76, cases: 17 },
];

const wardBeds = [
  { ward: 'ICU-A',   color: '#DC2626', beds: [
    { id:1, risk:9.2, name:'Ramesh', occ:true },  { id:2, risk:7.3, name:'Mohan', occ:true },
    { id:3, risk:4.1, name:'Anita',  occ:true },  { id:4, risk:0,   name:'',      occ:false },
    { id:5, risk:3.2, name:'Rita',   occ:true },  { id:6, risk:8.0, name:'Karan', occ:true },
    { id:7, risk:0,   name:'',       occ:false }, { id:8, risk:5.5, name:'Dev',   occ:true },
  ]},
  { ward: 'ICU-B',   color: '#D97706', beds: [
    { id:1, risk:8.9, name:'Ajay',  occ:true },  { id:2, risk:5.4, name:'Sita',  occ:true },
    { id:3, risk:0,   name:'',      occ:false }, { id:4, risk:6.1, name:'Suresh',occ:true },
    { id:5, risk:7.2, name:'Kavya', occ:true },  { id:6, risk:0,   name:'',      occ:false },
  ]},
  { ward: 'Ward-B3', color: '#0891B2', beds: [
    { id:1, risk:6.8, name:'Priya', occ:true },  { id:2, risk:2.1, name:'Leela', occ:true },
    { id:3, risk:0,   name:'',      occ:false }, { id:4, risk:1.5, name:'Raj',   occ:true },
    { id:5, risk:4.3, name:'Uma',   occ:true },  { id:6, risk:0,   name:'',      occ:false },
    { id:7, risk:7.2, name:'Arjun', occ:true },  { id:8, risk:0,   name:'',      occ:false },
    { id:9, risk:3.8, name:'Devi',  occ:true },  { id:10,risk:0,   name:'',      occ:false },
  ]},
  { ward: 'Ward-C1', color: '#059669', beds: [
    { id:1, risk:5.4, name:'Sita',  occ:true }, { id:2, risk:1.2, name:'Gita',  occ:true },
    { id:3, risk:0,   name:'',      occ:false}, { id:4, risk:3.7, name:'Ravi',  occ:true },
    { id:5, risk:0,   name:'',      occ:false}, { id:6, risk:2.5, name:'Asha',  occ:true },
    { id:7, risk:4.1, name:'Tara',  occ:true }, { id:8, risk:0,   name:'',      occ:false},
  ]},
];

/* ═══ HELPERS (theme-aware — accept tk from context) ═══ */
const riskColor  = (r: number, tk: TokenMap = LIGHT_TOKENS) => r >= 8 ? tk.red : r >= 5 ? tk.amber : r >= 3 ? (tk.isDark ? '#F59E0B' : '#B45309') : tk.green;
const riskBg     = (r: number, tk: TokenMap = LIGHT_TOKENS) => r >= 8 ? tk.redSoft : r >= 5 ? tk.amberSoft : r >= 3 ? (tk.isDark ? 'rgba(245,158,11,0.12)' : '#FFFBEB') : tk.greenSoft;
const statusColor = (s: string, tk: TokenMap = LIGHT_TOKENS) =>
  s === 'positive' || s === 'critical' ? tk.red :
  s === 'suspect'  || s === 'warning'  ? tk.amber :
  s === 'clear'    || s === 'info'     ? tk.green : tk.txtMuted;
const statusBg = (s: string, tk: TokenMap = LIGHT_TOKENS) =>
  s === 'positive' || s === 'critical' ? tk.redSoft :
  s === 'suspect'  || s === 'warning'  ? tk.amberSoft :
  s === 'clear'    || s === 'info'     ? tk.greenSoft : tk.surface;

/* ═══════════════════════════════════════════════
   SHARED UI PIECES — all use useT() for live theme
═══════════════════════════════════════════════ */
const PageShell = ({ children, title, subtitle, onBack, accent }: {
  children: React.ReactNode; title: string; subtitle: string;
  onBack: () => void; accent?: string;
}) => {
  const tk = useT();
  const ac = accent || tk.blue;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.28, ease: 'easeOut' }}
      style={{ minHeight: '100%', background: tk.pageBg, margin: '-24px -28px -28px', padding: '0 0 40px', transition: 'background 0.3s' }}
    >
      {/* Page Header */}
      <div style={{
        background: tk.white, borderBottom: `1px solid ${tk.border}`,
        padding: '18px 32px', display: 'flex', alignItems: 'center',
        gap: 16, position: 'sticky', top: 0, zIndex: 50,
        boxShadow: tk.shadowSm, transition: 'background 0.3s',
      }}>
        <button
          onClick={onBack}
          style={{
            width: 36, height: 36, borderRadius: 10, border: `1px solid ${tk.border}`,
            background: tk.white, cursor: 'pointer', display: 'flex', alignItems: 'center',
            justifyContent: 'center', color: tk.txtSec, transition: 'all 0.2s',
            boxShadow: tk.shadowSm,
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = tk.surface; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = tk.white; }}
        >
          <ArrowLeft size={16} color={tk.txtSec} />
        </button>
        <div style={{ width: 1, height: 24, background: tk.border }} />
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: ac, flexShrink: 0, boxShadow: `0 0 0 3px ${ac}30` }} />
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: tk.txt, lineHeight: 1.2, fontFamily: 'Outfit, Inter, sans-serif' }}>{title}</div>
          <div style={{ fontSize: 12, color: tk.txtMuted, marginTop: 1 }}>{subtitle}</div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: tk.green, padding: '4px 10px', borderRadius: 99, background: tk.greenSoft, border: `1px solid ${tk.green}30` }}>
            <div className="mdr-pulse-dot" style={{ width: 6, height: 6, borderRadius: '50%', background: tk.green }} />
            Live System
          </div>
        </div>
      </div>
      <div style={{ padding: '28px 32px 0' }}>
        {children}
      </div>
    </motion.div>
  );
};

const Card = ({ children, style = {}, onClick, accent }: {
  children: React.ReactNode; style?: React.CSSProperties;
  onClick?: () => void; accent?: string;
}) => {
  const tk = useT();
  return (
    <div
      onClick={onClick}
      style={{
        background: tk.white, borderRadius: 16, border: `1px solid ${tk.border}`,
        boxShadow: tk.shadowMd, transition: 'all 0.22s cubic-bezier(0.34,1.56,0.64,1)',
        cursor: onClick ? 'pointer' : undefined,
        ...(accent ? { borderTop: `3px solid ${accent}` } : {}),
        ...style,
      }}
      onMouseEnter={onClick ? e => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = tk.shadowLg;
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)';
      } : undefined}
      onMouseLeave={onClick ? e => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = tk.shadowMd;
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
      } : undefined}
    >
      {children}
    </div>
  );
};

const Chip = ({ label, color, bg }: { label: string; color: string; bg: string }) => (
  <span style={{ fontSize: 10, fontWeight: 700, color, background: bg, borderRadius: 99, padding: '2px 8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
    {label}
  </span>
);

const RiskBar = ({ score, max = 10 }: { score: number; max?: number }) => {
  const tk = useT();
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 11, color: tk.txtMuted }}>Risk Score</span>
        <span style={{ fontSize: 12, fontWeight: 700, color: riskColor(score, tk) }}>{score}/10</span>
      </div>
      <div style={{ height: 6, background: tk.surface, borderRadius: 99, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${(score / max) * 100}%`, background: `linear-gradient(90deg, ${riskColor(score, tk)}, ${riskColor(score, tk)}cc)`, borderRadius: 99, transition: 'width 1s ease' }} />
      </div>
    </div>
  );
};

const StatPill = ({ label, value, color, soft }: { label: string; value: string | number; color: string; soft: string }) => (
  <div style={{ background: soft, border: `1px solid ${color}30`, borderRadius: 14, padding: '14px 18px', flex: 1, minWidth: 110 }}>
    <div style={{ fontSize: 26, fontWeight: 900, color, fontFamily: 'Outfit, sans-serif', lineHeight: 1 }}>{value}</div>
    <div style={{ fontSize: 11, color, opacity: 0.7, marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>{label}</div>
  </div>
);



/* ═══════════════════════════════════════════════════════
   1. HOME PAGE
═══════════════════════════════════════════════════════ */
type FeatureId = 'patients' | 'status' | 'tracenet' | 'labsync' | 'beds' |
  'screening' | 'chatbot' | 'newsfeed' | 'care' | 'camera' | 'surveillance';

interface FeatureDef {
  id: FeatureId; title: string; desc: string;
  icon: string; accentKey: string; tag: string;
}

const FEATURE_DEFS: FeatureDef[] = [
  { id: 'patients',     title: 'Patient Clinical Insights', desc: 'Medical profiles, risk scores, lab history & MDR markers', icon: '🧑‍⚕️', accentKey: 'blue',   tag: 'Clinical' },
  { id: 'status',       title: 'Patient Status Panel',      desc: 'Live table & cards — filter by MDR status, risk level',   icon: '📋', accentKey: 'purple', tag: 'Monitoring' },
  { id: 'tracenet',     title: 'MDR TraceNet',              desc: 'Exposure chain mapping — contact graph & risk analysis',   icon: '🧬', accentKey: 'red',    tag: 'AI Network' },
  { id: 'labsync',      title: 'LabSync Integration',       desc: 'Auto-sync lab results, resistance profiles & reports',    icon: '🔬', accentKey: 'teal',   tag: 'Diagnostics' },
  { id: 'beds',         title: 'Patient Bed Status',        desc: 'Visual ward layout — occupancy & risk color overlay',     icon: '🛏️', accentKey: 'amber',  tag: 'Ward View' },
  { id: 'screening',    title: 'MDR Screening UI',          desc: 'AI-powered triage form — instant risk score in seconds',  icon: '🤖', accentKey: 'purple', tag: 'AI Tool' },
  { id: 'chatbot',      title: 'AI MDR Assistant',          desc: 'Ask about patients, wards, alerts — ChatGPT for hospital',icon: '💬', accentKey: 'blue',   tag: 'Assistant' },
  { id: 'newsfeed',     title: 'MDR Case Newsfeed',         desc: 'Live event log — new cases, alerts & protocol updates',   icon: '📡', accentKey: 'red',    tag: 'Feed' },
  { id: 'care',         title: 'MDR Care & Safety',         desc: 'Isolation steps, PPE protocols, decontamination guide',   icon: '🛡️', accentKey: 'green',  tag: 'Safety' },
  { id: 'camera',       title: 'Camera & Tracking',         desc: 'Live camera feeds & real-time patient movement logs',     icon: '📷', accentKey: 'teal',   tag: 'Surveillance' },
  { id: 'surveillance', title: 'Live Surveillance',         desc: 'Full-screen MDR tracking — maps, graphs & analytics',    icon: '🔴', accentKey: 'red',    tag: 'LIVE' },
];


const HomePage = ({ onNavigate }: { onNavigate: (id: FeatureId) => void }) => {
  const tk = useT();
  const [liveRisk, setLiveRisk] = useState(87);
  const [liveAlerts, setLiveAlerts] = useState(9);
  const [livePositive, setLivePositive] = useState(22);

  useEffect(() => {
    const t = setInterval(() => {
      setLiveRisk(r => Math.min(99, Math.max(55, r + (Math.random() - 0.48) * 4)));
      if (Math.random() > 0.8) setLiveAlerts(a => Math.min(15, a + 1));
    }, 4000);
    return () => clearInterval(t);
  }, []);

  const accentMap: Record<string, { accent: string; soft: string }> = {
    blue:   { accent: tk.blue,   soft: tk.blueSoft   },
    purple: { accent: tk.purple, soft: tk.purpleSoft },
    red:    { accent: tk.red,    soft: tk.redSoft    },
    teal:   { accent: tk.teal,   soft: tk.tealSoft   },
    amber:  { accent: tk.amber,  soft: tk.amberSoft  },
    green:  { accent: tk.green,  soft: tk.greenSoft  },
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      style={{ minHeight: '100%', margin: '-24px -28px -28px', background: tk.pageBg, fontFamily: 'Inter, Outfit, system-ui, sans-serif', transition: 'background 0.3s' }}
    >
      {/* ── HERO BANNER ─────────────────────────────── */}
      <div style={{
        background: tk.heroBg,
        padding: '48px 40px 40px', position: 'relative', overflow: 'hidden',
      }}>
        {/* BG orbs */}
        <div style={{ position: 'absolute', right: 80, top: -60, width: 320, height: 320, borderRadius: '50%', background: 'rgba(37,99,235,0.15)', filter: 'blur(60px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', right: -40, bottom: -100, width: 260, height: 260, borderRadius: '50%', background: 'rgba(124,58,237,0.12)', filter: 'blur(50px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', left: '50%', top: '50%', width: 500, height: 300, background: 'rgba(0,0,0,0)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', maxWidth: 900 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <div style={{ padding: '4px 12px', borderRadius: 99, background: 'rgba(220,38,38,0.25)', border: '1px solid rgba(220,38,38,0.45)', fontSize: 11, fontWeight: 700, color: '#FCA5A5', display: 'flex', alignItems: 'center', gap: 6 }}>
              <div className="mdr-pulse-dot" style={{ width: 6, height: 6, borderRadius: '50%', background: '#EF4444' }} />
              LIVE — MDR COMMAND ACTIVE
            </div>
            <div style={{ padding: '4px 12px', borderRadius: 99, background: 'rgba(255,255,255,0.08)', fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>
              Amrit Sparsh • v2.0
            </div>
          </div>

          <h1 style={{ fontSize: 38, fontWeight: 900, color: '#FFFFFF', fontFamily: 'Outfit, sans-serif', lineHeight: 1.15, margin: 0, marginBottom: 12 }}>
            MDR Surveillance<br />
            <span style={{ background: 'linear-gradient(90deg, #60A5FA, #A78BFA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Platform
            </span>
          </h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.6)', maxWidth: 520, lineHeight: 1.65, margin: '0 0 28px' }}>
            AI-powered Multi-Drug Resistant infection tracking, contact tracing, and hospital intelligence — built for AIIMS-level deployment.
          </p>

          {/* Live Stats Strip */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {[
              { label: 'Patients Monitored', val: '247', color: '#60A5FA' },
              { label: 'MDR Positive',        val: String(livePositive), color: '#F87171' },
              { label: 'Active Alerts',        val: String(liveAlerts), color: '#FBBF24' },
              { label: 'AI Risk Index',        val: `${liveRisk.toFixed(0)}%`, color: liveRisk > 80 ? '#F87171' : '#FBBF24' },
              { label: 'Contained',            val: '73%', color: '#34D399' },
            ].map(s => (
              <div key={s.label} style={{ background: 'rgba(255,255,255,0.07)', borderRadius: 12, padding: '10px 18px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ fontSize: 22, fontWeight: 900, color: s.color, fontFamily: 'Outfit, sans-serif', lineHeight: 1 }}>{s.val}</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', marginTop: 3, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── FEATURE GRID ─────────────────────────────── */}
      <div style={{ padding: '36px 40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, color: tk.txt, fontFamily: 'Outfit, sans-serif' }}>Feature Modules</div>
            <div style={{ fontSize: 13, color: tk.txtMuted, marginTop: 2 }}>Select a module to open its full workspace</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input placeholder="Search modules..." style={{ padding: '8px 14px', borderRadius: 10, border: `1px solid ${tk.border}`, fontSize: 13, color: tk.txt, outline: 'none', background: tk.white, boxShadow: tk.shadowSm }} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 18 }}>
          {FEATURE_DEFS.map((f, idx) => {
            const { accent, soft } = accentMap[f.accentKey] || accentMap.blue;
            return (
            <motion.div
              key={f.id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.045, duration: 0.32, ease: 'easeOut' }}
            >
              <div
                onClick={() => onNavigate(f.id)}
                style={{
                  background: tk.white, borderRadius: 20, border: `1px solid ${tk.border}`,
                  padding: '22px 22px 18px', cursor: 'pointer',
                  boxShadow: tk.shadowMd, transition: 'all 0.25s cubic-bezier(0.34,1.56,0.64,1)',
                  position: 'relative', overflow: 'hidden',
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLDivElement;
                  el.style.boxShadow = tk.shadowXl;
                  el.style.transform = 'translateY(-5px)';
                  el.style.borderColor = `${accent}40`;
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLDivElement;
                  el.style.boxShadow = tk.shadowMd;
                  el.style.transform = 'translateY(0)';
                  el.style.borderColor = tk.border;
                }}
              >
                {/* Top accent line */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${accent}, ${accent}66)`, borderRadius: '20px 20px 0 0' }} />

                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 14, background: soft, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, border: `1px solid ${accent}20` }}>
                    {f.icon}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: accent, background: soft, borderRadius: 99, padding: '2px 8px', textTransform: 'uppercase' as const, letterSpacing: '0.04em' }}>{f.tag}</span>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: soft, border: `1px solid ${accent}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: accent }}>
                      <Plus size={14} />
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: 15, fontWeight: 700, color: tk.txt, marginBottom: 6, lineHeight: 1.3, fontFamily: 'Outfit, sans-serif' }}>{f.title}</div>
                <div style={{ fontSize: 12.5, color: tk.txtMuted, lineHeight: 1.55 }}>{f.desc}</div>

                <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 5, color: accent, fontSize: 12, fontWeight: 600 }}>
                  Open Module <ChevronRight size={13} />
                </div>
              </div>
            </motion.div>
          );
          })}
        </div>

        {/* Bottom CTA */}
        <div style={{ marginTop: 40, background: `linear-gradient(135deg, ${tk.blueSoft}, ${tk.purpleSoft})`, borderRadius: 20, border: `1px solid ${tk.blue}20`, padding: '28px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: tk.txt, marginBottom: 4, fontFamily: 'Outfit, sans-serif' }}>Ready for AIIMS-level deployment</div>
            <div style={{ fontSize: 13, color: tk.txtSec }}>Connect your hospital EHR, lab system, and camera network for full AI-powered surveillance</div>
          </div>
          <button
            onClick={() => onNavigate('surveillance')}
            style={{ padding: '12px 24px', borderRadius: 14, background: `linear-gradient(135deg, ${tk.blue}, ${tk.purple})`, border: 'none', color: 'white', fontSize: 14, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', boxShadow: `0 4px 16px ${tk.blue}40` }}
          >
            🔴 View Live Dashboard
          </button>
        </div>
      </div>
    </motion.div>
  );
};

/* ═══════════════════════════════════════════════════════
   2. PATIENT CLINICAL INSIGHTS
═══════════════════════════════════════════════════════ */
const PatientClinicalPage = ({ onBack }: { onBack: () => void }) => {
  const [selected, setSelected] = useState(patients[0]);
  const [tab, setTab] = useState<'overview' | 'history' | 'risk'>('overview');

  const timeline = [
    { date: '2026-04-20', event: 'MDR culture positive — XDR strain confirmed', type: 'critical' },
    { date: '2026-04-19', event: 'Blood sample collected for sensitivity testing', type: 'info' },
    { date: '2026-04-18', event: 'Admitted to ICU-A — suspected drug resistance', type: 'warning' },
    { date: '2026-04-15', event: 'Referred from district hospital — TB symptoms', type: 'info' },
    { date: '2026-04-10', event: 'First-line antibiotics failed — switched protocol', type: 'warning' },
  ];

  return (
    <PageShell title="Patient Clinical Insights" subtitle="Full medical profile, risk scoring & MDR history" onBack={onBack} accent={T.blue}>
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 20 }}>
        {/* Patient List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: T.txtMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>All Patients</div>
          {patients.map(p => (
            <div key={p.id} onClick={() => setSelected(p)} style={{
              background: selected.id === p.id ? T.blueSoft : T.white,
              border: `1px solid ${selected.id === p.id ? T.blue + '40' : T.border}`,
              borderRadius: 12, padding: '12px 14px', cursor: 'pointer',
              transition: 'all 0.18s', boxShadow: T.shadowSm,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: statusBg(p.status), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
                  {p.gender === 'M' ? '👨' : '👩'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: T.txt, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: T.txtMuted }}>{p.ward} · {p.age}y</div>
                </div>
                <Chip label={p.badge} color={statusColor(p.status)} bg={statusBg(p.status)} />
              </div>
              <RiskBar score={p.risk} />
            </div>
          ))}
        </div>

        {/* Detail Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Card style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 56, height: 56, borderRadius: 16, background: statusBg(selected.status), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>
                  {selected.gender === 'M' ? '👨' : '👩'}
                </div>
                <div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: T.txt, fontFamily: 'Outfit, sans-serif' }}>{selected.name}</div>
                  <div style={{ fontSize: 13, color: T.txtSec }}>{selected.age} years · {selected.gender === 'M' ? 'Male' : 'Female'} · ID: {selected.id}</div>
                  <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                    <Chip label={selected.badge} color={statusColor(selected.status)} bg={statusBg(selected.status)} />
                    <Chip label={selected.ward} color={T.blue} bg={T.blueSoft} />
                    <Chip label={`${selected.since} ago`} color={T.txtSec} bg={T.surface} />
                  </div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 36, fontWeight: 900, color: riskColor(selected.risk), fontFamily: 'Outfit, sans-serif', lineHeight: 1 }}>{selected.risk}</div>
                <div style={{ fontSize: 11, color: T.txtMuted }}>Risk Score /10</div>
                <div style={{ marginTop: 8, padding: '4px 12px', borderRadius: 99, background: statusBg(selected.status), color: statusColor(selected.status), fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>
                  {selected.status}
                </div>
              </div>
            </div>
          </Card>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 4, background: T.surface, borderRadius: 12, padding: 4 }}>
            {(['overview', 'history', 'risk'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)} style={{
                flex: 1, padding: '8px 0', borderRadius: 8, border: 'none', cursor: 'pointer',
                fontSize: 13, fontWeight: tab === t ? 700 : 500,
                background: tab === t ? T.white : 'transparent',
                color: tab === t ? T.txt : T.txtMuted,
                boxShadow: tab === t ? T.shadowSm : 'none',
                transition: 'all 0.18s', textTransform: 'capitalize',
              }}>{t}</button>
            ))}
          </div>

          {tab === 'overview' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {[
                ['Patient ID', selected.id], ['Ward', selected.ward],
                ['Admitted', selected.admitted], ['MDR Type', selected.badge],
                ['Status', selected.status.toUpperCase()], ['Contacts Exposed', `${selected.contacts} people`],
                ['Lab Tests', '3 pending'], ['Antibiotic Protocol', 'Modified Regimen B'],
              ].map(([label, value]) => (
                <div key={label} style={{ background: T.surface, borderRadius: 12, padding: '12px 14px' }}>
                  <div style={{ fontSize: 10, color: T.txtMuted, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 3 }}>{label}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: T.txt }}>{value}</div>
                </div>
              ))}
            </div>
          )}

          {tab === 'history' && (
            <Card style={{ padding: 20 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: T.txt, marginBottom: 16 }}>Medical Timeline</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {timeline.map((t, i) => (
                  <div key={i} style={{ display: 'flex', gap: 14, paddingBottom: 16, position: 'relative' }}>
                    {i < timeline.length - 1 && <div style={{ position: 'absolute', left: 11, top: 24, bottom: 0, width: 1, background: T.border }} />}
                    <div style={{ width: 24, height: 24, borderRadius: '50%', flexShrink: 0, background: t.type === 'critical' ? T.redSoft : t.type === 'warning' ? T.amberSoft : T.blueSoft, border: `1.5px solid ${statusColor(t.type)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: statusColor(t.type) }} />
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: T.txtMuted, marginBottom: 2 }}>{t.date}</div>
                      <div style={{ fontSize: 13, color: T.txt }}>{t.event}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {tab === 'risk' && (
            <Card style={{ padding: 20 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: T.txt, marginBottom: 16 }}>AI Risk Breakdown</div>
              {[
                ['Drug Resistance', selected.risk * 10, riskColor(selected.risk)],
                ['Contact Exposure', Math.min(selected.contacts * 7, 95), T.amber],
                ['Treatment Response', selected.status === 'clear' ? 15 : 75, T.red],
                ['Environmental Risk', 62, T.purple],
                ['Immunity Status', 45, T.teal],
              ].map(([l, v, c]) => (
                <div key={l as string} style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ fontSize: 13, color: T.txt }}>{l}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: c as string }}>{(v as number).toFixed(0)}%</span>
                  </div>
                  <div style={{ height: 6, background: T.surface, borderRadius: 99 }}>
                    <div style={{ height: '100%', width: `${v}%`, background: `linear-gradient(90deg, ${c}, ${c as string}99)`, borderRadius: 99 }} />
                  </div>
                </div>
              ))}
            </Card>
          )}
        </div>
      </div>
    </PageShell>
  );
};

/* ═══ PATIENT STATUS PAGE ═══ */
const PatientStatusPage = ({ onBack }: { onBack: () => void }) => {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const filtered = patients
    .filter(p => filter === 'all' || p.status === filter)
    .filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.ward.toLowerCase().includes(search.toLowerCase()));

  return (
    <PageShell title="Patient Status Panel" subtitle="Real-time MDR status for all monitored patients" onBack={onBack} accent={T.purple}>
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: T.txtMuted }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or ward..."
            style={{ width: '100%', padding: '10px 14px 10px 34px', borderRadius: 10, border: `1px solid ${T.border}`, fontSize: 13, color: T.txt, outline: 'none', background: T.white, boxShadow: T.shadowSm }} />
        </div>
        {['all', 'positive', 'suspect', 'clear'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '8px 16px', borderRadius: 10, border: `1px solid ${filter === f ? T.purple + '50' : T.border}`,
            background: filter === f ? T.purpleSoft : T.white,
            color: filter === f ? T.purple : T.txtSec, fontSize: 12, fontWeight: 700, cursor: 'pointer', textTransform: 'capitalize',
            boxShadow: T.shadowSm,
          }}>{f}</button>
        ))}
      </div>

      {/* Stats Row */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <StatPill label="Total"    value={patients.length}                           color={T.blue}   soft={T.blueSoft} />
        <StatPill label="Positive" value={patients.filter(p=>p.status==='positive').length} color={T.red}    soft={T.redSoft} />
        <StatPill label="Suspect"  value={patients.filter(p=>p.status==='suspect').length}  color={T.amber}  soft={T.amberSoft} />
        <StatPill label="Cleared"  value={patients.filter(p=>p.status==='clear').length}    color={T.green}  soft={T.greenSoft} />
      </div>

      {/* Table */}
      <Card style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: T.surface }}>
              {['Patient', 'Ward', 'MDR Type', 'Risk Score', 'Status', 'Contacts', 'Since', 'Action'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: T.txtMuted, letterSpacing: '0.04em', textTransform: 'uppercase', borderBottom: `1px solid ${T.border}` }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((p, i) => (
              <tr key={p.id} style={{ borderBottom: `1px solid ${T.border}`, background: i % 2 === 0 ? T.white : T.pageBg, transition: 'background 0.15s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLTableRowElement).style.background = T.blueSoft; }}
                onMouseLeave={e => { (e.currentTarget as HTMLTableRowElement).style.background = i % 2 === 0 ? T.white : T.pageBg; }}>
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: statusBg(p.status), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>{p.gender === 'M' ? '👨' : '👩'}</div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: T.txt }}>{p.name}</div>
                      <div style={{ fontSize: 11, color: T.txtMuted }}>{p.id} · {p.age}y</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '14px 16px', fontSize: 13, color: T.txt }}>{p.ward}</td>
                <td style={{ padding: '14px 16px' }}><Chip label={p.badge} color={statusColor(p.status)} bg={statusBg(p.status)} /></td>
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 48, height: 6, background: T.surface, borderRadius: 99, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${p.risk * 10}%`, background: riskColor(p.risk), borderRadius: 99 }} />
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: riskColor(p.risk) }}>{p.risk}</span>
                  </div>
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 99, background: statusBg(p.status), border: `1px solid ${statusColor(p.status)}30` }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: statusColor(p.status) }} />
                    <span style={{ fontSize: 11, fontWeight: 700, color: statusColor(p.status), textTransform: 'capitalize' }}>{p.status}</span>
                  </div>
                </td>
                <td style={{ padding: '14px 16px', fontSize: 13, color: T.txt, fontWeight: 600 }}>{p.contacts}</td>
                <td style={{ padding: '14px 16px', fontSize: 12, color: T.txtMuted }}>{p.since}</td>
                <td style={{ padding: '14px 16px' }}>
                  <button style={{ padding: '5px 12px', borderRadius: 8, background: T.blueSoft, border: `1px solid ${T.blue}30`, color: T.blue, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </PageShell>
  );
};

/* ═══ MDR TRACENET PAGE ═══ */
const TraceNetPage = ({ onBack }: { onBack: () => void }) => {
  const [selectedNode, setSelectedNode] = useState<string | null>('P001');

  const nodes = [
    { id: 'P001', x: 50,  y: 18, risk: 9.2, label: 'Ramesh', sub: 'ICU-A', type: 'patient' },
    { id: 'P003', x: 78,  y: 42, risk: 8.9, label: 'Ajay',   sub: 'ICU-B', type: 'patient' },
    { id: 'P005', x: 20,  y: 48, risk: 8.1, label: 'Vikram', sub: 'D2',    type: 'patient' },
    { id: 'P002', x: 62,  y: 72, risk: 6.8, label: 'Priya',  sub: 'B3',    type: 'patient' },
    { id: 'P007', x: 34,  y: 28, risk: 7.3, label: 'Mohan',  sub: 'ICU-A', type: 'patient' },
    { id: 'D001', x: 54,  y: 52, risk: 3.1, label: 'Dr. Mehra', sub: 'Staff', type: 'staff' },
    { id: 'N001', x: 14,  y: 72, risk: 2.1, label: 'Nurse A',   sub: 'Staff', type: 'staff' },
    { id: 'V001', x: 84,  y: 20, risk: 1.2, label: 'Visitor',   sub: 'Unregist.', type: 'visitor' },
  ];
  const edges = [
    { a:'P001', b:'P007', type:'high', prob:87, dur:'45min' },
    { a:'P001', b:'D001', type:'med',  prob:72, dur:'18min' },
    { a:'P003', b:'D001', type:'high', prob:91, dur:'32min' },
    { a:'P003', b:'P002', type:'med',  prob:61, dur:'12min' },
    { a:'P005', b:'N001', type:'low',  prob:38, dur:'28min' },
    { a:'P007', b:'D001', type:'med',  prob:68, dur:'22min' },
    { a:'P001', b:'V001', type:'low',  prob:29, dur:'9min'  },
    { a:'P005', b:'P007', type:'high', prob:83, dur:'60min' },
  ];
  const nodeMap = Object.fromEntries(nodes.map(n => [n.id, n]));
  const edgeColor = (t: string) => t === 'high' ? T.red : t === 'med' ? T.amber : T.teal;
  const nc = (r: number) => r >= 8 ? T.red : r >= 5 ? T.amber : r >= 3 ? T.teal : T.green;
  const sn = nodes.find(n => n.id === selectedNode);
  const relEdges = edges.filter(e => e.a === selectedNode || e.b === selectedNode);
  const contacts = [...new Set(relEdges.flatMap(e => [e.a, e.b]).filter(x => x !== selectedNode))];

  return (
    <PageShell title="MDR TraceNet" subtitle="AI exposure chain mapping — contact graph & risk probability" onBack={onBack} accent={T.red}>
      <div style={{ display: 'flex', gap: 16, marginBottom: 14 }}>
        {[['⏱ Time Range', '24h'], ['🏥 All Wards', ''], ['📊 All Risk Levels', '']].map(([label, val]) => (
          <button key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 10, border: `1px solid ${T.border}`, background: T.white, color: T.txtSec, fontSize: 12, fontWeight: 500, cursor: 'pointer', boxShadow: T.shadowSm }}>
            {label} <ChevronDown size={12} />
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr 260px', gap: 16 }}>
        {/* Patient List */}
        <Card style={{ padding: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: T.txtMuted, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 10 }}>Network Nodes</div>
          {nodes.map(n => (
            <div key={n.id} onClick={() => setSelectedNode(n.id)}
              style={{ padding: '9px 10px', borderRadius: 10, cursor: 'pointer', marginBottom: 4, background: selectedNode === n.id ? riskBg(n.risk) : 'transparent', border: `1px solid ${selectedNode === n.id ? nc(n.risk) + '40' : 'transparent'}`, transition: 'all 0.15s' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: riskBg(n.risk), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>
                  {n.type === 'patient' ? '🧑' : n.type === 'staff' ? '👨‍⚕️' : '👤'}
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: T.txt }}>{n.label}</div>
                  <div style={{ fontSize: 10, color: T.txtMuted }}>{n.sub}</div>
                </div>
                <div style={{ marginLeft: 'auto', fontSize: 12, fontWeight: 800, color: nc(n.risk) }}>{n.risk}</div>
              </div>
            </div>
          ))}
        </Card>

        {/* Network Graph */}
        <Card style={{ overflow: 'hidden', padding: 0 }}>
          <div style={{ padding: '14px 16px', borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.txt }}>Exposure Network Graph</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {[['High', T.red], ['Medium', T.amber], ['Low', T.teal]].map(([l, c]) => (
                <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: T.txtSec }}>
                  <div style={{ width: 16, height: 2, background: c as string, borderRadius: 1 }} />{l}
                </div>
              ))}
            </div>
          </div>
          <svg viewBox="0 0 100 90" style={{ width: '100%', height: 420 }}>
            <defs>
              <radialGradient id="tnBg"><stop offset="0%" stopColor="#FAFBFF" /><stop offset="100%" stopColor="#F0F2F8" /></radialGradient>
            </defs>
            <rect x="0" y="0" width="100" height="90" fill="url(#tnBg)" />
            {/* Grid */}
            {[20,40,60,80].map(v => <line key={`h${v}`} x1="0" y1={v} x2="100" y2={v} stroke={T.border} strokeWidth="0.3" />)}
            {[20,40,60,80].map(v => <line key={`v${v}`} x1={v} y1="0" x2={v} y2="90" stroke={T.border} strokeWidth="0.3" />)}
            {/* Edges */}
            {edges.map((e, i) => {
              const na = nodeMap[e.a], nb = nodeMap[e.b];
              const c = edgeColor(e.type);
              return (
                <g key={i}>
                  <line x1={na.x} y1={na.y} x2={nb.x} y2={nb.y} stroke={c} strokeWidth="0.8"
                    strokeDasharray={e.type === 'low' ? '2 2' : undefined} opacity={selectedNode && e.a !== selectedNode && e.b !== selectedNode ? 0.2 : 0.8} />
                  <text x={(na.x+nb.x)/2} y={(na.y+nb.y)/2 - 1} textAnchor="middle" fill={c} fontSize="2.5" fontWeight="700" opacity="0.9">{e.prob}%</text>
                </g>
              );
            })}
            {/* Nodes */}
            {nodes.map(n => {
              const c = nc(n.risk); const r = n.risk >= 7 ? 6 : 5;
              const isSel = selectedNode === n.id;
              return (
                <g key={n.id} style={{ cursor: 'pointer' }} onClick={() => setSelectedNode(n.id)}>
                  {isSel && <circle cx={n.x} cy={n.y} r={r + 4} fill={`${c}20`} stroke={`${c}80`} strokeWidth="0.5" />}
                  <circle cx={n.x} cy={n.y} r={r} fill={isSel ? c : `${c}30`} stroke={c} strokeWidth={isSel ? 1.5 : 1} />
                  <text x={n.x} y={n.y + 1} textAnchor="middle" fill={isSel ? 'white' : c} fontSize="3.5" fontWeight="800" fontFamily="Outfit">{n.risk}</text>
                  <text x={n.x} y={n.y + r + 4.5} textAnchor="middle" fill={T.txt} fontSize="3.2" fontFamily="Inter">{n.label}</text>
                </g>
              );
            })}
          </svg>
        </Card>

        {/* Risk Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {sn && (
            <Card style={{ padding: 18 }} accent={nc(sn.risk)}>
              <div style={{ fontSize: 14, fontWeight: 800, color: T.txt, marginBottom: 2 }}>{sn.label}</div>
              <div style={{ fontSize: 12, color: T.txtMuted, marginBottom: 14 }}>{sn.sub} · {sn.id}</div>
              <div style={{ fontSize: 36, fontWeight: 900, color: nc(sn.risk), fontFamily: 'Outfit, sans-serif', lineHeight: 1, marginBottom: 4 }}>{sn.risk}</div>
              <div style={{ fontSize: 11, color: T.txtMuted, marginBottom: 14 }}>Risk Score / 10</div>
              <RiskBar score={sn.risk} />
            </Card>
          )}
          <Card style={{ padding: 18 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: T.txtMuted, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 10 }}>Exposure Events</div>
            {relEdges.map((e, i) => {
              const other = e.a === selectedNode ? e.b : e.a;
              const oth = nodeMap[other];
              return (
                <div key={i} style={{ padding: '10px 0', borderBottom: `1px solid ${T.border}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: T.txt }}>{oth?.label}</span>
                    <span style={{ fontSize: 12, fontWeight: 800, color: edgeColor(e.type) }}>{e.prob}%</span>
                  </div>
                  <div style={{ fontSize: 11, color: T.txtMuted }}>Duration: {e.dur} · {e.type} exposure</div>
                  <div style={{ marginTop: 6, height: 4, background: T.surface, borderRadius: 99 }}>
                    <div style={{ height: '100%', width: `${e.prob}%`, background: edgeColor(e.type), borderRadius: 99 }} />
                  </div>
                </div>
              );
            })}
            {relEdges.length === 0 && <div style={{ fontSize: 12, color: T.txtMuted }}>No exposure events found</div>}
          </Card>
        </div>
      </div>
    </PageShell>
  );
};

/* ═══ LABSYNC PAGE ═══ */
const LabSyncPage = ({ onBack }: { onBack: () => void }) => {
  const [syncing, setSyncing] = useState(false);
  const handleSync = () => { setSyncing(true); setTimeout(() => setSyncing(false), 2000); };

  return (
    <PageShell title="LabSync Integration" subtitle="Auto-sync lab results, resistance profiles & bacteriology reports" onBack={onBack} accent={T.teal}>
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, alignItems: 'center' }}>
        <StatPill label="Synced Today" value="18" color={T.teal}  soft={T.tealSoft} />
        <StatPill label="Pending"      value="5"  color={T.amber} soft={T.amberSoft} />
        <StatPill label="Critical"     value="3"  color={T.red}   soft={T.redSoft} />
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 10 }}>
          <button onClick={handleSync} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px', borderRadius: 12, background: T.teal, border: 'none', color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer', boxShadow: `0 3px 10px ${T.teal}40` }}>
            <RefreshCw size={14} className={syncing ? 'mdr-float' : ''} />
            {syncing ? 'Syncing…' : 'Sync Now'}
          </button>
          <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px', borderRadius: 12, background: T.white, border: `1px solid ${T.border}`, color: T.txtSec, fontSize: 13, fontWeight: 600, cursor: 'pointer', boxShadow: T.shadowSm }}>
            <Upload size={14} /> Upload Report
          </button>
        </div>
      </div>

      {labResults.map((l, i) => (
        <motion.div key={l.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
          <Card style={{ padding: 22, marginBottom: 14 }} accent={l.status === 'critical' ? T.red : T.amber}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: l.status === 'critical' ? T.redSoft : T.amberSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>🦠</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 16, fontWeight: 800, color: T.txt, fontFamily: 'Outfit, sans-serif' }}>{l.patient}</span>
                  <Chip label={l.status} color={statusColor(l.status)} bg={statusBg(l.status)} />
                  <Chip label={l.ward} color={T.blue} bg={T.blueSoft} />
                </div>
                <div style={{ fontSize: 12, color: T.txtSec }}>{l.test} · {l.date}</div>
                <div style={{ display: 'flex', gap: 24, marginTop: 12 }}>
                  <div>
                    <div style={{ fontSize: 10, color: T.txtMuted, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 2 }}>Bacteria Detected</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: T.txt }}>{l.bacteria}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: T.txtMuted, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 2 }}>Drug Resistance</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: statusColor(l.status) }}>{l.resistance}</div>
                  </div>
                </div>
                <div style={{ marginTop: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 11, color: T.txtMuted }}>
                    <span>Antibiotic Resistance Profile</span>
                     <span style={{ fontWeight: 700, color: statusColor(l.status) }}>{l.resist}%</span>
                  </div>
                  <div style={{ height: 8, background: T.surface, borderRadius: 99 }}>
                    <motion.div initial={{ width: 0 }} animate={{ width: `${l.resist}%` }} transition={{ delay: 0.5, duration: 1 }}
                      style={{ height: '100%', borderRadius: 99, background: `linear-gradient(90deg, ${statusColor(l.status)}, ${statusColor(l.status)}88)` }} />
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
                <button style={{ padding: '7px 14px', borderRadius: 9, background: T.tealSoft, border: `1px solid ${T.teal}30`, color: T.teal, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>View Full Report</button>
                <button style={{ padding: '7px 14px', borderRadius: 9, background: T.surface, border: `1px solid ${T.border}`, color: T.txtSec, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>Send to TraceNet</button>
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </PageShell>
  );
};

/* === BED STATUS PAGE === */
interface BedPatient {
  name: string; age: number; doctor: string; status: string;
  risk: number; mdr: boolean; diagnosis: string; since: string;
  vitals: { hr: number; bp: string; spo2: number; temp: number };
}
interface WardBed {
  id: number; occ: boolean; patient?: BedPatient;
}
interface Ward {
  id: string; name: string; color: string; glowColor: string;
  type: 'icu' | 'general' | 'surgical' | 'mdr';
  beds: WardBed[];
  capacity: number;
}

const WARDS: Ward[] = [
  {
    id: 'icu-a', name: 'ICU Ward A', color: '#EF4444', glowColor: 'rgba(239,68,68,0.35)',
    type: 'icu', capacity: 8,
    beds: [
      { id: 1, occ: true,  patient: { name: 'Ramesh Kumar',  age: 54, doctor: 'Dr. Mehta',  status: 'critical', risk: 9.2, mdr: true,  diagnosis: 'XDR-TB + Sepsis',    since: '2d',  vitals: { hr: 118, bp: '88/52',  spo2: 86, temp: 38.9 } } },
      { id: 2, occ: true,  patient: { name: 'Mohan Gupta',   age: 66, doctor: 'Dr. Singh',  status: 'critical', risk: 8.0, mdr: true,  diagnosis: 'MRSA Pneumonia',     since: '3d',  vitals: { hr: 104, bp: '92/60',  spo2: 89, temp: 39.2 } } },
      { id: 3, occ: true,  patient: { name: 'Anita Verma',   age: 29, doctor: 'Dr. Rao',    status: 'warning',  risk: 4.1, mdr: false, diagnosis: 'Post-op Recovery',   since: '1d',  vitals: { hr: 88,  bp: '118/74', spo2: 96, temp: 37.4 } } },
      { id: 4, occ: false, patient: undefined },
      { id: 5, occ: true,  patient: { name: 'Rita Sharma',   age: 42, doctor: 'Dr. Mehta',  status: 'warning',  risk: 3.2, mdr: false, diagnosis: 'Cardiac Failure',    since: '4h',  vitals: { hr: 92,  bp: '128/82', spo2: 94, temp: 37.1 } } },
      { id: 6, occ: true,  patient: { name: 'Karan Malhotra', age: 38, doctor: 'Dr. Iyer',  status: 'critical', risk: 8.0, mdr: true,  diagnosis: 'CRE Septicemia',     since: '5d',  vitals: { hr: 122, bp: '84/48',  spo2: 82, temp: 40.1 } } },
      { id: 7, occ: false, patient: undefined },
      { id: 8, occ: true,  patient: { name: 'Dev Prasad',    age: 71, doctor: 'Dr. Khan',   status: 'warning',  risk: 5.5, mdr: false, diagnosis: 'Respiratory Failure', since: '2d', vitals: { hr: 96,  bp: '102/66', spo2: 91, temp: 38.1 } } },
    ]
  },
  {
    id: 'icu-b', name: 'ICU Ward B', color: '#F97316', glowColor: 'rgba(249,115,22,0.3)',
    type: 'icu', capacity: 6,
    beds: [
      { id: 1, occ: true,  patient: { name: 'Ajay Singh',    age: 61, doctor: 'Dr. Bose',   status: 'critical', risk: 8.9, mdr: true,  diagnosis: 'CRE + Renal Failure', since: '3d', vitals: { hr: 112, bp: '90/58',  spo2: 88, temp: 38.7 } } },
      { id: 2, occ: true,  patient: { name: 'Sita Devi',     age: 45, doctor: 'Dr. Gupta',  status: 'warning',  risk: 5.4, mdr: false, diagnosis: 'ESBL UTI + Sepsis',   since: '1d', vitals: { hr: 94,  bp: '108/70', spo2: 93, temp: 38.0 } } },
      { id: 3, occ: false, patient: undefined },
      { id: 4, occ: true,  patient: { name: 'Suresh Yadav',  age: 55, doctor: 'Dr. Rao',    status: 'warning',  risk: 6.1, mdr: true,  diagnosis: 'MDR-TB Progression',  since: '6d', vitals: { hr: 99,  bp: '116/72', spo2: 90, temp: 38.5 } } },
      { id: 5, occ: true,  patient: { name: 'Kavya Nair',    age: 31, doctor: 'Dr. Pillai', status: 'stable',   risk: 2.4, mdr: false, diagnosis: 'Post-Cardiac Surgery', since: '1d', vitals: { hr: 78,  bp: '124/78', spo2: 98, temp: 36.8 } } },
      { id: 6, occ: false, patient: undefined },
    ]
  },
  {
    id: 'general', name: 'General Ward', color: '#EAB308', glowColor: 'rgba(234,179,8,0.25)',
    type: 'general', capacity: 10,
    beds: [
      { id: 1, occ: true,  patient: { name: 'Priya Sharma',  age: 38, doctor: 'Dr. Mehta',  status: 'warning',  risk: 5.8, mdr: true,  diagnosis: 'MDR-TB Suspect',     since: '1d',  vitals: { hr: 86,  bp: '122/78', spo2: 95, temp: 37.8 } } },
      { id: 2, occ: true,  patient: { name: 'Leela Das',     age: 52, doctor: 'Dr. Singh',  status: 'stable',   risk: 2.1, mdr: false, diagnosis: 'Pneumonia',          since: '3d',  vitals: { hr: 72,  bp: '118/74', spo2: 97, temp: 37.2 } } },
      { id: 3, occ: false, patient: undefined },
      { id: 4, occ: true,  patient: { name: 'Raj Kumar',     age: 44, doctor: 'Dr. Rao',    status: 'stable',   risk: 1.5, mdr: false, diagnosis: 'COPD Exacerbation',  since: '2d',  vitals: { hr: 76,  bp: '126/80', spo2: 96, temp: 37.0 } } },
      { id: 5, occ: true,  patient: { name: 'Uma Shankar',   age: 63, doctor: 'Dr. Bose',   status: 'warning',  risk: 4.3, mdr: false, diagnosis: 'Fever of Unknown Origin','since':'2d',vitals: { hr: 90,  bp: '114/72', spo2: 94, temp: 38.6 } } },
      { id: 6, occ: false, patient: undefined },
      { id: 7, occ: true,  patient: { name: 'Arjun Mehra',   age: 27, doctor: 'Dr. Khan',   status: 'stable',   risk: 1.8, mdr: false, diagnosis: 'Dengue Recovery',    since: '4d',  vitals: { hr: 68,  bp: '112/70', spo2: 99, temp: 36.6 } } },
      { id: 8, occ: false, patient: undefined },
      { id: 9, occ: true,  patient: { name: 'Devi Prasad',   age: 58, doctor: 'Dr. Pillai', status: 'warning',  risk: 3.8, mdr: false, diagnosis: 'Cellulitis',         since: '1d',  vitals: { hr: 82,  bp: '130/84', spo2: 96, temp: 37.9 } } },
      { id: 10,occ: false, patient: undefined },
    ]
  },
  {
    id: 'surgical', name: 'Surgical Ward', color: '#8B5CF6', glowColor: 'rgba(139,92,246,0.25)',
    type: 'surgical', capacity: 8,
    beds: [
      { id: 1, occ: true,  patient: { name: 'Ravi Shankar',  age: 49, doctor: 'Dr. Sharma', status: 'stable',   risk: 2.8, mdr: false, diagnosis: 'Post-Appendectomy',  since: '1d',  vitals: { hr: 74,  bp: '122/76', spo2: 98, temp: 36.9 } } },
      { id: 2, occ: true,  patient: { name: 'Gita Verma',    age: 34, doctor: 'Dr. Mehta',  status: 'stable',   risk: 1.2, mdr: false, diagnosis: 'Post-Hysterectomy',  since: '2d',  vitals: { hr: 70,  bp: '116/72', spo2: 99, temp: 36.7 } } },
      { id: 3, occ: true,  patient: { name: 'Tara Singh',    age: 67, doctor: 'Dr. Gupta',  status: 'warning',  risk: 4.1, mdr: false, diagnosis: 'Post-Knee Replacement','since':'1d',vitals: { hr: 84,  bp: '132/84', spo2: 95, temp: 37.6 } } },
      { id: 4, occ: false, patient: undefined },
      { id: 5, occ: false, patient: undefined },
      { id: 6, occ: true,  patient: { name: 'Asha Kumari',   age: 41, doctor: 'Dr. Bose',   status: 'stable',   risk: 2.5, mdr: false, diagnosis: 'Post-Laparoscopy',   since: '1d',  vitals: { hr: 76,  bp: '118/74', spo2: 98, temp: 37.0 } } },
      { id: 7, occ: true,  patient: { name: 'Vikram Rao',    age: 72, doctor: 'Dr. Rao',    status: 'warning',  risk: 5.1, mdr: true,  diagnosis: 'MDR Wound Infection', since: '4d', vitals: { hr: 95,  bp: '138/88', spo2: 93, temp: 38.3 } } },
      { id: 8, occ: false, patient: undefined },
    ]
  },
  {
    id: 'mdr-iso', name: 'MDR Isolation Unit', color: '#7C3AED', glowColor: 'rgba(124,58,237,0.5)',
    type: 'mdr', capacity: 6,
    beds: [
      { id: 1, occ: true,  patient: { name: 'P. Krishnan',   age: 58, doctor: 'Dr. Iyer',   status: 'critical', risk: 9.8, mdr: true,  diagnosis: 'XDR-TB + Fungal Co-Inf','since':'7d',vitals: { hr: 128, bp: '80/44',  spo2: 78, temp: 40.5 } } },
      { id: 2, occ: true,  patient: { name: 'Sunita Roy',    age: 47, doctor: 'Dr. Khan',   status: 'critical', risk: 9.1, mdr: true,  diagnosis: 'Pan-Resistant CRE',  since: '5d',  vitals: { hr: 119, bp: '86/52',  spo2: 81, temp: 39.8 } } },
      { id: 3, occ: true,  patient: { name: 'Babu Lal',      age: 63, doctor: 'Dr. Bose',   status: 'critical', risk: 8.4, mdr: true,  diagnosis: 'MDR-TB + HIV',       since: '3d',  vitals: { hr: 108, bp: '94/64',  spo2: 85, temp: 39.1 } } },
      { id: 4, occ: false, patient: undefined },
      { id: 5, occ: true,  patient: { name: 'Mala Devi',     age: 39, doctor: 'Dr. Pillai', status: 'warning',  risk: 7.3, mdr: true,  diagnosis: 'MRSA + ESBL Co-Inf', since: '2d',  vitals: { hr: 102, bp: '100/66', spo2: 90, temp: 38.8 } } },
      { id: 6, occ: false, patient: undefined },
    ]
  },
];

/* ── Color helpers ── */
const bedStatusColor = (p?: BedPatient): string => {
  if (!p) return '#22C55E';
  if (p.mdr && p.risk >= 8) return '#7C3AED';
  if (p.risk >= 8) return '#EF4444';
  if (p.risk >= 6) return '#F97316';
  if (p.risk >= 4) return '#EAB308';
  return '#22C55E';
};
const bedStatusBg = (p?: BedPatient): string => {
  if (!p) return 'rgba(34,197,94,0.05)';
  if (p.mdr && p.risk >= 8) return 'rgba(124,58,237,0.07)';
  if (p.risk >= 8) return 'rgba(239,68,68,0.07)';
  if (p.risk >= 6) return 'rgba(249,115,22,0.07)';
  if (p.risk >= 4) return 'rgba(234,179,8,0.06)';
  return 'rgba(34,197,94,0.05)';
};
const bedStatusGlow = (p?: BedPatient): string => {
  if (!p) return 'none';
  if (p.mdr && p.risk >= 8) return '0 0 16px rgba(124,58,237,0.45), 0 0 40px rgba(124,58,237,0.15)';
  if (p.risk >= 8) return '0 0 16px rgba(239,68,68,0.50), 0 0 40px rgba(239,68,68,0.18)';
  if (p.risk >= 6) return '0 0 12px rgba(249,115,22,0.40), 0 0 30px rgba(249,115,22,0.12)';
  if (p.risk >= 4) return '0 0 10px rgba(234,179,8,0.35)';
  return 'none';
};

/* ── Top-view human silhouette SVG ── */
const HumanSilhouette = ({ color, isCritical }: { color: string; isCritical: boolean }) => (
  <svg width="44" height="72" viewBox="0 0 44 72" fill="none" xmlns="http://www.w3.org/2000/svg"
    style={{ filter: isCritical ? `drop-shadow(0 0 5px ${color})` : undefined }}>
    {/* Head */}
    <ellipse cx="22" cy="10" rx="8.5" ry="9" fill={color} opacity="0.85" />
    {/* Neck */}
    <rect x="18" y="18" width="8" height="5" rx="2" fill={color} opacity="0.7" />
    {/* Torso */}
    <ellipse cx="22" cy="36" rx="13" ry="14" fill={color} opacity="0.75" />
    {/* Left arm */}
    <ellipse cx="6" cy="34" rx="4.5" ry="12" fill={color} opacity="0.6" transform="rotate(-8 6 34)" />
    {/* Right arm */}
    <ellipse cx="38" cy="34" rx="4.5" ry="12" fill={color} opacity="0.6" transform="rotate(8 38 34)" />
    {/* Left leg */}
    <ellipse cx="15" cy="59" rx="5" ry="13" fill={color} opacity="0.65" />
    {/* Right leg */}
    <ellipse cx="29" cy="59" rx="5" ry="13" fill={color} opacity="0.65" />
  </svg>
);

/* ── Single hospital bed (top view) ── */
const HospitalBed = ({
  bed, wardType, onClick,
}: {
  bed: WardBed; wardType: Ward['type']; onClick: (b: WardBed) => void;
}) => {
  const tk = useT();
  const p = bed.patient;
  const col = bedStatusColor(p);
  const bg  = bedStatusBg(p);
  const glow = bedStatusGlow(p);
  const isCritical = !!p && p.risk >= 8;
  const isMDR      = !!p && p.mdr;

  return (
    <motion.div
      whileHover={{ scale: 1.04, y: -4 }}
      onClick={() => onClick(bed)}
      style={{
        width: 130, cursor: 'pointer',
        background: tk.isDark ? `rgba(17,24,39,0.9)` : '#FFFFFF',
        borderRadius: 18,
        border: `2px solid ${col}${isCritical ? 'cc' : '55'}`,
        boxShadow: `${tk.shadowMd}${glow !== 'none' ? ', ' + glow : ''}`,
        overflow: 'hidden', position: 'relative',
        transition: 'border-color 0.3s, box-shadow 0.3s',
      }}
    >
      {/* Critical pulse ring */}
      {isCritical && (
        <div style={{
          position: 'absolute', inset: -3, borderRadius: 20,
          border: `2px solid ${col}`,
          animation: 'mdrPulse 1.6s ease-in-out infinite',
          pointerEvents: 'none', zIndex: 0,
        }} />
      )}

      {/* Bed frame — top-view */}
      <div style={{
        position: 'relative', zIndex: 1,
        background: bed.occ
          ? `linear-gradient(180deg, ${col}18 0%, ${col}08 100%)`
          : tk.isDark ? 'rgba(255,255,255,0.03)' : 'rgba(248,250,252,0.9)',
        padding: '10px 10px 8px',
        minHeight: 148,
      }}>
        {/* Headboard */}
        <div style={{
          height: 10, borderRadius: '10px 10px 6px 6px',
          background: col, opacity: bed.occ ? 0.7 : 0.18,
          marginBottom: 4,
        }} />

        {/* Mattress / patient area */}
        <div style={{
          background: bed.occ
            ? (tk.isDark ? `rgba(17,24,39,0.6)` : `rgba(255,255,255,0.85)`)
            : (tk.isDark ? 'rgba(255,255,255,0.04)' : 'rgba(241,245,249,0.8)'),
          borderRadius: 10,
          border: `1px solid ${col}22`,
          padding: '6px 6px 4px',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          minHeight: 98,
          position: 'relative',
        }}>
          {bed.occ && p ? (
            <>
              {/* Breathing glow under silhouette */}
              <div style={{
                position: 'absolute', inset: 4, borderRadius: 8,
                background: `radial-gradient(ellipse at 50% 50%, ${col}22 0%, transparent 70%)`,
                animation: 'mdrFloat 3s ease-in-out infinite',
              }} />
              <HumanSilhouette color={col} isCritical={isCritical} />
            </>
          ) : (
            /* Empty bed — draw pillow + sheet lines */
            <>
              <div style={{
                width: 44, height: 22, borderRadius: '50% 50% 40% 40% / 60% 60% 40% 40%',
                background: tk.isDark ? 'rgba(255,255,255,0.06)' : 'rgba(203,213,225,0.6)',
                border: `1px solid ${tk.isDark ? 'rgba(255,255,255,0.08)' : 'rgba(148,163,184,0.3)'}`,
                marginBottom: 6, marginTop: 4,
              }} />
              {[0,1,2].map(i => (
                <div key={i} style={{
                  width: '85%', height: 1.5,
                  background: tk.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(203,213,225,0.5)',
                  borderRadius: 1, marginBottom: 5,
                }} />
              ))}
            </>
          )}
        </div>

        {/* Footboard */}
        <div style={{
          height: 7, borderRadius: '4px 4px 10px 10px',
          background: col, opacity: bed.occ ? 0.5 : 0.12,
          marginTop: 4,
        }} />
      </div>

      {/* Info strip */}
      <div style={{
        background: tk.isDark ? 'rgba(0,0,0,0.4)' : `${col}0e`,
        borderTop: `1px solid ${col}22`,
        padding: '7px 8px 8px',
        position: 'relative', zIndex: 1,
      }}>
        {/* Bed number + status icon */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 }}>
          <span style={{ fontSize: 10, fontWeight: 800, color: col, letterSpacing: '0.04em' }}>BED {bed.id}</span>
          <span style={{ fontSize: 12 }}>
            {!bed.occ ? '🛏️' : isMDR && isCritical ? '🟣' : isCritical ? '❗' : p!.risk >= 5 ? '⚠️' : '✅'}
          </span>
        </div>

        {bed.occ && p ? (
          <>
            <div style={{ fontSize: 10, fontWeight: 700, color: tk.txt, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {p.name.split(' ')[0]} {p.name.split(' ').slice(-1)} · {p.age}y
            </div>
            <div style={{ fontSize: 9, color: tk.txtMuted, marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {p.doctor.replace('Dr. ', 'Dr.')} · {p.since}
            </div>
            {/* Risk bar */}
            <div style={{ height: 4, background: tk.isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)', borderRadius: 99, overflow: 'hidden' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(p.risk / 10) * 100}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                style={{ height: '100%', background: `linear-gradient(90deg, ${col}, ${col}aa)`, borderRadius: 99 }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
              <span style={{ fontSize: 8.5, color: tk.txtMuted }}>Risk</span>
              <span style={{ fontSize: 9, fontWeight: 800, color: col }}>{p.risk.toFixed(1)}/10</span>
            </div>
          </>
        ) : (
          <>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#22C55E' }}>Available</div>
            <div style={{ fontSize: 9, color: tk.txtMuted }}>Ready for admission</div>
          </>
        )}
      </div>
    </motion.div>
  );
};

/* ── Ward section (compact view) ── */
const WardSection = ({ ward, onSelectWard, onSelectBed }: {
  ward: Ward;
  onSelectWard: (w: Ward) => void;
  onSelectBed: (b: WardBed, w: Ward) => void;
}) => {
  const tk = useT();
  const occupied = ward.beds.filter(b => b.occ).length;
  const critical  = ward.beds.filter(b => b.patient && b.patient.risk >= 8).length;
  const mdrCount  = ward.beds.filter(b => b.patient?.mdr).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      style={{
        background: tk.white,
        borderRadius: 20,
        border: `1.5px solid ${ward.color}30`,
        boxShadow: `${tk.shadowMd}, 0 0 20px ${ward.glowColor}`,
        overflow: 'hidden',
        marginBottom: 20,
      }}
    >
      {/* Ward Header */}
      <div style={{
        background: `linear-gradient(135deg, ${ward.color}22, ${ward.color}08)`,
        borderBottom: `1px solid ${ward.color}25`,
        padding: '16px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 42, height: 42, borderRadius: 12,
            background: `${ward.color}20`,
            border: `1.5px solid ${ward.color}40`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20,
            boxShadow: `0 0 10px ${ward.glowColor}`,
          }}>
            {ward.type === 'icu' ? '🏥' : ward.type === 'mdr' ? '⚠️' : ward.type === 'surgical' ? '🔬' : '🛏️'}
          </div>
          <div>
            <div style={{ fontSize: 17, fontWeight: 800, color: tk.txt, fontFamily: 'Outfit, sans-serif' }}>{ward.name}</div>
            <div style={{ display: 'flex', gap: 10, marginTop: 2 }}>
              <span style={{ fontSize: 11, color: tk.txtSec }}>{ward.beds.length} beds</span>
              <span style={{ fontSize: 11, color: ward.color, fontWeight: 600 }}>{occupied} occupied</span>
              {critical > 0 && <span style={{ fontSize: 11, color: '#EF4444', fontWeight: 700 }}>❗ {critical} critical</span>}
              {mdrCount > 0 && <span style={{ fontSize: 11, color: '#7C3AED', fontWeight: 700 }}>🟣 {mdrCount} MDR</span>}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Occupancy ring */}
          <div style={{ textAlign: 'center' }}>
            <svg width="44" height="44" viewBox="0 0 44 44">
              <circle cx="22" cy="22" r="18" fill="none" stroke={tk.isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'} strokeWidth="4" />
              <circle cx="22" cy="22" r="18" fill="none" stroke={ward.color} strokeWidth="4"
                strokeDasharray={`${(occupied / ward.beds.length) * 113} 113`}
                strokeLinecap="round" strokeDashoffset="28.3" />
              <text x="22" y="27" textAnchor="middle" fill={ward.color} fontSize="11" fontWeight="800" fontFamily="Outfit">
                {Math.round((occupied / ward.beds.length) * 100)}%
              </text>
            </svg>
          </div>
          <button
            onClick={() => onSelectWard(ward)}
            style={{
              padding: '8px 16px', borderRadius: 10, border: `1px solid ${ward.color}40`,
              background: `${ward.color}15`, color: ward.color,
              fontSize: 12, fontWeight: 700, cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            Full View →
          </button>
        </div>
      </div>

      {/* Bed grid — horizontal scroll */}
      <div style={{ padding: '18px 20px' }}>
        {/* Floor grid lines */}
        <div style={{
          position: 'relative',
          backgroundImage: `
            linear-gradient(${tk.isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.025)'} 1px, transparent 1px),
            linear-gradient(90deg, ${tk.isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.025)'} 1px, transparent 1px)
          `,
          backgroundSize: '32px 32px',
          borderRadius: 12, padding: '12px 8px',
          overflowX: 'auto',
        }}>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', minWidth: 0 }}>
            {ward.beds.map(bed => (
              <HospitalBed key={bed.id} bed={bed} wardType={ward.type} onClick={(b) => onSelectBed(b, ward)} />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

/* ── Patient detail drawer ── */
const PatientDrawer = ({ bed, ward, onClose }: {
  bed: WardBed | null; ward: Ward | null; onClose: () => void;
}) => {
  const tk = useT();
  if (!bed) return null;
  const p = bed.patient;
  const col = bedStatusColor(p);
  const isOpen = !!bed;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 200, backdropFilter: 'blur(4px)' }}
          />
          {/* Drawer */}
          <motion.div
            initial={{ x: 420 }} animate={{ x: 0 }} exit={{ x: 420 }}
            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
            style={{
              position: 'fixed', right: 0, top: 0, bottom: 0,
              width: 380, background: tk.white,
              boxShadow: '-12px 0 60px rgba(0,0,0,0.2)',
              zIndex: 201, overflowY: 'auto',
              borderLeft: `3px solid ${col}`,
            }}
          >
            {/* Drawer header */}
            <div style={{
              background: `linear-gradient(135deg, ${col}22, ${col}08)`,
              padding: '22px 24px',
              borderBottom: `1px solid ${col}22`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: `${col}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, border: `1.5px solid ${col}40` }}>
                    🏥
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: tk.txtMuted, fontWeight: 600 }}>{ward?.name} · Bed {bed.id}</div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: col }}>{p ? p.status.toUpperCase() : 'AVAILABLE'}</div>
                  </div>
                </div>
                <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${tk.border}`, background: tk.surface, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: tk.txtMuted }}>
                  <X size={15} />
                </button>
              </div>

              {p ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{
                    width: 56, height: 90, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: `${col}12`, borderRadius: 12, border: `1px solid ${col}30`,
                  }}>
                    <HumanSilhouette color={col} isCritical={p.risk >= 8} />
                  </div>
                  <div>
                    <div style={{ fontSize: 20, fontWeight: 900, color: tk.txt, fontFamily: 'Outfit, sans-serif', lineHeight: 1.2 }}>{p.name}</div>
                    <div style={{ fontSize: 12, color: tk.txtSec, marginTop: 2 }}>Age {p.age} · {p.doctor}</div>
                    <div style={{ fontSize: 11, color: tk.txtMuted, marginTop: 1 }}>{p.diagnosis}</div>
                    <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                      {p.mdr && <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: 'rgba(124,58,237,0.15)', color: '#7C3AED', border: '1px solid rgba(124,58,237,0.3)' }}>🟣 MDR</span>}
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: `${col}18`, color: col, border: `1px solid ${col}35` }}>{p.status}</span>
                      <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 99, background: tk.surface, color: tk.txtSec }}>Since {p.since}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: 20 }}>
                  <div style={{ fontSize: 40 }}>🛏️</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#22C55E', marginTop: 8 }}>Bed Available</div>
                  <div style={{ fontSize: 12, color: tk.txtMuted }}>Ready for new admission</div>
                </div>
              )}
            </div>

            {p && (
              <div style={{ padding: 20 }}>
                {/* Risk score */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: tk.txt, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>MDR Risk Score</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ flex: 1, height: 10, background: tk.isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)', borderRadius: 99, overflow: 'hidden' }}>
                      <motion.div
                        initial={{ width: 0 }} animate={{ width: `${p.risk * 10}%` }}
                        transition={{ duration: 1.2, ease: 'easeOut' }}
                        style={{ height: '100%', background: `linear-gradient(90deg, ${col}, ${col}88)`, borderRadius: 99 }}
                      />
                    </div>
                    <span style={{ fontSize: 22, fontWeight: 900, color: col, fontFamily: 'Outfit' }}>{p.risk}</span>
                    <span style={{ fontSize: 12, color: tk.txtMuted }}>/10</span>
                  </div>
                </div>

                {/* Vitals grid */}
                <div style={{ fontSize: 12, fontWeight: 700, color: tk.txt, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Live Vitals</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
                  {[
                    { label: 'Heart Rate', val: `${p.vitals.hr} bpm`,  icon: '❤️', warn: p.vitals.hr > 100 },
                    { label: 'Blood Pressure', val: p.vitals.bp,       icon: '🩺', warn: parseInt(p.vitals.bp) > 130 },
                    { label: 'SpO₂',           val: `${p.vitals.spo2}%`,icon: '🫁', warn: p.vitals.spo2 < 93 },
                    { label: 'Temperature',    val: `${p.vitals.temp}°C`,icon: '🌡️', warn: p.vitals.temp > 38 },
                  ].map(v => (
                    <div key={v.label} style={{
                      background: v.warn ? (tk.isDark ? 'rgba(239,68,68,0.12)' : '#FEF2F2') : tk.surface,
                      borderRadius: 12, padding: '12px 14px',
                      border: `1px solid ${v.warn ? '#EF444430' : tk.border}`,
                    }}>
                      <div style={{ fontSize: 14, marginBottom: 4 }}>{v.icon}</div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: v.warn ? '#EF4444' : tk.txt, fontFamily: 'Outfit' }}>{v.val}</div>
                      <div style={{ fontSize: 10, color: tk.txtMuted, marginTop: 2 }}>{v.label}</div>
                    </div>
                  ))}
                </div>

                {/* Action buttons */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <button style={{ padding: '11px 16px', borderRadius: 12, background: `linear-gradient(135deg, ${col}, ${col}cc)`, border: 'none', color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer', boxShadow: `0 4px 14px ${col}40` }}>
                    📋 View Full Patient File
                  </button>
                  <button style={{ padding: '11px 16px', borderRadius: 12, background: tk.surface, border: `1px solid ${tk.border}`, color: tk.txt, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                    🧬 Open in TraceNet
                  </button>
                  {p.mdr && (
                    <button style={{ padding: '11px 16px', borderRadius: 12, background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.3)', color: '#7C3AED', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                      ⚠️ MDR Protocol Checklist
                    </button>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

/* ── Full ward modal ── */
const WardFullModal = ({ ward, onClose, onSelectBed }: {
  ward: Ward | null; onClose: () => void; onSelectBed: (b: WardBed, w: Ward) => void;
}) => {
  const tk = useT();
  if (!ward) return null;

  return (
    <AnimatePresence>
      {ward && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 150, backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 24 }}
            onClick={e => e.stopPropagation()}
            style={{
              background: tk.white, borderRadius: 24,
              border: `2px solid ${ward.color}40`,
              boxShadow: `0 40px 120px rgba(0,0,0,0.35), 0 0 40px ${ward.glowColor}`,
              width: '100%', maxWidth: 900, maxHeight: '85vh', overflowY: 'auto',
              padding: 32,
            }}
          >
            {/* Modal header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <div>
                <div style={{ fontSize: 24, fontWeight: 900, color: tk.txt, fontFamily: 'Outfit' }}>{ward.name}</div>
                <div style={{ fontSize: 13, color: tk.txtSec, marginTop: 2 }}>
                  {ward.beds.filter(b => b.occ).length} / {ward.beds.length} beds occupied · {ward.beds.filter(b => b.patient?.risk && b.patient.risk >= 8).length} critical
                </div>
              </div>
              <button onClick={onClose} style={{ width: 36, height: 36, borderRadius: 10, border: `1px solid ${tk.border}`, background: tk.surface, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: tk.txtMuted }}>
                <X size={16} />
              </button>
            </div>

            {/* Full bed grid */}
            <div style={{
              backgroundImage: `linear-gradient(${tk.isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.025)'} 1px, transparent 1px), linear-gradient(90deg, ${tk.isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.025)'} 1px, transparent 1px)`,
              backgroundSize: '40px 40px',
              borderRadius: 16, padding: '20px',
              border: `1px solid ${tk.border}`,
            }}>
              <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                {ward.beds.map(bed => (
                  <HospitalBed key={bed.id} bed={bed} wardType={ward.type}
                    onClick={(b) => { onClose(); onSelectBed(b, ward); }}
                  />
                ))}
              </div>
            </div>

            {/* Legend */}
            <div style={{ display: 'flex', gap: 16, marginTop: 20, flexWrap: 'wrap' }}>
              {[
                { label: '🟣 MDR Critical', color: '#7C3AED' },
                { label: '❗ Critical (≥8)', color: '#EF4444' },
                { label: '⚠️ High (6–8)', color: '#F97316' },
                { label: '⚡ Medium (4–6)', color: '#EAB308' },
                { label: '✅ Stable (<4)',  color: '#22C55E' },
                { label: '🛏️ Available',   color: '#94A3B8' },
              ].map(l => (
                <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: tk.txtSec }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: l.color }} /> {l.label}
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/* ── MAIN BED STATUS PAGE ── */
const BedStatusPage = ({ onBack }: { onBack: () => void }) => {
  const tk = useT();
  const [selectedBed, setSelectedBed] = useState<WardBed | null>(null);
  const [selectedWardForDetail, setSelectedWardForDetail] = useState<Ward | null>(null);
  const [selectedWard, setSelectedWard] = useState<Ward | null>(null);

  const totalBeds    = WARDS.reduce((s, w) => s + w.beds.length, 0);
  const occupied     = WARDS.reduce((s, w) => s + w.beds.filter(b => b.occ).length, 0);
  const available    = totalBeds - occupied;
  const critical     = WARDS.reduce((s, w) => s + w.beds.filter(b => b.patient && b.patient.risk >= 8).length, 0);
  const mdrPatients  = WARDS.reduce((s, w) => s + w.beds.filter(b => b.patient?.mdr).length, 0);
  const occupancyPct = Math.round((occupied / totalBeds) * 100);

  return (
    <PageShell title="ICU Ward Monitoring" subtitle="Live hospital bed layout — real-time occupancy & MDR risk overlay" onBack={onBack} accent={tk.amber}>
      {/* ── TOP INFO BAR ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Total Beds',    val: totalBeds,       color: tk.blue,   soft: tk.blueSoft,   icon: '🛏️' },
          { label: 'Occupied',      val: occupied,        color: '#F97316', soft: 'rgba(249,115,22,0.1)', icon: '👤' },
          { label: 'Available',     val: available,       color: '#22C55E', soft: 'rgba(34,197,94,0.1)',  icon: '✅' },
          { label: 'Critical',      val: critical,        color: '#EF4444', soft: 'rgba(239,68,68,0.1)',  icon: '❗' },
          { label: 'MDR Patients',  val: mdrPatients,     color: '#7C3AED', soft: 'rgba(124,58,237,0.1)',  icon: '🟣' },
        ].map(s => (
          <div key={s.label} style={{
            background: s.soft, borderRadius: 16, padding: '16px 18px',
            border: `1.5px solid ${s.color}25`,
            boxShadow: `0 0 20px ${s.color}18`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 16 }}>{s.icon}</span>
              <span style={{ fontSize: 10, fontWeight: 700, color: s.color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Live</span>
            </div>
            <div style={{ fontSize: 30, fontWeight: 900, color: s.color, fontFamily: 'Outfit, sans-serif', lineHeight: 1 }}>{s.val}</div>
            <div style={{ fontSize: 11, color: tk.txtMuted, marginTop: 4, fontWeight: 600 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Occupancy progress bar */}
      <div style={{ background: tk.white, borderRadius: 16, padding: '16px 20px', marginBottom: 20, border: `1px solid ${tk.border}`, boxShadow: tk.shadowSm, display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: tk.txt }}>Hospital Occupancy</span>
            <span style={{ fontSize: 12, fontWeight: 800, color: occupancyPct > 80 ? '#EF4444' : occupancyPct > 60 ? '#F97316' : '#22C55E' }}>{occupancyPct}%</span>
          </div>
          <div style={{ height: 10, background: tk.isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)', borderRadius: 99, overflow: 'hidden' }}>
            <motion.div
              initial={{ width: 0 }} animate={{ width: `${occupancyPct}%` }} transition={{ duration: 1.4, ease: 'easeOut' }}
              style={{ height: '100%', background: occupancyPct > 80 ? 'linear-gradient(90deg,#EF4444,#F97316)' : occupancyPct > 60 ? 'linear-gradient(90deg,#F97316,#EAB308)' : 'linear-gradient(90deg,#22C55E,#10B981)', borderRadius: 99 }}
            />
          </div>
        </div>
        {/* Color legend */}
        <div style={{ display: 'flex', gap: 12, flexShrink: 0, flexWrap: 'wrap' }}>
          {[
            { label: '🟣 MDR', color: '#7C3AED' }, { label: '❗ Critical', color: '#EF4444' },
            { label: '⚠️ High', color: '#F97316' }, { label: '⚡ Med', color: '#EAB308' },
            { label: '✅ Stable', color: '#22C55E' }, { label: '🛏️ Empty', color: '#94A3B8' },
          ].map(l => (
            <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, color: tk.txtSec }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: l.color }} /> {l.label}
            </div>
          ))}
        </div>
      </div>

      {/* ── WARD SECTIONS ── */}
      {WARDS.map(ward => (
        <WardSection
          key={ward.id} ward={ward}
          onSelectWard={w => setSelectedWardForDetail(w)}
          onSelectBed={(b, w) => { setSelectedBed(b); setSelectedWard(w); }}
        />
      ))}

      {/* Full ward modal */}
      <WardFullModal
        ward={selectedWardForDetail}
        onClose={() => setSelectedWardForDetail(null)}
        onSelectBed={(b, w) => { setSelectedWardForDetail(null); setSelectedBed(b); setSelectedWard(w); }}
      />

      {/* Patient detail drawer */}
      <PatientDrawer
        bed={selectedBed} ward={selectedWard}
        onClose={() => { setSelectedBed(null); setSelectedWard(null); }}
      />
    </PageShell>
  );
};


/* ═══ SCREENING PAGE ═══ */
const ScreeningPage = ({ onBack }: { onBack: () => void }) => {
  const qs = [
    'Antibiotics received in last 90 days?',
    'Hospitalized in the past 3 months?',
    'Travel to high MDR-burden region?',
    'Close contact with confirmed MDR patient?',
    'Presence of open wounds / invasive devices?',
    'Immunocompromised (HIV, DM, Chemotherapy)?',
    'Failure to respond to first-line antibiotics?',
  ];
  const [ans, setAns] = useState<Record<number,string>>({});
  const [result, setResult] = useState<{score:number;level:string;action:string} | null>(null);

  const calc = () => {
    const score = Math.min(Object.values(ans).filter(v=>v==='yes').length * 1.4 + Object.values(ans).filter(v=>v==='unsure').length * 0.6, 10);
    setResult({
      score: parseFloat(score.toFixed(1)),
      level: score >= 7 ? 'HIGH RISK' : score >= 4 ? 'MODERATE RISK' : 'LOW RISK',
      action: score >= 7 ? '🔴 Immediate isolation + MDR workup + notify Infection Control team' :
              score >= 4 ? '🟡 Enhanced monitoring + swab cultures + re-screen at 48h' :
              '🟢 Standard precautions · Re-screen if symptoms develop',
    });
  };

  return (
    <PageShell title="MDR Screening UI" subtitle="AI-powered triage — answer 7 questions for instant risk score" onBack={onBack} accent={T.purple}>
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        <Card style={{ padding: 28, marginBottom: 20 }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: T.txt, marginBottom: 4, fontFamily: 'Outfit, sans-serif' }}>Clinical Screening Questionnaire</div>
          <div style={{ fontSize: 12, color: T.txtMuted, marginBottom: 24 }}>Answer all questions honestly to generate an AI-powered MDR risk assessment</div>

          {qs.map((q, i) => (
            <div key={i} style={{ marginBottom: 16, padding: '14px 16px', borderRadius: 12, background: T.surface, border: `1px solid ${T.border}` }}>
              <div style={{ fontSize: 13, color: T.txt, fontWeight: 500, marginBottom: 10 }}>
                <span style={{ width: 20, height: 20, borderRadius: '50%', background: T.purple, color: 'white', fontSize: 10, fontWeight: 800, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginRight: 8 }}>{i+1}</span>
                {q}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {['yes','no','unsure'].map(a => (
                  <button key={a} onClick={() => setAns(p => ({ ...p, [i]: a }))}
                    style={{
                      flex: 1, padding: '8px', borderRadius: 9,
                      border: `1.5px solid ${ans[i]===a ? (a==='yes'?T.red:a==='no'?T.green:T.amber) : T.border}`,
                      background: ans[i]===a ? (a==='yes'?T.redSoft:a==='no'?T.greenSoft:T.amberSoft) : T.white,
                      color: ans[i]===a ? (a==='yes'?T.red:a==='no'?T.green:T.amber) : T.txtMuted,
                      fontSize: 12, fontWeight: 700, cursor: 'pointer', textTransform: 'uppercase',
                      transition: 'all 0.15s',
                    }}>
                    {a}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <button onClick={calc} style={{
            width: '100%', padding: '14px', borderRadius: 14,
            background: `linear-gradient(135deg, ${T.blue}, ${T.purple})`,
            border: 'none', color: 'white', fontSize: 14, fontWeight: 800,
            cursor: 'pointer', letterSpacing: '0.01em',
            boxShadow: `0 4px 16px ${T.purple}40`,
          }}>
            ⚡ Calculate AI Risk Score
          </button>
        </Card>

        <AnimatePresence>
          {result && (
            <motion.div initial={{ opacity: 0, y: 16, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0 }}>
              <Card style={{ padding: 28 }} accent={result.score >= 7 ? T.red : result.score >= 4 ? T.amber : T.green}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div>
                    <div style={{ fontSize: 12, color: T.txtMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>AI Assessment Result</div>
                    <div style={{ fontSize: 22, fontWeight: 900, color: result.score >= 7 ? T.red : result.score >= 4 ? T.amber : T.green, fontFamily: 'Outfit, sans-serif' }}>{result.level}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 56, fontWeight: 900, color: result.score >= 7 ? T.red : result.score >= 4 ? T.amber : T.green, fontFamily: 'Outfit, sans-serif', lineHeight: 1 }}>{result.score}</div>
                    <div style={{ fontSize: 12, color: T.txtMuted }}>out of 10</div>
                  </div>
                </div>
                <div style={{ height: 10, background: T.surface, borderRadius: 99, marginBottom: 16 }}>
                  <motion.div initial={{ width: 0 }} animate={{ width: `${result.score * 10}%` }} transition={{ duration: 0.8, ease: 'easeOut' }}
                    style={{ height: '100%', borderRadius: 99, background: result.score >= 7 ? T.red : result.score >= 4 ? T.amber : T.green }} />
                </div>
                <div style={{ padding: 14, borderRadius: 12, background: result.score >= 7 ? T.redSoft : result.score >= 4 ? T.amberSoft : T.greenSoft }}>
                  <div style={{ fontSize: 14, color: T.txt, fontWeight: 600, lineHeight: 1.6 }}>{result.action}</div>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageShell>
  );
};

/* ═══ AI CHATBOT PAGE ═══ */
const ChatbotPage = ({ onBack }: { onBack: () => void }) => {
  const initMsgs = [
    { role: 'ai', text: 'Hello! I\'m MedBot, your AI MDR Intelligence Assistant 🏥\n\nI can help you with patient status, ward risk levels, outbreak alerts, PPE protocols, and more. How can I assist you today?' },
  ];
  const [msgs, setMsgs] = useState(initMsgs);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const aiMap: Record<string, string> = {
    'high risk':   '🔴 Top Critical Patients:\n1. Ramesh Kumar (ICU-A) — 9.2/10 [XDR]\n2. Ajay Singh (ICU-B) — 8.9/10 [CRE]\n3. Vikram Rao (Ward-D2) — 8.1/10 [MDR]\n\nAll three are on enhanced isolation.',
    'ward':        '🏥 Ward Risk Ranking:\n1. ICU-A → 9.2 🔴 CRITICAL\n2. ICU-B → 8.9 🔴 CRITICAL\n3. Ward-D2 → 8.1 🟠 HIGH\n4. Ward-B3 → 6.8 🟡 MEDIUM\n5. Ward-C1 → 5.4 🟡 MEDIUM',
    'critical':    '⚠️ ICU-A and ICU-B are at critical risk right now. Enhanced isolation protocols are active. Recommend immediate MDR team review.',
    'ppe':         '🧥 PPE By Zone:\n• ICU-A/B: N95 + Face Shield + Full Gown + Double Gloves\n• Ward-D2: N95 + Gloves + Gown\n• Ward-B3: Surgical Mask + Gloves\n• All areas: Strict hand hygiene mandatory',
    'alert':       '⚠️ 9 Active Alerts:\n• CRE in ICU-B (Critical)\n• PPE compliance at 76% in D2\n• MDR-TB contact chain: 9 exposed\n• AI outbreak prob: 84%\n• ICU-A quarantine protocol active',
    'isolat':      '🔒 Current Isolation Status:\n• ICU-A: Full quarantine ACTIVE ✅\n• ICU-B: Negative pressure rooms in use ✅\n• Ward-D2: Cohort isolation in progress ⚠️\n• Ward-B3: Contact precautions only',
    'contact':     '📊 Contact Tracing:\nP001 (Ramesh) has 12 exposure contacts.\nHighest risk contacts: Dr. Mehra (87%), Mohan P007 (83%).\nAll contacts have been notified and screened.',
    'lab':         '🔬 LabSync Status:\n• 18 results synced today\n• 5 pending review\n• 3 critical findings requiring action\n• Latest: MRSA strain B — 96% resistance',
  };

  const send = async (text?: string) => {
    const msg = text || input;
    if (!msg.trim()) return;
    setMsgs(p => [...p, { role: 'user', text: msg }]);
    setInput('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 850));
    const lower = msg.toLowerCase();
    const key = Object.keys(aiMap).find(k => lower.includes(k));
    const reply = key ? aiMap[key] : `🤖 Processing your query about "${msg}"...\n\nI've logged this for the MDR Intelligence System. For immediate escalation, please contact the Infection Control Officer or trigger the emergency protocol from the dashboard.`;
    setMsgs(p => [...p, { role: 'ai', text: reply }]);
    setLoading(false);
  };

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs, loading]);

  const suggestions = ['Show high-risk patients', 'Which ward is critical?', 'PPE recommendations', 'Active alerts', 'Isolation status', 'Contact tracing report', 'Lab sync status'];

  return (
    <PageShell title="AI MDR Assistant" subtitle="ChatGPT-level intelligence for your hospital MDR system" onBack={onBack} accent={T.blue}>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        <Card style={{ display: 'flex', flexDirection: 'column', height: 580, padding: 0, overflow: 'hidden' }}>
          {/* Header */}
          <div style={{ padding: '16px 20px', borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: `linear-gradient(135deg, ${T.blue}, ${T.purple})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Brain size={20} color="white" />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: T.txt }}>MedBot — MDR Intelligence</div>
              <div style={{ fontSize: 11, color: T.green, display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: T.green }} />
                Online · Real-time hospital data
              </div>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {msgs.map((m, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start', gap: 8 }}>
                {m.role === 'ai' && (
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: `linear-gradient(135deg,${T.blue},${T.purple})`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                    <Brain size={13} color="white" />
                  </div>
                )}
                <div style={{
                  maxWidth: '78%', padding: '10px 14px',
                  borderRadius: m.role === 'user' ? '16px 16px 4px 16px' : '4px 16px 16px 16px',
                  background: m.role === 'user' ? `linear-gradient(135deg, ${T.blue}, ${T.purple})` : T.surface,
                  color: m.role === 'user' ? 'white' : T.txt,
                  fontSize: 13, lineHeight: 1.6, whiteSpace: 'pre-wrap',
                  boxShadow: T.shadowSm,
                }}>
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: `linear-gradient(135deg,${T.blue},${T.purple})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Brain size={13} color="white" />
                </div>
                <div style={{ display: 'flex', gap: 4, padding: '10px 14px', background: T.surface, borderRadius: '4px 16px 16px 16px' }}>
                  {[0,1,2].map(i => <div key={i} className="mdr-pulse-dot" style={{ width: 8, height: 8, borderRadius: '50%', background: T.blue, animationDelay: `${i*0.2}s` }} />)}
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Suggestions */}
          <div style={{ padding: '8px 16px', borderTop: `1px solid ${T.border}`, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {suggestions.map(s => (
              <button key={s} onClick={() => send(s)} style={{ padding: '4px 10px', borderRadius: 99, background: T.blueSoft, border: `1px solid ${T.blue}30`, color: T.blue, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>{s}</button>
            ))}
          </div>

          {/* Input */}
          <div style={{ padding: '12px 16px', borderTop: `1px solid ${T.border}`, display: 'flex', gap: 8 }}>
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()}
              placeholder="Ask about patients, wards, alerts..."
              style={{ flex: 1, padding: '10px 14px', borderRadius: 12, border: `1px solid ${T.border}`, fontSize: 13, color: T.txt, outline: 'none', background: T.surface }} />
            <button onClick={() => send()} style={{ width: 42, height: 42, borderRadius: 12, background: `linear-gradient(135deg,${T.blue},${T.purple})`, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Send size={16} color="white" />
            </button>
          </div>
        </Card>
      </div>
    </PageShell>
  );
};

/* ═══ NEWS FEED PAGE ═══ */
const NewsfeedPage = ({ onBack }: { onBack: () => void }) => (
  <PageShell title="MDR Case Newsfeed" subtitle="Live protocol events, new cases & system updates" onBack={onBack} accent={T.red}>
    <div style={{ maxWidth: 700, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        {['All', 'Critical', 'Warning', 'Info'].map(f => (
          <button key={f} style={{ padding: '6px 14px', borderRadius: 9, border: `1px solid ${T.border}`, background: T.white, color: T.txtSec, fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>{f}</button>
        ))}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: T.green, padding: '6px 12px', borderRadius: 9, background: T.greenSoft, border: `1px solid ${T.green}30` }}>
          <div className="mdr-pulse-dot" style={{ width: 6, height: 6, borderRadius: '50%', background: T.green }} />
          Auto-updating
        </div>
      </div>
      {newsFeedItems.map((n, i) => (
        <motion.div key={n.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}>
          <Card style={{ padding: '14px 20px' }} accent={statusColor(n.severity)}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: statusBg(n.severity), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 16 }}>
                {n.severity === 'critical' ? '🔴' : n.severity === 'warning' ? '⚠️' : '📋'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: T.txt, marginBottom: 4 }}>{n.event}</div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ fontSize: 11, color: T.txtMuted }}>🕐 {n.time}</span>
                  <Chip label={n.ward} color={T.blue} bg={T.blueSoft} />
                  <Chip label={n.tag} color={statusColor(n.severity)} bg={statusBg(n.severity)} />
                </div>
              </div>
              <button style={{ fontSize: 11, color: T.blue, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, whiteSpace: 'nowrap' }}>View Details</button>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  </PageShell>
);

/* ═══ CARE & SAFETY PAGE ═══ */
const CarePage = ({ onBack }: { onBack: () => void }) => {
  const [open, setOpen] = useState<string | null>('Isolation Protocol');
  const guides = [
    { title: 'Isolation Protocol', icon: '🔒', color: T.red,
      steps: ['Activate negative pressure room immediately','Full PPE: N95 + face shield + gown + double gloves','Dedicated equipment — no sharing between rooms','Log all personnel entries/exits in TraceNet','Notify Infection Control Officer within 1 hour','Patient transport: minimum staff, designated route only'] },
    { title: 'PPE Requirements by Zone', icon: '🧥', color: T.amber,
      steps: ['ICU Confirmed: N95 + Shield + Full gown + Double gloves','Ward Suspected: N95 + Gloves + Gown','OPD: Surgical mask + Gloves (if symptom risk)','Admin: Standard surgical mask','Transport: N95 + Gloves minimum','Lab: BSL-2 full PPE compulsory'] },
    { title: 'Environmental Decontamination', icon: '🧹', color: T.teal,
      steps: ['Terminal clean with hospital-grade disinfectant after discharge','UV-C decontamination for ICU rooms post-use','High-touch surfaces: disinfect every 4 hours','Linen & waste: double-bagged, biohazard-labeled','HVAC filter check: weekly during outbreak','Water & sanitation audit: monthly compliance'] },
    { title: 'Staff Surveillance', icon: '👨‍⚕️', color: T.purple,
      steps: ['Daily symptom check for all ICU & MDR ward staff','Weekly swab for staff in ICU-A/B','Mandatory MDR awareness training: 6-monthly','HCAI incident reporting within 24 hours','Post-exposure follow-up protocol (14 days)','Annual flu vaccination + TB screening'] },
    { title: 'Patient Communication', icon: '📣', color: T.blue,
      steps: ['Explain MDR status in simple language to patient & family','Provide written isolation guidelines in patient language','Designated visitor protocol — max 1 visitor at a time','Family counselling session within 24h of MDR confirmation','No handshakes or physical contact without PPE','Regular updates through nurse: every 6 hours'] },
  ];

  return (
    <PageShell title="MDR Care & Safety Guide" subtitle="Isolation protocols, PPE requirements & staff safety procedures" onBack={onBack} accent={T.green}>
      <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {guides.map(g => (
          <Card key={g.title} style={{ overflow: 'hidden' }}>
            <button onClick={() => setOpen(open === g.title ? null : g.title)} style={{ width: '100%', padding: '18px 20px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 11, background: open === g.title ? g.color : T.surface, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, transition: 'background 0.2s' }}>
                  {g.icon}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: T.txt }}>{g.title}</div>
                  <div style={{ fontSize: 11, color: T.txtMuted }}>{g.steps.length} steps</div>
                </div>
              </div>
              <ChevronDown size={16} color={T.txtMuted} style={{ transform: open === g.title ? 'rotate(180deg)' : undefined, transition: 'transform 0.2s' }} />
            </button>
            <AnimatePresence>
              {open === g.title && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                  <div style={{ padding: '0 20px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {g.steps.map((s, i) => (
                      <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '10px 12px', borderRadius: 10, background: T.surface }}>
                        <div style={{ width: 22, height: 22, borderRadius: '50%', background: g.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: 'white', flexShrink: 0, lineHeight: 1 }}>{i+1}</div>
                        <span style={{ fontSize: 13, color: T.txt, lineHeight: 1.5 }}>{s}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        ))}
      </div>
    </PageShell>
  );
};

/* ═══ CAMERA & TRACKING PAGE ═══ */
const CameraPage = ({ onBack }: { onBack: () => void }) => {
  const feeds = [
    { id: 1, name: 'ICU-A Entry',      status: 'live', events: 3, alert: true },
    { id: 2, name: 'ICU-B Corridor',   status: 'live', events: 1, alert: true },
    { id: 3, name: 'Ward-D2 Hall',     status: 'live', events: 0, alert: false },
    { id: 4, name: 'OPD Entrance',     status: 'live', events: 2, alert: false },
    { id: 5, name: 'Lab Reception',    status: 'offline', events: 0, alert: false },
    { id: 6, name: 'Pharmacy Lounge',  status: 'live', events: 0, alert: false },
  ];
  const movements = [
    { time: '20:38', person: 'Dr. Mehra',     role: 'staff',   from: 'ICU-A', to: 'ICU-B', risk: 'medium', icon: '👨‍⚕️', dur: '—' },
    { time: '20:35', person: 'Nurse Priti',   role: 'staff',   from: 'Ward-D2', to: 'ICU-A', risk: 'high',   icon: '👩‍⚕️', dur: '—' },
    { time: '20:22', person: 'Patient P001',  role: 'patient', from: 'ICU-A Bed1', to: 'Radiology', risk: 'critical', icon: '🧑‍🦽', dur: '23 min' },
    { time: '20:15', person: 'Visitor (Unreg.)', role: 'visitor', from: 'OPD', to: 'Ward-B3', risk: 'high', icon: '👤', dur: '—' },
    { time: '20:08', person: 'Housekeeping',  role: 'staff',   from: 'ICU-B Corridor', to: '—', risk: 'medium', icon: '🧹', dur: '15 min' },
    { time: '19:50', person: 'Patient P003',  role: 'patient', from: 'ICU-B Bed1', to: 'CT Room', risk: 'critical', icon: '🧑‍🦽', dur: '31 min' },
  ];

  return (
    <PageShell title="Camera & Patient Tracking" subtitle="Live surveillance feeds & real-time movement event logs" onBack={onBack} accent={T.teal}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 20, alignItems: 'start' }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: T.txt, marginBottom: 12 }}>Live Camera Feeds</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            {feeds.map(f => (
              <Card key={f.id} style={{ overflow: 'hidden', padding: 0 }}>
                <div style={{ position: 'relative', paddingBottom: '65%', background: f.status === 'live' ? '#0D1729' : '#1a1a1a', overflow: 'hidden' }}>
                  {f.status === 'live' ? (
                    <>
                      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #0D1729 0%, #050D18 100%)' }} />
                      {/* Simulated grid lines */}
                      <div style={{ position: 'absolute', inset: 0, opacity: 0.12 }}>
                        {[25,50,75].map(v => <div key={`h${v}`} style={{ position: 'absolute', left: 0, right: 0, top: `${v}%`, height: 1, background: T.teal }} />)}
                        {[25,50,75].map(v => <div key={`v${v}`} style={{ position: 'absolute', top: 0, bottom: 0, left: `${v}%`, width: 1, background: T.teal }} />)}
                      </div>
                      {/* Moving scan line */}
                      <div className="mdr-scan" style={{ position: 'absolute', left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${T.teal}, transparent)`, top: 0 }} />
                      <div style={{ position: 'absolute', top: 8, left: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <div className="mdr-pulse-dot" style={{ width: 6, height: 6, borderRadius: '50%', background: T.green }} />
                        <span style={{ fontSize: 8, color: T.green, fontWeight: 700 }}>LIVE</span>
                      </div>
                    </>
                  ) : (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: 11, color: '#666' }}>📷 SIGNAL LOST</span>
                    </div>
                  )}
                  {f.alert && <div className="mdr-pulse-dot" style={{ position: 'absolute', top: 8, right: 8, width: 9, height: 9, borderRadius: '50%', background: T.red }} />}
                </div>
                <div style={{ padding: '9px 11px' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: T.txt }}>{f.name}</div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 }}>
                    <span style={{ fontSize: 10, color: f.status === 'live' ? T.green : T.txtMuted, fontWeight: 600, textTransform: 'uppercase' }}>{f.status}</span>
                    {f.events > 0 && <span style={{ fontSize: 10, color: T.red, fontWeight: 600 }}>{f.events} events</span>}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <Card style={{ padding: 18 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: T.txt, marginBottom: 14 }}>📍 Movement Log</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {movements.map((m, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, padding: '10px 12px', borderRadius: 10, background: T.surface, border: `1px solid ${T.border}`, alignItems: 'flex-start' }}>
                <div style={{ fontSize: 20 }}>{m.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: T.txt }}>{m.person}</div>
                  <div style={{ fontSize: 11, color: T.txtMuted }}>{m.from} → {m.to}</div>
                  {m.dur !== '—' && <div style={{ fontSize: 10, color: T.txtMuted }}>{m.dur}</div>}
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 10, color: T.txtMuted }}>{m.time}</div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: statusColor(m.risk), textTransform: 'uppercase', marginTop: 2 }}>{m.risk}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </PageShell>
  );
};

/* ═══ LIVE SURVEILLANCE HERO PAGE ═══ */
const SurveillancePage = ({ onBack }: { onBack: () => void }) => {
  const [liveRisk, setLiveRisk] = useState(87);
  useEffect(() => {
    const t = setInterval(() => setLiveRisk(r => Math.min(99, Math.max(55, r + (Math.random()-0.48)*4))), 3000);
    return () => clearInterval(t);
  }, []);

  const ticker = ['🔴 CRE detected ICU-B', '⚠️ MDR-TB contacts: 9 exposed', '🟡 PPE compliance 76%', '🤖 Outbreak prob: 84%', '✅ ICU-A quarantine active', '📊 Risk peaked 16:00hrs', '🧬 TraceNet: 8 active chains'];

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ minHeight: '100%', margin: '-24px -28px -28px', background: '#F7F8FC', fontFamily: 'Inter, Outfit, system-ui, sans-serif' }}
    >
      {/* Page Header - minimal */}
      <div style={{ background: T.white, borderBottom: `1px solid ${T.border}`, padding: '14px 32px', display: 'flex', alignItems: 'center', gap: 12, boxShadow: T.shadowSm }}>
        <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px', borderRadius: 9, border: `1px solid ${T.border}`, background: T.white, color: T.txtSec, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
          <ArrowLeft size={14} /> Back
        </button>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Ticker */}
          <div style={{ flex: 1, overflow: 'hidden', whiteSpace: 'nowrap' }}>
            <div className="mdr-ticker" style={{ display: 'inline-flex', gap: 40 }}>
              {[...ticker,...ticker].map((t,i) => <span key={i} style={{ fontSize: 11, color: T.txtSec, fontWeight: 500 }}>{t}</span>)}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 99, background: T.redSoft, border: `1px solid ${T.red}30`, fontSize: 11, fontWeight: 700, color: T.red, flexShrink: 0 }}>
            <div className="mdr-pulse-dot" style={{ width: 6, height: 6, borderRadius: '50%', background: T.red }} />
            LIVE MDR FEED
          </div>
        </div>
      </div>

      {/* SPLIT HERO */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.1fr', minHeight: 'calc(100vh - 60px)' }}>
        {/* LEFT: Feature Pitch */}
        <div style={{ padding: '64px 52px', background: `linear-gradient(160deg, #1E3A5F 0%, #120B30 100%)`, display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', right: -80, top: '20%', width: 300, height: 300, borderRadius: '50%', background: 'rgba(37,99,235,0.15)', filter: 'blur(70px)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', left: -60, bottom: '10%', width: 250, height: 250, borderRadius: '50%', background: 'rgba(124,58,237,0.12)', filter: 'blur(60px)', pointerEvents: 'none' }} />

          <div style={{ position: 'relative' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 14px', borderRadius: 99, background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.4)', marginBottom: 28 }}>
              <div className="mdr-pulse-dot" style={{ width: 7, height: 7, borderRadius: '50%', background: '#EF4444' }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: '#FCA5A5', letterSpacing: '0.04em' }}>LIVE MDR TRACKING</span>
            </div>

            <h1 style={{ fontSize: 40, fontWeight: 900, color: 'white', fontFamily: 'Outfit, sans-serif', lineHeight: 1.15, margin: '0 0 16px' }}>
              MDR Live Tracking<br />
              <span style={{ background: 'linear-gradient(90deg, #60A5FA, #A78BFA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                & AI Exposure Analysis
              </span>
            </h1>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, maxWidth: 420, marginBottom: 36 }}>
              Hospital-grade, real-time Multi-Drug Resistant infection surveillance powered by AI — built for AIIMS & Government deployment.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 40 }}>
              {[
                { icon: '📍', label: 'Live Patient Movement', desc: 'Track patient, staff & visitor movement continuously' },
                { icon: '🧬', label: 'Exposure Chain Mapping', desc: 'AI-built contact graphs with probability scoring' },
                { icon: '🤖', label: 'AI Risk Scoring',        desc: 'Multi-factor MDR risk index updated every 30s' },
                { icon: '🗺️', label: 'Interactive Hospital Map', desc: 'Color-coded floor maps with live risk overlay' },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, flexShrink: 0 }}>
                    {item.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'white', marginBottom: 2 }}>{item.label}</div>
                    <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <button onClick={onBack} style={{ padding: '13px 26px', borderRadius: 13, background: `linear-gradient(135deg, ${T.blue}, ${T.purple})`, border: 'none', color: 'white', fontSize: 14, fontWeight: 800, cursor: 'pointer', boxShadow: `0 4px 20px rgba(37,99,235,0.45)` }}>
                🔴 View Live MDR Dashboard
              </button>
              <button style={{ padding: '13px 20px', borderRadius: 13, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                📋 View Documentation
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT: Live Dashboard Preview */}
        <div style={{ background: '#F0F2F8', padding: 28, display: 'flex', flexDirection: 'column', gap: 16, overflow: 'auto' }}>
          {/* Mini Stats */}
          <div style={{ display: 'flex', gap: 10 }}>
            {[
              { l: 'Patients', v: 247, c: T.blue, s: T.blueSoft },
              { l: 'MDR+', v: 22, c: T.red, s: T.redSoft },
              { l: 'Alerts', v: 9, c: T.amber, s: T.amberSoft },
              { l: 'AI Risk', v: `${liveRisk.toFixed(0)}%`, c: liveRisk>80?T.red:T.amber, s: liveRisk>80?T.redSoft:T.amberSoft },
            ].map(s => (
              <div key={s.l} style={{ flex: 1, background: s.s, borderRadius: 12, padding: '12px', border: `1px solid ${s.c}30` }}>
                <div style={{ fontSize: 22, fontWeight: 900, color: s.c, fontFamily: 'Outfit', lineHeight: 1 }}>{s.v}</div>
                <div style={{ fontSize: 10, color: s.c, opacity: 0.7, marginTop: 3, textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>{s.l}</div>
              </div>
            ))}
          </div>

          {/* Mini Chart */}
          <Card style={{ padding: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: T.txt, marginBottom: 10 }}>AI Risk Trend — 24h</div>
            <ResponsiveContainer width="100%" height={130}>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="svGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={T.blue} stopOpacity={0.2} />
                    <stop offset="95%" stopColor={T.blue} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" tick={{ fill: T.txtMuted, fontSize: 9 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: T.txtMuted, fontSize: 9 }} axisLine={false} tickLine={false} />
                <Area type="monotone" dataKey="risk" stroke={T.blue} fill="url(#svGrad)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          {/* Mini Heatmap */}
          <Card style={{ padding: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: T.txt, marginBottom: 10 }}>Hospital Floor Risk Map</div>
            <svg viewBox="0 0 100 60" style={{ width: '100%' }}>
              <rect x="2" y="2" width="96" height="56" rx="3" fill={T.surface} stroke={T.border} strokeWidth="0.5" />
              {[
                { name:'ICU-A', risk:9.2, x:3,  y:3,  w:35, h:26 },
                { name:'ICU-B', risk:8.9, x:44, y:3,  w:35, h:26 },
                { name:'Ward-D2', risk:8.1, x:83, y:3, w:14, h:55 },
                { name:'Ward-B3', risk:6.8, x:3,  y:33, w:35, h:24 },
                { name:'Ward-C1', risk:5.4, x:44, y:33, w:35, h:24 },
              ].map(z => {
                const c = riskColor(z.risk);
                return (
                  <g key={z.name}>
                    <rect x={z.x} y={z.y} width={z.w} height={z.h} rx="2" fill={`${c}22`} stroke={`${c}70`} strokeWidth="0.5" />
                    <text x={z.x + z.w/2} y={z.y + z.h/2 - 2} textAnchor="middle" fill={c} fontSize="3.5" fontWeight="700" fontFamily="Inter">{z.name}</text>
                    <text x={z.x + z.w/2} y={z.y + z.h/2 + 5} textAnchor="middle" fill={c} fontSize="5" fontWeight="900" fontFamily="Outfit">{z.risk}</text>
                  </g>
                );
              })}
            </svg>
          </Card>

          {/* Mini Feed */}
          <Card style={{ padding: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: T.txt, marginBottom: 10 }}>Live Event Feed</div>
            {newsFeedItems.slice(0, 4).map(n => (
              <div key={n.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: `1px solid ${T.border}` }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: statusColor(n.severity), flexShrink: 0 }} />
                <div style={{ flex: 1, fontSize: 11, color: T.txt, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{n.event}</div>
                <span style={{ fontSize: 10, color: T.txtMuted, flexShrink: 0 }}>{n.time}</span>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </motion.div>
  );
};

/* ═══════════════════════════
   ROOT: MAIN MODULE (ROUTER + THEME PROVIDER)
═══════════════════════════ */
export default function MDRModule() {
  const [page, setPage] = useState<FeatureId | null>(null);
  const styleInjected = useRef(false);
  const tokens = useThemeTokens(); // ← live theme from global store

  useEffect(() => {
    if (!styleInjected.current) {
      const el = document.createElement('style');
      el.textContent = MDR_CSS;
      document.head.appendChild(el);
      styleInjected.current = true;
    }
  }, []);

  const navigate = (id: FeatureId) => setPage(id);
  const goHome = () => setPage(null);

  const PAGE_MAP: Record<FeatureId, React.ReactNode> = {
    patients:     <PatientClinicalPage onBack={goHome} />,
    status:       <PatientStatusPage   onBack={goHome} />,
    tracenet:     <TraceNetPage        onBack={goHome} />,
    labsync:      <LabSyncPage         onBack={goHome} />,
    beds:         <BedStatusPage       onBack={goHome} />,
    screening:    <ScreeningPage       onBack={goHome} />,
    chatbot:      <ChatbotPage         onBack={goHome} />,
    newsfeed:     <NewsfeedPage        onBack={goHome} />,
    care:         <CarePage            onBack={goHome} />,
    camera:       <CameraPage          onBack={goHome} />,
    surveillance: <SurveillancePage    onBack={goHome} />,
  };

  return (
    /* ═ Wrap the entire MDR module in a ThemeCtx so every child auto-adapts ═ */
    <ThemeCtx.Provider value={tokens}>
      <AnimatePresence mode="wait">
        {page === null
          ? <motion.div key="home">{<HomePage onNavigate={navigate} />}</motion.div>
          : <motion.div key={page}>{PAGE_MAP[page]}</motion.div>
        }
      </AnimatePresence>
    </ThemeCtx.Provider>
  );
}
