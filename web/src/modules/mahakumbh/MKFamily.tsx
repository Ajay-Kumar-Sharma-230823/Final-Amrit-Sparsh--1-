'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Phone, MapPin, CheckCircle, Loader, AlertTriangle, MessageCircle, Navigation } from 'lucide-react';

type ContactStatus = 'Notified' | 'Calling' | 'Responded';

const familyMembers = [
  { name: 'Rajesh Kumar', relation: 'Father', phone: '+91 98765 43210', photo: '👨', hospital: 'Prayagraj District Hospital' },
  { name: 'Meena Devi', relation: 'Mother', phone: '+91 98765 22222', photo: '👩', hospital: 'Prayagraj District Hospital' },
  { name: 'Amit Kumar', relation: 'Brother', phone: '+91 98765 55555', photo: '👦', hospital: null },
  { name: 'Dr. Priya Sharma', relation: 'Family Doctor', phone: '+91 98765 11111', photo: '👩‍⚕️', hospital: 'AIIMS Prayagraj' },
];

export default function MKFamily() {
  const [statuses, setStatuses] = useState<Record<string, ContactStatus>>({});
  const [alertActive, setAlertActive] = useState(false);

  const triggerAlert = () => {
    setAlertActive(true);
    familyMembers.forEach((member, i) => {
      setTimeout(() => {
        setStatuses(prev => ({ ...prev, [member.name]: 'Notified' }));
      }, i * 800);
      setTimeout(() => {
        setStatuses(prev => ({ ...prev, [member.name]: 'Calling' }));
      }, 2000 + i * 1000);
      setTimeout(() => {
        setStatuses(prev => ({ ...prev, [member.name]: 'Responded' }));
      }, 4000 + i * 800);
    });
  };

  const reset = () => { setStatuses({}); setAlertActive(false); };

  const statusConfig: Record<ContactStatus, { color: string; icon: React.ReactNode }> = {
    'Notified': { color: '#f59e0b', icon: <AlertTriangle size={12} /> },
    'Calling': { color: '#3b82f6', icon: <Phone size={12} /> },
    'Responded': { color: '#10b981', icon: <CheckCircle size={12} /> },
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
          👨‍👩‍👧 Family Alert System
        </div>
        {!alertActive ? (
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={triggerAlert}
            style={{ padding: '8px 20px', borderRadius: 12, background: 'linear-gradient(135deg, #dc2626, #ef4444)', border: 'none', color: 'white', fontSize: 12, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 15px rgba(239,68,68,0.3)' }}>
            🚨 Send Family Alert
          </motion.button>
        ) : (
          <motion.button whileHover={{ scale: 1.03 }} onClick={reset}
            style={{ padding: '8px 20px', borderRadius: 12, background: 'var(--accent-surface)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
            Reset
          </motion.button>
        )}
      </div>

      {/* Alert status banner */}
      <AnimatePresence>
        {alertActive && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="glass-card" style={{ padding: 16, border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444', animation: 'mk-pulse 1.5s ease infinite' }} />
              <div style={{ fontSize: 13, fontWeight: 700, color: '#ef4444' }}>Family Alert Active</div>
              <div style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--text-muted)' }}>
                {Object.values(statuses).filter(s => s === 'Responded').length}/{familyMembers.length} responded
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Family Members */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
        {familyMembers.map(member => {
          const status = statuses[member.name];
          const cfg = status ? statusConfig[status] : null;
          return (
            <motion.div key={member.name} whileHover={{ y: -3 }} className="glass-card" style={{ padding: 18, position: 'relative', overflow: 'hidden' }}>
              {cfg && <div style={{ position: 'absolute', top: 0, right: 0, width: 4, height: '100%', background: cfg.color }} />}
              <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div style={{
                  width: 50, height: 50, borderRadius: 16, background: 'var(--accent-surface)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28,
                  border: cfg ? `2px solid ${cfg.color}` : '2px solid var(--border-color)',
                }}>
                  {member.photo}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{member.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{member.relation}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{member.phone}</div>

                  {/* Status */}
                  {cfg && (
                    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 8, padding: '3px 10px', borderRadius: 8, background: `${cfg.color}15`, border: `1px solid ${cfg.color}30` }}>
                      <span style={{ color: cfg.color }}>{cfg.icon}</span>
                      <span style={{ fontSize: 10, fontWeight: 700, color: cfg.color }}>{status}</span>
                    </motion.div>
                  )}

                  {/* Extra info when responded */}
                  {status === 'Responded' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: '#10b981' }}>
                        <Navigation size={9} /> Map link sent ✓
                      </div>
                      {member.hospital && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: 'var(--text-muted)' }}>
                          <MapPin size={9} /> {member.hospital}
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
                <button style={{ flex: 1, padding: '6px', borderRadius: 8, background: 'var(--accent-surface)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: 10, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                  <Phone size={10} /> Call
                </button>
                <button style={{ flex: 1, padding: '6px', borderRadius: 8, background: 'var(--accent-surface)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: 10, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                  <MessageCircle size={10} /> Message
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
