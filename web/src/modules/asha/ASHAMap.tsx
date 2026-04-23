'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Home, AlertTriangle, Navigation, Clock, User, Activity } from 'lucide-react';

type HouseStatus = 'healthy' | 'at-risk' | 'critical';
interface House { id: string; name: string; x: number; y: number; status: HouseStatus; members: number; lastVisit: string; condition?: string }

const houses: House[] = [
  { id: 'H1', name: 'Sunita Devi', x: 22, y: 28, status: 'critical', members: 5, lastVisit: '2 days ago', condition: 'Pregnant — 7th month, high BP' },
  { id: 'H2', name: 'Ram Prasad', x: 55, y: 18, status: 'critical', members: 3, lastVisit: '5 days ago', condition: 'TB Treatment — Month 4' },
  { id: 'H3', name: 'Geeta Kumari', x: 75, y: 42, status: 'at-risk', members: 4, lastVisit: '1 week ago', condition: 'Anemia follow-up' },
  { id: 'H4', name: 'Kavita Singh', x: 35, y: 60, status: 'healthy', members: 6, lastVisit: '3 days ago', condition: 'Post-natal care — healthy' },
  { id: 'H5', name: 'Lakshmi Bai', x: 62, y: 68, status: 'at-risk', members: 4, lastVisit: '4 days ago', condition: 'Diabetes Type-2' },
  { id: 'H6', name: 'Raju Yadav', x: 18, y: 72, status: 'healthy', members: 7, lastVisit: '1 day ago', condition: 'All clear' },
  { id: 'H7', name: 'Priya Sharma', x: 82, y: 78, status: 'healthy', members: 3, lastVisit: 'Today', condition: 'Post-vaccination checkup' },
  { id: 'H8', name: 'Meena Devi', x: 45, y: 40, status: 'at-risk', members: 5, lastVisit: '6 days ago', condition: 'High-risk pregnancy — 8th month' },
  { id: 'H9', name: 'Bhola Nath', x: 30, y: 85, status: 'healthy', members: 4, lastVisit: '2 days ago', condition: 'Hypertension — controlled' },
  { id: 'H10', name: 'Kamla Devi', x: 68, y: 25, status: 'critical', members: 6, lastVisit: '10 days ago', condition: 'TB suspected — needs screening' },
];

const statusColor = { healthy: '#10b981', 'at-risk': '#f59e0b', critical: '#ef4444' };
const routePoints = [
  { x: 50, y: 92 }, // ASHA start (village center)
  { x: 22, y: 28 }, // Sunita (critical)
  { x: 55, y: 18 }, // Ram (critical)
  { x: 68, y: 25 }, // Kamla (critical)
  { x: 45, y: 40 }, // Meena (at-risk)
  { x: 75, y: 42 }, // Geeta (at-risk)
  { x: 62, y: 68 }, // Lakshmi (at-risk)
];

export default function ASHAMap({ onSelectPatient }: { onSelectPatient: (h: House) => void }) {
  const [selected, setSelected] = useState<House | null>(null);
  const [ashaPos, setAshaPos] = useState({ x: 50, y: 92 });
  const [routeIdx, setRouteIdx] = useState(0);
  const [heatmapVisible, setHeatmapVisible] = useState(true);

  // Simulate ASHA worker movement along route
  useEffect(() => {
    const interval = setInterval(() => {
      setRouteIdx(prev => {
        const next = (prev + 1) % routePoints.length;
        setAshaPos(routePoints[next]);
        return next;
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleHouseClick = useCallback((h: House) => {
    setSelected(h);
    onSelectPatient(h);
  }, [onSelectPatient]);

  return (
    <div className="glass-card" style={{ padding: 0, overflow: 'hidden', position: 'relative' }}>
      {/* Header */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <MapPin size={16} color="#10b981" /> Live Village Health Map
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>Rampur Block · 3 villages · {houses.length} households</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button onClick={() => setHeatmapVisible(!heatmapVisible)} style={{
            background: heatmapVisible ? 'rgba(239,68,68,0.12)' : 'var(--accent-surface)',
            border: '1px solid var(--border-color)', borderRadius: 8, padding: '4px 10px',
            cursor: 'pointer', fontSize: 10, fontWeight: 600, color: heatmapVisible ? '#ef4444' : 'var(--text-muted)',
          }}>🔥 Heatmap</button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: '#10b981', fontWeight: 700 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', animation: 'mk-dot 1.5s ease infinite' }} /> LIVE
          </div>
        </div>
      </div>

      {/* Map Area */}
      <div style={{ position: 'relative', height: 340, background: 'linear-gradient(180deg, rgba(16,185,129,0.04), rgba(16,185,129,0.01))', overflow: 'hidden' }}>
        {/* Grid lines */}
        <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0, opacity: 0.08 }}>
          {Array.from({ length: 10 }, (_, i) => (
            <React.Fragment key={i}>
              <line x1={`${(i + 1) * 10}%`} y1="0" x2={`${(i + 1) * 10}%`} y2="100%" stroke="var(--text-muted)" strokeWidth={0.5} />
              <line x1="0" y1={`${(i + 1) * 10}%`} x2="100%" y2={`${(i + 1) * 10}%`} stroke="var(--text-muted)" strokeWidth={0.5} />
            </React.Fragment>
          ))}
        </svg>

        {/* Disease heatmap blobs */}
        {heatmapVisible && (
          <>
            <div style={{ position: 'absolute', left: '20%', top: '25%', width: 120, height: 120, borderRadius: '50%', background: 'radial-gradient(circle, rgba(239,68,68,0.18), transparent 70%)', pointerEvents: 'none', filter: 'blur(10px)' }} />
            <div style={{ position: 'absolute', left: '50%', top: '15%', width: 100, height: 100, borderRadius: '50%', background: 'radial-gradient(circle, rgba(239,68,68,0.14), transparent 70%)', pointerEvents: 'none', filter: 'blur(8px)' }} />
            <div style={{ position: 'absolute', left: '65%', top: '20%', width: 80, height: 80, borderRadius: '50%', background: 'radial-gradient(circle, rgba(239,68,68,0.12), transparent 70%)', pointerEvents: 'none', filter: 'blur(8px)' }} />
            <div style={{ position: 'absolute', left: '40%', top: '35%', width: 90, height: 90, borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,158,11,0.12), transparent 70%)', pointerEvents: 'none', filter: 'blur(8px)' }} />
          </>
        )}

        {/* Route path (dashed line) */}
        <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <polyline
            points={routePoints.map(p => `${p.x}%,${p.y}%`).join(' ')}
            fill="none" stroke="#3b82f6" strokeWidth={1.5} strokeDasharray="6 4" opacity={0.4}
          />
        </svg>

        {/* House markers */}
        {houses.map(h => (
          <motion.div key={h.id}
            whileHover={{ scale: 1.3, zIndex: 20 }}
            onClick={() => handleHouseClick(h)}
            style={{
              position: 'absolute', left: `${h.x}%`, top: `${h.y}%`, transform: 'translate(-50%,-50%)',
              cursor: 'pointer', zIndex: selected?.id === h.id ? 15 : 5,
            }}
          >
            <div style={{
              width: 28, height: 28, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: `${statusColor[h.status]}20`, border: `2px solid ${statusColor[h.status]}`,
              boxShadow: selected?.id === h.id ? `0 0 20px ${statusColor[h.status]}60` : `0 2px 8px ${statusColor[h.status]}30`,
              transition: 'box-shadow 0.3s',
            }}>
              <Home size={13} color={statusColor[h.status]} />
            </div>
            {h.status === 'critical' && (
              <div style={{
                position: 'absolute', top: -3, right: -3, width: 10, height: 10, borderRadius: '50%',
                background: '#ef4444', border: '2px solid var(--bg-card)',
                animation: 'sos-pulse 1.5s ease infinite',
              }} />
            )}
          </motion.div>
        ))}

        {/* ASHA Worker position (blue dot) */}
        <motion.div
          animate={{ left: `${ashaPos.x}%`, top: `${ashaPos.y}%` }}
          transition={{ duration: 2, ease: 'easeInOut' }}
          style={{ position: 'absolute', transform: 'translate(-50%,-50%)', zIndex: 30 }}
        >
          <div style={{
            width: 18, height: 18, borderRadius: '50%', background: '#3b82f6', border: '3px solid white',
            boxShadow: '0 0 20px rgba(59,130,246,0.5)',
          }} />
          <div style={{
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
            width: 40, height: 40, borderRadius: '50%', border: '1.5px solid rgba(59,130,246,0.3)',
            background: 'rgba(59,130,246,0.06)', pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute', top: -20, left: '50%', transform: 'translateX(-50%)',
            fontSize: 8, fontWeight: 700, color: '#3b82f6', background: 'rgba(59,130,246,0.12)',
            padding: '1px 6px', borderRadius: 4, whiteSpace: 'nowrap',
          }}>ASHA</div>
        </motion.div>

        {/* Selected house popup */}
        <AnimatePresence>
          {selected && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              style={{
                position: 'absolute', left: `${Math.min(selected.x, 70)}%`, top: `${Math.min(selected.y + 6, 70)}%`,
                background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 14,
                padding: '12px 14px', zIndex: 40, minWidth: 200, boxShadow: 'var(--shadow-lg)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: statusColor[selected.status] }} />
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{selected.name}</span>
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>{selected.condition}</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                <User size={9} style={{ display: 'inline' }} /> {selected.members} members · <Clock size={9} style={{ display: 'inline' }} /> {selected.lastVisit}
              </div>
              <button onClick={() => onSelectPatient(selected)} style={{
                marginTop: 8, width: '100%', padding: '5px 10px', borderRadius: 8, fontSize: 10, fontWeight: 700,
                background: statusColor[selected.status], border: 'none', color: 'white', cursor: 'pointer',
              }}>View Full Profile →</button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Legend + Route */}
      <div style={{ padding: '10px 20px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 12 }}>
          {[['#10b981', 'Healthy'], ['#f59e0b', 'At-Risk'], ['#ef4444', 'Critical']].map(([c, l]) => (
            <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: 'var(--text-muted)' }}>
              <div style={{ width: 8, height: 8, borderRadius: 3, background: c }} /> {l}
            </div>
          ))}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: '#3b82f6' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#3b82f6' }} /> You
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, color: 'var(--text-muted)' }}>
          <Navigation size={10} color="#3b82f6" />
          <span>Today's Route: <strong style={{ color: '#3b82f6' }}>6 visits</strong> · Priority-first</span>
        </div>
      </div>
    </div>
  );
}
