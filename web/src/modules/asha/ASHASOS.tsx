'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, MapPin, Phone, CheckCircle, Loader, Send, Navigation, FileText, Clock } from 'lucide-react';

type SOSState = 'idle' | 'connecting' | 'dispatched' | 'arriving';

export default function ASHASOS() {
  const [status, setStatus] = useState<SOSState>('idle');
  const [selectedPatient] = useState('Sunita Devi');

  const triggerSOS = () => {
    setStatus('connecting');
    setTimeout(() => setStatus('dispatched'), 2500);
    setTimeout(() => setStatus('arriving'), 5500);
  };

  const reset = () => setStatus('idle');

  const stColor = status === 'idle' ? '#ef4444' : status === 'connecting' ? '#f59e0b' : status === 'dispatched' ? '#3b82f6' : '#10b981';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* SOS Card */}
      <div className="glass-card" style={{ padding: 28, textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(circle at 50% 50%, ${stColor}06, transparent 70%)`, pointerEvents: 'none' }} />

        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 20 }}>
          Emergency Dispatch
        </div>

        {/* SOS Button */}
        <div style={{ position: 'relative', display: 'inline-block', marginBottom: 20 }}>
          {status !== 'idle' && [1, 2, 3].map(i => (
            <motion.div key={i} animate={{ scale: [1, 3], opacity: [0.6, 0] }} transition={{ repeat: Infinity, duration: 2, delay: i * 0.5 }}
              style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 100, height: 100, borderRadius: '50%', border: `2px solid ${stColor}40`, pointerEvents: 'none' }}
            />
          ))}
          <motion.button whileHover={{ scale: status === 'idle' ? 1.05 : 1 }} whileTap={{ scale: 0.95 }}
            onClick={status === 'idle' ? triggerSOS : undefined}
            style={{
              width: 110, height: 110, borderRadius: '50%',
              background: status === 'idle' ? 'linear-gradient(135deg, #dc2626, #ef4444)' : `linear-gradient(135deg, ${stColor}, ${stColor}cc)`,
              border: 'none', cursor: status === 'idle' ? 'pointer' : 'default', color: 'white',
              fontSize: 16, fontWeight: 900, boxShadow: `0 10px 40px ${stColor}40`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 2, position: 'relative', zIndex: 2,
            }}>
            {status === 'connecting' ? <Loader size={28} style={{ animation: 'spin 1s linear infinite' }} /> :
             status === 'dispatched' ? <Send size={28} /> :
             status === 'arriving' ? <CheckCircle size={28} /> :
             <AlertTriangle size={32} />}
            {status === 'idle' && <span style={{ fontSize: 12, fontWeight: 800 }}>SOS</span>}
          </motion.button>
        </div>

        {/* Status */}
        <motion.div key={status} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 16, background: `${stColor}12`, border: `1px solid ${stColor}25` }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: stColor, animation: status !== 'idle' ? 'mk-dot 1s ease infinite' : 'none' }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: stColor }}>
            {status === 'idle' ? 'Ready' : status === 'connecting' ? 'Connecting...' : status === 'dispatched' ? 'Ambulance Dispatched' : 'Arriving in ~8 min'}
          </span>
        </motion.div>

        {/* Steps */}
        <AnimatePresence>
          {status !== 'idle' && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
              style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 8, textAlign: 'left', maxWidth: 380, margin: '20px auto 0' }}>
              {[
                { label: `Sharing ${selectedPatient}'s medical data + history PDF...`, done: status !== 'connecting' },
                { label: 'Location sent: 26.8467°N, 80.9462°E (Rampur village)', done: status === 'dispatched' || status === 'arriving' },
                { label: 'Nearest: CHC Rampur (3.2 km) · Ambulance assigned', done: status === 'arriving' },
                { label: 'ETA: 8 minutes · Driver: Suresh (MH-02-4521)', done: status === 'arriving' },
              ].map((s, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.3 }}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 10, background: 'var(--accent-surface)', border: '1px solid var(--border-color)' }}>
                  {s.done ? <CheckCircle size={14} color="#10b981" /> : <Loader size={14} color="#f59e0b" style={{ animation: 'spin 1s linear infinite' }} />}
                  <span style={{ fontSize: 11, color: 'var(--text-primary)', fontWeight: 500 }}>{s.label}</span>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {status === 'arriving' && (
          <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={reset}
            style={{ marginTop: 14, background: 'var(--accent-surface)', border: '1px solid var(--border-color)', borderRadius: 10, padding: '6px 16px', cursor: 'pointer', color: 'var(--text-primary)', fontSize: 11, fontWeight: 600 }}>
            Reset Demo
          </motion.button>
        )}
      </div>

      {/* Auto-shared data */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
        {[
          { icon: <FileText size={16} />, label: 'Health PDF', desc: 'Auto-generated patient report', color: '#3b82f6' },
          { icon: <MapPin size={16} />, label: 'Live Location', desc: 'GPS coordinates shared', color: '#10b981' },
          { icon: <Phone size={16} />, label: 'PHC Notified', desc: 'CHC Rampur alerted', color: '#8b5cf6' },
        ].map(item => (
          <div key={item.label} className="glass-card" style={{ padding: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: `${item.color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: item.color }}>{item.icon}</div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-primary)' }}>{item.label}</div>
              <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>{item.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
