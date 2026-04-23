'use client';

import React, { useState, useEffect, useRef, KeyboardEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Mail, Phone, Lock, Eye, EyeOff, ArrowRight, CheckCircle,
  RefreshCw, AtSign, Building2, Check, ChevronLeft, Sun, Moon,
  Shield, Activity, Bell, Zap, Heart, Sparkles,
} from 'lucide-react';
import { useAppStore } from '@/store/appStore';

/* ══════════════════════════════════════════════════════════
   TYPES
══════════════════════════════════════════════════════════ */
type AuthMode = 'login' | 'register';
type LoginTab = 'password' | 'otp';
type RegStep = 1 | 2 | 3 | 4;
type Theme = 'light' | 'dark';

interface FormData {
  name: string; institute: string; role: string; gender: string;
  mobile: string; email: string; password: string; identifier: string;
  diseases: string[]; medHistory: string; primaryColor: string; avatar: string;
}

/* ══════════════════════════════════════════════════════════
   DESIGN TOKENS — ultra-premium palette
══════════════════════════════════════════════════════════ */
const T = {
  light: {
    outerBg: 'radial-gradient(ellipse 120% 80% at 50% 0%, #f0e4d4 0%, #e8ddd0 35%, #ddd0c4 70%, #d4c4b4 100%)',
    /* phone hardware */
    phoneBg: 'linear-gradient(160deg, #1C1C1E 0%, #2C2C2E 50%, #1C1C1E 100%)',
    phoneBorder: '#3A3A3C',
    phoneShadow: '0 60px 120px rgba(0,0,0,0.50), 0 24px 48px rgba(0,0,0,0.30), 0 8px 20px rgba(139,94,52,0.15)',
    /* screen interior */
    screenBg: 'linear-gradient(160deg, #fdf6f0 0%, #f7ece0 45%, #f0e0ce 100%)',
    appBar: 'rgba(255,255,255,0.75)',
    appBarBorder: 'rgba(139,94,52,0.10)',
    /* card */
    card: 'rgba(255,255,255,0.97)',
    cardBorder: 'rgba(139,94,52,0.12)',
    cardShadow: '0 28px 72px rgba(139,94,52,0.15), 0 8px 24px rgba(0,0,0,0.08)',
    topBar: 'linear-gradient(90deg, #8B5E34 0%, #C8A27A 50%, #8B5E34 100%)',
    /* inputs */
    input: '#f0e4d6',
    inputFocus: '#e8d6c4',
    inputBorder: 'transparent',
    inputBorderF: '#8B5E34',
    inputText: '#2D1B0F',
    inputPh: '#B08868',
    /* tabs */
    tabBg: 'rgba(139,94,52,0.08)',
    tabActive: '#8B5E34',
    tabActText: '#FFFFFF',
    tabInact: '#A07050',
    /* text */
    text: '#1C0F05',
    textSub: '#6B4226',
    muted: '#A07050',
    /* brand */
    primary: '#8B5E34',
    primaryGrad: 'linear-gradient(135deg, #7a4f28 0%, #8B5E34 40%, #A87248 100%)',
    primaryShadow: 'rgba(139,94,52,0.45)',
    primaryText: '#FFFFFF',
    /* misc */
    divider: 'rgba(139,94,52,0.10)',
    stepDone: '#3D7A3D',
    stepInact: '#DCC8A8',
    errBg: 'rgba(180,40,30,0.08)',
    errText: '#B42820',
    chip: 'rgba(139,94,52,0.08)',
    chipActive: 'rgba(139,94,52,0.18)',
    chipBorder: 'rgba(139,94,52,0.15)',
    chipBorderA: '#8B5E34',
    chipText: '#7B5438',
    chipTextA: '#4A2810',
    featureBg: 'rgba(139,94,52,0.07)',
    featureText: '#7B5438',
  },
  dark: {
    outerBg: 'radial-gradient(ellipse 140% 90% at 50% -20%, #0d1130 0%, #080c1e 40%, #040610 70%, #020408 100%)',
    /* phone hardware */
    phoneBg: 'linear-gradient(160deg, #0A0A0C 0%, #1A1A1E 50%, #0A0A0C 100%)',
    phoneBorder: '#2C2C2E',
    phoneShadow: '0 60px 140px rgba(0,0,0,0.90), 0 24px 60px rgba(0,0,0,0.70), 0 0 80px rgba(80,60,240,0.14)',
    /* screen interior */
    screenBg: 'radial-gradient(ellipse 120% 80% at 50% 20%, #0a0f28 0%, #060918 50%, #030614 100%)',
    appBar: 'rgba(0,0,0,0.50)',
    appBarBorder: 'rgba(255,255,255,0.05)',
    /* card */
    card: 'rgba(255,255,255,0.04)',
    cardBorder: 'rgba(255,255,255,0.08)',
    cardShadow: '0 28px 72px rgba(0,0,0,0.60), 0 0 0 1px rgba(255,255,255,0.05), inset 0 1px 0 rgba(255,255,255,0.07)',
    topBar: 'linear-gradient(90deg, #4F46E5 0%, #818CF8 50%, #4F46E5 100%)',
    /* inputs */
    input: 'rgba(255,255,255,0.07)',
    inputFocus: 'rgba(255,255,255,0.12)',
    inputBorder: 'transparent',
    inputBorderF: 'rgba(255,255,255,0.45)',
    inputText: '#F1F5F9',
    inputPh: '#475569',
    /* tabs */
    tabBg: 'rgba(255,255,255,0.06)',
    tabActive: '#FFFFFF',
    tabActText: '#020617',
    tabInact: '#64748B',
    /* text */
    text: '#F1F5F9',
    textSub: '#94A3B8',
    muted: '#64748B',
    /* brand */
    primary: '#FFFFFF',
    primaryGrad: 'linear-gradient(135deg, #FFFFFF 0%, #E2E8F0 100%)',
    primaryShadow: 'rgba(255,255,255,0.16)',
    primaryText: '#020617',
    /* misc */
    divider: 'rgba(255,255,255,0.07)',
    stepDone: '#22C55E',
    stepInact: 'rgba(255,255,255,0.10)',
    errBg: 'rgba(239,68,68,0.10)',
    errText: '#F87171',
    chip: 'rgba(255,255,255,0.06)',
    chipActive: 'rgba(255,255,255,0.14)',
    chipBorder: 'rgba(255,255,255,0.08)',
    chipBorderA: 'rgba(255,255,255,0.40)',
    chipText: '#94A3B8',
    chipTextA: '#F1F5F9',
    featureBg: 'rgba(255,255,255,0.04)',
    featureText: '#94A3B8',
  },
};

/* ══════════════════════════════ CONSTANTS ══════════════════════════════ */
const DISEASES = [
  'Diabetes', 'Hypertension', 'Asthma', 'Heart Disease', 'Thyroid',
  'Arthritis', 'Migraine', 'Anaemia', 'Kidney Disease', 'Epilepsy',
  'Depression', 'Anxiety', 'PCOS', 'None',
];
const COLOR_PRESETS = [
  '#8B5E34', '#7C3AED', '#E11D48', '#059669', '#0284C7', '#D97706', '#A21CAF', '#0D9488',
];
const AVATAR_GROUPS = [
  { label: '🦸 Hero', avatars: [{ id: 'bat', e: '🦇' }, { id: 'iron', e: '🤖' }, { id: 'thor', e: '⚡' }, { id: 'spider', e: '🕷️' }] },
  { label: '🧑‍⚕️ Medical', avatars: [{ id: 'doc', e: '🧑‍⚕️' }, { id: 'grad', e: '🎓' }, { id: 'nova', e: '🌟' }, { id: 'bio', e: '🧬' }] },
];
const OTP_LEN = 6;

/* ══════════════════════════════ API ══════════════════════════════ */
async function apiSend(id: string, ch: 'mobile' | 'email') {
  try {
    const r = await fetch('/api/send-otp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ identifier: id, channel: ch }) });
    return r.json() as Promise<{ success: boolean; hint?: string; error?: string }>;
  } catch { return { success: false, error: 'Network error' }; }
}
async function apiVerify(id: string, otp: string) {
  try {
    const r = await fetch('/api/verify-otp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ identifier: id, otp }) });
    return r.json() as Promise<{ success: boolean; error?: string }>;
  } catch { return { success: false, error: 'Network error' }; }
}

/* ══════════════════════════════ PRIMITIVES ══════════════════════════════ */
interface TTokens { [k: string]: string }

function LapInput({
  t, icon: Icon, type = 'text', placeholder, value, onChange, onKeyDown, rightEl, disabled = false,
}: {
  t: TTokens; icon: React.ElementType; type?: string; placeholder: string;
  value: string; onChange: (v: string) => void; onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void;
  rightEl?: React.ReactNode; disabled?: boolean;
}) {
  const [focus, setFocus] = useState(false);
  return (
    <div style={{ position: 'relative' }}>
      <div style={{
        position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
        color: focus ? t.primary : t.inputPh, transition: 'color 0.22s', pointerEvents: 'none', zIndex: 1,
      }}>
        <Icon size={15} />
      </div>
      <input
        type={type} placeholder={placeholder} value={value} disabled={disabled}
        onChange={e => onChange(e.target.value)} onKeyDown={onKeyDown}
        onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
        style={{
          width: '100%', height: 46, paddingLeft: 40, paddingRight: rightEl ? 40 : 14,
          background: focus ? t.inputFocus : t.input,
          border: `1.5px solid ${focus ? t.inputBorderF : t.inputBorder}`,
          borderRadius: 12, fontSize: 14, fontFamily: 'Inter,sans-serif',
          color: t.inputText, outline: 'none', boxSizing: 'border-box',
          transition: 'all 0.22s', cursor: disabled ? 'not-allowed' : 'text',
          boxShadow: focus ? `0 0 0 3px ${t.primaryShadow}22` : 'none',
        }}
      />
      {rightEl && (
        <div style={{ position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: t.inputPh }}>
          {rightEl}
        </div>
      )}
    </div>
  );
}

function LapBtn({
  t, onClick, children, disabled = false, variant = 'primary', fullWidth = true,
}: {
  t: TTokens; onClick?: () => void; children: React.ReactNode;
  disabled?: boolean; variant?: 'primary' | 'ghost'; fullWidth?: boolean;
}) {
  const [hover, setHover] = useState(false);
  const isPrimary = variant === 'primary';
  return (
    <button
      onClick={onClick} disabled={disabled}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        width: fullWidth ? '100%' : 'auto',
        height: 46, padding: '0 22px',
        background: isPrimary ? t.primaryGrad : 'transparent',
        border: isPrimary ? 'none' : `1.5px solid ${t.divider}`,
        borderRadius: 12, fontSize: 14, fontWeight: 700,
        fontFamily: 'Inter,sans-serif',
        color: isPrimary ? t.primaryText : t.textSub,
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        transition: 'all 0.22s',
        opacity: disabled ? 0.45 : 1,
        boxShadow: isPrimary && hover ? `0 10px 28px ${t.primaryShadow}` : 'none',
        transform: isPrimary && hover && !disabled ? 'translateY(-2px)' : 'none',
      }}
    >
      {children}
    </button>
  );
}

function ErrMsg({ msg, t }: { msg: string; t: TTokens }) {
  if (!msg) return null;
  return (
    <div style={{ padding: '9px 13px', borderRadius: 9, fontSize: 12.5, background: t.errBg, color: t.errText, fontWeight: 500 }}>
      {msg}
    </div>
  );
}

function StepBar({ step, t }: { step: number; t: TTokens }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 16 }}>
      {[1, 2, 3, 4].map(s => (
        <React.Fragment key={s}>
          <div style={{
            width: 26, height: 26, borderRadius: '50%', fontSize: 11.5, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: s < step ? t.stepDone : s === step ? t.primary : t.stepInact,
            color: s <= step ? t.primaryText : t.muted,
            transition: 'all 0.3s',
            boxShadow: s === step ? `0 4px 12px ${t.primaryShadow}` : 'none',
          }}>
            {s < step ? <Check size={12} /> : s}
          </div>
          {s < 4 && <div style={{ flex: 1, height: 2, borderRadius: 2, background: s < step ? t.stepDone : t.stepInact, transition: 'all 0.3s' }} />}
        </React.Fragment>
      ))}
    </div>
  );
}

function OtpBoxes({ otp, setOtp, t }: { otp: string[]; setOtp: (o: string[]) => void; t: TTokens }) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const handle = (i: number, val: string) => {
    if (!/^[0-9]?$/.test(val)) return;
    const n = [...otp]; n[i] = val; setOtp(n);
    if (val && i < OTP_LEN - 1) refs.current[i + 1]?.focus();
  };
  const handleKey = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) refs.current[i - 1]?.focus();
  };
  return (
    <div style={{ display: 'flex', gap: 9, justifyContent: 'center' }}>
      {Array.from({ length: OTP_LEN }).map((_, i) => (
        <input key={i} ref={el => { refs.current[i] = el; }}
          type="text" inputMode="numeric" maxLength={1}
          value={otp[i] || ''}
          onChange={e => handle(i, e.target.value)}
          onKeyDown={e => handleKey(i, e)}
          style={{
            width: 44, height: 52, textAlign: 'center', fontSize: 20,
            fontWeight: 800, fontFamily: 'Inter,sans-serif',
            background: t.input, border: `2px solid ${otp[i] ? t.inputBorderF : t.divider}`,
            borderRadius: 11, color: t.inputText, outline: 'none',
            transition: 'all 0.2s',
            boxShadow: otp[i] ? `0 0 0 3px ${t.primaryShadow}22` : 'none',
          }}
        />
      ))}
    </div>
  );
}

/* ══════════════════════════════ LOGIN FORM ══════════════════════════════ */
function LoginForm({ t, loginTab, setLoginTab, form, setForm, onSuccess }: {
  t: TTokens; loginTab: LoginTab; setLoginTab: (v: LoginTab) => void;
  form: FormData; setForm: React.Dispatch<React.SetStateAction<FormData>>;
  onSuccess: () => void;
}) {
  const [showPw, setShowPw] = useState(false);
  const [otp, setOtp] = useState(Array(OTP_LEN).fill(''));
  const [otpSent, setOtpSent] = useState(false);
  const [timer, setTimer] = useState(0);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (timer > 0) { const id = setTimeout(() => setTimer(p => p - 1), 1000); return () => clearTimeout(id); }
  }, [timer]);

  const sendOtp = async () => {
    setErr(''); setLoading(true);
    const ch = form.identifier.includes('@') ? 'email' : 'mobile';
    const r = await apiSend(form.identifier, ch);
    setLoading(false);
    if (r.success) { setOtpSent(true); setTimer(120); }
    else setErr(r.error || 'Failed to send OTP');
  };

  const submit = async () => {
    setErr(''); setLoading(true);
    if (loginTab === 'password') {
      await new Promise(r => setTimeout(r, 900));
      setLoading(false); onSuccess();
    } else {
      const code = otp.join('');
      if (code.length < OTP_LEN) { setLoading(false); setErr('Enter all 6 digits'); return; }
      const r = await apiVerify(form.identifier, code);
      setLoading(false);
      if (r.success) onSuccess(); else setErr(r.error || 'Invalid OTP');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Sub-tabs */}
      <div style={{ display: 'flex', background: t.tabBg, borderRadius: 11, padding: 3, gap: 3 }}>
        {(['password', 'otp'] as LoginTab[]).map(tab => (
          <button key={tab} onClick={() => { setLoginTab(tab); setErr(''); setOtpSent(false); }}
            style={{
              flex: 1, height: 36, borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700,
              fontFamily: 'Inter,sans-serif', transition: 'all 0.25s',
              background: loginTab === tab ? t.tabActive : 'transparent',
              color: loginTab === tab ? t.tabActText : t.tabInact,
              boxShadow: loginTab === tab ? `0 2px 10px ${t.primaryShadow}` : 'none',
            }}>
            {tab === 'password' ? ' Password' : ' OTP Login'}
          </button>
        ))}
      </div>

      {loginTab === 'password' ? (
        <>
          <LapInput t={t} icon={AtSign} placeholder="Email or Mobile Number"
            value={form.identifier} onChange={v => setForm(f => ({ ...f, identifier: v }))} />
          <LapInput t={t} icon={Lock} type={showPw ? 'text' : 'password'} placeholder="Password"
            value={form.password} onChange={v => setForm(f => ({ ...f, password: v }))}
            rightEl={<div onClick={() => setShowPw(p => !p)}>{showPw ? <EyeOff size={15} /> : <Eye size={15} />}</div>} />
        </>
      ) : (
        <>
          <LapInput t={t} icon={AtSign} placeholder="Email or Mobile Number"
            value={form.identifier} onChange={v => setForm(f => ({ ...f, identifier: v }))} />
          {!otpSent ? (
            <LapBtn t={t} onClick={sendOtp} disabled={loading || !form.identifier}>
              {loading ? <><RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} />Sending…</> : 'Send OTP'}
            </LapBtn>
          ) : (
            <>
              <OtpBoxes otp={otp} setOtp={setOtp} t={t} />
              <div style={{ textAlign: 'center', fontSize: 12, color: t.muted }}>
                {timer > 0 ? `Resend in ${timer}s` : (
                  <span style={{ color: t.primary, cursor: 'pointer', fontWeight: 700 }} onClick={sendOtp}>Resend OTP</span>
                )}
              </div>
            </>
          )}
        </>
      )}

      <ErrMsg msg={err} t={t} />

      {(loginTab === 'password' || otpSent) && (
        <LapBtn t={t} onClick={submit} disabled={loading}>
          {loading ? <><RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} />Signing in…</> : <>Sign In to Amrit Sparsh <ArrowRight size={14} /></>}
        </LapBtn>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5 }}>
        <span style={{ color: t.muted, cursor: 'pointer' }}>Forgot Password?</span>
        <span style={{ color: t.primary, fontWeight: 700, cursor: 'pointer' }}>Create Account →</span>
      </div>
    </div>
  );
}

/* ══════════════════════════════ REGISTER STEPS ══════════════════════════════ */
function Step1({ t, form, setForm }: { t: TTokens; form: FormData; setForm: React.Dispatch<React.SetStateAction<FormData>> }) {
  const [showPw, setShowPw] = useState(false);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <LapInput t={t} icon={User} placeholder="Full Name" value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} />
      <LapInput t={t} icon={Building2} placeholder="Hospital/Institute" value={form.institute} onChange={v => setForm(f => ({ ...f, institute: v }))} />
      <LapInput t={t} icon={Phone} placeholder="Mobile Number (WhatsApp)" value={form.mobile} onChange={v => setForm(f => ({ ...f, mobile: v }))} />
      <LapInput t={t} icon={Mail} placeholder="Email Address" value={form.email} onChange={v => setForm(f => ({ ...f, email: v }))} />
      <LapInput t={t} icon={Lock} type={showPw ? 'text' : 'password'} placeholder="Create Password"
        value={form.password} onChange={v => setForm(f => ({ ...f, password: v }))}
        rightEl={<div onClick={() => setShowPw(p => !p)}>{showPw ? <EyeOff size={15} /> : <Eye size={15} />}</div>} />
      {/* Gender */}
      <div>
        <div style={{ fontSize: 11, color: t.muted, fontWeight: 600, marginBottom: 5 }}>Gender</div>
        <div style={{ display: 'flex', gap: 6 }}>
          {(['Male', 'Female', 'Other'] as const).map(g => (
            <button key={g} onClick={() => setForm(f => ({ ...f, gender: g.toLowerCase() }))}
              style={{
                padding: '5px 13px', borderRadius: 9, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                fontFamily: 'Inter,sans-serif', transition: 'all 0.2s',
                border: `1.5px solid ${form.gender === g.toLowerCase() ? t.chipBorderA : t.chipBorder}`,
                background: form.gender === g.toLowerCase() ? t.chipActive : t.chip,
                color: form.gender === g.toLowerCase() ? t.chipTextA : t.chipText,
              }}>{g === 'Male' ? ' Male' : g === 'Female' ? ' Female' : ' Other'}</button>
          ))}
        </div>
      </div>
      {/* Role */}
      <div>
        <div style={{ fontSize: 11, color: t.muted, fontWeight: 600, marginBottom: 5 }}>Role</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {['Doctor', 'Patient', 'Hospital'].map(r => (
            <button key={r} onClick={() => setForm(f => ({ ...f, role: r.toLowerCase() }))}
              style={{
                padding: '5px 13px', borderRadius: 9, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                fontFamily: 'Inter,sans-serif', transition: 'all 0.2s',
                border: `1.5px solid ${form.role === r.toLowerCase() ? t.chipBorderA : t.chipBorder}`,
                background: form.role === r.toLowerCase() ? t.chipActive : t.chip,
                color: form.role === r.toLowerCase() ? t.chipTextA : t.chipText,
              }}>{r}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

function Step2({ t, form, setForm, onOtpSent }: {
  t: TTokens; form: FormData; setForm: React.Dispatch<React.SetStateAction<FormData>>;
  onOtpSent: () => void;
}) {
  const [otp, setOtp] = useState(Array(OTP_LEN).fill(''));
  const [sent, setSent] = useState(false);
  const [timer, setTimer] = useState(0);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (timer > 0) { const id = setTimeout(() => setTimer(p => p - 1), 1000); return () => clearTimeout(id); }
  }, [timer]);

  const send = async () => {
    setErr(''); setLoading(true);
    const r = await apiSend(form.mobile, 'mobile');
    setLoading(false);
    if (r.success) { setSent(true); setTimer(120); }
    else setErr(r.error || 'Failed');
  };
  const verify = async () => {
    setErr(''); setLoading(true);
    const r = await apiVerify(form.mobile, otp.join(''));
    setLoading(false);
    if (r.success) onOtpSent(); else setErr(r.error || 'Invalid OTP');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
      <div style={{ textAlign: 'center', fontSize: 13.5, color: t.textSub, lineHeight: 1.6 }}>
        We'll send a verification code to<br />
        <strong style={{ color: t.text }}>{form.mobile || 'your mobile'}</strong>
      </div>
      {!sent ? (
        <LapBtn t={t} onClick={send} disabled={loading || !form.mobile}>
          {loading ? <><RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} />Sending…</> : 'Send Verification Code'}
        </LapBtn>
      ) : (
        <>
          <OtpBoxes otp={otp} setOtp={setOtp} t={t} />
          <div style={{ textAlign: 'center', fontSize: 12, color: t.muted }}>
            {timer > 0 ? `Resend in ${timer}s` : <span style={{ color: t.primary, cursor: 'pointer', fontWeight: 700 }} onClick={send}>Resend</span>}
          </div>
          <ErrMsg msg={err} t={t} />
          <LapBtn t={t} onClick={verify} disabled={loading || otp.join('').length < OTP_LEN}>
            {loading ? <><RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} />Verifying…</> : <>Verify OTP <CheckCircle size={14} /></>}
          </LapBtn>
        </>
      )}
      {!sent && <ErrMsg msg={err} t={t} />}
    </div>
  );
}

function Step3({ t, form, setForm }: { t: TTokens; form: FormData; setForm: React.Dispatch<React.SetStateAction<FormData>> }) {
  const toggle = (d: string) => setForm(f => ({
    ...f, diseases: f.diseases.includes(d) ? f.diseases.filter(x => x !== d) : [...f.diseases, d]
  }));
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
      <div>
        <div style={{ fontSize: 12, color: t.muted, marginBottom: 8, fontWeight: 600 }}>Known Conditions</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {DISEASES.map(d => {
            const on = form.diseases.includes(d);
            return (
              <button key={d} onClick={() => toggle(d)} style={{
                padding: '4px 11px', borderRadius: 9, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                fontFamily: 'Inter,sans-serif', transition: 'all 0.18s',
                border: `1.5px solid ${on ? t.chipBorderA : t.chipBorder}`,
                background: on ? t.chipActive : t.chip,
                color: on ? t.chipTextA : t.chipText,
              }}>{d}</button>
            );
          })}
        </div>
      </div>
      <div>
        <div style={{ fontSize: 12, color: t.muted, marginBottom: 6, fontWeight: 600 }}>Medical History <span style={{ fontWeight: 400 }}>(optional)</span></div>
        <textarea value={form.medHistory} onChange={e => setForm(f => ({ ...f, medHistory: e.target.value }))}
          placeholder="Past surgeries, allergies, medications…" rows={3}
          style={{
            width: '100%', padding: '11px 13px', background: t.input,
            border: `1.5px solid ${t.inputBorder}`, borderRadius: 11,
            fontSize: 13, fontFamily: 'Inter,sans-serif', color: t.inputText,
            outline: 'none', resize: 'none', boxSizing: 'border-box',
          }} />
      </div>
      <div>
        <div style={{ fontSize: 12, color: t.muted, marginBottom: 7, fontWeight: 600 }}>Dashboard Accent Color</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {COLOR_PRESETS.map(c => (
            <button key={c} onClick={() => setForm(f => ({ ...f, primaryColor: c }))}
              style={{
                width: 28, height: 28, borderRadius: '50%', background: c, cursor: 'pointer', border: 'none',
                boxShadow: form.primaryColor === c ? `0 0 0 2.5px white,0 0 0 4.5px ${c}` : '0 2px 8px rgba(0,0,0,0.25)',
                transform: form.primaryColor === c ? 'scale(1.18)' : 'scale(1)', transition: 'all 0.18s',
              }} />
          ))}
        </div>
      </div>
    </div>
  );
}

function Step4({ t, form, setForm }: { t: TTokens; form: FormData; setForm: React.Dispatch<React.SetStateAction<FormData>> }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
      <div style={{ textAlign: 'center', fontSize: 13.5, color: t.textSub, lineHeight: 1.6 }}>
        Choose your avatar — it will represent you across the platform
      </div>
      {AVATAR_GROUPS.map(g => (
        <div key={g.label}>
          <div style={{ fontSize: 11.5, color: t.muted, fontWeight: 600, marginBottom: 7 }}>{g.label}</div>
          <div style={{ display: 'flex', gap: 9 }}>
            {g.avatars.map(a => (
              <button key={a.id} onClick={() => setForm(f => ({ ...f, avatar: a.id }))}
                style={{
                  width: 56, height: 56, borderRadius: 15, fontSize: 24, cursor: 'pointer',
                  background: form.avatar === a.id ? t.chipActive : t.chip,
                  border: `2px solid ${form.avatar === a.id ? t.chipBorderA : t.chipBorder}`,
                  transform: form.avatar === a.id ? 'scale(1.12)' : 'scale(1)',
                  transition: 'all 0.18s', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: form.avatar === a.id ? `0 6px 18px ${t.primaryShadow}` : 'none',
                }}>{a.e}</button>
            ))}
          </div>
        </div>
      ))}
      {form.name && (
        <div style={{
          padding: '13px 16px', borderRadius: 13, background: t.chip,
          border: `1px solid ${t.chipBorder}`, display: 'flex', alignItems: 'center', gap: 12, marginTop: 4,
        }}>
          <div style={{
            width: 44, height: 44, borderRadius: 13, background: form.primaryColor || t.primary,
            fontSize: 22, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {AVATAR_GROUPS.flatMap(g => g.avatars).find(a => a.id === form.avatar)?.e || '😊'}
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, color: t.text }}>{form.name}</div>
            <div style={{ fontSize: 11.5, color: t.muted }}>{form.role || 'Healthcare Professional'} · {form.institute || 'Your Institute'}</div>
          </div>
          <div style={{ marginLeft: 'auto', width: 10, height: 10, borderRadius: '50%', background: t.stepDone }} />
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════ SUCCESS SCREEN ══════════════════════════════ */
function SuccessScreen({ t, form, onComplete }: { t: TTokens; form: FormData; onComplete?: (profile: FormData) => void }) {
  const vidRef = useRef<HTMLVideoElement>(null);
  const [ended, setEnded] = useState(false);

  useEffect(() => {
    const v = vidRef.current;
    if (!v) return;
    v.play().catch(() => { });
    const handleEnded = () => {
      setEnded(true);
      // Auto-redirect to About Us after a brief 1.2s so user sees the overlay
      setTimeout(() => { onComplete?.(form); }, 1200);
    };
    v.addEventListener('ended', handleEnded);
    return () => v.removeEventListener('ended', handleEnded);
  }, [onComplete]);

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      gap: 20, padding: '24px 32px', height: '100%', boxSizing: 'border-box',
    }}>
      <div style={{
        width: 280, borderRadius: 18, overflow: 'hidden',
        boxShadow: `0 24px 72px ${t.primaryShadow},0 8px 24px rgba(0,0,0,0.22)`,
        border: `1px solid ${t.cardBorder}`, background: '#000', position: 'relative',
      }}>
        {/* No loop — plays once, then onEnded fires */}
        <video ref={vidRef} autoPlay muted playsInline style={{ width: '100%', display: 'block' }}>
          <source src="/namaste.mp4" type="video/mp4" />
        </video>
        {/* Overlay shown when video ends */}
        {ended && (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'rgba(0,0,0,0.65)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: 8,
          }}>
            <div style={{ fontSize: 28 }}></div>
            <div style={{
              fontSize: 13, fontWeight: 700, color: '#fff',
              letterSpacing: '0.3px', textAlign: 'center', padding: '0 16px',
            }}>Taking you to Amrit Sparsh</div>
            {/* Animated progress bar */}
            <div style={{ width: 120, height: 3, borderRadius: 4, background: 'rgba(255,255,255,0.20)', marginTop: 4 }}>
              <div style={{
                height: '100%', borderRadius: 4,
                background: `linear-gradient(90deg,${t.primary},#fff)`,
                animation: 'progressFill 1.2s linear forwards',
              }} />
            </div>
          </div>
        )}
        {!ended && (
          <div style={{
            position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)',
            background: 'rgba(0,0,0,0.60)', padding: '4px 12px', borderRadius: 20,
            fontSize: 11, color: '#fff', whiteSpace: 'nowrap', backdropFilter: 'blur(6px)',
          }}> Hi I am Amrit Sparsh</div>
        )}
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 24, fontWeight: 900, color: t.text, marginBottom: 5, letterSpacing: '-0.5px' }}>
          Welcome to Amrit Sparsh
        </div>
        <div style={{ fontSize: 13.5, color: t.textSub }}>
          {ended ? 'Redirecting to About Us…' : 'Your healthcare journey begins now.'}
        </div>
      </div>
      {!ended && (
        <LapBtn t={t} onClick={() => onComplete?.(form)} fullWidth={false}>
          Skip to About Us <ArrowRight size={14} />
        </LapBtn>
      )}
    </div>
  );
}

/* ══════════════════════════════ SCREEN APP ══════════════════════════════ */
function ScreenApp({
  theme, mode, setMode, step, setStep, form, setForm, loginTab, setLoginTab, onSuccess, loggedIn, onComplete,
}: {
  theme: Theme;
  mode: AuthMode; setMode: (v: AuthMode) => void;
  step: RegStep; setStep: (v: RegStep) => void;
  form: FormData; setForm: React.Dispatch<React.SetStateAction<FormData>>;
  loginTab: LoginTab; setLoginTab: (v: LoginTab) => void;
  onSuccess: () => void; loggedIn: boolean;
  onComplete?: (profile: FormData) => void;
}) {
  const t = T[theme];
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const advance = () => {
    setErr('');
    if (step === 1) {
      if (!form.name || !form.mobile || !form.email || !form.password || !form.role) {
        setErr('Please fill all required fields.'); return;
      }
    }
    setStep((step + 1) as RegStep);
  };

  const STEP_LABELS = ['Your Details', 'Verify Mobile', 'Health Profile', 'Avatar'];

  return (
    <div style={{
      width: '100%', height: '100%', background: t.screenBg,
      display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden',
      fontFamily: "'Inter',sans-serif",
    }}>
      {/* Screen ambient glow for dark mode */}
      {theme === 'dark' && (
        <>
          <div style={{
            position: 'absolute', top: -120, right: -80, width: 380, height: 380, borderRadius: '50%',
            background: 'radial-gradient(circle,rgba(79,70,229,0.14) 0%,transparent 70%)',
            filter: 'blur(50px)', pointerEvents: 'none'
          }} />
          <div style={{
            position: 'absolute', bottom: -80, left: -60, width: 300, height: 300, borderRadius: '50%',
            background: 'radial-gradient(circle,rgba(139,92,246,0.10) 0%,transparent 70%)',
            filter: 'blur(40px)', pointerEvents: 'none'
          }} />
        </>
      )}
      {/* Light mode warm grid */}
      {theme === 'light' && (
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `linear-gradient(rgba(139,94,52,0.035) 1px,transparent 1px),linear-gradient(90deg,rgba(139,94,52,0.035) 1px,transparent 1px)`,
          backgroundSize: '32px 32px', pointerEvents: 'none',
        }} />
      )}

      {/* Dynamic Island spacer */}
      <div style={{ height: 58, flexShrink: 0 }} />

      {/* App Bar */}
      <div style={{
        height: 44, flexShrink: 0, display: 'flex', alignItems: 'center',
        padding: '0 16px', background: t.appBar,
        borderBottom: `1px solid ${t.appBarBorder}`,
        position: 'relative', zIndex: 2,
        backdropFilter: theme === 'dark' ? 'blur(20px)' : 'none',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
          <div style={{
            width: 26, height: 26, borderRadius: 8, background: t.primaryGrad,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13,
            boxShadow: `0 3px 10px ${t.primaryShadow}`,
          }}></div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 900, color: t.text, letterSpacing: '-0.3px' }}>Amrit Sparsh</div>
            <div style={{ fontSize: 8, color: t.muted, letterSpacing: '0.6px', marginTop: -1 }}>UNIFIED HEALTHCARE</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 5 }}>
          {[{ i: <Shield size={9} />, l: 'Secure' }, { i: <Bell size={9} />, l: 'Live' }].map((f, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 3, padding: '3px 7px',
              borderRadius: 6, background: t.featureBg, color: t.featureText, fontSize: 9, fontWeight: 600,
            }}>{f.i}{f.l}</div>
          ))}
        </div>
      </div>

      {/* Content */}
      {loggedIn ? (
        <SuccessScreen t={t} form={form} onComplete={onComplete} />
      ) : (
        <div style={{
          flex: 1, overflow: 'auto', display: 'flex',
          alignItems: 'flex-start', justifyContent: 'center',
          padding: '14px 12px', position: 'relative', zIndex: 1,
        }}>
          <motion.div
            key={mode + step}
            initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.38, ease: 'easeOut' }}
            style={{
              width: '100%', background: t.card,
              backdropFilter: 'blur(28px)', WebkitBackdropFilter: 'blur(28px)',
              border: `1px solid ${t.cardBorder}`, borderRadius: 20,
              boxShadow: t.cardShadow, overflow: 'hidden',
            }}
          >
            {/* Top gradient bar */}
            <div style={{ height: 3, background: t.topBar }} />

            <div style={{ padding: '16px 18px' }}>
              {/* Main Tabs */}
              <div style={{ display: 'flex', background: t.tabBg, borderRadius: 13, padding: 3, gap: 3, marginBottom: 18 }}>
                {(['login', 'register'] as AuthMode[]).map(m => (
                  <button key={m} onClick={() => { setMode(m); setErr(''); }}
                    style={{
                      flex: 1, height: 38, borderRadius: 10, border: 'none', cursor: 'pointer',
                      fontSize: 13, fontWeight: 700, fontFamily: 'Inter,sans-serif',
                      background: mode === m ? t.tabActive : 'transparent',
                      color: mode === m ? t.tabActText : t.tabInact,
                      transition: 'all 0.25s',
                      boxShadow: mode === m ? `0 2px 12px ${t.primaryShadow}` : 'none',
                    }}>
                    {m === 'login' ? 'Login' : 'Sign Up'}
                  </button>
                ))}
              </div>

              {/* Header */}
              {mode === 'login' ? (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 22, fontWeight: 900, color: t.text, letterSpacing: '-0.5px' }}>
                    Welcome Back
                  </div>
                  <div style={{ fontSize: 13, color: t.textSub, marginTop: 3 }}>Sign in to your healthcare dashboard</div>
                </div>
              ) : (
                <div style={{ marginBottom: 14 }}>
                  <StepBar step={step} t={t} />
                  <div style={{ fontSize: 18, fontWeight: 900, color: t.text }}>
                    Step {step}: {STEP_LABELS[step - 1]}
                  </div>
                  <div style={{ fontSize: 12.5, color: t.textSub, marginTop: 3 }}>
                    {['Fill in your personal & account details', 'Verify your mobile number with OTP', 'Tell us about your health profile', 'Choose your identity & theme'][step - 1]}
                  </div>
                </div>
              )}

              {/* Form Body */}
              <AnimatePresence mode="wait">
                <motion.div key={mode === 'login' ? loginTab : step}
                  initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.22 }}>
                  {mode === 'login' ? (
                    <LoginForm t={t} loginTab={loginTab} setLoginTab={setLoginTab}
                      form={form} setForm={setForm} onSuccess={onSuccess} />
                  ) : (
                    <>
                      {step === 1 && <Step1 t={t} form={form} setForm={setForm} />}
                      {step === 2 && <Step2 t={t} form={form} setForm={setForm} onOtpSent={() => setStep(3)} />}
                      {step === 3 && <Step3 t={t} form={form} setForm={setForm} />}
                      {step === 4 && <Step4 t={t} form={form} setForm={setForm} />}

                      <ErrMsg msg={err} t={t} />

                      <div style={{ display: 'flex', gap: 9, marginTop: 14 }}>
                        {step > 1 && (
                          <LapBtn t={t} variant='ghost' onClick={() => { setStep((step - 1) as RegStep); setErr(''); }} fullWidth={false}>
                            <ChevronLeft size={14} /> Back
                          </LapBtn>
                        )}
                        {step < 4 && (
                          <LapBtn t={t} onClick={advance} disabled={loading}>
                            {loading ? <><RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} />Processing…</> : <>Continue <ArrowRight size={14} /></>}
                          </LapBtn>
                        )}
                        {step === 4 && (
                          <LapBtn t={t} onClick={() => { setLoading(true); setTimeout(() => { setLoading(false); onSuccess(); }, 1000); }}>
                            {loading ? <><RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} />Creating…</> : <>Create Account 🎉</>}
                          </LapBtn>
                        )}
                      </div>
                    </>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Security footer */}
              <div style={{
                marginTop: 16, paddingTop: 13, borderTop: `1px solid ${t.divider}`,
                textAlign: 'center', fontSize: 11, color: t.muted,
              }}>
                256-bit encrypted · ABHA compliant · Government certified
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   REALISTIC iPHONE-STYLE SHELL
   – Dynamic Island, side buttons, cinematic drop shadow
══════════════════════════════════════════════════════════ */
function IPhoneShell({ children, theme }: { children: React.ReactNode; theme: Theme }) {
  const t = T[theme];
  const isDark = theme === 'dark';

  // iPhone 15 Pro proportions
  const SW = 390;   // screen width
  const SH = 780;   // screen height (taller for full content)
  const BEZEL = 14; // side/top bezel
  const BOT = 14; // bottom bezel
  const PW = SW + BEZEL * 2; // phone total width
  const PH = SH + BEZEL + BOT + 6; // phone total height

  return (
    <div style={{
      display: 'flex', flexDirection: 'row', alignItems: 'center',
      gap: 0, position: 'relative', zIndex: 2,
    }}>

      {/* ─── LEFT BUTTONS (volume) ─── */}
      <div style={{
        display: 'flex', flexDirection: 'column', gap: 10,
        marginRight: -2, zIndex: 5,
      }}>
        {/* Silent switch */}
        <div style={{
          width: 3, height: 28, borderRadius: '2px 0 0 2px',
          background: `linear-gradient(180deg, ${isDark ? '#3A3A3C' : '#48484A'} 0%, ${isDark ? '#2C2C2E' : '#3A3A3C'} 100%)`,
          boxShadow: `-1px 0 4px rgba(0,0,0,0.5), inset 1px 0 1px rgba(255,255,255,0.08)`,
          marginBottom: 6,
        }} />
        {/* Volume Up */}
        <div style={{
          width: 3, height: 52, borderRadius: '2px 0 0 2px',
          background: `linear-gradient(180deg, ${isDark ? '#3A3A3C' : '#48484A'} 0%, ${isDark ? '#2C2C2E' : '#3A3A3C'} 100%)`,
          boxShadow: `-1px 0 4px rgba(0,0,0,0.5), inset 1px 0 1px rgba(255,255,255,0.08)`,
        }} />
        {/* Volume Down */}
        <div style={{
          width: 3, height: 52, borderRadius: '2px 0 0 2px',
          background: `linear-gradient(180deg, ${isDark ? '#3A3A3C' : '#48484A'} 0%, ${isDark ? '#2C2C2E' : '#3A3A3C'} 100%)`,
          boxShadow: `-1px 0 4px rgba(0,0,0,0.5), inset 1px 0 1px rgba(255,255,255,0.08)`,
        }} />
      </div>

      {/* ─── PHONE BODY ─── */}
      <div style={{
        width: PW, height: PH,
        background: t.phoneBg,
        borderRadius: 54,
        border: `1px solid ${t.phoneBorder}`,
        position: 'relative',
        boxSizing: 'border-box',
        boxShadow: t.phoneShadow,
        overflow: 'hidden',
        flexShrink: 0,
      }}>
        {/* Titanium frame sheen - top */}
        <div style={{
          position: 'absolute', top: 0, left: '10%', right: '10%', height: 1,
          background: 'rgba(255,255,255,0.18)', borderRadius: '0 0 4px 4px',
          pointerEvents: 'none', zIndex: 10,
        }} />
        {/* Titanium frame sheen - left */}
        <div style={{
          position: 'absolute', top: '10%', left: 0, width: 1, height: '80%',
          background: 'linear-gradient(180deg,transparent,rgba(255,255,255,0.10),transparent)',
          pointerEvents: 'none', zIndex: 10,
        }} />
        {/* Titanium frame sheen - right */}
        <div style={{
          position: 'absolute', top: '15%', right: 0, width: 1, height: '70%',
          background: 'linear-gradient(180deg,transparent,rgba(255,255,255,0.07),transparent)',
          pointerEvents: 'none', zIndex: 10,
        }} />

        {/* ─── SCREEN AREA ─── */}
        <div style={{
          position: 'absolute',
          top: BEZEL, left: BEZEL,
          width: SW, height: SH,
          borderRadius: 42,
          overflow: 'hidden',
          background: '#000',
        }}>
          {/* Screen content */}
          <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
            {children}
            {/* Screen glare */}
            <div style={{
              position: 'absolute', inset: 0, pointerEvents: 'none',
              background: `linear-gradient(135deg, rgba(255,255,255,${isDark ? 0.04 : 0.08}) 0%, transparent 45%, rgba(255,255,255,${isDark ? 0.01 : 0.02}) 100%)`,
              borderRadius: 42,
            }} />
          </div>
        </div>

        {/* ─── DYNAMIC ISLAND ─── */}
        <div style={{
          position: 'absolute',
          top: BEZEL + 12,
          left: '50%', transform: 'translateX(-50%)',
          width: 120, height: 34,
          background: '#000',
          borderRadius: 22,
          zIndex: 20,
          boxShadow: `0 0 0 1px rgba(255,255,255,0.06), inset 0 1px 2px rgba(255,255,255,0.04)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
          {/* Front camera dot */}
          <div style={{
            width: 10, height: 10, borderRadius: '50%',
            background: 'radial-gradient(circle at 35% 35%, #1a1a2e, #000)',
            boxShadow: 'inset 0 0 4px rgba(0,0,0,0.9), 0 0 0 1px rgba(255,255,255,0.04)',
          }} />
          {/* Face ID sensor */}
          <div style={{
            width: 6, height: 6, borderRadius: '50%',
            background: '#0a0a14',
            border: '1px solid rgba(255,255,255,0.06)',
          }} />
        </div>

        {/* ─── HOME INDICATOR ─── */}
        <div style={{
          position: 'absolute',
          bottom: BOT - 2,
          left: '50%', transform: 'translateX(-50%)',
          width: 130, height: 5,
          background: 'rgba(255,255,255,0.25)',
          borderRadius: 3,
          zIndex: 20,
        }} />
      </div>

      {/* ─── RIGHT BUTTON (power) ─── */}
      <div style={{
        width: 3, height: 80, borderRadius: '0 2px 2px 0',
        background: `linear-gradient(180deg, ${isDark ? '#3A3A3C' : '#48484A'} 0%, ${isDark ? '#2C2C2E' : '#3A3A3C'} 100%)`,
        boxShadow: `1px 0 4px rgba(0,0,0,0.5), inset -1px 0 1px rgba(255,255,255,0.08)`,
        marginLeft: -2, zIndex: 5, alignSelf: 'center',
        marginTop: -60,
      }} />

      {/* ─── DROP SHADOW BELOW ─── */}
      <div style={{
        position: 'absolute', bottom: -28, left: '50%', transform: 'translateX(-50%)',
        width: '60%', height: 28,
        background: `radial-gradient(ellipse, rgba(0,0,0,${isDark ? 0.50 : 0.30}) 0%, transparent 70%)`,
        filter: 'blur(10px)',
        pointerEvents: 'none',
      }} />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   ROOT AUTH PAGE
══════════════════════════════════════════════════════════ */
export default function AuthPage({ onComplete }: { onComplete?: (profile: FormData) => void }) {
  const { setTheme: storeSetTheme } = useAppStore();

  const [theme, setTheme] = useState<Theme>('dark');
  const [mode, setMode] = useState<AuthMode>('login');
  const [step, setStep] = useState<RegStep>(1);
  const [loginTab, setLoginTab] = useState<LoginTab>('password');
  const [loggedIn, setLoggedIn] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [form, setForm] = useState<FormData>({
    name: '', institute: '', role: '', gender: '', mobile: '', email: '',
    password: '', identifier: '', diseases: [], medHistory: '',
    primaryColor: '#8B5E34', avatar: '',
  });

  /* Detect mobile screens */
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  /* Sync theme to global store */
  useEffect(() => { storeSetTheme(theme === 'dark' ? 'dark' : 'light'); }, [theme, storeSetTheme]);

  /* Load persisted theme */
  useEffect(() => {
    const s = localStorage.getItem('as-theme');
    if (s === 'light') setTheme('light'); else setTheme('dark');
  }, []);

  /* Persist theme */
  useEffect(() => { localStorage.setItem('as-theme', theme); }, [theme]);

  const isDark = theme === 'dark';
  const t = T[theme];

  const screenApp = (
    <ScreenApp
      theme={theme}
      mode={mode} setMode={(v) => { setMode(v); setStep(1); }}
      step={step} setStep={setStep}
      form={form} setForm={setForm}
      loginTab={loginTab} setLoginTab={setLoginTab}
      onSuccess={() => setLoggedIn(true)}
      onComplete={onComplete}
      loggedIn={loggedIn}
    />
  );

  /* ─── MOBILE: full-screen, no mockup ─── */
  if (isMobile) {
    return (
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
          *{margin:0;padding:0;box-sizing:border-box;}
          html,body{height:100%;}
          ::-webkit-scrollbar{display:none;}
          @keyframes spin{to{transform:rotate(360deg);}}
          @keyframes progressFill{from{width:0}to{width:100%}}
          ::placeholder{opacity:1;}
        `}</style>
        <div style={{ minHeight:'100vh', width:'100%', background: t.screenBg, fontFamily:"'Inter',sans-serif", display:'flex', flexDirection:'column', position:'relative' }}>
          {/* Mobile theme toggle */}
          <button onClick={() => setTheme(th => th === 'dark' ? 'light' : 'dark')}
            style={{ position:'fixed', top:12, right:12, zIndex:200, display:'flex', alignItems:'center', gap:6, padding:'7px 14px', borderRadius:50, background: isDark ? 'rgba(255,255,255,0.10)' : 'rgba(139,94,52,0.14)', border: isDark ? '1px solid rgba(255,255,255,0.16)' : '1px solid rgba(139,94,52,0.22)', color: isDark ? '#CBD5E1' : '#8B5E34', fontSize:12, fontWeight:700, cursor:'pointer', backdropFilter:'blur(12px)' }}>
            {isDark ? <Sun size={13} /> : <Moon size={13} />}
            {isDark ? 'Light' : 'Dark'}
          </button>
          <div style={{ flex:1, overflow:'auto' }}>{screenApp}</div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        *{margin:0;padding:0;box-sizing:border-box;}
        html,body{height:100%;}
        ::-webkit-scrollbar{width:4px;height:4px;}
        ::-webkit-scrollbar-track{background:transparent;}
        ::-webkit-scrollbar-thumb{background:rgba(128,128,128,0.25);border-radius:4px;}
        @keyframes spin{to{transform:rotate(360deg);}}
        @keyframes progressFill{from{width:0}to{width:100%}}
        ::placeholder{opacity:1;}
      `}</style>

      <div style={{
        minHeight: '100vh',
        background: T[theme].outerBg,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '24px 16px',
        fontFamily: "'Inter',sans-serif",
        position: 'relative', overflow: 'hidden',
      }}>

        {/* ── Cinematic ambient lights ── */}
        {isDark && (
          <>
            {/* Purple top-left ambient */}
            <div style={{
              position: 'fixed', top: '-5%', left: '-5%',
              width: '55%', height: '70%', pointerEvents: 'none', zIndex: 0,
              background: 'radial-gradient(ellipse at 20% 20%, rgba(79,70,229,0.12) 0%, transparent 65%)',
              filter: 'blur(60px)',
            }} />
            {/* Blue bottom-right ambient */}
            <div style={{
              position: 'fixed', bottom: '-10%', right: '-5%',
              width: '50%', height: '60%', pointerEvents: 'none', zIndex: 0,
              background: 'radial-gradient(ellipse at 80% 80%, rgba(99,102,241,0.08) 0%, transparent 65%)',
              filter: 'blur(80px)',
            }} />
            {/* Screen emission glow */}
            <div style={{
              position: 'fixed', top: '10%', left: '50%', transform: 'translateX(-50%)',
              width: '80%', height: '70%', pointerEvents: 'none', zIndex: 1,
              background: 'radial-gradient(ellipse, rgba(80,60,240,0.10) 0%, rgba(60,40,200,0.04) 40%, transparent 70%)',
              filter: 'blur(60px)',
            }} />
          </>
        )}
        {!isDark && (
          <>
            <div style={{
              position: 'fixed', top: '-10%', left: '-10%',
              width: '60%', height: '60%', pointerEvents: 'none', zIndex: 0,
              background: 'radial-gradient(ellipse at 20% 20%, rgba(200,160,110,0.18) 0%, transparent 65%)',
              filter: 'blur(80px)',
            }} />
            <div style={{
              position: 'fixed', bottom: 0, right: 0,
              width: '40%', height: '40%', pointerEvents: 'none', zIndex: 0,
              background: 'radial-gradient(ellipse at 80% 80%, rgba(180,130,90,0.10) 0%, transparent 65%)',
              filter: 'blur(60px)',
            }} />
          </>
        )}

        {/* ── THEME TOGGLE ── */}
        <motion.button
          onClick={() => setTheme(th => th === 'dark' ? 'light' : 'dark')}
          whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
          style={{
            display: 'flex', alignItems: 'center', gap: 9,
            padding: '10px 20px', borderRadius: 50, marginBottom: 28,
            background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(139,94,52,0.10)',
            border: isDark ? '1px solid rgba(255,255,255,0.11)' : '1px solid rgba(139,94,52,0.18)',
            color: isDark ? '#CBD5E1' : '#8B5E34',
            fontSize: 12.5, fontWeight: 700, fontFamily: 'Inter,sans-serif',
            cursor: 'pointer', letterSpacing: '0.5px',
            backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
            position: 'relative', zIndex: 10,
            boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.30)' : '0 4px 20px rgba(139,94,52,0.12)',
          }}>
          <AnimatePresence mode="wait">
            <motion.span key={theme}
              initial={{ rotate: -60, opacity: 0, scale: 0.5 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: 60, opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.24 }}>
              {isDark ? <Sun size={14} /> : <Moon size={14} />}
            </motion.span>
          </AnimatePresence>
          {isDark ? 'LIGHT MODE' : 'DARK MODE'}
        </motion.button>

        {/* ── iPHONE ── */}
        <div style={{ position: 'relative', zIndex: 2 }}>
          <IPhoneShell theme={theme}>
            {screenApp}
          </IPhoneShell>
        </div>

        {/* ── TAGLINE ── */}
        <div style={{ marginTop: 26, textAlign: 'center', position: 'relative', zIndex: 10 }}>
          <div style={{
            fontSize: 11.5,
            color: isDark ? 'rgba(255,255,255,0.20)' : 'rgba(139,94,52,0.40)',
            fontWeight: 500, letterSpacing: '1.5px', textTransform: 'uppercase',
          }}>
            Trusted by 2 Lakh+ Patients · ABHA Certified · 256-bit Secure
          </div>
        </div>

      </div>
    </>
  );
}
