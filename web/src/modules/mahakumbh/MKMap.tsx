'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Building2, Cross, Pill } from 'lucide-react';

const generateHeatmap = () =>
  Array.from({ length: 12 }, (_, row) =>
    Array.from({ length: 16 }, (_, col) => {
      const cx = 8, cy = 6;
      const d = Math.sqrt(Math.pow(row - cy, 2) + Math.pow(col - cx, 2));
      return Math.min(100, Math.max(0, Math.round(100 - d * 12 + Math.random() * 25 - 12)));
    })
  );

const getColor = (v: number) =>
  v >= 80 ? '#ef4444' : v >= 60 ? '#f97316' : v >= 40 ? '#f59e0b' : v >= 20 ? '#84cc16' : '#10b981';

const pois = [
  { type: 'hospital', name: 'District Hospital', dist: '0.8 km', x: 25, y: 30, color: '#ef4444' },
  { type: 'hospital', name: 'AIIMS Camp', dist: '1.5 km', x: 72, y: 20, color: '#ef4444' },
  { type: 'camp', name: 'Health Camp A', dist: '0.3 km', x: 45, y: 55, color: '#10b981' },
  { type: 'camp', name: 'Health Camp B', dist: '1.1 km', x: 80, y: 65, color: '#10b981' },
  { type: 'pharmacy', name: 'Jan Aushadhi', dist: '0.5 km', x: 35, y: 75, color: '#3b82f6' },
  { type: 'pharmacy', name: 'MedPlus', dist: '0.9 km', x: 65, y: 80, color: '#3b82f6' },
];

export default function MKMap() {
  const [heatmap, setHeatmap] = useState(generateHeatmap());
  const [selectedPOI, setSelectedPOI] = useState<typeof pois[0] | null>(null);

  useEffect(() => {
    const i = setInterval(() => setHeatmap(generateHeatmap()), 4000);
    return () => clearInterval(i);
  }, []);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16 }}>
        {/* Map with heatmap */}
        <div className="glass-card" style={{ padding: 20, position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>🗺️ Crowd Density Heatmap</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Live GPS • Updates every 4s</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, color: '#10b981', fontWeight: 700 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981', animation: 'mk-dot 1.5s ease infinite' }} /> LIVE
            </div>
          </div>

          {/* Heatmap grid with POIs overlaid */}
          <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', background: '#0a0a0a' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(16, 1fr)', gap: 2, padding: 2 }}>
              {heatmap.map((row, ri) =>
                row.map((v, ci) => (
                  <motion.div key={`${ri}-${ci}`}
                    animate={{ background: getColor(v), opacity: 0.5 + v / 200 }}
                    transition={{ duration: 0.6 }}
                    title={`${v}% density`}
                    style={{ aspectRatio: '1', borderRadius: 3 }}
                  />
                ))
              )}
            </div>

            {/* POI markers */}
            {pois.map(poi => (
              <motion.div key={poi.name}
                whileHover={{ scale: 1.3 }}
                onClick={() => setSelectedPOI(poi)}
                style={{
                  position: 'absolute', left: `${poi.x}%`, top: `${poi.y}%`, transform: 'translate(-50%,-50%)',
                  width: 22, height: 22, borderRadius: '50%', background: poi.color,
                  border: '2px solid white', cursor: 'pointer', zIndex: 5,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: `0 2px 8px ${poi.color}80`,
                }}
              >
                {poi.type === 'hospital' ? <Building2 size={10} color="white" /> :
                 poi.type === 'camp' ? <Cross size={10} color="white" /> :
                 <Pill size={10} color="white" />}
              </motion.div>
            ))}

            {/* User location */}
            <div style={{
              position: 'absolute', left: '50%', top: '45%', transform: 'translate(-50%,-50%)', zIndex: 6,
            }}>
              <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#3b82f6', border: '3px solid white', boxShadow: '0 0 15px rgba(59,130,246,0.6)' }} />
              <div style={{
                position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
                width: 80, height: 80, borderRadius: '50%', border: '1.5px solid rgba(59,130,246,0.3)',
                background: 'rgba(59,130,246,0.06)', pointerEvents: 'none',
              }} />
            </div>
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', gap: 10, marginTop: 12, justifyContent: 'center' }}>
            {[['#10b981', 'Safe'], ['#84cc16', 'Low'], ['#f59e0b', 'Moderate'], ['#f97316', 'High'], ['#ef4444', 'Critical']].map(([c, l]) => (
              <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: 'var(--text-muted)' }}>
                <div style={{ width: 10, height: 10, borderRadius: 2, background: c }} /> {l}
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar - Nearby */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Selected POI detail */}
          {selectedPOI && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="glass-card" style={{ padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <div style={{ width: 32, height: 32, borderRadius: 10, background: `${selectedPOI.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <MapPin size={16} color={selectedPOI.color} />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{selectedPOI.name}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{selectedPOI.dist} away</div>
                </div>
              </div>
              <button style={{
                width: '100%', padding: '8px', borderRadius: 10, background: selectedPOI.color,
                border: 'none', color: 'white', fontSize: 11, fontWeight: 700, cursor: 'pointer',
              }}>Navigate →</button>
            </motion.div>
          )}

          {/* Nearby list */}
          {['Hospitals', 'Health Camps', 'Pharmacies'].map((cat, ci) => (
            <div key={cat} className="glass-card" style={{ padding: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
                {cat === 'Hospitals' ? '🏥' : cat === 'Health Camps' ? '⛺' : '💊'} Nearby {cat}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {pois.filter(p => (ci === 0 ? p.type === 'hospital' : ci === 1 ? p.type === 'camp' : p.type === 'pharmacy')).map(p => (
                  <div key={p.name} onClick={() => setSelectedPOI(p)} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '8px 10px', borderRadius: 10, background: 'var(--accent-surface)',
                    border: '1px solid var(--border-color)', cursor: 'pointer', fontSize: 11,
                  }}>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{p.name}</span>
                    <span style={{ color: p.color, fontWeight: 700 }}>{p.dist}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
