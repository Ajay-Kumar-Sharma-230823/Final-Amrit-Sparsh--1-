'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, MapPin, Phone, QrCode, CheckCircle, Loader, Send, X } from 'lucide-react';

const waveKF = `@keyframes sos-wave{0%{transform:scale(1);opacity:0.8}100%{transform:scale(3);opacity:0}}`;

type SOSStatus = 'idle' | 'connecting' | 'sent' | 'received';

const emergencyContacts = [
  { name: 'Rajesh Kumar (Father)', phone: '+91 98765 43210', relation: 'Father' },
  { name: 'Dr. Priya Sharma', phone: '+91 98765 11111', relation: 'Doctor' },
  { name: 'Meena Devi (Mother)', phone: '+91 98765 22222', relation: 'Mother' },
];

export default function MKEmergency({ onBack }: { onBack: () => void }) {
  const [status, setStatus] = useState<SOSStatus>('idle');
  const [showQR, setShowQR] = useState(false);

  const triggerSOS = () => {
    setStatus('connecting');
    setTimeout(() => setStatus('sent'), 2000);
    setTimeout(() => setStatus('received'), 4500);
  };

  const statusColor = status === 'idle' ? '#ef4444' : status === 'connecting' ? '#f59e0b' : status === 'sent' ? '#3b82f6' : '#10b981';
  const statusLabel = status === 'idle' ? 'Ready' : status === 'connecting' ? 'Connecting...' : status === 'sent' ? 'Data Sent' : 'Received ✓';

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <style>{waveKF}</style>

      {/* Back nav */}
      <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, width: 'fit-content' }}>
        ← Back to Dashboard
      </button>

      {/* SOS Main */}
      <div className="glass-card" style={{ padding: 40, textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(circle at 50% 50%, ${statusColor}08, transparent 70%)`, pointerEvents: 'none' }} />

        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 24 }}>
          Emergency SOS
        </div>

        {/* SOS Button with pulse waves */}
        <div style={{ position: 'relative', display: 'inline-block', marginBottom: 28 }}>
          {status !== 'idle' && [1, 2, 3].map(i => (
            <div key={i} style={{
              position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
              width: 140, height: 140, borderRadius: '50%', border: `2px solid ${statusColor}40`,
              animation: `sos-wave 2s ease-out ${i * 0.5}s infinite`, pointerEvents: 'none',
            }} />
          ))}
          <motion.button
            whileHover={{ scale: status === 'idle' ? 1.05 : 1 }}
            whileTap={{ scale: 0.95 }}
            onClick={status === 'idle' ? triggerSOS : undefined}
            style={{
              width: 140, height: 140, borderRadius: '50%',
              background: status === 'idle' ? 'linear-gradient(135deg, #dc2626, #ef4444)' : `linear-gradient(135deg, ${statusColor}, ${statusColor}cc)`,
              border: 'none', cursor: status === 'idle' ? 'pointer' : 'default',
              color: 'white', fontSize: 28, fontWeight: 900,
              boxShadow: `0 12px 40px ${statusColor}50`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 4,
              position: 'relative', zIndex: 2,
            }}
          >
            {status === 'connecting' ? <Loader size={32} style={{ animation: 'spin 1s linear infinite' }} /> :
             status === 'sent' ? <Send size={32} /> :
             status === 'received' ? <CheckCircle size={32} /> :
             <AlertTriangle size={36} />}
            <span style={{ fontSize: 14, fontWeight: 800 }}>{status === 'idle' ? 'SOS' : ''}</span>
          </motion.button>
        </div>

        {/* Status */}
        <motion.div key={status} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 20px', borderRadius: 20, background: `${statusColor}15`, border: `1px solid ${statusColor}30` }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: statusColor }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: statusColor }}>{statusLabel}</span>
          </div>
        </motion.div>

        {/* Progress steps */}
        <AnimatePresence>
          {status !== 'idle' && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 10, textAlign: 'left', maxWidth: 400, margin: '24px auto 0' }}>
              {[
                { label: 'Sharing medical data...', done: status !== 'connecting' },
                { label: 'Sending live location (25.4358°N, 81.8463°E)', done: status === 'received' },
                { label: 'Assigned: Prayagraj District Hospital (1.2 km)', done: status === 'received' },
              ].map((step, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.3 }}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 12, background: 'var(--accent-surface)', border: '1px solid var(--border-color)' }}>
                  {step.done ? <CheckCircle size={16} color="#10b981" /> : <Loader size={16} color="#f59e0b" style={{ animation: 'spin 1s linear infinite' }} />}
                  <span style={{ fontSize: 12, color: 'var(--text-primary)', fontWeight: 500 }}>{step.label}</span>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {status === 'received' && (
          <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => setStatus('idle')}
            style={{ marginTop: 16, background: 'var(--accent-surface)', border: '1px solid var(--border-color)', borderRadius: 12, padding: '8px 20px', cursor: 'pointer', color: 'var(--text-primary)', fontSize: 12, fontWeight: 600 }}>
            Reset
          </motion.button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Emergency Contacts */}
        <div className="glass-card" style={{ padding: 22 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Phone size={16} /> Emergency Contacts
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {emergencyContacts.map(c => (
              <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 14, background: 'var(--accent-surface)', border: '1px solid var(--border-color)' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: 13 }}>
                  {c.name.charAt(0)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>{c.name}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{c.relation} · {c.phone}</div>
                </div>
                {status === 'received' && (
                  <span style={{ fontSize: 9, fontWeight: 700, color: '#10b981', background: 'rgba(16,185,129,0.12)', padding: '3px 8px', borderRadius: 8 }}>Notified ✓</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* QR Code */}
        <div className="glass-card" style={{ padding: 22, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <QrCode size={16} /> Quick Medical QR
          </div>
          <div style={{
            width: 160, height: 160, borderRadius: 20, background: 'white', padding: 16,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
          }}>
            {/* Simplified QR pattern */}
            <svg width={128} height={128} viewBox="0 0 128 128">
              {Array.from({ length: 13 }, (_, r) =>
                Array.from({ length: 13 }, (_, c) => {
                  const isFinder = (r < 4 && c < 4) || (r < 4 && c > 8) || (r > 8 && c < 4);
                  const isData = Math.random() > 0.45;
                  return (isFinder || isData) ? (
                    <rect key={`${r}-${c}`} x={c * 9.8 + 1} y={r * 9.8 + 1} width={8.5} height={8.5} rx={1.5} fill="#1a1a1a" />
                  ) : null;
                })
              )}
            </svg>
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 10, textAlign: 'center' }}>
            Scan for instant medical profile access
          </div>
        </div>
      </div>
    </motion.div>
  );
}
