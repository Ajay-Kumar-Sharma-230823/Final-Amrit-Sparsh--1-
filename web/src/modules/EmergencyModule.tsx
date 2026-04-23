'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle, Phone, MapPin, FileText, Shield, CheckCircle,
  X, Loader, QrCode, Share2, Download, Wifi, Activity,
  Clock, User, HeartPulse, Pill, Stethoscope, ChevronRight,
  Bell, Send, Copy, RefreshCw,
} from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { STATIC_MEDICAL_PROFILE, NEARBY_HOSPITALS, EmergencyContact } from '@/lib/emergencyData';
import { generateEmergencyPDF, downloadPDF } from '@/lib/pdfGenerator';

// Dynamic QR import
let QRCodeSVG: React.ComponentType<{ value: string; size: number; bgColor: string; fgColor: string; level: string; }> | null = null;

type SOSPhase = 'idle' | 'selecting' | 'otp' | 'processing' | 'active' | 'cancelled';
type Tab = 'sos' | 'qr' | 'profile' | 'contacts' | 'logs';

const EMERGENCY_TYPES = [
  { id: 'cardiac',   label: 'Cardiac Emergency', icon: '❤️',  color: '#ef4444', desc: 'Heart attack, arrhythmia' },
  { id: 'accident',  label: 'Accident / Trauma',  icon: '🚑',  color: '#f97316', desc: 'Road accident, fall, injury' },
  { id: 'stroke',    label: 'Stroke',             icon: '🧠',  color: '#8b5cf6', desc: 'Sudden weakness, speech loss' },
  { id: 'allergy',   label: 'Severe Allergy',     icon: '⚠️',  color: '#f59e0b', desc: 'Anaphylaxis, allergic shock' },
  { id: 'breathing', label: 'Breathing Difficulty',icon: '🫁', color: '#06b6d4', desc: 'Asthma, choking, low SpO2' },
  { id: 'unknown',   label: 'Unknown Emergency',  icon: '🆘',  color: '#dc2626', desc: 'Trigger by someone else' },
];

const SOS_STEPS = [
  { icon: '📍', label: 'Fetching Live Location' },
  { icon: '🏥', label: 'Alerting Nearest Hospital' },
  { icon: '📄', label: 'Generating Medical PDF' },
  { icon: '📲', label: 'Notifying Emergency Contacts (WhatsApp)' },
  { icon: '✅', label: 'Help Dispatched — Stay Calm' },
];

export default function EmergencyModule() {
  const { user, setSosActive, sosActive, addAlert } = useAppStore();

  const [tab, setTab] = useState<Tab>('sos');
  const [phase, setPhase] = useState<SOSPhase>('idle');
  const [emergencyType, setEmergencyType] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [currentStep, setCurrentStep] = useState(-1);
  const [location, setLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);
  const [selectedHospital, setSelectedHospital] = useState(NEARBY_HOSPITALS[0]);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [qrUrl, setQrUrl] = useState('');
  const [qrLoading, setQrLoading] = useState(false);
  const [qrLoaded, setQrLoaded] = useState(false);
  const [sosLog, setSosLog] = useState<Array<{ time: string; event: string; type: 'info' | 'success' | 'warning' }>>([]);
  const [contactStatus, setContactStatus] = useState<Record<string, 'pending' | 'sent' | 'called'>>({});
  const [holdProgress, setHoldProgress] = useState(0);
  const holdTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const holdStart = useRef(0);

  const profile = STATIC_MEDICAL_PROFILE;

  // Load QRCode
  useEffect(() => {
    import('react-qr-code').then((mod) => {
      QRCodeSVG = mod.default as typeof QRCodeSVG;
      setQrLoaded(true);
    });
  }, []);

  // Get location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          address: 'Sector 4, Civil Lines, Indore, MP',
        }),
        () => setLocation({ lat: 22.7196, lng: 75.8577, address: 'Indore, Madhya Pradesh' })
      );
    }
  }, []);

  const appendLog = useCallback((event: string, type: 'info' | 'success' | 'warning' = 'info') => {
    setSosLog(prev => [...prev, { time: new Date().toLocaleTimeString('en-IN'), event, type }]);
  }, []);

  // Generate QR
  const generateQR = useCallback(async () => {
    setQrLoading(true);
    try {
      const res = await fetch('/api/qr-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id || 'guest-001' }),
      });
      const data = await res.json();
      if (data.success) {
        setQrUrl(data.qrUrl);
      }
    } catch {
      const fallback = `${window.location.origin}/emergency/scan?token=demo-token-${Date.now()}`;
      setQrUrl(fallback);
    } finally {
      setQrLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (tab === 'qr' && !qrUrl) generateQR();
  }, [tab, qrUrl, generateQR]);

  // Hold-to-SOS logic
  const startHold = () => {
    if (phase !== 'selecting') return;
    holdStart.current = Date.now();
    holdTimer.current = setInterval(() => {
      const elapsed = Date.now() - holdStart.current;
      const progress = Math.min((elapsed / 1500) * 100, 100);
      setHoldProgress(progress);
      if (progress >= 100) {
        clearInterval(holdTimer.current!);
        setHoldProgress(0);
        setPhase('otp');
      }
    }, 20);
  };

  const stopHold = () => {
    if (holdTimer.current) clearInterval(holdTimer.current);
    if (holdProgress < 100) setHoldProgress(0);
  };

  const handleOTPInput = (val: string, idx: number) => {
    const digit = val.replace(/[^0-9]/g, '').slice(-1);
    const next = [...otp];
    next[idx] = digit;
    setOtp(next);
    if (digit && idx < 3) document.getElementById(`sos-otp-${idx + 1}`)?.focus();
  };

  const activateSOS = async () => {
    if (otp.join('').length < 4) return;
    setPhase('processing');
    setCurrentStep(0);
    appendLog('SOS Protocol Initiated', 'info');

    // Step through SOS workflow
    for (let i = 0; i < SOS_STEPS.length; i++) {
      await new Promise<void>(resolve => setTimeout(resolve, 900));
      setCurrentStep(i);
      appendLog(SOS_STEPS[i].label, i === SOS_STEPS.length - 1 ? 'success' : 'info');

      // At step 3 (notify contacts), call the API
      if (i === 2) {
        try {
          await fetch('/api/sos-trigger', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              patientName: profile.patientName,
              emergencyType: EMERGENCY_TYPES.find(e => e.id === emergencyType)?.label || emergencyType,
              location,
              hospitalName: selectedHospital.name,
              contacts: profile.emergencyContacts,
              phone: profile.phone.replace(/\D/g, ''),
            }),
          });
          profile.emergencyContacts.forEach(c => {
            setContactStatus(prev => ({ ...prev, [c.id]: 'sent' }));
          });
          appendLog('WhatsApp alerts sent to all emergency contacts', 'success');
        } catch {
          appendLog('WhatsApp alerts queued for retry', 'warning');
        }
      }
    }

    await new Promise<void>(resolve => setTimeout(resolve, 400));
    setPhase('active');
    setSosActive(true);
    addAlert({
      type: 'sos', title: '🆘 SOS ACTIVE',
      message: `Emergency SOS activated. ${selectedHospital.name} notified. Contacts alerted.`,
      severity: 'critical',
    });
    appendLog(`SOS SYSTEM LIVE — ${selectedHospital.name} alerted`, 'success');
  };

  const cancelSOS = () => {
    setPhase('idle');
    setCurrentStep(-1);
    setOtp(['', '', '', '']);
    setSosActive(false);
    setEmergencyType('');
    setContactStatus({});
    setHoldProgress(0);
    setSosLog([]);
    appendLog('SOS Cancelled by user', 'warning');
  };

  const handleDownloadPDF = async () => {
    setPdfLoading(true);
    try {
      const blob = await generateEmergencyPDF(profile, {
        emergencyType: EMERGENCY_TYPES.find(e => e.id === emergencyType)?.label,
        location: location ?? undefined,
        hospitalAlerted: selectedHospital.name,
      });
      downloadPDF(blob, `AmritSparsh-Emergency-${Date.now()}.pdf`);
      appendLog('Emergency PDF generated & downloaded', 'success');
    } catch (e) {
      console.error(e);
    } finally {
      setPdfLoading(false);
    }
  };

  const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'sos',      label: 'SOS',       icon: <AlertTriangle size={14} /> },
    { id: 'qr',       label: 'QR Card',   icon: <QrCode size={14} /> },
    { id: 'profile',  label: 'Med Profile',icon: <FileText size={14} /> },
    { id: 'contacts', label: 'Contacts',  icon: <Phone size={14} /> },
    { id: 'logs',     label: 'Logs',      icon: <Clock size={14} /> },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 1200, margin: '0 auto' }}>

      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg, #450a0a 0%, #7f1d1d 40%, #991b1b 100%)',
        borderRadius: 20, padding: '24px 28px', position: 'relative', overflow: 'hidden',
      }}>
        {/* Pulse rings */}
        {sosActive && [1, 2, 3].map(i => (
          <div key={i} style={{
            position: 'absolute', right: -20, top: '50%', transform: 'translateY(-50%)',
            width: 160 + i * 60, height: 160 + i * 60, borderRadius: '50%',
            border: `2px solid rgba(239,68,68,${0.3 - i * 0.08})`,
            animation: `sos-ring 1.5s ease-out ${i * 0.4}s infinite`,
          }} />
        ))}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <div style={{ fontSize: 26, fontWeight: 900, color: 'white', fontFamily: 'Outfit, sans-serif' }}>
                🆘 Emergency SOS System
              </div>
              {sosActive && (
                <motion.span animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 0.8 }}
                  style={{ background: '#ef4444', color: 'white', borderRadius: 999, padding: '2px 10px', fontSize: 11, fontWeight: 800 }}>
                  ● LIVE
                </motion.span>
              )}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13 }}>
              Instant medical history sharing • Hospital notification • Emergency contact alerts
            </div>
          </div>
          {location && (
            <div style={{ textAlign: 'right' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#86efac', fontSize: 12 }}>
                <Wifi size={12} /> GPS Active
              </div>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, marginTop: 2 }}>{location.address}</div>
            </div>
          )}
        </div>
      </div>

      {/* ── TABS ───────────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 2 }}>
        {TABS.map(t => (
          <motion.button key={t.id} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => setTab(t.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '9px 18px', borderRadius: 999, border: 'none', cursor: 'pointer',
              fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap', fontFamily: 'Outfit, sans-serif',
              background: tab === t.id
                ? (t.id === 'sos' ? 'linear-gradient(135deg, #dc2626, #ef4444)' : 'var(--gradient-primary)')
                : 'var(--bg-glass)',
              color: tab === t.id ? 'white' : 'var(--text-secondary)',
              boxShadow: tab === t.id ? '0 4px 16px rgba(239,68,68,0.35)' : 'none',
            }}>
            {t.icon} {t.label}
          </motion.button>
        ))}
      </div>

      <AnimatePresence mode="wait">

        {/* ══════════════════ TAB: SOS ══════════════════ */}
        {tab === 'sos' && (
          <motion.div key="sos" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

            {/* Left: SOS Controls */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Idle → Select Emergency */}
              {phase === 'idle' && (
                <motion.div className="glass-card" style={{ padding: 24 }}>
                  {/* BIG 3D SOS BUTTON */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0, marginBottom: 24, paddingTop: 8 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 18, letterSpacing: 1 }}>
                      SELECT EMERGENCY TYPE THEN PRESS SOS
                    </div>
                    {/* Outer glow rings */}
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                      {[180, 210, 240].map((sz, i) => (
                        <div key={sz} style={{
                          position: 'absolute',
                          width: sz, height: sz, borderRadius: '50%',
                          border: `2px solid rgba(239,68,68,${0.18 - i * 0.05})`,
                          animation: `sos-idle-ring ${1.4 + i * 0.4}s ease-in-out ${i * 0.35}s infinite`,
                        }} />
                      ))}
                      {/* 3D Button shell */}
                      <div style={{
                        position: 'relative',
                        width: 150, height: 150,
                        borderRadius: '50%',
                        /* Bottom depth layer — darkest */
                        background: '#5a0a0a',
                        boxShadow: '0 18px 0px #3a0505, 0 22px 40px rgba(0,0,0,0.7), 0 0 0 6px #7f1515, 0 0 60px rgba(239,68,68,0.35)',
                        cursor: 'default',
                      }}>
                        {/* Mid layer */}
                        <div style={{
                          position: 'absolute', inset: 5,
                          borderRadius: '50%',
                          background: 'linear-gradient(160deg, #c42020 0%, #8b1010 60%, #6b0d0d 100%)',
                          boxShadow: 'inset 0 -6px 16px rgba(0,0,0,0.5), inset 0 4px 10px rgba(255,120,120,0.2)',
                        }} />
                        {/* Top sheen */}
                        <div style={{
                          position: 'absolute', top: 14, left: '50%', transform: 'translateX(-50%)',
                          width: 80, height: 28, borderRadius: '50%',
                          background: 'rgba(255,255,255,0.12)',
                          filter: 'blur(4px)',
                        }} />
                        {/* Label */}
                        <div style={{
                          position: 'absolute', inset: 0,
                          display: 'flex', flexDirection: 'column',
                          alignItems: 'center', justifyContent: 'center',
                          gap: 0,
                        }}>
                          <span style={{
                            fontSize: 42, fontWeight: 900,
                            fontFamily: 'Outfit, sans-serif',
                            color: 'white',
                            textShadow: '0 2px 8px rgba(0,0,0,0.6), 0 0 20px rgba(255,100,100,0.5)',
                            letterSpacing: 2,
                            lineHeight: 1,
                          }}>SOS</span>
                          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', letterSpacing: 3, marginTop: 4, fontWeight: 600 }}>EMERGENCY</span>
                        </div>
                      </div>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>↓ Select type below then activate</div>
                  </div>

                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10 }}>🚨 Select Emergency Type</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 4 }}>
                    {EMERGENCY_TYPES.map(type => (
                      <motion.button key={type.id} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                        onClick={() => { setEmergencyType(type.id); setPhase('selecting'); }}
                        style={{
                          background: `${type.color}15`, border: `2px solid ${type.color}40`,
                          borderRadius: 12, padding: '12px 10px', cursor: 'pointer',
                          display: 'flex', flexDirection: 'column', gap: 4, textAlign: 'left',
                          transition: 'all 0.2s',
                        }}>
                        <span style={{ fontSize: 22 }}>{type.icon}</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: type.color }}>{type.label}</span>
                        <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{type.desc}</span>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Selecting → Hold SOS */}
              {phase === 'selecting' && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  className="glass-card" style={{ padding: 28, textAlign: 'center' }}>

                  {/* Selected Badge */}
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    background: `${EMERGENCY_TYPES.find(e => e.id === emergencyType)?.color}20`,
                    border: `1px solid ${EMERGENCY_TYPES.find(e => e.id === emergencyType)?.color}50`,
                    borderRadius: 999, padding: '6px 16px', marginBottom: 10,
                  }}>
                    <span style={{ fontSize: 16 }}>{EMERGENCY_TYPES.find(e => e.id === emergencyType)?.icon}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: EMERGENCY_TYPES.find(e => e.id === emergencyType)?.color }}>
                      {EMERGENCY_TYPES.find(e => e.id === emergencyType)?.label}
                    </span>
                  </div>

                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 28 }}>
                    Hold the SOS button for <strong style={{ color: '#ef4444' }}>1.5 seconds</strong> to activate emergency protocol
                  </div>

                  {/* ── MEGA 3D SOS BUTTON ── */}
                  <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>

                    {/* Animated glow rings */}
                    {[220, 260, 300].map((sz, i) => (
                      <div key={sz} style={{
                        position: 'absolute', width: sz, height: sz, borderRadius: '50%',
                        border: `2px solid rgba(239,68,68,${holdProgress > 0 ? 0.6 - i * 0.15 : 0.2 - i * 0.05})`,
                        transform: `scale(${holdProgress > 0 ? 1 + i * 0.05 : 1})`,
                        animation: holdProgress > 0
                          ? `sos-active-ring ${0.6 + i * 0.2}s ease-out ${i * 0.1}s infinite`
                          : `sos-idle-ring ${1.8 + i * 0.4}s ease-in-out ${i * 0.4}s infinite`,
                        transition: 'border-color 0.3s',
                      }} />
                    ))}

                    {/* Progress ring SVG */}
                    <svg width="190" height="190" style={{ position: 'absolute', zIndex: 2 }}>
                      <circle cx="95" cy="95" r="86" fill="none" stroke="rgba(239,68,68,0.12)" strokeWidth="8" />
                      <circle cx="95" cy="95" r="86" fill="none"
                        stroke={holdProgress > 60 ? '#ff6b6b' : '#ef4444'}
                        strokeWidth="8"
                        strokeDasharray={`${2 * Math.PI * 86}`}
                        strokeDashoffset={`${2 * Math.PI * 86 * (1 - holdProgress / 100)}`}
                        strokeLinecap="round" transform="rotate(-90 95 95)"
                        style={{ transition: 'stroke-dashoffset 0.05s linear, stroke 0.2s' }} />
                    </svg>

                    {/* THE 3D BUTTON */}
                    <motion.button
                      onMouseDown={startHold} onMouseUp={stopHold} onMouseLeave={stopHold}
                      onTouchStart={startHold} onTouchEnd={stopHold}
                      animate={holdProgress > 0 ? { scale: 0.94 } : { scale: [1, 1.03, 1] }}
                      transition={holdProgress > 0 ? { duration: 0.1 } : { repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
                      style={{
                        position: 'relative',
                        width: 160, height: 160, borderRadius: '50%',
                        cursor: 'pointer', border: 'none', outline: 'none',
                        zIndex: 3,
                        /* 3D depth: multiple box-shadow layers */
                        background: holdProgress > 0
                          ? 'linear-gradient(145deg, #ff4444 0%, #c01010 50%, #880000 100%)'
                          : 'linear-gradient(145deg, #ff5555 0%, #cc1515 45%, #8b0000 100%)',
                        boxShadow: holdProgress > 0
                          ? `
                              0 4px 0px #5a0000,
                              0 6px 0px #3d0000,
                              0 8px 30px rgba(239,68,68,0.7),
                              0 0 80px rgba(239,68,68,0.4),
                              inset 0 -8px 20px rgba(0,0,0,0.5),
                              inset 0 6px 12px rgba(255,150,150,0.18)
                            `
                          : `
                              0 8px 0px #7a0a0a,
                              0 14px 0px #4a0505,
                              0 18px 0px #2e0303,
                              0 22px 50px rgba(0,0,0,0.6),
                              0 0 50px rgba(239,68,68,0.35),
                              0 0 90px rgba(239,68,68,0.15),
                              inset 0 -10px 24px rgba(0,0,0,0.4),
                              inset 0 8px 16px rgba(255,120,120,0.2)
                            `,
                        transform: holdProgress > 0 ? 'translateY(8px)' : 'translateY(0)',
                        transition: 'transform 0.12s, box-shadow 0.15s, background 0.2s',
                      }}>

                      {/* Inner chrome rim */}
                      <div style={{
                        position: 'absolute', inset: 6, borderRadius: '50%',
                        border: '2px solid rgba(255,255,255,0.15)',
                        boxShadow: 'inset 0 2px 6px rgba(255,255,255,0.1)',
                        pointerEvents: 'none',
                      }} />

                      {/* Top specular sheen */}
                      <div style={{
                        position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)',
                        width: 90, height: 34, borderRadius: '50%',
                        background: 'radial-gradient(ellipse, rgba(255,255,255,0.22) 0%, transparent 70%)',
                        filter: 'blur(2px)',
                        pointerEvents: 'none',
                      }} />

                      {/* SOS TEXT */}
                      <div style={{
                        position: 'absolute', inset: 0,
                        display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center',
                        gap: 2, pointerEvents: 'none',
                      }}>
                        <span style={{
                          fontSize: 48, fontWeight: 900, fontFamily: 'Outfit, sans-serif',
                          color: 'white', letterSpacing: 3, lineHeight: 1,
                          textShadow: `
                            0 2px 4px rgba(0,0,0,0.8),
                            0 4px 12px rgba(0,0,0,0.5),
                            0 0 30px rgba(255,200,200,0.4)
                          `,
                        }}>SOS</span>
                        <span style={{
                          fontSize: 9, fontWeight: 700, letterSpacing: 4,
                          color: 'rgba(255,255,255,0.75)',
                          textShadow: '0 1px 4px rgba(0,0,0,0.6)',
                          marginTop: 2,
                        }}>HOLD TO ACTIVATE</span>
                      </div>
                    </motion.button>
                  </div>

                  {/* Progress text */}
                  {holdProgress > 0 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      style={{ fontSize: 13, fontWeight: 700, color: '#ef4444', marginBottom: 12 }}>
                      {holdProgress < 100 ? `Activating... ${Math.round(holdProgress)}%` : '🚨 Releasing...'}
                    </motion.div>
                  )}

                  <button onClick={() => { setPhase('idle'); setEmergencyType(''); }}
                    style={{ background: 'none', border: '1px solid var(--border-color)', borderRadius: 8, padding: '8px 20px', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 12 }}>
                    ← Change Type
                  </button>
                </motion.div>
              )}

              {/* OTP Verification */}
              {phase === 'otp' && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  className="glass-card" style={{ padding: 28 }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
                    🔐 Identity Verification
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 20 }}>
                    OTP sent to {profile.phone}. Enter to confirm SOS.
                  </div>
                  <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 12 }}>
                    {otp.map((digit, i) => (
                      <input key={i} id={`sos-otp-${i}`} value={digit} maxLength={1}
                        onChange={(e) => handleOTPInput(e.target.value, i)}
                        onKeyDown={(e) => {
                          if (e.key === 'Backspace' && !digit && i > 0) document.getElementById(`sos-otp-${i - 1}`)?.focus();
                        }}
                        style={{
                          width: 54, height: 62, textAlign: 'center', fontSize: 26, fontWeight: 700,
                          background: 'var(--bg-glass)', border: `2px solid ${digit ? '#ef4444' : 'var(--border-color)'}`,
                          borderRadius: 12, color: 'var(--text-primary)', outline: 'none', transition: 'border-color 0.2s',
                        }} />
                    ))}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--accent-primary)', marginBottom: 16, textAlign: 'center' }}>
                    💡 Demo: enter <strong>1234</strong>
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={() => setPhase('selecting')}
                      style={{ flex: 1, background: 'var(--bg-glass)', border: '1px solid var(--border-color)', borderRadius: 10, padding: 12, cursor: 'pointer', color: 'var(--text-muted)', fontWeight: 600, fontSize: 13 }}>
                      ← Back
                    </button>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      onClick={activateSOS}
                      disabled={otp.join('').length < 4}
                      style={{
                        flex: 2, background: otp.join('').length === 4
                          ? 'linear-gradient(135deg, #dc2626, #ef4444)' : 'var(--bg-glass)',
                        border: 'none', borderRadius: 10, padding: 12, cursor: 'pointer',
                        color: 'white', fontWeight: 700, fontSize: 13, transition: 'background 0.2s',
                      }}>
                      🆘 Confirm SOS Activation
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {/* Processing */}
              {(phase === 'processing' || phase === 'active') && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="glass-card" style={{ padding: 24 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                    {phase === 'active'
                      ? <CheckCircle size={20} color="#10b981" />
                      : <Loader size={20} color="#ef4444" style={{ animation: 'spin 1s linear infinite' }} />}
                    <div style={{ fontSize: 15, fontWeight: 700, color: phase === 'active' ? '#10b981' : '#ef4444' }}>
                      {phase === 'active' ? '✅ SOS Active — Help on the way!' : '⚡ Activating Emergency Protocol...'}
                    </div>
                  </div>
                  {SOS_STEPS.map((step, i) => (
                    <motion.div key={step.label} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.15 }}
                      style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < SOS_STEPS.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
                      <div style={{
                        width: 30, height: 30, borderRadius: '50%', flexShrink: 0, fontSize: 14,
                        background: i <= currentStep ? '#10b98120' : 'var(--bg-glass)',
                        border: `2px solid ${i <= currentStep ? '#10b981' : 'var(--border-color)'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {i < currentStep ? '✓' : i === currentStep ? <Loader size={13} color="#f59e0b" style={{ animation: 'spin 1s linear infinite' }} /> : step.icon}
                      </div>
                      <span style={{ fontSize: 13, fontWeight: i <= currentStep ? 600 : 400, color: i <= currentStep ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                        {step.label}
                      </span>
                      {i <= currentStep && i < currentStep && <CheckCircle size={14} color="#10b981" style={{ marginLeft: 'auto' }} />}
                    </motion.div>
                  ))}

                  {phase === 'active' && (
                    <div style={{ marginTop: 16, display: 'flex', gap: 10 }}>
                      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        onClick={handleDownloadPDF} disabled={pdfLoading}
                        style={{ flex: 1, background: 'var(--gradient-primary)', border: 'none', borderRadius: 10, padding: 10, cursor: 'pointer', color: 'white', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                        {pdfLoading ? <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Download size={14} />}
                        PDF Report
                      </motion.button>
                      <button onClick={cancelSOS}
                        style={{ flex: 1, background: 'var(--bg-glass)', border: '1px solid var(--border-color)', borderRadius: 10, padding: 10, cursor: 'pointer', color: 'var(--text-secondary)', fontSize: 12, fontWeight: 600 }}>
                        ✓ I am Safe — Cancel SOS
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </div>

            {/* Right: Info Panels */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Medical Quick-View */}
              <div className="glass-card" style={{ padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                  <HeartPulse size={16} color="var(--accent-danger)" />
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Emergency Medical Summary</div>
                  <span style={{ marginLeft: 'auto', background: '#10b98118', color: '#10b981', borderRadius: 999, padding: '2px 8px', fontSize: 10, fontWeight: 700 }}>AUTO-SHARED</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
                  {[
                    { label: 'Blood Group', value: profile.bloodGroup, icon: '🩸', highlight: true },
                    { label: 'ABHA ID', value: profile.abhaId, icon: '🆔', highlight: false },
                    { label: 'Allergies', value: profile.allergies.join(', '), icon: '⚠️', highlight: true },
                    { label: 'Conditions', value: profile.diseases.filter(d => d.type === 'current').map(d => d.name).join(', '), icon: '🩺', highlight: false },
                  ].map(item => (
                    <div key={item.label} style={{
                      background: item.highlight ? 'rgba(239,68,68,0.08)' : 'var(--bg-glass)',
                      border: `1px solid ${item.highlight ? 'rgba(239,68,68,0.25)' : 'var(--border-color)'}`,
                      borderRadius: 10, padding: '8px 10px',
                    }}>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 3 }}>{item.icon} {item.label}</div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: item.highlight ? '#ef4444' : 'var(--text-primary)', lineHeight: 1.3 }}>{item.value}</div>
                    </div>
                  ))}
                </div>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={handleDownloadPDF} disabled={pdfLoading}
                  style={{ width: '100%', background: 'linear-gradient(135deg, #dc2626, #ef4444)', border: 'none', borderRadius: 10, padding: 10, cursor: 'pointer', color: 'white', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  {pdfLoading ? <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Download size={14} />}
                  Download Full Medical PDF
                </motion.button>
              </div>

              {/* Nearest Hospitals */}
              <div className="glass-card" style={{ padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                  <MapPin size={16} color="var(--accent-danger)" />
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Nearest Hospitals</div>
                </div>
                {NEARBY_HOSPITALS.map(h => (
                  <div key={h.name} onClick={() => setSelectedHospital(h)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10, padding: '10px 8px',
                      borderRadius: 10, cursor: 'pointer', marginBottom: 4,
                      background: selectedHospital.name === h.name ? 'rgba(239,68,68,0.08)' : 'transparent',
                      border: `1px solid ${selectedHospital.name === h.name ? 'rgba(239,68,68,0.3)' : 'transparent'}`,
                      transition: 'all 0.2s',
                    }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0, background: h.emergency ? '#10b981' : '#f59e0b' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                        {h.name}
                        {h.emergency && <span style={{ background: '#10b98118', color: '#10b981', borderRadius: 999, padding: '1px 5px', fontSize: 9 }}>24/7 ER</span>}
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 1 }}>
                        {h.distance} • {h.time} • {h.beds} beds
                      </div>
                    </div>
                    <a href={`https://www.google.com/maps?q=${h.lat},${h.lng}`} target="_blank" rel="noreferrer"
                      onClick={e => e.stopPropagation()}
                      style={{ background: '#3b82f618', border: '1px solid #3b82f640', borderRadius: 6, padding: '4px 8px', color: '#3b82f6', fontSize: 10, fontWeight: 700, textDecoration: 'none' }}>
                      Navigate
                    </a>
                  </div>
                ))}
              </div>

              {/* Emergency Contacts */}
              <div className="glass-card" style={{ padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                  <Phone size={16} color="#10b981" />
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Emergency Contacts</div>
                </div>
                {profile.emergencyContacts.map(c => (
                  <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--border-color)' }}>
                    <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
                      {c.name.charAt(0)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{c.name}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{c.relation} • {c.phone}</div>
                    </div>
                    {contactStatus[c.id] === 'sent' ? (
                      <span style={{ background: '#10b98118', color: '#10b981', borderRadius: 999, padding: '2px 8px', fontSize: 10, fontWeight: 700 }}>✓ WA Sent</span>
                    ) : (
                      <a href={`tel:${c.phone}`} style={{ background: '#ef444418', border: '1px solid #ef444440', borderRadius: 6, padding: '4px 8px', color: '#ef4444', fontSize: 10, fontWeight: 700, textDecoration: 'none' }}>
                        Call
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ══════════════════ TAB: QR CODE ══════════════════ */}
        {tab === 'qr' && (
          <motion.div key="qr" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

            {/* QR Card */}
            <div className="glass-card" style={{ padding: 28, textAlign: 'center' }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
                📱 Emergency QR Access Card
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 24 }}>
                Scan this QR to access instant medical data (OTP-protected)
              </div>

              {/* QR Code */}
              <div style={{
                background: 'white', borderRadius: 16, padding: 20, display: 'inline-block',
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)', marginBottom: 20,
              }}>
                {qrLoading ? (
                  <div style={{ width: 200, height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Loader size={32} color="#ef4444" style={{ animation: 'spin 1s linear infinite' }} />
                  </div>
                ) : qrUrl && qrLoaded && QRCodeSVG ? (
                  <QRCodeSVG value={qrUrl} size={180} bgColor="#ffffff" fgColor="#0f172a" level="H" />
                ) : (
                  <div style={{ width: 180, height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                    No QR yet
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={generateQR}
                  style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-color)', borderRadius: 10, padding: '8px 16px', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <RefreshCw size={14} /> Regenerate
                </motion.button>
                {qrUrl && (
                  <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    onClick={() => navigator.clipboard.writeText(qrUrl)}
                    style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-color)', borderRadius: 10, padding: '8px 16px', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Copy size={14} /> Copy Link
                  </motion.button>
                )}
              </div>
            </div>

            {/* Emergency ID Card (Debit Card Style) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{
                background: 'linear-gradient(135deg, #7f1d1d 0%, #dc2626 40%, #991b1b 100%)',
                borderRadius: 20, padding: '24px 22px', position: 'relative', overflow: 'hidden',
                boxShadow: '0 20px 60px rgba(239,68,68,0.4)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}>
                {/* Holographic circles */}
                <div style={{ position: 'absolute', right: -30, top: -30, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
                <div style={{ position: 'absolute', right: 40, bottom: -60, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.03)' }} />

                {/* Card Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, position: 'relative' }}>
                  <div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', letterSpacing: 2 }}>AMRIT SPARSH</div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: 'white', marginTop: 2 }}>EMERGENCY MEDICAL CARD</div>
                  </div>
                  <div style={{ fontSize: 28 }}>🏥</div>
                </div>

                {/* Blood Group Large */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 42, fontWeight: 900, color: 'white', lineHeight: 1 }}>{profile.bloodGroup}</div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)' }}>BLOOD GROUP</div>
                </div>

                {/* Name & ABHA */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: 'white', letterSpacing: 1 }}>
                    {profile.patientName.toUpperCase()}
                  </div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>
                    {profile.abhaId} • Age {profile.age}
                  </div>
                </div>

                {/* Allergies */}
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
                  {profile.allergies.map(a => (
                    <span key={a} style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 999, padding: '2px 8px', fontSize: 10, color: 'white', fontWeight: 600 }}>
                      ⚠️ {a}
                    </span>
                  ))}
                </div>

                {/* Emergency Contact */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <div>
                    <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', marginBottom: 2 }}>EMERGENCY CONTACT</div>
                    <div style={{ fontSize: 11, color: 'white', fontWeight: 600 }}>{profile.emergencyContacts[0]?.name} — {profile.emergencyContacts[0]?.phone}</div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 6, padding: '4px 10px' }}>
                    <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.7)' }}>SCAN QR FOR</div>
                    <div style={{ fontSize: 9, fontWeight: 700, color: 'white' }}>FULL RECORDS</div>
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div className="glass-card" style={{ padding: 18 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10 }}>🔐 How QR Access Works</div>
                {[
                  { step: '1', text: 'Rescuer scans QR code with phone camera' },
                  { step: '2', text: 'Opens secure Amrit Sparsh emergency page' },
                  { step: '3', text: 'OTP sent to patient\'s registered number' },
                  { step: '4', text: 'Full medical history displayed & PDF generated' },
                ].map(s => (
                  <div key={s.step} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', borderBottom: '1px solid var(--border-color)' }}>
                    <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'linear-gradient(135deg, #dc2626, #ef4444)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 11, fontWeight: 800, flexShrink: 0 }}>
                      {s.step}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{s.text}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ══════════════════ TAB: MEDICAL PROFILE ══════════════════ */}
        {tab === 'profile' && (
          <motion.div key="profile" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

            {/* Left: Patient Info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="glass-card" style={{ padding: 22 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                  <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg, #dc2626, #ef4444)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, color: 'white', fontWeight: 700 }}>
                    {profile.patientName.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>{profile.patientName}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{profile.age} years • {profile.gender}</div>
                    <div style={{ fontSize: 11, color: 'var(--accent-primary)' }}>{profile.abhaId}</div>
                  </div>
                  <div style={{ marginLeft: 'auto', background: '#dc262618', border: '2px solid #dc2626', borderRadius: 10, padding: '8px 14px', textAlign: 'center' }}>
                    <div style={{ fontSize: 24, fontWeight: 900, color: '#dc2626' }}>{profile.bloodGroup}</div>
                    <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>Blood Group</div>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {[
                    { label: 'Phone', value: profile.phone },
                    { label: 'Address', value: profile.address },
                  ].map(f => (
                    <div key={f.label} style={{ background: 'var(--bg-glass)', borderRadius: 8, padding: '8px 10px' }}>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 2 }}>{f.label}</div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-primary)' }}>{f.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Allergies */}
              <div className="glass-card" style={{ padding: 18 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <AlertTriangle size={15} color="#f59e0b" />
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Critical Allergies</div>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {profile.allergies.map(a => (
                    <span key={a} style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 999, padding: '4px 12px', color: '#ef4444', fontSize: 12, fontWeight: 700 }}>
                      ⚠️ {a}
                    </span>
                  ))}
                </div>
              </div>

              {/* Medications */}
              <div className="glass-card" style={{ padding: 18 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <Pill size={15} color="var(--accent-primary)" />
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Current Medications</div>
                </div>
                {profile.currentMedications.map(m => (
                  <div key={m.name} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--border-color)' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-primary)', flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{m.name} <span style={{ color: 'var(--accent-primary)' }}>{m.dosage}</span></div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{m.frequency} • Since {m.since}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Diseases */}
              <div className="glass-card" style={{ padding: 18 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <Activity size={15} color="var(--accent-danger)" />
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Medical Conditions</div>
                </div>
                {profile.diseases.map(d => (
                  <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--border-color)' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 999, background: d.type === 'current' ? 'rgba(239,68,68,0.12)' : 'rgba(16,185,129,0.12)', color: d.type === 'current' ? '#ef4444' : '#10b981' }}>
                      {d.type === 'current' ? 'ACTIVE' : 'PAST'}
                    </span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{d.name}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Since {d.since} • {d.severity}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Doctors */}
              <div className="glass-card" style={{ padding: 18 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <Stethoscope size={15} color="var(--accent-primary)" />
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Treating Doctors</div>
                </div>
                {profile.doctors.map(dr => (
                  <div key={dr.name} style={{ padding: '10px 0', borderBottom: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>{dr.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{dr.specialization} • {dr.hospital}</div>
                    <div style={{ fontSize: 11, color: 'var(--accent-primary)', marginTop: 2 }}>📞 {dr.phone}</div>
                  </div>
                ))}
              </div>

              {/* Reports */}
              <div className="glass-card" style={{ padding: 18 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <FileText size={15} color="var(--text-secondary)" />
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Medical Reports</div>
                </div>
                {profile.reports.map(rep => (
                  <div key={rep.name} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 0', borderBottom: '1px solid var(--border-color)' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{rep.name}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{rep.type} • {rep.date}</div>
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 999, background: rep.status === 'Normal' ? '#10b98118' : rep.status === 'Borderline' ? '#f59e0b18' : '#ef444418', color: rep.status === 'Normal' ? '#10b981' : rep.status === 'Borderline' ? '#f59e0b' : '#ef4444' }}>
                      {rep.status}
                    </span>
                  </div>
                ))}
              </div>

              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={handleDownloadPDF} disabled={pdfLoading}
                style={{ background: 'linear-gradient(135deg, #dc2626, #ef4444)', border: 'none', borderRadius: 12, padding: '14px', cursor: 'pointer', color: 'white', fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                {pdfLoading ? <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Download size={16} />}
                {pdfLoading ? 'Generating PDF...' : '⬇️ Download Complete Medical Report'}
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* ══════════════════ TAB: CONTACTS ══════════════════ */}
        {tab === 'contacts' && (
          <motion.div key="contacts" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="glass-card" style={{ padding: 22 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>
                  📞 Emergency Contacts (Auto-Notified during SOS)
                </div>
                {profile.emergencyContacts.map((c, idx) => (
                  <div key={c.id} style={{ padding: '14px 0', borderBottom: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                      <div style={{ width: 44, height: 44, borderRadius: '50%', background: `linear-gradient(135deg, #dc2626, #ef4444)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: 16 }}>
                        {c.name.charAt(0)}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{c.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{c.relation}</div>
                      </div>
                      <span style={{ background: '#ef444418', color: '#ef4444', borderRadius: 999, padding: '2px 8px', fontSize: 10, fontWeight: 700 }}>Contact {idx + 1}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <a href={`tel:${c.phone}`}
                        style={{ flex: 1, background: 'linear-gradient(135deg, #dc2626, #ef4444)', borderRadius: 8, padding: '8px', textAlign: 'center', color: 'white', fontSize: 12, fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                        <Phone size={12} /> Call {c.phone}
                      </a>
                      <a href={`https://wa.me/${c.whatsapp}`} target="_blank" rel="noreferrer"
                        style={{ flex: 1, background: '#25d36618', border: '1px solid #25d36640', borderRadius: 8, padding: '8px', textAlign: 'center', color: '#25d366', fontSize: 12, fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                        <Send size={12} /> WhatsApp
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Unknown User Flow */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(245,158,11,0.1), rgba(239,68,68,0.05))',
                border: '1px solid rgba(245,158,11,0.3)', borderRadius: 16, padding: 22,
              }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
                  🆘 Unknown Person Emergency Flow
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>
                  If a stranger finds an unconscious patient with this device
                </div>
                {[
                  { step: '1', text: 'Scan QR code on the ID card' },
                  { step: '2', text: 'Full medical history shown after OTP' },
                  { step: '3', text: 'Call emergency number on screen' },
                  { step: '4', text: 'System auto-alerts family via WhatsApp' },
                ].map(s => (
                  <div key={s.step} style={{ display: 'flex', gap: 10, padding: '6px 0', borderBottom: '1px solid var(--border-color)' }}>
                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: 12, flexShrink: 0 }}>
                      {s.step}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', paddingTop: 3 }}>{s.text}</div>
                  </div>
                ))}

                <div style={{ marginTop: 16, background: 'rgba(245,158,11,0.1)', borderRadius: 10, padding: '10px 14px' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#f59e0b', marginBottom: 4 }}>📞 Dedicated Emergency Number</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>+91 9686513132</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Dial from patient's phone → auto triggers SOS</div>
                </div>
              </div>

              {/* National Emergency Numbers */}
              <div className="glass-card" style={{ padding: 18 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>🚨 National Emergency Numbers</div>
                {[
                  { name: 'Ambulance', num: '108', color: '#ef4444' },
                  { name: 'Police', num: '100', color: '#3b82f6' },
                  { name: 'Fire Brigade', num: '101', color: '#f97316' },
                  { name: 'NDMA (Disaster)', num: '1078', color: '#8b5cf6' },
                  { name: 'Women Helpline', num: '1091', color: '#ec4899' },
                ].map(n => (
                  <div key={n.name} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--border-color)' }}>
                    <div style={{ flex: 1, fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{n.name}</div>
                    <a href={`tel:${n.num}`} style={{ background: `${n.color}18`, border: `1px solid ${n.color}40`, borderRadius: 8, padding: '4px 12px', color: n.color, fontWeight: 800, fontSize: 13, textDecoration: 'none' }}>
                      📞 {n.num}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ══════════════════ TAB: LOGS ══════════════════ */}
        {tab === 'logs' && (
          <motion.div key="logs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="glass-card" style={{ padding: 22 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <Clock size={16} color="var(--text-secondary)" />
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>SOS Activity Logs</div>
                <span style={{ marginLeft: 'auto', background: 'var(--bg-glass)', borderRadius: 999, padding: '2px 10px', fontSize: 11, color: 'var(--text-muted)' }}>
                  {sosLog.length} events
                </span>
              </div>
              {sosLog.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)', fontSize: 13 }}>
                  <div style={{ fontSize: 40, marginBottom: 10 }}>📋</div>
                  No SOS events recorded yet. Logs will appear here when SOS is triggered.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  {[...sosLog].reverse().map((log, i) => (
                    <div key={i} style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border-color)' }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', marginTop: 5, flexShrink: 0, background: log.type === 'success' ? '#10b981' : log.type === 'warning' ? '#f59e0b' : 'var(--accent-primary)' }} />
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{log.event}</div>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{log.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

      </AnimatePresence>

      <style>{`
        @keyframes sos-pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.12); opacity: 0.7; }
        }
        @keyframes sos-ring {
          0% { transform: translateY(-50%) scale(0.5); opacity: 0.8; }
          100% { transform: translateY(-50%) scale(1.5); opacity: 0; }
        }
        @keyframes sos-idle-ring {
          0%, 100% { opacity: 0.15; transform: scale(1); }
          50% { opacity: 0.45; transform: scale(1.04); }
        }
        @keyframes sos-active-ring {
          0% { opacity: 0.9; transform: scale(0.95); }
          100% { opacity: 0; transform: scale(1.6); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </motion.div>
  );
}
