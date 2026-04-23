'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import type { RealPlace } from '@/components/LiveMap';
import { getMedicines, STATIC_SHOPS, Medicine, STATIC_MEDICINES } from '@/lib/firebaseData';

/* ── Local colour map (duplicated from LiveMap to avoid SSR leaflet import) ── */
const PLACE_COLORS: Record<string, string> = {
  jan_aushadhi: '#10b981',
  pharmacy:     '#6366f1',
  chain:        '#f97316',
};

/* ══════════════════════════════════════════════════════════════════════════
   DYNAMIC IMPORT — SSR-safe Leaflet
══════════════════════════════════════════════════════════════════════════ */
const LiveMap = dynamic(() => import('@/components/LiveMap'), {
  ssr: false,
  loading: () => (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg,#0f172a,#1e293b)',
      flexDirection: 'column', gap: 16,
    }}>
      <div style={{
        width: 44, height: 44,
        border: '3px solid rgba(16,185,129,.15)', borderTopColor: '#10b981',
        borderRadius: '50%', animation: 'ms-spin .8s linear infinite',
      }} />
      <span style={{ color: 'rgba(255,255,255,.45)', fontSize: 13, fontWeight: 600 }}>
        Initialising map…
      </span>
    </div>
  ),
});

/* ══════════════════════════════════════════════════════════════════════════
   GLOBAL CSS
══════════════════════════════════════════════════════════════════════════ */
const MS_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800;900&display=swap');

@keyframes ms-spin  { to { transform: rotate(360deg) } }
@keyframes ms-pulse { 0%,100%{opacity:.4} 50%{opacity:1} }
@keyframes ms-slide { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
@keyframes ms-ping  { 0%{transform:scale(1);opacity:1} 75%,100%{transform:scale(2);opacity:0} }
@keyframes ms-bar   { from{width:0} to{width:var(--w)} }

.leaflet-container { z-index: 1 !important; }
.leaflet-pane, .leaflet-control { z-index: 1 !important; }
.leaflet-top, .leaflet-bottom { z-index: 2 !important; }

/* ── Search input ── */
.ms-search {
  width: 100%;
  padding: 13px 48px 13px 48px;
  border-radius: 14px;
  border: 2px solid var(--border-color);
  background: var(--bg-card);
  color: var(--text-primary);
  font-size: 14px;
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 500;
  outline: none;
  transition: border-color .2s, box-shadow .2s;
  box-sizing: border-box;
}
.ms-search:focus {
  border-color: #10b981;
  box-shadow: 0 0 0 4px rgba(16,185,129,.1);
}
.ms-search::placeholder { color: var(--text-muted); font-weight: 400; }

/* ── Pills ── */
.ms-pill {
  padding: 5px 13px;
  border-radius: 30px;
  border: 1.5px solid var(--border-color);
  background: transparent;
  color: var(--text-muted);
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  transition: all .18s;
  white-space: nowrap;
  font-family: 'Space Grotesk', sans-serif;
}
.ms-pill:hover:not(.ms-pill-active) { background: var(--accent-surface); color: var(--text-primary); }
.ms-pill-green.ms-pill-active  { background: rgba(16,185,129,.14); border-color: #10b981; color: #10b981; }
.ms-pill-blue.ms-pill-active   { background: rgba(99,102,241,.14); border-color: #6366f1; color: #6366f1; }
.ms-pill-orange.ms-pill-active { background: rgba(249,115,22,.14); border-color: #f97316; color: #f97316; }
.ms-pill-purple.ms-pill-active { background: rgba(139,92,246,.14); border-color: #8b5cf6; color: #8b5cf6; }

/* ── Tab ── */
.ms-tab {
  padding: 8px 18px;
  border-radius: 12px;
  border: 1.5px solid var(--border-color);
  background: transparent;
  color: var(--text-muted);
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all .18s;
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: 'Space Grotesk', sans-serif;
}
.ms-tab.active { background: rgba(16,185,129,.12); border-color: #10b981; color: #10b981; }
.ms-tab:hover:not(.active) { background: var(--accent-surface); color: var(--text-primary); }

/* ── Cards ── */
.ms-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 18px;
  box-shadow: 0 2px 10px rgba(0,0,0,.05);
  position: relative;
  overflow: hidden;
  transition: box-shadow .2s;
}
.ms-card:hover { box-shadow: 0 6px 28px rgba(0,0,0,.1); }

/* ── Compact shop card ── */
.ms-compact {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 14px;
  border: 1.5px solid var(--border-color);
  background: var(--bg-card);
  cursor: pointer;
  transition: all .2s;
  position: relative;
  overflow: hidden;
}
.ms-compact:hover {
  border-color: rgba(99,102,241,.4);
  box-shadow: 0 8px 24px rgba(0,0,0,.1);
  transform: translateY(-1px);
}
.ms-compact.selected {
  border-color: #10b981;
  box-shadow: 0 0 0 3px rgba(16,185,129,.1), 0 8px 24px rgba(0,0,0,.12);
}
.ms-compact-dot {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}
.ms-compact-body { flex: 1; min-width: 0; }
.ms-compact-name {
  font-size: 13px;
  font-weight: 700;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-family: 'Space Grotesk', sans-serif;
}
.ms-compact-sub {
  font-size: 11px;
  color: var(--text-muted);
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.ms-compact-right { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; flex-shrink: 0; }
.ms-compact-dist { font-size: 14px; font-weight: 900; font-family: 'Space Grotesk', sans-serif; line-height: 1; }
.ms-compact-actions { display: flex; gap: 5px; }
.ms-compact-btn {
  padding: 5px 10px;
  border-radius: 8px;
  border: 1px solid;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  transition: all .15s;
  display: flex;
  align-items: center;
  gap: 4px;
  font-family: 'Space Grotesk', sans-serif;
}
.ms-compact-btn:hover { opacity: .82; transform: translateY(-1px); }

/* ── Section header ── */
.ms-section-hdr {
  font-size: 10px;
  font-weight: 800;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: .12em;
  margin-bottom: 8px;
}

/* ── Scrollbar ── */
.ms-scroll::-webkit-scrollbar { width: 4px; }
.ms-scroll::-webkit-scrollbar-track { background: transparent; }
.ms-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,.08); border-radius: 4px; }

/* ── Badge ── */
.ms-badge {
  padding: 3px 9px;
  border-radius: 20px;
  font-size: 9px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: .05em;
  display: inline-flex;
  align-items: center;
  gap: 3px;
}

/* ── Sim bar ── */
.ms-sim-track { height: 9px; border-radius: 8px; background: var(--accent-surface); overflow: hidden; flex: 1; }
.ms-sim-fill { height: 100%; border-radius: 8px; background: linear-gradient(90deg,#10b981,#06b6d4); animation: ms-bar .7s ease-out forwards; }

/* ── Buttons ── */
.ms-btn {
  padding: 8px 14px;
  border-radius: 11px;
  border: none;
  font-weight: 700;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  transition: all .16s;
  font-family: 'Space Grotesk', sans-serif;
}
.ms-btn:hover { opacity: .86; transform: translateY(-1px); }
.ms-btn-green  { background: rgba(16,185,129,.12); border: 1px solid rgba(16,185,129,.25); color: #10b981; }
.ms-btn-solid  { background: linear-gradient(135deg,#10b981,#0d9488); color: white; box-shadow: 0 4px 12px rgba(16,185,129,.28); }

/* ── Suggest dropdown ── */
.ms-suggest {
  padding: 11px 14px;
  cursor: pointer;
  font-size: 13px;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  gap: 10px;
  border-bottom: 1px solid var(--border-color);
  transition: background .12s;
  font-family: 'Space Grotesk', sans-serif;
}
.ms-suggest:last-child { border-bottom: none; }
.ms-suggest:hover { background: var(--accent-surface); }
`;

/* ══════════════════════════════════════════════════════════════════════════
   HOME SERVICES DATA
══════════════════════════════════════════════════════════════════════════ */
const HOME_STAFF = [
  { id:1, name:'Anjali Devi',      role:'Registered Nurse',    exp:'8 yrs',  dist:0.6, rating:4.9, avail:'Available Now',  skills:['Injection','Wound Care','BP Check'],        phone:'9876000001', gender:'female' },
  { id:2, name:'Rakesh Kumar',     role:'IV Drip Technician',  exp:'5 yrs',  dist:1.1, rating:4.7, avail:'Available Now',  skills:['IV Drip','Saline','Blood Sample'],          phone:'9876000002', gender:'male'   },
  { id:3, name:'Sunita Sharma',    role:'Home Nurse',          exp:'12 yrs', dist:1.4, rating:5.0, avail:'Book Later',     skills:['Post-surgery','Elder Care','Physio'],       phone:'9876000003', gender:'female' },
  { id:4, name:'Dr. Arvind Joshi', role:'Visiting Doctor',     exp:'18 yrs', dist:2.0, rating:4.8, avail:'Book Later',     skills:['Consultation','Prescription','Emergency'], phone:'9876000004', gender:'male'   },
  { id:5, name:'Priya Yadav',      role:'Injection Provider',  exp:'4 yrs',  dist:2.3, rating:4.6, avail:'Available Now',  skills:['IM Injection','SC Injection','Insulin'],   phone:'9876000005', gender:'female' },
];

/* ══════════════════════════════════════════════════════════════════════════
   HELPERS — Haversine, Overpass API, Static fallback
══════════════════════════════════════════════════════════════════════════ */
function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLng = (lng2 - lng1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function fetchNearbyPharmacies(
  lat: number,
  lng: number,
  radiusM = 3000,
): Promise<RealPlace[]> {
  const q = `[out:json][timeout:20];(
    node["amenity"="pharmacy"](around:${radiusM},${lat},${lng});
    way["amenity"="pharmacy"](around:${radiusM},${lat},${lng});
    node["shop"="chemist"](around:${radiusM},${lat},${lng});
    way["shop"="chemist"](around:${radiusM},${lat},${lng});
    node["healthcare"="pharmacy"](around:${radiusM},${lat},${lng});
    node["shop"="medical_supply"](around:${radiusM},${lat},${lng});
  );out center body qt;`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 18000);

  const res = await fetch(
    `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(q)}`,
    { signal: controller.signal },
  );
  clearTimeout(timer);

  if (!res.ok) throw new Error('Overpass error');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: { elements: any[] } = await res.json();

  const seen = new Set<string>();

  return data.elements
    .filter(el => {
      if (!el.tags?.name) return false;
      const key = `${el.tags.name}_${String((el.lat ?? el.center?.lat ?? 0)).slice(0, 7)}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .map(el => {
      const elLat = Number(el.lat ?? el.center?.lat ?? 0);
      const elLng = Number(el.lon ?? el.center?.lon ?? 0);
      const dist  = haversine(lat, lng, elLat, elLng);
      const name  = String(el.tags.name);
      const nl    = name.toLowerCase();

      const isJA    = nl.includes('jan aushadhi') || nl.includes('janaushadhi') || nl.includes('pmbjp') || nl.includes('pradhan mantri bhartiya janaushadhi');
      const isChain = nl.includes('apollo') || nl.includes('medplus') || nl.includes('wellness forever') || nl.includes('1mg') || nl.includes('netmeds') || nl.includes('guardian') || nl.includes('medkart');

      const addrParts = [
        el.tags['addr:housenumber'],
        el.tags['addr:street'],
        el.tags['addr:suburb'] || el.tags['addr:city'],
      ].filter(Boolean);

      return {
        id:           `osm_${el.type}_${el.id}`,
        name,
        address:      addrParts.length > 0
                        ? addrParts.join(', ')
                        : (el.tags['addr:full'] || el.tags.description || ''),
        lat:          elLat,
        lng:          elLng,
        distance_km:  Math.round(dist * 100) / 100,
        distance:     dist < 1
                        ? `${Math.round(dist * 1000)}m`
                        : `${dist.toFixed(1)}km`,
        phone:        el.tags.phone || el.tags['contact:phone'] || el.tags['contact:mobile'],
        placeType:    isJA ? 'jan_aushadhi' : isChain ? 'chain' : 'pharmacy',
        source:       'overpass',
      } as RealPlace;
    })
    .sort((a, b) => a.distance_km - b.distance_km);
}

/** Convert static STATIC_SHOPS to RealPlace[] for demo / fallback */
function staticToRealPlaces(): RealPlace[] {
  return STATIC_SHOPS.map(s => ({
    id:           `static_${s.id}`,
    name:         s.name,
    address:      s.address,
    lat:          s.lat,
    lng:          s.lng,
    distance_km:  s.distance_km,
    distance:     s.distance,
    phone:        s.phone,
    isOpen:       s.open,
    placeType:    s.type === 'Jan Aushadhi' ? 'jan_aushadhi' : s.type === 'Chain' ? 'chain' : 'pharmacy',
    source:       'static',
  }));
}

/* ══════════════════════════════════════════════════════════════════════════
   MEDICINE INFO CARD
══════════════════════════════════════════════════════════════════════════ */
function MedicineInfoCard({
  med, saved, onSave,
}: { med: Medicine; saved: boolean; onSave: () => void }) {
  const saving = med.price - med.generic_price;

  return (
    <div className="ms-card" style={{ padding: '18px 20px' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg,#10b981,#06b6d4)', borderRadius: '18px 18px 0 0' }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 17, fontWeight: 900, color: 'var(--text-primary)', fontFamily: 'Space Grotesk,sans-serif', lineHeight: 1.2 }}>{med.name}</div>
          <div style={{ fontSize: 11, color: '#10b981', fontWeight: 600, marginTop: 2 }}>{med.category || med.use}</div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 1 }}>💊 {med.composition}</div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontSize: 24, fontWeight: 900, color: '#f97316', fontFamily: 'Space Grotesk,sans-serif', lineHeight: 1 }}>₹{med.price}</div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>per strip</div>
          {saving > 0 && <div style={{ fontSize: 11, fontWeight: 700, color: '#10b981', marginTop: 2 }}>Save ₹{saving}</div>}
        </div>
      </div>

      {/* Info rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
        {[
          ['🔬', 'Composition', med.composition],
          ['💡', 'Used For',    med.use],
          med.dosage ? ['⏰', 'Dosage', med.dosage] : null,
        ].filter((row): row is string[] => row !== null).map(([icon, label, val]) => (
          <div key={label as string} style={{
            padding: '8px 11px', borderRadius: 10,
            background: 'var(--accent-surface)', border: '1px solid var(--border-color)',
          }}>
            <div style={{ fontSize: 9, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 1 }}>{icon} {label as string}</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{val as string}</div>
          </div>
        ))}
      </div>

      {med.side_effects && med.side_effects.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <div className="ms-section-hdr">⚠️ Side Effects</div>
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
            {med.side_effects.map(se => (
              <span key={se} style={{ padding: '3px 9px', borderRadius: 20, fontSize: 10, background: 'rgba(251,146,60,.08)', color: '#fb923c', border: '1px solid rgba(251,146,60,.2)', fontWeight: 600 }}>{se}</span>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <button className={`ms-btn ${saved ? 'ms-btn-green' : ''}`}
          style={!saved ? { border: '1px solid var(--border-color)', background: 'var(--accent-surface)', color: 'var(--text-muted)' } : {}}
          onClick={onSave}>
          {saved ? '🔖 Saved' : '🔖 Save'}
        </button>
        <button className="ms-btn ms-btn-solid">🛒 Order Now</button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   AI COMPARISON CARD
══════════════════════════════════════════════════════════════════════════ */
function AIComparisonCard({ med }: { med: Medicine }) {
  const saving  = med.price - med.generic_price;
  const savePct = Math.round((saving / med.price) * 100);

  return (
    <div className="ms-card" style={{ padding: '18px 20px' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg,#6366f1,#8b5cf6)', borderRadius: '18px 18px 0 0' }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <div style={{ width: 30, height: 30, borderRadius: 9, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>⚖️</div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'Space Grotesk,sans-serif' }}>AI Generic Comparison</div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Brand vs Generic · instant analysis</div>
        </div>
      </div>

      {/* Brand vs Generic */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 32px 1fr', gap: 8, alignItems: 'center', marginBottom: 14 }}>
        <div style={{ padding: '12px', borderRadius: 12, background: 'rgba(249,115,22,.06)', border: '1px solid rgba(249,115,22,.2)', textAlign: 'center' }}>
          <div style={{ fontSize: 9, fontWeight: 800, color: '#f97316', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 4 }}>Brand</div>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 3 }}>{med.name}</div>
          <div style={{ fontSize: 20, fontWeight: 900, color: '#f97316', fontFamily: 'Space Grotesk,sans-serif' }}>₹{med.price}</div>
          <div style={{ fontSize: 9, color: 'var(--text-muted)', marginTop: 1 }}>per strip</div>
        </div>
        <div style={{ textAlign: 'center', fontSize: 11, fontWeight: 900, color: 'var(--text-muted)' }}>VS</div>
        <div style={{ padding: '12px', borderRadius: 12, background: 'rgba(16,185,129,.06)', border: '1px solid rgba(16,185,129,.2)', textAlign: 'center' }}>
          <div style={{ fontSize: 9, fontWeight: 800, color: '#10b981', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 4 }}>✓ Generic</div>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 3 }}>{med.generic}</div>
          <div style={{ fontSize: 20, fontWeight: 900, color: '#10b981', fontFamily: 'Space Grotesk,sans-serif' }}>₹{med.generic_price}</div>
          <div style={{ fontSize: 9, color: 'var(--text-muted)', marginTop: 1 }}>per strip</div>
        </div>
      </div>

      {/* Similarity bar */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)' }}>Composition Similarity</span>
          <span style={{ fontSize: 13, fontWeight: 900, color: med.similarity >= 95 ? '#10b981' : '#f97316', fontFamily: 'Space Grotesk,sans-serif' }}>{med.similarity}%</span>
        </div>
        <div className="ms-sim-track">
          <div className="ms-sim-fill" style={{ ['--w' as string]: `${med.similarity}%`, width: 0 }} />
        </div>
        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 3 }}>
          {med.similarity >= 98 ? '✅ Virtually identical — CDSCO approved' : med.similarity >= 90 ? '✅ Highly similar — clinically equivalent' : '⚠️ Slightly different formulation'}
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 7 }}>
        {[
          { l: 'You Save', v: `₹${saving}`, c: '#10b981' },
          { l: '% Off',    v: `${savePct}%`, c: '#06b6d4' },
          { l: 'Efficacy', v: 'Equal',        c: '#8b5cf6' },
        ].map(s => (
          <div key={s.l} style={{ padding: '9px 6px', borderRadius: 11, textAlign: 'center', background: 'var(--accent-surface)', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: 17, fontWeight: 900, color: s.c, fontFamily: 'Space Grotesk,sans-serif', lineHeight: 1 }}>{s.v}</div>
            <div style={{ fontSize: 9, color: 'var(--text-muted)', marginTop: 2, fontWeight: 600 }}>{s.l}</div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 10, padding: '9px 12px', borderRadius: 11, background: 'linear-gradient(135deg,rgba(16,185,129,.1),rgba(6,182,212,.05))', border: '1px solid rgba(16,185,129,.2)', display: 'flex', alignItems: 'center', gap: 9 }}>
        <span style={{ fontSize: 18 }}>💡</span>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#10b981' }}>AI Recommendation</div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', lineHeight: 1.5 }}>
            Switch to <strong style={{ color: 'var(--text-primary)' }}>{med.generic}</strong> and save <strong style={{ color: '#10b981' }}>₹{saving}</strong> per strip. Available at Jan Aushadhi stores.
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   COMPACT SHOP CARD
══════════════════════════════════════════════════════════════════════════ */
function CompactShopCard({
  place, selected, rank, onSelect, onViewMap,
}: {
  place:     RealPlace;
  selected:  boolean;
  rank:      number;
  onSelect:  () => void;
  onViewMap: () => void;
}) {
  const tc   = PLACE_COLORS[place.placeType] || '#6366f1';
  const icon = place.placeType === 'jan_aushadhi' ? '🟢' : place.placeType === 'chain' ? '🟠' : '🔵';
  const label = place.placeType === 'jan_aushadhi' ? 'Jan Aushadhi' : place.placeType === 'chain' ? 'Chain' : 'Pharmacy';

  return (
    <motion.div
      className={`ms-compact ${selected ? 'selected' : ''}`}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank * 0.04 }}
      onClick={onSelect}
      layout
    >
      {/* Left accent bar */}
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: tc, borderRadius: '14px 0 0 14px' }} />

      {/* Icon dot */}
      <div className="ms-compact-dot" style={{ background: `${tc}16`, border: `1px solid ${tc}30` }}>
        {icon}
      </div>

      {/* Info */}
      <div className="ms-compact-body">
        <div className="ms-compact-name">{place.name}</div>
        <div className="ms-compact-sub">
          {label}
          {place.address ? ` · ${place.address}` : ''}
        </div>

        {/* Actions row */}
        <div className="ms-compact-actions" style={{ marginTop: 5 }}>
          {place.phone && (
            <button
              className="ms-compact-btn"
              style={{ background: `${tc}10`, borderColor: `${tc}30`, color: tc }}
              onClick={e => { e.stopPropagation(); window.open(`tel:${place.phone}`); }}
            >
              📞 Call
            </button>
          )}
          <button
            className="ms-compact-btn"
            style={{ background: 'var(--accent-surface)', borderColor: 'var(--border-color)', color: 'var(--text-muted)' }}
            onClick={e => { e.stopPropagation(); onViewMap(); }}
          >
            📍 Map
          </button>
          {place.source === 'overpass' && (
            <span style={{
              padding: '4px 8px', borderRadius: 8, fontSize: 9, fontWeight: 800,
              background: 'rgba(16,185,129,.08)', color: '#10b981', border: '1px solid rgba(16,185,129,.2)',
              alignSelf: 'center',
            }}>LIVE</span>
          )}
        </div>
      </div>

      {/* Right: distance + status */}
      <div className="ms-compact-right">
        <div className="ms-compact-dist" style={{ color: tc }}>
          {place.distance}
        </div>
        {place.rating != null && (
          <div style={{ fontSize: 10, color: '#f59e0b', fontWeight: 700 }}>⭐ {place.rating.toFixed(1)}</div>
        )}
        {place.isOpen !== undefined && (
          <div style={{ fontSize: 10, fontWeight: 700, color: place.isOpen ? '#10b981' : '#ef4444' }}>
            {place.isOpen ? '🟢 Open' : '🔴 Closed'}
          </div>
        )}
      </div>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   LEFT PANEL — search + shop list
══════════════════════════════════════════════════════════════════════════ */
function LeftPanel({
  medicines, places, loadingPlaces, mapStatus,
  selectedPlace, onPlaceSelect, radiusKm, onRadiusChange,
}: {
  medicines:      Medicine[];
  places:         RealPlace[];
  loadingPlaces:  boolean;
  mapStatus:      string;
  selectedPlace:  RealPlace | null;
  onPlaceSelect:  (p: RealPlace) => void;
  radiusKm:       number;       // lifted from parent — drives BOTH list AND map
  onRadiusChange: (r: number) => void;
}) {
  const [q, setQ]                     = useState('');
  const [result, setResult]           = useState<Medicine | null>(null);
  const [searching, setSearching]     = useState(false);
  const [showSuggest, setShowSuggest] = useState(false);
  const [activeView, setActiveView]   = useState<'info' | 'compare'>('info');
  const [saved, setSaved]             = useState<string[]>(['Pantokind', 'Glycomet']);
  const [typeFilter, setTypeFilter]   = useState('All');

  const suggestions = useMemo(() =>
    q.length > 0
      ? medicines.filter(m =>
          m.name.toLowerCase().startsWith(q.toLowerCase()) ||
          m.generic.toLowerCase().startsWith(q.toLowerCase())
        ).slice(0, 6)
      : [],
    [q, medicines],
  );

  const doSearch = useCallback((query: string) => {
    if (!query.trim()) return;
    setSearching(true);
    setShowSuggest(false);
    setActiveView('info');
    const found = medicines.find(m =>
      m.name.toLowerCase().includes(query.toLowerCase()) ||
      m.generic.toLowerCase().includes(query.toLowerCase()) ||
      m.composition.toLowerCase().includes(query.toLowerCase()),
    ) || null;
    setTimeout(() => { setResult(found); setSearching(false); }, 400);
  }, [medicines]);

  const filteredPlaces = useMemo(() =>
    places.filter(p => {
      if (p.distance_km > radiusKm) return false;
      if (typeFilter === 'All') return true;
      if (typeFilter === 'Jan Aushadhi') return p.placeType === 'jan_aushadhi';
      if (typeFilter === 'Chain') return p.placeType === 'chain';
      if (typeFilter === 'Pharmacy') return p.placeType === 'pharmacy';
      return true;
    }).sort((a, b) => a.distance_km - b.distance_km),
    [places, typeFilter, radiusKm],
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* ── Sticky search bar ── */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 20,
        background: 'var(--bg-card)',
        borderBottom: '1px solid var(--border-color)',
        paddingBottom: 12,
        marginBottom: -4,
      }}>
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 18, pointerEvents: 'none', zIndex: 2 }}>🔍</span>
          <input
            className="ms-search"
            value={q}
            placeholder="Search medicine, e.g. Dolo 650, Pantokind…"
            onChange={e => { setQ(e.target.value); setShowSuggest(e.target.value.length > 0); }}
            onKeyDown={e => { if (e.key === 'Enter') doSearch(q); }}
            onFocus={() => q.length > 0 && setShowSuggest(true)}
            onBlur={() => setTimeout(() => setShowSuggest(false), 150)}
          />
          {q && (
            <button
              onClick={() => { setQ(''); setResult(null); setShowSuggest(false); }}
              style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 18, zIndex: 2, lineHeight: 1 }}
            >×</button>
          )}

          {/* Suggestions */}
          <AnimatePresence>
            {showSuggest && suggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
                style={{
                  position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, zIndex: 999,
                  background: 'var(--bg-card)', border: '1px solid var(--border-color)',
                  borderRadius: 14, boxShadow: '0 12px 40px rgba(0,0,0,.2)', overflow: 'hidden',
                }}
              >
                {suggestions.map(med => (
                  <div key={med.id} className="ms-suggest" onMouseDown={() => { setQ(med.name); doSearch(med.name); }}>
                    <span style={{ fontSize: 18 }}>💊</span>
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{med.name}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{med.generic} · ₹{med.price}</div>
                    </div>
                    <span style={{ marginLeft: 'auto', fontSize: 11, color: '#10b981', fontWeight: 700 }}>₹{med.price}</span>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Medicine search result ── */}
      {searching && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderRadius: 14, background: 'var(--accent-surface)', border: '1px solid var(--border-color)' }}>
          <div style={{ width: 20, height: 20, border: '2px solid rgba(16,185,129,.2)', borderTopColor: '#10b981', borderRadius: '50%', animation: 'ms-spin .7s linear infinite' }} />
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Searching database…</span>
        </div>
      )}

      <AnimatePresence mode="wait">
        {!searching && result && (
          <motion.div key={result.name} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

            {/* Sub-tabs */}
            <div style={{ display: 'flex', gap: 7 }}>
              {([['info', '💊 Info'], ['compare', '⚖️ Compare']] as const).map(([t, l]) => (
                <button key={t} className={`ms-tab ${activeView === t ? 'active' : ''}`} onClick={() => setActiveView(t)}>{l}</button>
              ))}
              <button
                className="ms-tab"
                style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontSize: 12 }}
                onClick={() => { setQ(''); setResult(null); }}
              >✕ Clear</button>
            </div>

            {activeView === 'info' && (
              <MedicineInfoCard
                med={result}
                saved={saved.includes(result.name)}
                onSave={() => setSaved(p => p.includes(result.name) ? p.filter(x => x !== result.name) : [result.name, ...p])}
              />
            )}
            {activeView === 'compare' && <AIComparisonCard med={result} />}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Not found ── */}
      {!searching && q && result === null && (
        <div className="ms-card" style={{ padding: '24px', textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>💊</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>Medicine not found</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Try: Pantokind, Dolo 650, Azithral, Glycomet</div>
        </div>
      )}

      {/* ── Initial quick searches ── */}
      {!result && !searching && !q && (
        <div className="ms-card" style={{ padding: '14px 16px', background: 'linear-gradient(135deg,rgba(16,185,129,.05),rgba(6,182,212,.03))' }}>
          <div className="ms-section-hdr">💊 Popular searches</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {medicines.slice(0, 8).map(m => (
              <motion.button
                key={m.id}
                whileHover={{ scale: 1.04 }} whileTap={{ scale: .96 }}
                onClick={() => { setQ(m.name); doSearch(m.name); }}
                style={{
                  padding: '5px 12px', borderRadius: 30,
                  background: 'var(--bg-card)', border: '1px solid var(--border-color)',
                  color: 'var(--text-secondary)', fontSize: 11, fontWeight: 600, cursor: 'pointer',
                  fontFamily: 'Space Grotesk,sans-serif', transition: 'all .18s',
                }}
              >{m.name}</motion.button>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          NEARBY SHOP LIST
      ══════════════════════════════════════════════════ */}
      <div>
        {/* Header + filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
          <div className="ms-section-hdr" style={{ marginBottom: 0 }}>🏪 Nearby Medical Stores</div>

          {/* Source badge */}
          <span style={{
            padding: '3px 9px', borderRadius: 20, fontSize: 9, fontWeight: 800,
            background: mapStatus === 'live' ? 'rgba(16,185,129,.1)' : 'rgba(249,115,22,.1)',
            color: mapStatus === 'live' ? '#10b981' : '#f97316',
            border: `1px solid ${mapStatus === 'live' ? 'rgba(16,185,129,.25)' : 'rgba(249,115,22,.25)'}`,
            display: 'flex', alignItems: 'center', gap: 4,
          }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'currentColor', display: 'inline-block' }} />
            {mapStatus === 'live' ? 'LIVE DATA' : mapStatus === 'loading' ? 'FETCHING…' : 'DEMO DATA'}
          </span>

          <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-muted)' }}>
            {filteredPlaces.length} found
          </span>
        </div>

        {/* Radius pills */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
          {[1, 2, 3, 5].map(r => (
            <button key={r} className={`ms-pill ms-pill-green ${radiusKm === r ? 'ms-pill-active' : ''}`} onClick={() => onRadiusChange(r)}>
              {r} km
            </button>
          ))}
        </div>

        {/* Type pills */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
          {['All', 'Pharmacy', 'Jan Aushadhi', 'Chain'].map(t => (
            <button key={t} className={`ms-pill ms-pill-blue ${typeFilter === t ? 'ms-pill-active' : ''}`} onClick={() => setTypeFilter(t)}>
              {t}
            </button>
          ))}
        </div>

        {/* Shop cards */}
        {loadingPlaces ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{
                height: 76, borderRadius: 14,
                background: 'var(--accent-surface)',
                border: '1.5px solid var(--border-color)',
                animation: 'ms-pulse 1.4s infinite',
              }} />
            ))}
            <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', paddingTop: 4 }}>
              Fetching real nearby pharmacies…
            </div>
          </div>
        ) : filteredPlaces.length === 0 ? (
          <div className="ms-card" style={{ padding: '24px', textAlign: 'center' }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>🏪</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>No shops found</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Try increasing the radius or changing filters</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            {filteredPlaces.map((place, i) => (
              <CompactShopCard
                key={place.id}
                place={place}
                rank={i}
                selected={selectedPlace?.id === place.id}
                onSelect={() => onPlaceSelect(place)}
                onViewMap={() => onPlaceSelect(place)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   HOME SERVICES PANEL
══════════════════════════════════════════════════════════════════════════ */
function HomeServicesPanel() {
  const [filter, setFilter] = useState('All');
  const roles    = ['All', 'Nurse', 'IV Drip', 'Injection', 'Doctor'];
  const filtered = HOME_STAFF.filter(s => filter === 'All' || s.role.toLowerCase().includes(filter.toLowerCase()));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ padding: '14px 18px', borderRadius: 16, background: 'linear-gradient(135deg,rgba(139,92,246,.1),rgba(99,102,241,.06))', border: '1px solid rgba(139,92,246,.2)' }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: '#8b5cf6', marginBottom: 4, fontFamily: 'Space Grotesk,sans-serif' }}>🏡 Home Healthcare Network</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.7 }}>
          Trained professionals for home visits — injections, IV drips, nursing, and doctor consultations.
        </div>
      </div>

      <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
        {roles.map(r => (
          <button key={r} className={`ms-pill ms-pill-purple ${filter === r ? 'ms-pill-active' : ''}`} onClick={() => setFilter(r)}>{r}</button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 10 }}>
        {filtered.map((p, i) => (
          <motion.div key={p.id} className="ms-card"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .06 * i }}
            whileHover={{ y: -3, boxShadow: '0 16px 40px rgba(0,0,0,.15)' }}
            style={{ padding: '16px 18px' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg,#8b5cf6,#6366f1)', borderRadius: '18px 18px 0 0' }} />

            <div style={{ display: 'flex', gap: 11, marginBottom: 12 }}>
              <div style={{
                width: 48, height: 48, borderRadius: 14, flexShrink: 0,
                background: `linear-gradient(135deg,${p.gender === 'female' ? '#f9a8d4,#e879f9' : '#93c5fd,#6366f1'})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
              }}>
                {p.gender === 'female' ? '👩' : '👨'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'Space Grotesk,sans-serif' }}>{p.name}</div>
                <div style={{ fontSize: 12, color: '#8b5cf6', fontWeight: 600, marginTop: 2 }}>{p.role}</div>
                <div style={{ display: 'flex', gap: 8, marginTop: 3, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>⭐ {p.rating}</span>
                  <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>· {p.exp}</span>
                  <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>· {p.dist} km</span>
                </div>
              </div>
              <span className="ms-badge" style={{
                background: p.avail === 'Available Now' ? 'rgba(16,185,129,.12)' : 'rgba(249,115,22,.1)',
                color:      p.avail === 'Available Now' ? '#10b981' : '#f97316',
                border:     `1px solid ${p.avail === 'Available Now' ? 'rgba(16,185,129,.25)' : 'rgba(249,115,22,.25)'}`,
                fontSize: 9, flexShrink: 0, alignSelf: 'flex-start',
              }}>
                {p.avail === 'Available Now' ? '🟢 Now' : '📅 Book'}
              </span>
            </div>

            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 12 }}>
              {p.skills.map(sk => (
                <span key={sk} style={{ padding: '3px 9px', borderRadius: 20, background: 'rgba(139,92,246,.08)', border: '1px solid rgba(139,92,246,.2)', fontSize: 10, color: '#8b5cf6', fontWeight: 600 }}>{sk}</span>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7 }}>
              <button className="ms-btn ms-btn-green" onClick={() => window.open(`tel:${p.phone}`)}>📞 Call</button>
              <button className="ms-btn" style={{ background: 'rgba(37,211,102,.08)', border: '1px solid rgba(37,211,102,.22)', color: '#25D366' }} onClick={() => window.open(`https://wa.me/${p.phone}`)}>💬 WhatsApp</button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   MAP LEGEND OVERLAY
══════════════════════════════════════════════════════════════════════════ */
function MapLegend({ count, mapStatus, selectedPlace, onClear }: {
  count: number;
  mapStatus: string;
  selectedPlace: RealPlace | null;
  onClear: () => void;
}) {
  return (
    <>
      {/* Top-left: count badge */}
      <div style={{ position: 'absolute', top: 12, left: 12, zIndex: 10 }}>
        <div style={{
          padding: '7px 13px', borderRadius: 30,
          background: 'rgba(0,0,0,.75)', backdropFilter: 'blur(12px)',
          fontSize: 12, fontWeight: 700, color: 'white',
          display: 'flex', alignItems: 'center', gap: 7,
          boxShadow: '0 4px 20px rgba(0,0,0,.4)',
        }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981', display: 'inline-block', animation: mapStatus === 'live' ? 'ms-ping 1.6s infinite' : 'none' }} />
          🗺️ {count} pharmacies nearby
        </div>
      </div>

      {/* Top-right: selected shop pill */}
      <AnimatePresence>
        {selectedPlace && (
          <motion.div
            initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }}
            style={{ position: 'absolute', top: 12, right: 12, zIndex: 10 }}
          >
            <div style={{
              padding: '7px 13px', borderRadius: 30,
              background: 'rgba(16,185,129,.9)', backdropFilter: 'blur(12px)',
              fontSize: 12, fontWeight: 700, color: 'white',
              display: 'flex', alignItems: 'center', gap: 8,
              boxShadow: '0 4px 20px rgba(16,185,129,.35)',
            }}>
              📍 {selectedPlace.name.split(' ').slice(0, 3).join(' ')}
              <button onClick={onClear} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'white', fontSize: 16, lineHeight: 1, opacity: .7 }}>×</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom: legend */}
      <div style={{ position: 'absolute', bottom: 40, left: 12, zIndex: 10 }}>
        <div style={{
          padding: '8px 12px', borderRadius: 12,
          background: 'rgba(0,0,0,.7)', backdropFilter: 'blur(10px)',
          display: 'flex', flexDirection: 'column', gap: 4,
          boxShadow: '0 4px 16px rgba(0,0,0,.3)',
        }}>
          {[
            { c: '#10b981', l: 'Jan Aushadhi' },
            { c: '#6366f1', l: 'Pharmacy' },
            { c: '#f97316', l: 'Chain Store' },
          ].map(item => (
            <div key={item.l} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: item.c }} />
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,.75)', fontWeight: 600 }}>{item.l}</span>
            </div>
          ))}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2, paddingTop: 4, borderTop: '1px solid rgba(255,255,255,.1)' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#3b82f6' }} />
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,.75)', fontWeight: 600 }}>You</span>
          </div>
        </div>
      </div>
    </>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   MAIN MODULE
══════════════════════════════════════════════════════════════════════════ */
type MainTab = 'search' | 'home';

export default function MedicalServicesModule() {
  const [medicines, setMedicines]       = useState<Medicine[]>(STATIC_MEDICINES);
  const [places, setPlaces]             = useState<RealPlace[]>([]);
  const [loadingPlaces, setLoadingPlaces] = useState(true);
  const [mapStatus, setMapStatus]       = useState<'loading' | 'live' | 'demo'>('loading');
  const [tab, setTab]                   = useState<MainTab>('search');
  const [selectedPlace, setSelectedPlace] = useState<RealPlace | null>(null);
  const [userLat, setUserLat]           = useState(22.7196);
  const [userLng, setUserLng]           = useState(75.8577);
  const [locationGranted, setLocationGranted] = useState(false);
  const [radiusKm, setRadiusKm]               = useState(3); // shared between list + map

  /* ── Load medicines ── */
  useEffect(() => {
    getMedicines().then(setMedicines).catch(() => {});
  }, []);

  /* ── Get user location → fetch Overpass ── */
  useEffect(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      // No geolocation — use static demo data
      setPlaces(staticToRealPlaces());
      setMapStatus('demo');
      setLoadingPlaces(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async pos => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setUserLat(lat);
        setUserLng(lng);
        setLocationGranted(true);

        try {
          const real = await fetchNearbyPharmacies(lat, lng, 5000); // fetch max range; radius filter applied client-side
          if (real.length > 0) {
            setPlaces(real);
            setMapStatus('live');
          } else {
            // Overpass returned 0 results (rural area) — use static
            setPlaces(staticToRealPlaces());
            setMapStatus('demo');
          }
        } catch {
          setPlaces(staticToRealPlaces());
          setMapStatus('demo');
        } finally {
          setLoadingPlaces(false);
        }
      },
      () => {
        // Permission denied — use static at default location
        setPlaces(staticToRealPlaces());
        setMapStatus('demo');
        setLoadingPlaces(false);
      },
      { timeout: 8000, maximumAge: 60000 },
    );
  }, []);

  const handlePlaceSelect = (place: RealPlace) => {
    setSelectedPlace(prev => prev?.id === place.id ? null : place);
  };

  return (
    <>
      <style>{MS_CSS}</style>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{ display: 'flex', flexDirection: 'column', gap: 14, height: '100%' }}
      >
        {/* ══════════════════════════════════════
            HEADER
        ══════════════════════════════════════ */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--text-primary)', fontFamily: 'Space Grotesk,sans-serif', letterSpacing: '-.03em', lineHeight: 1 }}>
              🏥 Medical Services
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, lineHeight: 1.6 }}>
              Real-time map · Nearby pharmacies · AI generic comparison · Home healthcare
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Data source badge */}
            <div style={{
              padding: '5px 12px', borderRadius: 30,
              background: mapStatus === 'live' ? 'rgba(16,185,129,.1)' : mapStatus === 'demo' ? 'rgba(249,115,22,.1)' : 'rgba(148,163,184,.1)',
              border: `1px solid ${mapStatus === 'live' ? 'rgba(16,185,129,.3)' : mapStatus === 'demo' ? 'rgba(249,115,22,.3)' : 'rgba(148,163,184,.2)'}`,
              fontSize: 11, fontWeight: 700,
              color: mapStatus === 'live' ? '#10b981' : mapStatus === 'demo' ? '#f97316' : '#94a3b8',
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'currentColor', animation: mapStatus === 'live' ? 'ms-ping 1.5s infinite' : 'none' }} />
              {mapStatus === 'live' ? 'Live OpenStreetMap' : mapStatus === 'loading' ? 'Fetching…' : 'Demo Data'}
            </div>

            {/* Stats chips */}
            {[
              { icon: '🏪', label: 'Shops',    val: places.length.toString(),     c: '#10b981' },
              { icon: '💊', label: 'Medicines', val: medicines.length.toString(),  c: '#6366f1' },
              { icon: '🏡', label: 'Staff',     val: HOME_STAFF.length.toString(), c: '#8b5cf6' },
            ].map(s => (
              <div key={s.label} style={{
                padding: '6px 12px', borderRadius: 12,
                background: 'var(--bg-card)', border: '1px solid var(--border-color)',
                textAlign: 'center', minWidth: 60,
              }}>
                <div style={{ fontSize: 13, marginBottom: 1 }}>{s.icon}</div>
                <div style={{ fontSize: 15, fontWeight: 900, color: s.c, fontFamily: 'Space Grotesk,sans-serif', lineHeight: 1 }}>{s.val}</div>
                <div style={{ fontSize: 9, color: 'var(--text-muted)', marginTop: 1, fontWeight: 600 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ══════════════════════════════════════
            MAIN TABS
        ══════════════════════════════════════ */}
        <div style={{ display: 'flex', gap: 8 }}>
          {([['search', '💊', 'Medicine & Map'], ['home', '🧑‍⚕️', 'Home Services']] as const).map(([t, emoji, label]) => (
            <button key={t} className={`ms-tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
              {emoji} {label}
            </button>
          ))}
          {!locationGranted && tab === 'search' && (
            <div style={{
              marginLeft: 'auto', padding: '6px 12px', borderRadius: 12,
              background: 'rgba(249,115,22,.08)', border: '1px solid rgba(249,115,22,.2)',
              fontSize: 11, color: '#f97316', fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              📍 Allow location for live data
            </div>
          )}
        </div>

        {/* ══════════════════════════════════════
            SPLIT SCREEN CONTENT
        ══════════════════════════════════════ */}
        <AnimatePresence mode="wait">
          {tab === 'search' ? (
            <motion.div
              key="search"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              style={{
                display: 'grid',
                gridTemplateColumns: '42% 1fr',
                gap: 14,
                flex: 1,
                minHeight: 540,
                overflow: 'hidden',
              }}
            >
              {/* ── LEFT PANEL (scrollable) ── */}
              <div
                className="ms-scroll"
                style={{
                  overflowY: 'auto',
                  height: '100%',
                  paddingRight: 4,
                  paddingBottom: 16,
                }}
              >
                <LeftPanel
                  medicines={medicines}
                  places={places}
                  loadingPlaces={loadingPlaces}
                  mapStatus={mapStatus}
                  selectedPlace={selectedPlace}
                  onPlaceSelect={handlePlaceSelect}
                  radiusKm={radiusKm}
                  onRadiusChange={setRadiusKm}
                />
              </div>

              {/* ── RIGHT PANEL (map — fully fixed) ── */}
              <div style={{
                borderRadius: 20,
                overflow: 'hidden',
                border: '1.5px solid var(--border-color)',
                position: 'relative',
                height: '100%',
              }}>
                <MapLegend
                  count={places.filter(p => p.distance_km <= radiusKm).length}
                  mapStatus={mapStatus}
                  selectedPlace={selectedPlace}
                  onClear={() => setSelectedPlace(null)}
                />

                <LiveMap
                  places={places}
                  selectedPlace={selectedPlace}
                  onPlaceSelect={handlePlaceSelect}
                  userLat={userLat}
                  userLng={userLng}
                  searchRadius={radiusKm * 1000}
                />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              style={{ overflowY: 'auto' }}
              className="ms-scroll"
            >
              <HomeServicesPanel />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
}
