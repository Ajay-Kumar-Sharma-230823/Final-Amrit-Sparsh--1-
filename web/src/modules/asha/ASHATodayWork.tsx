'use client';
/**
 * Today's Work Screen — Auto-generated visit list with priority sorting
 */
import React, { useState } from 'react';
import { useASHAStore, Patient } from '@/store/ashaStore';
import { CheckCircle, Clock, RotateCcw, ChevronRight, AlertTriangle } from 'lucide-react';

const riskColor = { low: '#10b981', medium: '#f59e0b', high: '#f97316', critical: '#ef4444' };
const catEmoji  = { pregnant: '🤰', child: '👶', tb: '🫁', general: '🩺' };

function daysSince(d?: string) {
  if (!d) return 999;
  return Math.round((Date.now() - new Date(d).getTime()) / 86400000);
}

interface Props { onSelectPatient: (p: Patient) => void; onAddVisit: (p: Patient) => void; }

export default function ASHATodayWork({ onSelectPatient, onAddVisit }: Props) {
  const { getTodayVisits, updatePatient } = useASHAStore();
  const todayList = getTodayVisits();
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [rescheduled, setRescheduled] = useState<Set<string>>(new Set());

  const markDone = (id: string) => {
    setCompleted(s => new Set([...s, id]));
    updatePatient(id, { lastVisitDate: new Date().toISOString().split('T')[0] });
  };

  const reschedule = (id: string) => setRescheduled(s => new Set([...s, id]));

  const pending   = todayList.filter(p => !completed.has(p.id) && !rescheduled.has(p.id));
  const doneList  = todayList.filter(p => completed.has(p.id));
  const reschedList = todayList.filter(p => rescheduled.has(p.id));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Summary bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
        {[
          { label: 'Pending', value: pending.length, color: '#f59e0b' },
          { label: 'Completed', value: doneList.length, color: '#10b981' },
          { label: 'Rescheduled', value: reschedList.length, color: '#94a3b8' },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 12, padding: '12px 10px', textAlign: 'center' }}>
            <div style={{ fontSize: 22, fontWeight: 900, color: s.color, fontFamily: 'Space Grotesk, sans-serif' }}>{s.value}</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {todayList.length === 0 && (
        <div style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)', background: 'var(--bg-card)', borderRadius: 16, border: '1px solid var(--border-color)' }}>
          <CheckCircle size={36} color="#10b981" style={{ opacity: 0.5, marginBottom: 8 }} />
          <div style={{ fontSize: 14, fontWeight: 600 }}>No visits due today!</div>
          <div style={{ fontSize: 12, marginTop: 4 }}>All patients are up to date.</div>
        </div>
      )}

      {/* Pending visits */}
      {pending.length > 0 && (
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
            🔔 Pending ({pending.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {pending.map(p => {
              const rc = riskColor[p.riskLevel];
              const gap = daysSince(p.lastVisitDate);
              return (
                <div key={p.id} style={{
                  background: 'var(--bg-card)', border: `1.5px solid ${rc}30`,
                  borderLeft: `4px solid ${rc}`, borderRadius: 14, padding: '14px 14px 14px 16px',
                  display: 'flex', flexDirection: 'column', gap: 10,
                }}>
                  {/* Top row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 22 }}>{catEmoji[p.category]}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{p.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        Age {p.age} · {p.village}
                        {p.category === 'pregnant' && ` · Month ${p.pregnancyMonth}`}
                        {p.category === 'tb' && ` · ${p.tbPhase}`}
                      </div>
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 800, padding: '3px 8px', borderRadius: 6, background: `${rc}15`, color: rc, border: `1px solid ${rc}30` }}>
                      {p.riskLevel.toUpperCase()}
                    </span>
                  </div>

                  {/* Last visit info */}
                  <div style={{ fontSize: 11, color: gap > 14 ? '#ef4444' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    {gap > 14 && <AlertTriangle size={11} />}
                    {p.lastVisitDate ? `Last visit: ${gap} days ago` : 'Never visited'}
                  </div>

                  {/* Action buttons */}
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => { onSelectPatient(p); onAddVisit(p); }}
                      style={{ flex: 2, padding: '9px 12px', borderRadius: 10, background: '#10b981', border: 'none', color: 'white', fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                      ▶ Start Visit
                    </button>
                    <button onClick={() => markDone(p.id)}
                      style={{ flex: 1, padding: '9px 10px', borderRadius: 10, background: '#10b98112', border: '1.5px solid #10b98140', color: '#10b981', fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                      <CheckCircle size={13} /> Done
                    </button>
                    <button onClick={() => reschedule(p.id)}
                      style={{ flex: 1, padding: '9px 10px', borderRadius: 10, background: 'var(--accent-surface)', border: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                      <RotateCcw size={13} /> Later
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Completed */}
      {doneList.length > 0 && (
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>✓ Completed ({doneList.length})</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {doneList.map(p => (
              <div key={p.id} style={{ background: '#10b98108', border: '1px solid #10b98130', borderRadius: 12, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
                <CheckCircle size={16} color="#10b981" />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{p.name}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{p.village} · Visited today</div>
                </div>
                <button onClick={() => onSelectPatient(p)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                  <ChevronRight size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
