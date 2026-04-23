'use client';
/**
 * Visit Action Screen — The core field-worker form
 * Records BP, Sugar, Weight, Temp, SpO2, Symptoms, Notes
 * Supports voice input via Web Speech API
 */
import React, { useState, useRef, useCallback } from 'react';
import { useASHAStore, Patient } from '@/store/ashaStore';
import { Mic, MicOff, Save, X, AlertTriangle, CheckCircle } from 'lucide-react';

interface Props { patient: Patient; onClose: () => void; onSaved?: () => void; }

export default function ASHAVisitForm({ patient, onClose, onSaved }: Props) {
  const addVisit = useASHAStore(s => s.addVisit);
  const [form, setForm] = useState({
    bp: '', sugar: '', weight: '', temp: '', spo2: '',
    symptoms: '', notes: '', isCritical: false,
  });
  const [listening, setListening] = useState<'symptoms' | 'notes' | null>(null);
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const recogRef = useRef<any>(null);

  const set = (k: string, v: string | boolean) => setForm(f => ({ ...f, [k]: v }));

  /* ── Voice Input ── */
  const startVoice = useCallback((field: 'symptoms' | 'notes') => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Voice input not supported on this browser. Use Chrome.');
      return;
    }
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recog = new SR();
    recog.lang = 'hi-IN';
    recog.interimResults = false;
    recog.maxAlternatives = 1;
    recog.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      setForm(f => ({ ...f, [field]: f[field] ? f[field] + ' ' + transcript : transcript }));
      setListening(null);
    };
    recog.onerror = () => setListening(null);
    recog.onend = () => setListening(null);
    recogRef.current = recog;
    recog.start();
    setListening(field);
  }, []);

  const stopVoice = () => { recogRef.current?.stop(); setListening(null); };

  /* ── AI Risk Detection ── */
  const detectRisk = (): { critical: boolean; reasons: string[] } => {
    const reasons: string[] = [];
    if (form.bp) {
      const s = parseInt(form.bp.split('/')[0]);
      if (s >= 160) reasons.push(`Very high BP: ${form.bp}`);
      else if (s >= 140) reasons.push(`Elevated BP: ${form.bp}`);
    }
    if (form.temp) {
      const t = parseFloat(form.temp);
      if (t >= 39.5) reasons.push(`High fever: ${form.temp}°C`);
    }
    if (form.spo2) {
      const sp = parseInt(form.spo2);
      if (sp < 90) reasons.push(`Low SpO₂: ${sp}%`);
    }
    if (form.sugar) {
      const sg = parseInt(form.sugar);
      if (sg > 300) reasons.push(`Very high sugar: ${form.sugar}`);
    }
    if (patient.category === 'pregnant' && (patient.pregnancyMonth ?? 0) >= 8 && reasons.length > 0) {
      reasons.push('High-risk pregnancy — immediate PHC referral needed');
    }
    return { critical: reasons.length > 0, reasons };
  };

  const riskInfo = detectRisk();

  const handleSave = () => {
    if (!form.symptoms && !form.notes && !form.bp) {
      setErrors({ general: 'Add at least one vital or note before saving.' });
      return;
    }
    addVisit({
      patientId: patient.id,
      date: new Date().toISOString().split('T')[0],
      bp: form.bp || undefined,
      sugar: form.sugar || undefined,
      weight: form.weight || undefined,
      temp: form.temp || undefined,
      spo2: form.spo2 || undefined,
      symptoms: form.symptoms,
      notes: form.notes,
      isCritical: form.isCritical || riskInfo.critical,
    });
    setSaved(true);
    setTimeout(() => { onSaved?.(); onClose(); }, 1000);
  };

  if (saved) {
    return (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
        <div style={{ background: 'var(--bg-card)', borderRadius: 20, padding: 40, textAlign: 'center', maxWidth: 300 }}>
          <CheckCircle size={48} color="#10b981" style={{ marginBottom: 12 }} />
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>Visit Saved</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Stored offline · Will sync when online</div>
        </div>
      </div>
    );
  }

  const InputRow = ({ label, name, placeholder, unit }: { label: string; name: string; placeholder: string; unit?: string }) => (
    <div>
      <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 3 }}>{label}</label>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <input value={(form as any)[name]} onChange={e => set(name, e.target.value)} placeholder={placeholder}
          style={{ flex: 1, padding: '9px 12px', borderRadius: 10, fontSize: 14, background: 'var(--bg-input)', border: '1.5px solid var(--border-color)', color: 'var(--text-primary)', outline: 'none' }} />
        {unit && <span style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{unit}</span>}
      </div>
    </div>
  );

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 12 }}>
      <div style={{ background: 'var(--bg-card)', borderRadius: 20, width: '100%', maxWidth: 500, maxHeight: '92vh', overflowY: 'auto', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-xl)' }}>
        {/* Header */}
        <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: 'var(--bg-card)', zIndex: 1 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>Record Visit — {patient.name}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{patient.village} · {patient.category} · Age {patient.age}</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
        </div>

        <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Risk alert */}
          {riskInfo.critical && (
            <div style={{ background: '#ef444412', border: '1.5px solid #ef444440', borderRadius: 12, padding: '10px 14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <AlertTriangle size={14} color="#ef4444" />
                <span style={{ fontSize: 12, fontWeight: 700, color: '#ef4444' }}>AI Risk Detection</span>
              </div>
              {riskInfo.reasons.map(r => <div key={r} style={{ fontSize: 11, color: '#ef4444' }}>• {r}</div>)}
            </div>
          )}

          {/* Vitals grid */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Vitals</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <InputRow label="Blood Pressure" name="bp" placeholder="120/80" />
              <InputRow label="Blood Sugar" name="sugar" placeholder="102" unit="mg/dL" />
              <InputRow label="Weight" name="weight" placeholder="58" unit="kg" />
              <InputRow label="Temperature" name="temp" placeholder="37.0" unit="°C" />
              <InputRow label="SpO₂" name="spo2" placeholder="98" unit="%" />
            </div>
          </div>

          {/* Symptoms with voice */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Symptoms</label>
              <button onClick={() => listening === 'symptoms' ? stopVoice() : startVoice('symptoms')}
                style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 8, border: '1px solid var(--border-color)', background: listening === 'symptoms' ? '#ef444412' : 'var(--accent-surface)', color: listening === 'symptoms' ? '#ef4444' : 'var(--text-muted)', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                {listening === 'symptoms' ? <><MicOff size={12} /> Stop</> : <><Mic size={12} /> Voice</>}
              </button>
            </div>
            {listening === 'symptoms' && (
              <div style={{ background: '#ef444408', border: '1px solid #ef444430', borderRadius: 8, padding: '6px 10px', fontSize: 11, color: '#ef4444', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444', animation: 'mk-dot 0.8s ease infinite' }} />
                Listening... (speak in Hindi or English)
              </div>
            )}
            <textarea value={form.symptoms} onChange={e => set('symptoms', e.target.value)}
              placeholder="e.g. Headache, swelling in feet, nausea..."
              rows={2}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 10, fontSize: 13, background: 'var(--bg-input)', border: '1.5px solid var(--border-color)', color: 'var(--text-primary)', outline: 'none', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' }}
            />
          </div>

          {/* Notes with voice */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Notes / Advice Given</label>
              <button onClick={() => listening === 'notes' ? stopVoice() : startVoice('notes')}
                style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 8, border: '1px solid var(--border-color)', background: listening === 'notes' ? '#ef444412' : 'var(--accent-surface)', color: listening === 'notes' ? '#ef4444' : 'var(--text-muted)', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                {listening === 'notes' ? <><MicOff size={12} /> Stop</> : <><Mic size={12} /> Voice</>}
              </button>
            </div>
            {listening === 'notes' && (
              <div style={{ background: '#ef444408', border: '1px solid #ef444430', borderRadius: 8, padding: '6px 10px', fontSize: 11, color: '#ef4444', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444', animation: 'mk-dot 0.8s ease infinite' }} />
                Listening... (speak in Hindi or English)
              </div>
            )}
            <textarea value={form.notes} onChange={e => set('notes', e.target.value)}
              placeholder="e.g. Advised rest and low salt diet. Next visit in 7 days..."
              rows={2}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 10, fontSize: 13, background: 'var(--bg-input)', border: '1.5px solid var(--border-color)', color: 'var(--text-primary)', outline: 'none', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' }}
            />
          </div>

          {/* Mark Critical */}
          <button onClick={() => set('isCritical', !form.isCritical)}
            style={{
              padding: '10px 14px', borderRadius: 12, cursor: 'pointer', textAlign: 'left', fontSize: 13, fontWeight: 600,
              background: form.isCritical ? '#ef444412' : 'var(--accent-surface)',
              border: `2px solid ${form.isCritical ? '#ef4444' : 'var(--border-color)'}`,
              color: form.isCritical ? '#ef4444' : 'var(--text-secondary)',
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
            <AlertTriangle size={16} />
            {form.isCritical ? '✓ Marked as Critical — PHC Referral Required' : 'Mark as Critical Case'}
          </button>

          {errors.general && <div style={{ fontSize: 12, color: '#ef4444', background: '#ef444410', padding: '8px 12px', borderRadius: 8 }}>{errors.general}</div>}

          {/* Actions */}
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={onClose} style={{ flex: 1, padding: '12px', borderRadius: 12, background: 'var(--accent-surface)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
            <button onClick={handleSave} style={{ flex: 2, padding: '12px', borderRadius: 12, background: '#10b981', border: 'none', color: 'white', fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <Save size={16} /> Save Visit
            </button>
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', textAlign: 'center' }}>
            📱 Saved locally · Will auto-sync when internet available
          </div>
        </div>
      </div>
    </div>
  );
}
