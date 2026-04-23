'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { UserCheck, Shield, QrCode, Link2, Eye, EyeOff, CheckCircle, Lock } from 'lucide-react';

export default function ABHAModule() {
  const [tab, setTab] = useState<'profile' | 'records' | 'consent'>('profile');
  const [showAadhaar, setShowAadhaar] = useState(false);

  const records = [
    { type: 'Lab Report', title: 'CBC Blood Test', date: '2024-03-12', doctor: 'Dr. Priya Sharma', hospital: 'AIIMS Prayagraj', status: 'shared' },
    { type: 'Prescription', title: 'Anti-hypertensive Rx', date: '2024-03-01', doctor: 'Dr. Raj Kumar', hospital: 'Apollo Clinic', status: 'private' },
    { type: 'X-Ray', title: 'Chest X-Ray', date: '2024-02-15', doctor: 'Dr. Anil Singh', hospital: 'District Hospital', status: 'shared' },
    { type: 'Vaccination', title: 'COVID-19 Booster', date: '2024-01-20', doctor: 'Dr. Meena Devi', hospital: 'PHC Naini', status: 'shared' },
  ];

  const consents = [
    { id: '1', requester: 'AIIMS Prayagraj', purpose: 'Treatment', records: 'Lab Reports, Prescriptions', expiry: '2024-06-30', status: 'active' },
    { id: '2', requester: 'Health Ministry Portal', purpose: 'Research (Anonymous)', records: 'Aggregated Vitals', expiry: '2024-12-31', status: 'active' },
    { id: '3', requester: 'Insurance Provider XYZ', purpose: 'Claims Processing', records: 'All Records', expiry: '2024-03-01', status: 'expired' },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* ABHA Card */}
      <div style={{
        background: 'linear-gradient(135deg, #0f4c81, #1e88e5, #0d47a1)',
        borderRadius: 24, padding: '32px', position: 'relative', overflow: 'hidden',
        boxShadow: '0 20px 60px rgba(30, 136, 229, 0.4)',
      }}>
        {/* Card decorations */}
        <div style={{ position: 'absolute', right: -30, top: -30, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
        <div style={{ position: 'absolute', right: 80, bottom: -40, width: 150, height: 150, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 8, padding: '4px 10px', fontSize: 11, color: 'rgba(255,255,255,0.9)', fontWeight: 700, letterSpacing: '0.1em' }}>
                  🇮🇳 AYUSHMAN BHARAT HEALTH ACCOUNT
                </div>
              </div>
              <div style={{ fontSize: 28, fontWeight: 900, color: 'white', letterSpacing: '0.06em', marginTop: 8, fontFamily: 'Space Grotesk, sans-serif' }}>
                ABHA-2024-78XQ
              </div>
            </div>
            <div style={{ width: 64, height: 64, background: 'white', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <QrCode size={40} color="#0f4c81" />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'auto auto auto auto', gap: 24 }}>
            {[
              { label: 'CARD HOLDER', value: 'AJAY KUMAR SHARMA' },
              { label: 'DATE OF BIRTH', value: '15 / 03 / 2002' },
              { label: 'BLOOD GROUP', value: 'O+' },
              { label: 'AADHAAR', value: showAadhaar ? 'XXXX-XXXX-7891' : '••••-••••-••••' },
            ].map((item) => (
              <div key={item.label}>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.1em', marginBottom: 4 }}>{item.label}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'white', display: 'flex', alignItems: 'center', gap: 6 }}>
                  {item.value}
                  {item.label === 'AADHAAR' && (
                    <button onClick={() => setShowAadhaar(!showAadhaar)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.7)', padding: 0 }}>
                      {showAadhaar ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8 }}>
        {[{ id: 'profile', label: '👤 Health Profile' }, { id: 'records', label: '📁 Health Records' }, { id: 'consent', label: '🔐 Data Consent' }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id as any)}
            style={{
              background: tab === t.id ? 'var(--gradient-primary)' : 'var(--bg-card)',
              border: `1px solid ${tab === t.id ? 'transparent' : 'var(--border-color)'}`,
              borderRadius: 12, padding: '10px 20px', cursor: 'pointer',
              color: tab === t.id ? 'white' : 'var(--text-secondary)', fontSize: 13, fontWeight: 600,
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'profile' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <div className="glass-card" style={{ padding: 24 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>Personal Information</div>
            {[
              { label: 'Full Name', value: 'Ajay Kumar Sharma', icon: '👤' },
              { label: 'Date of Birth', value: '15 March 2002', icon: '📅' },
              { label: 'Gender', value: 'Male', icon: '⚧' },
              { label: 'Phone', value: '+91 98765 43210', icon: '📱' },
              { label: 'Email', value: 'ajay.sharma@health.in', icon: '📧' },
              { label: 'Address', value: 'Sector 12, Naini, Prayagraj, UP 211008', icon: '🏠' },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border-color)' }}>
                <span>{item.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.label}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginTop: 2 }}>{item.value}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="glass-card" style={{ padding: 24 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>Medical Information</div>
            {[
              { label: 'Blood Group', value: 'O Positive (O+)', icon: '🩸' },
              { label: 'Height', value: '172 cm', icon: '📏' },
              { label: 'Weight', value: '68 kg', icon: '⚖️' },
              { label: 'BMI', value: '22.4 (Normal)', icon: '📊' },
              { label: 'Allergies', value: 'Penicillin', icon: '⚠️' },
              { label: 'Chronic Conditions', value: 'Mild Hypertension', icon: '❤️' },
              { label: 'Current Medications', value: 'Amlodipine 5mg', icon: '💊' },
              { label: 'Insurance', value: 'Ayushman Bharat (Active)', icon: '🛡️' },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border-color)' }}>
                <span>{item.icon}</span>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.label}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginTop: 2 }}>{item.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'records' && (
        <div className="glass-card" style={{ padding: 24 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>Digital Health Records</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {records.map((record) => (
              <div key={record.title} style={{ display: 'flex', alignItems: 'center', gap: 14, background: 'var(--bg-glass)', border: '1px solid var(--border-color)', borderRadius: 12, padding: '14px 16px' }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 18 }}>
                  {record.type === 'Lab Report' ? '🧪' : record.type === 'Prescription' ? '💊' : record.type === 'X-Ray' ? '🫁' : '💉'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{record.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                    {record.type} • {record.date} • {record.doctor} • {record.hospital}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ background: record.status === 'shared' ? '#3b82f620' : '#f59e0b20', color: record.status === 'shared' ? '#3b82f6' : '#f59e0b', borderRadius: 999, padding: '2px 10px', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                    {record.status === 'shared' ? <Link2 size={10} /> : <Lock size={10} />}
                    {record.status.toUpperCase()}
                  </span>
                  <button style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-color)', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: 12 }}>View</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'consent' && (
        <div className="glass-card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <Shield size={18} color="var(--accent-primary)" />
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>Data Access Consents</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {consents.map((consent) => (
              <div key={consent.id} style={{ background: 'var(--bg-glass)', border: `1px solid ${consent.status === 'active' ? 'var(--border-color)' : '#ef444440'}`, borderRadius: 12, padding: '16px 18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{consent.requester}</div>
                  <span style={{ background: consent.status === 'active' ? '#10b98120' : '#ef444420', color: consent.status === 'active' ? '#10b981' : '#ef4444', borderRadius: 999, padding: '2px 10px', fontSize: 10, fontWeight: 700 }}>
                    {consent.status.toUpperCase()}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                  <span style={{ marginRight: 16 }}>🎯 Purpose: {consent.purpose}</span>
                  <span style={{ marginRight: 16 }}>📁 Records: {consent.records}</span>
                  <span>📅 Expires: {consent.expiry}</span>
                </div>
                {consent.status === 'active' && (
                  <button style={{ marginTop: 10, background: '#ef444420', border: '1px solid #ef444440', borderRadius: 8, padding: '5px 14px', cursor: 'pointer', color: '#ef4444', fontSize: 11, fontWeight: 600 }}>
                    Revoke Access
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
