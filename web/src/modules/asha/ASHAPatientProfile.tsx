'use client';
/**
 * Patient Profile Screen — Full history, visits, trends, actions
 */
import React, { useState } from 'react';
import { useASHAStore, Patient, RiskLevel } from '@/store/ashaStore';
import { ArrowLeft, AlertTriangle, Edit, Plus, TrendingUp, Calendar, MapPin } from 'lucide-react';

const riskColor = { low: '#10b981', medium: '#f59e0b', high: '#f97316', critical: '#ef4444' };
const catBadge: Record<string, { label: string; color: string; emoji: string }> = {
  pregnant: { label: 'Pregnant', color: '#ec4899', emoji: '🤰' },
  child:    { label: 'Child 0-5', color: '#3b82f6', emoji: '👶' },
  tb:       { label: 'TB Patient', color: '#f59e0b', emoji: '🫁' },
  general:  { label: 'General', color: '#10b981', emoji: '🩺' },
};

function BPChart({ visits }: { visits: { date: string; bp?: string }[] }) {
  const validBP = visits.filter(v => v.bp).slice(-6).reverse();
  if (validBP.length < 2) return <div style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', padding: 16 }}>Not enough BP data</div>;
  const systolics = validBP.map(v => parseInt(v.bp!.split('/')[0]));
  const max = Math.max(...systolics), min = Math.min(100, ...systolics);
  const H = 60, W = 200;
  const pts = systolics.map((v, i) =>
    `${(i / (systolics.length - 1)) * W},${H - ((v - min) / (max - min + 1)) * (H - 8)}`
  ).join(' ');
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>BP Trend (Systolic)</div>
      <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id="bp-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ef4444" stopOpacity={0.2} />
            <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
          </linearGradient>
        </defs>
        <polygon points={`0,${H} ${pts} ${W},${H}`} fill="url(#bp-grad)" />
        <polyline points={pts} fill="none" stroke="#ef4444" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        {systolics.map((v, i) => (
          <g key={i}>
            <circle cx={(i / (systolics.length - 1)) * W} cy={H - ((v - min) / (max - min + 1)) * (H - 8)} r={3} fill={v >= 140 ? '#ef4444' : '#10b981'} />
            <text x={(i / (systolics.length - 1)) * W} y={H - ((v - min) / (max - min + 1)) * (H - 8) - 6} textAnchor="middle" fill="var(--text-muted)" fontSize={8}>{v}</text>
          </g>
        ))}
      </svg>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
        {validBP.map(v => <span key={v.date} style={{ fontSize: 8, color: 'var(--text-muted)' }}>{v.date.slice(5)}</span>)}
      </div>
    </div>
  );
}

interface Props { patientId: string; onBack: () => void; onAddVisit: (p: Patient) => void; }

export default function ASHAPatientProfile({ patientId, onBack, onAddVisit }: Props) {
  const { patients, updatePatient, getPatientVisits, recomputeRisks } = useASHAStore();
  const patient = patients.find(p => p.id === patientId);
  const visits = getPatientVisits(patientId);

  if (!patient) return (
    <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)' }}>Patient not found</div>
  );

  const cat = catBadge[patient.category];
  const rc = riskColor[patient.riskLevel];

  const markCritical = () => {
    updatePatient(patient.id, { riskLevel: 'critical' });
    recomputeRisks();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Back */}
      <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, padding: 0, width: 'fit-content' }}>
        <ArrowLeft size={16} /> Back to patients
      </button>

      {/* Patient Header */}
      <div style={{ background: 'var(--bg-card)', border: `2px solid ${rc}30`, borderRadius: 18, padding: 18, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, right: 0, width: 6, height: '100%', background: rc }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
              {cat.emoji} {patient.name}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>
              Age {patient.age} · {patient.gender} · <MapPin size={10} style={{ display: 'inline' }} /> {patient.village}
              {patient.mobile && ` · 📞 ${patient.mobile}`}
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 6, background: `${cat.color}15`, color: cat.color, border: `1px solid ${cat.color}30` }}>
                {cat.label}
                {patient.category === 'pregnant' && ` — Month ${patient.pregnancyMonth}`}
                {patient.category === 'tb' && ` — ${patient.tbPhase}`}
              </span>
              <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 6, background: `${rc}15`, color: rc, border: `1px solid ${rc}30` }}>
                {patient.riskLevel.toUpperCase()} RISK
              </span>
              {patient.syncStatus === 'pending' && (
                <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 6, background: '#f59e0b15', color: '#f59e0b', border: '1px solid #f59e0b30' }}>
                  ⏳ Pending Sync
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Category info */}
        {patient.category === 'pregnant' && patient.edd && (
          <div style={{ marginTop: 12, background: '#ec489910', borderRadius: 10, padding: '10px 14px' }}>
            <div style={{ fontSize: 12, color: '#ec4899', fontWeight: 600 }}>🤰 Pregnancy Details</div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>
              Expected Delivery: {patient.edd} · LMP: {patient.lmp || 'Not recorded'}
            </div>
          </div>
        )}
        {patient.category === 'tb' && patient.tbStartDate && (
          <div style={{ marginTop: 12, background: '#f59e0b10', borderRadius: 10, padding: '10px 14px' }}>
            <div style={{ fontSize: 12, color: '#f59e0b', fontWeight: 600 }}>🫁 TB Treatment</div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>
              Phase: {patient.tbPhase} · Started: {patient.tbStartDate}
            </div>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
          <button onClick={() => onAddVisit(patient)}
            style={{ flex: 2, padding: '10px', borderRadius: 12, background: '#10b981', border: 'none', color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <Plus size={16} /> Record Visit
          </button>
          {patient.riskLevel !== 'critical' && (
            <button onClick={markCritical}
              style={{ flex: 1, padding: '10px', borderRadius: 12, background: '#ef444412', border: '2px solid #ef444440', color: '#ef4444', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <AlertTriangle size={15} /> Critical
            </button>
          )}
        </div>
      </div>

      {/* BP Chart */}
      {visits.some(v => v.bp) && (
        <div style={{ background: 'var(--bg-card)', borderRadius: 16, padding: '16px 18px', border: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
            <TrendingUp size={15} color="#ef4444" /> Blood Pressure History
          </div>
          <BPChart visits={visits} />
        </div>
      )}

      {/* Visit History */}
      <div style={{ background: 'var(--bg-card)', borderRadius: 16, padding: '16px 18px', border: '1px solid var(--border-color)' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Calendar size={15} /> Visit History ({visits.length})
        </div>
        {visits.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 12, padding: '16px 0' }}>No visits recorded yet</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {visits.map(v => (
              <div key={v.id} style={{ background: v.isCritical ? '#ef444408' : 'var(--accent-surface)', borderRadius: 12, padding: '12px 14px', border: `1px solid ${v.isCritical ? '#ef444430' : 'var(--border-color)'}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>{v.date}</span>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {v.isCritical && <span style={{ fontSize: 9, fontWeight: 700, background: '#ef444420', color: '#ef4444', padding: '2px 7px', borderRadius: 5 }}>CRITICAL</span>}
                    <span style={{ fontSize: 9, background: v.syncStatus === 'synced' ? '#10b98120' : '#f59e0b20', color: v.syncStatus === 'synced' ? '#10b981' : '#f59e0b', padding: '2px 7px', borderRadius: 5, fontWeight: 600 }}>
                      {v.syncStatus === 'synced' ? '✓ Synced' : '⏳ Pending'}
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: v.symptoms ? 6 : 0 }}>
                  {v.bp && <span style={{ fontSize: 11, color: parseInt(v.bp) > 140 ? '#ef4444' : 'var(--text-secondary)' }}>BP: <b>{v.bp}</b></span>}
                  {v.weight && <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Wt: <b>{v.weight}kg</b></span>}
                  {v.temp && <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Temp: <b>{v.temp}°C</b></span>}
                  {v.sugar && <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Sugar: <b>{v.sugar}</b></span>}
                  {v.spo2 && <span style={{ fontSize: 11, color: parseInt(v.spo2) < 95 ? '#ef4444' : 'var(--text-secondary)' }}>SpO₂: <b>{v.spo2}%</b></span>}
                </div>
                {v.symptoms && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Symptoms: {v.symptoms}</div>}
                {v.notes && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Notes: {v.notes}</div>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
