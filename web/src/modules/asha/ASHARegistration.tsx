'use client';
/**
 * ASHA Patient Registration Form
 * Supports: Pregnant Women, TB Patients, Children (0-5), General
 */
import React, { useState } from 'react';
import { useASHAStore, PatientCategory, Gender } from '@/store/ashaStore';
import { X, Save, ChevronRight } from 'lucide-react';

interface Props { onClose: () => void; onCreated?: (id: string) => void; }

const initialForm = {
  name: '', age: '', gender: 'female' as Gender, village: '', mobile: '', aadhaar: '',
  category: 'general' as PatientCategory,
  pregnancyMonth: '', childDob: '', tbPhase: 'intensive' as const,
  mapX: Math.round(Math.random() * 80 + 10),
  mapY: Math.round(Math.random() * 70 + 10),
};

export default function ASHARegistration({ onClose, onCreated }: Props) {
  const addPatient = useASHAStore(s => s.addPatient);
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [step, setStep] = useState<1 | 2>(1);

  const set = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.village.trim()) e.village = 'Village is required';
    if (!form.age || isNaN(Number(form.age))) e.age = 'Valid age required';
    if (form.category === 'pregnant' && !form.pregnancyMonth) e.pregnancyMonth = 'Pregnancy month required';
    if (form.category === 'child' && !form.childDob) e.childDob = 'Date of birth required for child';
    if (form.mobile && !/^\d{10}$/.test(form.mobile)) e.mobile = '10-digit number only';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    const id = addPatient({
      name: form.name.trim(),
      age: Number(form.age),
      gender: form.gender,
      village: form.village.trim(),
      mobile: form.mobile || undefined,
      aadhaar: form.aadhaar || undefined,
      category: form.category,
      riskLevel: 'low',
      pregnancyMonth: form.category === 'pregnant' ? Number(form.pregnancyMonth) : undefined,
      childDob: form.category === 'child' ? form.childDob : undefined,
      tbPhase: form.category === 'tb' ? form.tbPhase : undefined,
      tbStartDate: form.category === 'tb' ? new Date().toISOString().split('T')[0] : undefined,
      mapX: form.mapX, mapY: form.mapY,
    });
    onCreated?.(id);
    onClose();
  };

  const Field = ({ label, name, type = 'text', placeholder = '', required = false }: {
    label: string; name: string; type?: string; placeholder?: string; required?: boolean;
  }) => (
    <div>
      <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
        {label}{required && <span style={{ color: '#ef4444' }}> *</span>}
      </label>
      <input
        type={type}
        value={(form as any)[name]}
        onChange={e => set(name, e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%', padding: '10px 12px', borderRadius: 10, fontSize: 14,
          background: 'var(--bg-input)', border: `1.5px solid ${errors[name] ? '#ef4444' : 'var(--border-color)'}`,
          color: 'var(--text-primary)', outline: 'none', boxSizing: 'border-box',
        }}
      />
      {errors[name] && <div style={{ fontSize: 11, color: '#ef4444', marginTop: 3 }}>{errors[name]}</div>}
    </div>
  );

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16,
    }}>
      <div style={{
        background: 'var(--bg-card)', borderRadius: 20, width: '100%', maxWidth: 520,
        maxHeight: '90vh', overflowY: 'auto', boxShadow: 'var(--shadow-xl)',
        border: '1px solid var(--border-color)',
      }}>
        {/* Header */}
        <div style={{ padding: '18px 20px 14px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: 'var(--bg-card)', zIndex: 1 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>Register New Patient</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Step {step} of 2</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}>
            <X size={20} />
          </button>
        </div>

        {/* Progress */}
        <div style={{ height: 3, background: 'var(--accent-surface)', margin: 0 }}>
          <div style={{ height: '100%', width: step === 1 ? '50%' : '100%', background: '#10b981', borderRadius: 2, transition: 'width 0.3s' }} />
        </div>

        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {step === 1 ? (
            <>
              <Field label="Full Name" name="name" placeholder="e.g. Sunita Devi" required />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Field label="Age (years)" name="age" type="number" placeholder="28" required />
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Gender <span style={{ color: '#ef4444' }}>*</span></label>
                  <select value={form.gender} onChange={e => set('gender', e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 10, fontSize: 14, background: 'var(--bg-input)', border: '1.5px solid var(--border-color)', color: 'var(--text-primary)', outline: 'none' }}>
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <Field label="Village" name="village" placeholder="e.g. Rampur" required />
              <Field label="Mobile Number (Optional)" name="mobile" type="tel" placeholder="10-digit mobile" />
              <Field label="Aadhaar Number (Optional)" name="aadhaar" placeholder="12-digit Aadhaar" />

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>Patient Category <span style={{ color: '#ef4444' }}>*</span></label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {([
                    { v: 'pregnant', label: '🤰 Pregnant Woman', color: '#ec4899' },
                    { v: 'child', label: '👶 Child (0–5 yrs)', color: '#3b82f6' },
                    { v: 'tb', label: '🫁 TB Patient', color: '#f59e0b' },
                    { v: 'general', label: '🩺 General Patient', color: '#10b981' },
                  ] as const).map(cat => (
                    <button key={cat.v} onClick={() => set('category', cat.v)}
                      style={{
                        padding: '10px 12px', borderRadius: 10, cursor: 'pointer', textAlign: 'left', fontSize: 13, fontWeight: 600,
                        background: form.category === cat.v ? `${cat.color}15` : 'var(--accent-surface)',
                        border: `2px solid ${form.category === cat.v ? cat.color : 'var(--border-color)'}`,
                        color: form.category === cat.v ? cat.color : 'var(--text-secondary)',
                        transition: 'all 0.15s',
                      }}>
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={() => { if (!form.name || !form.age || !form.village) { validate(); return; } setStep(2); }}
                style={{ padding: '12px', borderRadius: 12, background: '#10b981', border: 'none', color: 'white', fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                Next <ChevronRight size={16} />
              </button>
            </>
          ) : (
            <>
              {/* Category-specific fields */}
              {form.category === 'pregnant' && (
                <>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Pregnancy Month <span style={{ color: '#ef4444' }}>*</span></label>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {[1,2,3,4,5,6,7,8,9].map(m => (
                        <button key={m} onClick={() => set('pregnancyMonth', m.toString())}
                          style={{
                            width: 40, height: 40, borderRadius: 10, border: `2px solid ${form.pregnancyMonth === m.toString() ? '#ec4899' : 'var(--border-color)'}`,
                            background: form.pregnancyMonth === m.toString() ? '#ec489920' : 'var(--accent-surface)',
                            color: form.pregnancyMonth === m.toString() ? '#ec4899' : 'var(--text-primary)',
                            fontSize: 13, fontWeight: 700, cursor: 'pointer',
                          }}>
                          {m}
                        </button>
                      ))}
                    </div>
                    {errors.pregnancyMonth && <div style={{ fontSize: 11, color: '#ef4444', marginTop: 3 }}>{errors.pregnancyMonth}</div>}
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Last Menstrual Period (LMP)</label>
                    <input type="date" value={form.childDob} onChange={e => set('childDob', e.target.value)}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: 10, fontSize: 14, background: 'var(--bg-input)', border: '1.5px solid var(--border-color)', color: 'var(--text-primary)', outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                </>
              )}

              {form.category === 'child' && (
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Date of Birth <span style={{ color: '#ef4444' }}>*</span></label>
                  <input type="date" value={form.childDob} onChange={e => set('childDob', e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 10, fontSize: 14, background: 'var(--bg-input)', border: `1.5px solid ${errors.childDob ? '#ef4444' : 'var(--border-color)'}`, color: 'var(--text-primary)', outline: 'none', boxSizing: 'border-box' }} />
                  {errors.childDob && <div style={{ fontSize: 11, color: '#ef4444', marginTop: 3 }}>{errors.childDob}</div>}
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Vaccination schedule will be auto-generated</div>
                </div>
              )}

              {form.category === 'tb' && (
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>TB Treatment Phase</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {([
                      { v: 'intensive', label: 'Intensive Phase (first 2 months)' },
                      { v: 'continuation', label: 'Continuation Phase (months 3–6)' },
                      { v: 'completed', label: 'Completed' },
                    ] as const).map(opt => (
                      <button key={opt.v} onClick={() => set('tbPhase', opt.v)}
                        style={{
                          padding: '10px 14px', borderRadius: 10, cursor: 'pointer', textAlign: 'left', fontSize: 13,
                          background: form.tbPhase === opt.v ? '#f59e0b15' : 'var(--accent-surface)',
                          border: `2px solid ${form.tbPhase === opt.v ? '#f59e0b' : 'var(--border-color)'}`,
                          color: form.tbPhase === opt.v ? '#f59e0b' : 'var(--text-secondary)',
                        }}>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Summary box */}
              <div style={{ background: 'var(--accent-surface)', borderRadius: 12, padding: '12px 14px', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6 }}>SUMMARY</div>
                <div style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.6 }}>
                  <b>{form.name}</b> · Age {form.age} · {form.village}<br/>
                  {form.mobile && <>Mobile: {form.mobile}<br/></>}
                  Category: <b>{form.category.charAt(0).toUpperCase() + form.category.slice(1)}</b>
                  {form.category === 'pregnant' && ` — Month ${form.pregnancyMonth}`}
                  {form.category === 'tb' && ` — ${form.tbPhase} phase`}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setStep(1)} style={{ flex: 1, padding: '12px', borderRadius: 12, background: 'var(--accent-surface)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                  ← Back
                </button>
                <button onClick={handleSave} style={{ flex: 2, padding: '12px', borderRadius: 12, background: '#10b981', border: 'none', color: 'white', fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  <Save size={16} /> Save Patient
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
