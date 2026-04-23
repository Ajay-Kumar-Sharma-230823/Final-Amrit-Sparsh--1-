'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Clock, Star, Phone, Video } from 'lucide-react';

const doctors = [
  { name: 'Dr. Aarav Patel', specialty: 'General Physician', distance: '0.3 km', rating: 4.8, available: true, photo: '👨‍⚕️', patients: 12, exp: '12 yrs' },
  { name: 'Dr. Priya Sharma', specialty: 'Cardiologist', distance: '0.8 km', rating: 4.9, available: true, photo: '👩‍⚕️', patients: 8, exp: '15 yrs' },
  { name: 'Dr. Ravi Kumar', specialty: 'Emergency Medicine', distance: '1.2 km', rating: 4.7, available: false, photo: '👨‍⚕️', patients: 0, exp: '8 yrs' },
  { name: 'Dr. Neha Singh', specialty: 'Orthopedic', distance: '0.5 km', rating: 4.6, available: true, photo: '👩‍⚕️', patients: 5, exp: '10 yrs' },
];

const camps = [
  { name: 'Main Medical Camp', location: 'Sangam Ghaat', staff: 24, capacity: 200, active: 180, status: 'busy' },
  { name: 'Trauma Center', location: 'Parking Zone B', staff: 12, capacity: 100, active: 45, status: 'active' },
  { name: 'Mobile Unit A', location: 'East Mela Ground', staff: 6, capacity: 50, active: 38, status: 'active' },
  { name: 'Mental Health Camp', location: 'Sector 7 Gate', staff: 8, capacity: 80, active: 28, status: 'active' },
];

export default function MKMedical() {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
        👨‍⚕️ Quick Medical Access
      </div>

      {/* Doctor Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
        {doctors.map(doc => (
          <motion.div key={doc.name} whileHover={{ y: -4, scale: 1.01 }} className="glass-card" style={{ padding: 18, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -20, right: -10, width: 70, height: 70, borderRadius: '50%', background: doc.available ? 'radial-gradient(circle,rgba(16,185,129,0.12),transparent 70%)' : 'radial-gradient(circle,rgba(239,68,68,0.08),transparent 70%)', pointerEvents: 'none' }} />
            <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <div style={{
                width: 50, height: 50, borderRadius: 16, background: 'var(--accent-surface)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28,
                border: `2px solid ${doc.available ? '#10b981' : 'var(--border-color)'}`,
                position: 'relative',
              }}>
                {doc.photo}
                <div style={{
                  position: 'absolute', bottom: -2, right: -2, width: 12, height: 12, borderRadius: '50%',
                  background: doc.available ? '#10b981' : '#ef4444', border: '2px solid var(--bg-card)',
                }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{doc.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{doc.specialty} · {doc.exp}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 10, color: '#f59e0b' }}>
                    <Star size={10} fill="#f59e0b" /> {doc.rating}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 10, color: 'var(--text-muted)' }}>
                    <MapPin size={10} /> {doc.distance}
                  </span>
                  <span style={{
                    fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 6,
                    background: doc.available ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
                    color: doc.available ? '#10b981' : '#ef4444',
                  }}>
                    {doc.available ? 'Available' : 'Busy'}
                  </span>
                </div>
              </div>
            </div>
            {doc.available && (
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <button style={{ flex: 1, padding: '7px 12px', borderRadius: 10, background: 'var(--gradient-primary)', border: 'none', color: 'white', fontSize: 11, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                  <Phone size={12} /> Consult
                </button>
                <button style={{ flex: 1, padding: '7px 12px', borderRadius: 10, background: 'var(--accent-surface)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: 11, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                  <Video size={12} /> Video Call
                </button>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Health Camps */}
      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
        ⛺ Health Camps Status
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
        {camps.map(camp => {
          const occ = (camp.active / camp.capacity) * 100;
          return (
            <motion.div key={camp.name} whileHover={{ y: -3 }} className="glass-card" style={{ padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>{camp.name}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)' }}><MapPin size={9} style={{ display: 'inline' }} /> {camp.location} · {camp.staff} staff</div>
                </div>
                <span style={{
                  fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 6,
                  background: camp.status === 'active' ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.12)',
                  color: camp.status === 'active' ? '#10b981' : '#f59e0b',
                }}>
                  {camp.status.toUpperCase()}
                </span>
              </div>
              <div style={{ height: 6, borderRadius: 8, background: 'var(--accent-surface)', overflow: 'hidden' }}>
                <motion.div initial={{ width: 0 }} animate={{ width: `${occ}%` }} transition={{ duration: 1 }}
                  style={{ height: '100%', borderRadius: 8, background: occ > 80 ? '#ef4444' : occ > 60 ? '#f59e0b' : '#10b981' }} />
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4, textAlign: 'right' }}>{camp.active}/{camp.capacity} patients</div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
