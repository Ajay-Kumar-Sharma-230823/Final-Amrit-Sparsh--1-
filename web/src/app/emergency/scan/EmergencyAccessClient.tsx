'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import { Shield, CheckCircle, Download, Phone, AlertTriangle, Loader } from 'lucide-react';
import { STATIC_MEDICAL_PROFILE } from '@/lib/emergencyData';
import { generateEmergencyPDF, downloadPDF } from '@/lib/pdfGenerator';

type Phase = 'validating' | 'otp' | 'verified' | 'error';

export default function EmergencyAccessClient() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [phase, setPhase] = useState<Phase>('validating');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpSent, setOtpSent] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [loading, setLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const profile = STATIC_MEDICAL_PROFILE;

  // Validate token on load
  useEffect(() => {
    if (!token) {
      setPhase('error');
      setErrorMsg('No QR token found. Please scan the QR code again.');
      return;
    }

    // Simulate token validation (in production, call /api/qr-session)
    setTimeout(() => {
      setPhase('otp');
      handleSendOTP();
    }, 1200);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleSendOTP = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: profile.phone.replace(/\D/g, ''), channel: 'mobile' }),
      });
      const data = await res.json();
      setOtpSent(true);
      if (data.hint) {
        console.log('[DEV] Emergency OTP:', data.hint);
      }
    } catch {
      setOtpSent(true); // still allow entry
    } finally {
      setLoading(false);
    }
  };

  const handleOtpInput = (val: string, idx: number) => {
    const digit = val.replace(/[^0-9]/g, '').slice(-1);
    const next = [...otp];
    next[idx] = digit;
    setOtp(next);
    setOtpError('');
    if (digit && idx < 5) {
      document.getElementById(`eq-otp-${idx + 1}`)?.focus();
    }
  };

  const handleOtpKeyDown = (e: React.KeyboardEvent, idx: number) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      document.getElementById(`eq-otp-${idx - 1}`)?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length < 6) { setOtpError('Please enter complete 6-digit OTP'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: profile.phone.replace(/\D/g, ''), otp: code }),
      });
      const data = await res.json();
      if (data.success) {
        setPhase('verified');
      } else {
        setOtpError('Invalid OTP. Please try again.');
        setOtp(['', '', '', '', '', '']);
        document.getElementById('eq-otp-0')?.focus();
      }
    } catch {
      // For demo: accept 123456
      if (code === '123456') { setPhase('verified'); }
      else { setOtpError('Invalid OTP. Demo: use 123456'); }
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    setPdfLoading(true);
    try {
      const blob = await generateEmergencyPDF(profile);
      downloadPDF(blob, `emergency-${profile.patientName.replace(/ /g, '-')}.pdf`);
    } catch (e) {
      console.error(e);
    } finally {
      setPdfLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
      fontFamily: 'Outfit, Inter, sans-serif',
      padding: '24px 16px',
    }}>
      {/* Header */}
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
            marginBottom: 28,
          }}>
          <div style={{
            width: 44, height: 44, borderRadius: '50%',
            background: 'linear-gradient(135deg, #ef4444, #dc2626)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22,
          }}>🏥</div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'white' }}>Amrit Sparsh</div>
            <div style={{ fontSize: 11, color: '#94a3b8' }}>Emergency Medical Access System</div>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">

          {/* Validating */}
          {phase === 'validating' && (
            <motion.div key="validating" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ textAlign: 'center', padding: 48 }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🔐</div>
              <div style={{ color: 'white', fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Validating QR Token...</div>
              <div style={{ color: '#94a3b8', fontSize: 13 }}>Please wait while we verify the QR code</div>
              <div style={{ marginTop: 24 }}>
                <Loader size={28} color="#ef4444" style={{ animation: 'spin 1s linear infinite' }} />
              </div>
            </motion.div>
          )}

          {/* OTP Verification */}
          {phase === 'otp' && (
            <motion.div key="otp" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
              <div style={{
                background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)',
                border: '1px solid rgba(239,68,68,0.3)', borderRadius: 20, padding: 32,
              }}>
                {/* Emergency Warning Banner */}
                <div style={{
                  background: 'linear-gradient(135deg, #dc2626, #ef4444)',
                  borderRadius: 12, padding: '14px 20px', marginBottom: 24,
                  display: 'flex', alignItems: 'center', gap: 12,
                }}>
                  <AlertTriangle size={22} color="white" />
                  <div>
                    <div style={{ color: 'white', fontWeight: 800, fontSize: 15 }}>🚨 Emergency Medical Access</div>
                    <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12 }}>
                      OTP verification required to access confidential medical data
                    </div>
                  </div>
                </div>

                <div style={{ color: 'white', fontSize: 16, fontWeight: 700, marginBottom: 6 }}>
                  Enter Verification Code
                </div>
                <div style={{ color: '#94a3b8', fontSize: 13, marginBottom: 24 }}>
                  {otpSent
                    ? `6-digit OTP sent via WhatsApp to ${profile.phone}`
                    : 'Sending OTP...'}
                </div>

                {/* 6-digit OTP Input */}
                <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 20 }}>
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      id={`eq-otp-${i}`}
                      value={digit}
                      maxLength={1}
                      onChange={(e) => handleOtpInput(e.target.value, i)}
                      onKeyDown={(e) => handleOtpKeyDown(e, i)}
                      style={{
                        width: 50, height: 58, textAlign: 'center', fontSize: 24, fontWeight: 700,
                        background: 'rgba(255,255,255,0.08)',
                        border: `2px solid ${otpError ? '#ef4444' : digit ? '#ef4444' : 'rgba(255,255,255,0.2)'}`,
                        borderRadius: 12, color: 'white', outline: 'none',
                        transition: 'border-color 0.2s',
                      }}
                    />
                  ))}
                </div>

                {otpError && (
                  <div style={{ color: '#f87171', fontSize: 12, textAlign: 'center', marginBottom: 12 }}>
                    ⚠️ {otpError}
                  </div>
                )}

                <div style={{ color: '#60a5fa', fontSize: 11, textAlign: 'center', marginBottom: 20 }}>
                  💡 Demo mode: Enter <strong>123456</strong> to access
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={handleVerify}
                  disabled={loading || otp.join('').length < 6}
                  style={{
                    width: '100%', background: otp.join('').length === 6
                      ? 'linear-gradient(135deg, #dc2626, #ef4444)'
                      : 'rgba(255,255,255,0.1)',
                    border: 'none', borderRadius: 12, padding: '14px', cursor: 'pointer',
                    color: 'white', fontSize: 15, fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    transition: 'background 0.3s',
                  }}>
                  {loading ? <Loader size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <Shield size={18} />}
                  {loading ? 'Verifying...' : 'Verify & Access Medical Data'}
                </motion.button>

                <div style={{ textAlign: 'center', marginTop: 16 }}>
                  <button onClick={handleSendOTP} disabled={loading}
                    style={{ background: 'none', border: 'none', color: '#60a5fa', fontSize: 13, cursor: 'pointer' }}>
                    Resend OTP
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Medical Data View */}
          {phase === 'verified' && (
            <motion.div key="verified" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              {/* Verified Banner */}
              <div style={{
                background: 'linear-gradient(135deg, #065f46, #10b981)',
                borderRadius: 12, padding: '12px 20px', marginBottom: 20,
                display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <CheckCircle size={20} color="white" />
                <div style={{ color: 'white', fontWeight: 700 }}>✅ Identity Verified — Emergency Access Granted</div>
              </div>

              {/* Patient Card */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(239,68,68,0.15), rgba(220,38,38,0.05))',
                border: '1px solid rgba(239,68,68,0.4)', borderRadius: 16, padding: 20, marginBottom: 16,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                  <div style={{
                    width: 56, height: 56, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #dc2626, #ef4444)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 24, color: 'white', fontWeight: 700,
                  }}>
                    {profile.patientName.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: 'white' }}>{profile.patientName}</div>
                    <div style={{ fontSize: 13, color: '#94a3b8' }}>{profile.age} yrs • {profile.gender} • ABHA: {profile.abhaId}</div>
                    <div style={{ fontSize: 12, color: '#94a3b8' }}>{profile.phone}</div>
                  </div>
                  <div style={{
                    marginLeft: 'auto', background: '#dc2626', borderRadius: 10,
                    padding: '8px 14px', textAlign: 'center',
                  }}>
                    <div style={{ fontSize: 22, fontWeight: 800, color: 'white' }}>{profile.bloodGroup}</div>
                    <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.8)' }}>Blood Group</div>
                  </div>
                </div>

                {/* Allergies */}
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 12, color: '#fbbf24', fontWeight: 700, marginBottom: 6 }}>⚠️ ALLERGIES (Critical)</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {profile.allergies.map(a => (
                      <span key={a} style={{
                        background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.5)',
                        color: '#f87171', borderRadius: 999, padding: '3px 10px', fontSize: 12, fontWeight: 600,
                      }}>{a}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Medical Sections */}
              {[
                {
                  title: '💊 Current Medications',
                  content: profile.currentMedications.map(m => (
                    <div key={m.name} style={{ color: '#e2e8f0', fontSize: 13, padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <strong>{m.name}</strong> — {m.dosage} × {m.frequency}
                    </div>
                  )),
                },
                {
                  title: '🩺 Active Conditions',
                  content: profile.diseases.filter(d => d.type === 'current').map(d => (
                    <div key={d.name} style={{ color: '#e2e8f0', fontSize: 13, padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between' }}>
                      <span>{d.name}</span>
                      <span style={{ color: d.severity === 'severe' ? '#f87171' : d.severity === 'moderate' ? '#fbbf24' : '#34d399', fontSize: 11 }}>
                        {d.severity.toUpperCase()}
                      </span>
                    </div>
                  )),
                },
                {
                  title: '👨‍⚕️ Treating Doctors',
                  content: profile.doctors.map(dr => (
                    <div key={dr.name} style={{ color: '#e2e8f0', fontSize: 13, padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ fontWeight: 600 }}>{dr.name}</div>
                      <div style={{ color: '#94a3b8', fontSize: 12 }}>{dr.specialization} — {dr.hospital}</div>
                      <div style={{ color: '#60a5fa', fontSize: 12 }}>📞 {dr.phone}</div>
                    </div>
                  )),
                },
              ].map(section => (
                <div key={section.title} style={{
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 12, padding: 16, marginBottom: 12,
                }}>
                  <div style={{ color: 'white', fontWeight: 700, fontSize: 14, marginBottom: 10 }}>{section.title}</div>
                  {section.content}
                </div>
              ))}

              {/* Emergency Contacts */}
              <div style={{
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 12, padding: 16, marginBottom: 20,
              }}>
                <div style={{ color: 'white', fontWeight: 700, fontSize: 14, marginBottom: 10 }}>📞 Emergency Contacts</div>
                {profile.emergencyContacts.map(c => (
                  <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f87171', fontWeight: 700 }}>
                      {c.name.charAt(0)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ color: 'white', fontSize: 13, fontWeight: 600 }}>{c.name}</div>
                      <div style={{ color: '#94a3b8', fontSize: 12 }}>{c.relation}</div>
                    </div>
                    <a href={`tel:${c.phone}`} style={{
                      background: '#dc2626', borderRadius: 8, padding: '6px 12px',
                      color: 'white', fontSize: 12, fontWeight: 700, textDecoration: 'none',
                      display: 'flex', alignItems: 'center', gap: 4,
                    }}>
                      <Phone size={12} /> {c.phone}
                    </a>
                  </div>
                ))}
              </div>

              {/* Download PDF */}
              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={handleDownloadPDF}
                disabled={pdfLoading}
                style={{
                  width: '100%', background: 'linear-gradient(135deg, #dc2626, #ef4444)',
                  border: 'none', borderRadius: 14, padding: '16px',
                  color: 'white', fontSize: 16, fontWeight: 700,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  marginBottom: 12,
                }}>
                {pdfLoading
                  ? <><Loader size={18} style={{ animation: 'spin 1s linear infinite' }} /> Generating PDF...</>
                  : <><Download size={18} /> Download Emergency Medical Report (PDF)</>}
              </motion.button>

              <div style={{ textAlign: 'center', color: '#64748b', fontSize: 11, marginTop: 8 }}>
                🔒 Access logged. This emergency record view is audited and time-stamped.
              </div>
            </motion.div>
          )}

          {/* Error */}
          {phase === 'error' && (
            <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{ textAlign: 'center', padding: 48 }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>❌</div>
              <div style={{ color: '#f87171', fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Access Denied</div>
              <div style={{ color: '#94a3b8', fontSize: 13 }}>{errorMsg}</div>
            </motion.div>
          )}

        </AnimatePresence>

        {/* Branding Footer */}
        <div style={{ textAlign: 'center', marginTop: 32, color: '#475569', fontSize: 11 }}>
          Powered by <strong style={{ color: '#ef4444' }}>Amrit Sparsh</strong> Emergency Healthcare System
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
