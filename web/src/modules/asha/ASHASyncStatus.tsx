'use client';
/**
 * Sync Status Screen — Offline-first status, manual sync, pending queue
 */
import React, { useState } from 'react';
import { useASHAStore } from '@/store/ashaStore';
import { Wifi, WifiOff, RefreshCw, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

export default function ASHASyncStatus() {
  const { patients, visits, pendingSyncCount, lastSyncTime, syncNow } = useASHAStore();
  const [syncing, setSyncing] = useState(false);
  const [done, setDone] = useState(false);

  const handleSync = async () => {
    setSyncing(true);
    await new Promise(r => setTimeout(r, 2200));
    syncNow();
    setSyncing(false);
    setDone(true);
    setTimeout(() => setDone(false), 3000);
  };

  const pendingPatients = patients.filter(p => p.syncStatus === 'pending');
  const pendingVisits   = visits.filter(v => v.syncStatus === 'pending');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Status card */}
      <div style={{
        background: pendingSyncCount > 0 ? '#f59e0b08' : '#10b98108',
        border: `2px solid ${pendingSyncCount > 0 ? '#f59e0b30' : '#10b98130'}`,
        borderRadius: 18, padding: '20px 22px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 52, height: 52, borderRadius: '50%',
            background: pendingSyncCount > 0 ? '#f59e0b15' : '#10b98115',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {pendingSyncCount > 0 ? <WifiOff size={24} color="#f59e0b" /> : <Wifi size={24} color="#10b981" />}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)' }}>
              {pendingSyncCount > 0 ? `${pendingSyncCount} Records Pending Sync` : 'All Data Synced'}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
              {lastSyncTime
                ? `Last sync: ${new Date(lastSyncTime).toLocaleString('en-IN')}`
                : 'Never synced — data stored locally'}
            </div>
          </div>
        </div>

        <button onClick={handleSync} disabled={syncing}
          style={{
            marginTop: 16, width: '100%', padding: '13px', borderRadius: 14,
            background: syncing ? 'var(--accent-surface)' : '#10b981',
            border: 'none', color: syncing ? 'var(--text-muted)' : 'white',
            fontSize: 14, fontWeight: 700, cursor: syncing ? 'default' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
          <RefreshCw size={16} style={{ animation: syncing ? 'asha-sync 0.8s linear infinite' : 'none' }} />
          {done ? '✓ Sync Complete' : syncing ? 'Syncing...' : 'Sync Now'}
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
        {[
          { label: 'Total Patients', value: patients.length, color: 'var(--accent-primary)' },
          { label: 'Total Visits', value: visits.length, color: '#3b82f6' },
          { label: 'Pending (Patients)', value: pendingPatients.length, color: '#f59e0b' },
          { label: 'Pending (Visits)', value: pendingVisits.length, color: '#f97316' },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 12, padding: '14px 16px' }}>
            <div style={{ fontSize: 24, fontWeight: 900, color: s.color, fontFamily: 'Space Grotesk, sans-serif' }}>{s.value}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Pending queue */}
      {(pendingPatients.length > 0 || pendingVisits.length > 0) && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 16, padding: '16px 18px' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Clock size={14} color="#f59e0b" /> Pending Sync Queue
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            {pendingPatients.map(p => (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 10, background: '#f59e0b08', border: '1px solid #f59e0b20' }}>
                <Clock size={13} color="#f59e0b" />
                <div style={{ flex: 1, fontSize: 12, color: 'var(--text-primary)' }}>
                  Patient: <b>{p.name}</b>
                </div>
                <span style={{ fontSize: 9, color: '#f59e0b', fontWeight: 700 }}>PENDING</span>
              </div>
            ))}
            {pendingVisits.map(v => {
              const p = patients.find(pt => pt.id === v.patientId);
              return (
                <div key={v.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 10, background: '#f59e0b08', border: '1px solid #f59e0b20' }}>
                  <Clock size={13} color="#f59e0b" />
                  <div style={{ flex: 1, fontSize: 12, color: 'var(--text-primary)' }}>
                    Visit: <b>{p?.name || v.patientId}</b> · {v.date}
                  </div>
                  <span style={{ fontSize: 9, color: '#f59e0b', fontWeight: 700 }}>PENDING</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', padding: '4px 0' }}>
        📱 All data stored locally on your device. Safe even without internet.
      </div>
    </div>
  );
}
