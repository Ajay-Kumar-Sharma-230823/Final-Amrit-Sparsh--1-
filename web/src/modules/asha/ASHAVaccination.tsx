'use client';
/**
 * Vaccination Tracker — NHM India Universal Immunisation Programme schedule
 * Real dose tracking with "Mark as Given" actions
 */
import React, { useState } from 'react';
import { useASHAStore, Vaccination } from '@/store/ashaStore';
import { Syringe, CheckCircle, Clock, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';

function daysBetween(a: string, b: string) {
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000);
}
const today = () => new Date().toISOString().split('T')[0];

interface Props { onViewPatient: (id: string) => void; }

export default function ASHAVaccination({ onViewPatient }: Props) {
  const { patients, vaccinations, markVaccineGiven, initVaccines } = useASHAStore();
  const [expanded, setExpanded] = useState<string | null>(null);

  const children = patients.filter(p => p.category === 'child');

  const getStatus = (v: Vaccination) => {
    const t = today();
    if (v.status === 'given') return 'given';
    if (daysBetween(v.dueDate, t) > 0) return 'overdue';
    if (daysBetween(t, v.dueDate) <= 7) return 'due-soon';
    return 'pending';
  };

  const statusMeta = {
    given:     { color: '#10b981', label: 'Given', icon: <CheckCircle size={12} /> },
    overdue:   { color: '#ef4444', label: 'Overdue', icon: <AlertTriangle size={12} /> },
    'due-soon':{ color: '#f97316', label: 'Due Soon', icon: <Clock size={12} /> },
    pending:   { color: '#94a3b8', label: 'Pending', icon: <Clock size={12} /> },
  };

  // Global summary
  const allVaccines = Object.values(vaccinations).flat();
  const overdue  = allVaccines.filter(v => getStatus(v) === 'overdue').length;
  const dueSoon  = allVaccines.filter(v => getStatus(v) === 'due-soon').length;
  const given    = allVaccines.filter(v => v.status === 'given').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
        {[
          { label: 'Overdue', value: overdue, color: '#ef4444' },
          { label: 'Due This Week', value: dueSoon, color: '#f97316' },
          { label: 'Given', value: given, color: '#10b981' },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 14, padding: '14px 12px', textAlign: 'center' }}>
            <div style={{ fontSize: 26, fontWeight: 900, color: s.color, fontFamily: 'Space Grotesk, sans-serif' }}>{s.value}</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {children.length === 0 ? (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 16, padding: 32, textAlign: 'center', color: 'var(--text-muted)' }}>
          <Syringe size={32} style={{ opacity: 0.3, marginBottom: 8 }} />
          <div style={{ fontSize: 13 }}>No children registered.<br/>Register children (0–5) to track vaccinations.</div>
        </div>
      ) : (
        children.map(child => {
          const schedule = vaccinations[child.id] || [];
          const isOpen = expanded === child.id;
          const childOverdue = schedule.filter(v => getStatus(v) === 'overdue').length;

          return (
            <div key={child.id} style={{ background: 'var(--bg-card)', border: `1.5px solid ${childOverdue > 0 ? '#ef444430' : 'var(--border-color)'}`, borderRadius: 16, overflow: 'hidden' }}>
              {/* Child header */}
              <button onClick={() => setExpanded(isOpen ? null : child.id)}
                style={{ width: '100%', padding: '14px 16px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#3b82f615', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>👶</div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{child.name}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                      {child.village} · DOB: {child.childDob || 'N/A'}
                      {childOverdue > 0 && <span style={{ color: '#ef4444', fontWeight: 700, marginLeft: 6 }}>⚠ {childOverdue} overdue</span>}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    {schedule.filter(v => v.status === 'given').length}/{schedule.length} given
                  </div>
                  {isOpen ? <ChevronUp size={16} color="var(--text-muted)" /> : <ChevronDown size={16} color="var(--text-muted)" />}
                </div>
              </button>

              {/* Progress bar */}
              <div style={{ height: 4, background: 'var(--accent-surface)', margin: '0 16px' }}>
                <div style={{ height: '100%', borderRadius: 2, background: '#10b981', width: `${(schedule.filter(v => v.status === 'given').length / Math.max(schedule.length, 1)) * 100}%`, transition: 'width 0.5s' }} />
              </div>

              {/* Vaccine list */}
              {isOpen && (
                <div style={{ padding: '12px 16px 16px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {schedule.length === 0 ? (
                    <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 12, padding: '12px 0' }}>
                      No schedule generated.
                      {child.childDob && (
                        <button onClick={() => initVaccines(child.id, child.childDob!)}
                          style={{ display: 'block', margin: '8px auto 0', padding: '6px 14px', borderRadius: 8, background: '#10b981', border: 'none', color: 'white', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                          Generate Schedule
                        </button>
                      )}
                    </div>
                  ) : (
                    schedule.map(v => {
                      const st = getStatus(v);
                      const meta = statusMeta[st];
                      return (
                        <div key={v.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 10, background: `${meta.color}08`, border: `1px solid ${meta.color}20` }}>
                          <div style={{ color: meta.color }}>{meta.icon}</div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>
                              {v.vaccine} {v.dose > 0 ? `Dose ${v.dose}` : '(Birth)'}
                            </div>
                            <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                              Due: {v.dueDate}
                              {v.givenDate && ` · Given: ${v.givenDate}`}
                              {st === 'overdue' && <span style={{ color: '#ef4444', fontWeight: 600 }}> · {daysBetween(v.dueDate, today())} days overdue</span>}
                            </div>
                          </div>
                          <span style={{ fontSize: 10, fontWeight: 700, color: meta.color, background: `${meta.color}15`, padding: '2px 8px', borderRadius: 6 }}>
                            {meta.label}
                          </span>
                          {st !== 'given' && (
                            <button onClick={() => markVaccineGiven(child.id, v.id)}
                              style={{ padding: '5px 10px', borderRadius: 8, background: '#10b981', border: 'none', color: 'white', fontSize: 10, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                              Mark Given
                            </button>
                          )}
                        </div>
                      );
                    })
                  )}

                  <button onClick={() => onViewPatient(child.id)} style={{ marginTop: 4, padding: '7px', borderRadius: 10, background: 'var(--accent-surface)', border: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                    View Patient Profile →
                  </button>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
