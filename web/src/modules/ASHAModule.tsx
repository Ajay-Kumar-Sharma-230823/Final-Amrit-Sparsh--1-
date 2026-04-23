'use client';
/**
 * ASHA Worker System — Main Orchestrator
 * Integrates all 9 modules: Dashboard, Patients, Today's Work, Vaccination, Sync
 * Offline-first, real workflow, no decorative UI
 */
import React, { useState, lazy, Suspense } from 'react';
import { useASHAStore, Patient, SmartAlert } from '@/store/ashaStore';
import { LayoutDashboard, Users, CalendarCheck, Syringe, RefreshCw, Plus, AlertTriangle, ChevronRight, Clock, Wifi, WifiOff } from 'lucide-react';

const ASHARegistration   = lazy(() => import('./asha/ASHARegistration'));
const ASHATodayWork      = lazy(() => import('./asha/ASHATodayWork'));
const ASHAVisitForm      = lazy(() => import('./asha/ASHAVisitForm'));
const ASHAPatientProfile = lazy(() => import('./asha/ASHAPatientProfile'));
const ASHAVaccination    = lazy(() => import('./asha/ASHAVaccination'));
const ASHASyncStatus     = lazy(() => import('./asha/ASHASyncStatus'));

/* ─── CSS ─── */
const CSS = `
@keyframes asha-sync{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
@keyframes mk-dot{0%,100%{opacity:1}50%{opacity:0.4}}
.asha-tab{display:flex;align-items:center;gap:6px;padding:9px 14px;border-radius:10px;
  border:1px solid transparent;background:transparent;cursor:pointer;font-size:12px;
  font-weight:600;color:var(--text-muted);transition:all 0.15s;white-space:nowrap}
.asha-tab:hover{background:var(--accent-surface);color:var(--text-secondary)}
.asha-tab.active{background:var(--accent-surface);color:var(--accent-primary);border-color:var(--border-strong)}
`;

const riskColor = { low:'#10b981', medium:'#f59e0b', high:'#f97316', critical:'#ef4444' };
const catEmoji  = { pregnant:'🤰', child:'👶', tb:'🫁', general:'🩺' };

/* ─── Skeleton ─── */
const Skel = () => (
  <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
    {[120,80,160].map((h,i) => <div key={i} className="shimmer" style={{ height:h, borderRadius:14 }} />)}
  </div>
);

/* ─── Smart Alerts Panel ─── */
function AlertsPanel({ alerts, onOpenPatient }: { alerts: SmartAlert[]; onOpenPatient:(id:string)=>void }) {
  const active = alerts.filter(a => !a.dismissed).slice(0, 4);
  if (active.length === 0) return null;
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
      <div style={{ fontSize:12, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.06em' }}>
        ⚠ Smart Alerts ({active.length})
      </div>
      {active.map(a => (
        <button key={a.id} onClick={() => onOpenPatient(a.patientId)}
          style={{
            display:'flex', alignItems:'flex-start', gap:10, padding:'10px 12px', borderRadius:12,
            background:`${riskColor[a.severity]}08`, border:`1.5px solid ${riskColor[a.severity]}30`,
            cursor:'pointer', textAlign:'left', width:'100%',
          }}>
          <AlertTriangle size={14} color={riskColor[a.severity]} style={{ flexShrink:0, marginTop:1 }} />
          <div style={{ flex:1 }}>
            <div style={{ fontSize:12, fontWeight:700, color:'var(--text-primary)' }}>{a.message}</div>
            <div style={{ fontSize:10, color:riskColor[a.severity], marginTop:2, fontWeight:600 }}>→ {a.suggestion}</div>
          </div>
          <ChevronRight size={13} color="var(--text-muted)" style={{ flexShrink:0, marginTop:1 }} />
        </button>
      ))}
    </div>
  );
}

/* ─── Patient List ─── */
function PatientList({ onSelect, onAddVisit, onRegister }: {
  onSelect:(p:Patient)=>void; onAddVisit:(p:Patient)=>void; onRegister:()=>void;
}) {
  const { patients } = useASHAStore();
  const [filter, setFilter] = useState<'all'|'pregnant'|'tb'|'child'|'general'>('all');
  const [search, setSearch] = useState('');

  const shown = patients
    .filter(p => filter === 'all' || p.category === filter)
    .filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.village.toLowerCase().includes(search.toLowerCase()))
    .sort((a,b) => {
      const o = { critical:0, high:1, medium:2, low:3 };
      return o[a.riskLevel] - o[b.riskLevel];
    });

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
      {/* Top bar */}
      <div style={{ display:'flex', gap:8, alignItems:'center' }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search patient or village..."
          style={{ flex:1, padding:'9px 12px', borderRadius:10, background:'var(--bg-input)', border:'1.5px solid var(--border-color)', color:'var(--text-primary)', fontSize:13, outline:'none' }} />
        <button onClick={onRegister}
          style={{ padding:'9px 14px', borderRadius:10, background:'#10b981', border:'none', color:'white', fontSize:13, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', gap:5, whiteSpace:'nowrap' }}>
          <Plus size={15} /> New
        </button>
      </div>

      {/* Filter tabs */}
      <div style={{ display:'flex', gap:6, overflowX:'auto', paddingBottom:2 }}>
        {(['all','pregnant','child','tb','general'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{
              padding:'5px 12px', borderRadius:8, fontSize:11, fontWeight:600, cursor:'pointer', whiteSpace:'nowrap',
              background: filter===f ? 'var(--accent-primary)' : 'var(--accent-surface)',
              border: '1px solid var(--border-color)',
              color: filter===f ? 'white' : 'var(--text-muted)',
            }}>
            {f==='all'?'All':f==='pregnant'?'🤰 Pregnant':f==='child'?'👶 Child':f==='tb'?'🫁 TB':'🩺 General'}
          </button>
        ))}
      </div>

      {/* Count */}
      <div style={{ fontSize:11, color:'var(--text-muted)' }}>{shown.length} patients</div>

      {/* List */}
      <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
        {shown.map(p => {
          const rc = riskColor[p.riskLevel];
          return (
            <div key={p.id} style={{
              background:'var(--bg-card)', border:`1.5px solid ${rc}20`,
              borderLeft:`4px solid ${rc}`, borderRadius:12, padding:'12px 14px',
              display:'flex', alignItems:'center', gap:12,
            }}>
              <span style={{ fontSize:20 }}>{catEmoji[p.category]}</span>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:13, fontWeight:700, color:'var(--text-primary)', display:'flex', alignItems:'center', gap:6 }}>
                  {p.name}
                  {p.syncStatus === 'pending' && (
                    <span style={{ fontSize:8, fontWeight:700, background:'#f59e0b15', color:'#f59e0b', padding:'1px 5px', borderRadius:4 }}>⏳ SYNC</span>
                  )}
                </div>
                <div style={{ fontSize:10, color:'var(--text-muted)', marginTop:2 }}>
                  {p.village} · Age {p.age}
                  {p.category==='pregnant' && ` · Month ${p.pregnancyMonth}`}
                  {p.lastVisitDate && ` · Last: ${p.lastVisitDate}`}
                </div>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:5, alignItems:'flex-end' }}>
                <span style={{ fontSize:9, fontWeight:800, padding:'2px 7px', borderRadius:5, background:`${rc}15`, color:rc }}>{p.riskLevel.toUpperCase()}</span>
                <div style={{ display:'flex', gap:5 }}>
                  <button onClick={() => onAddVisit(p)}
                    style={{ padding:'4px 8px', borderRadius:7, background:'#10b981', border:'none', color:'white', fontSize:10, fontWeight:700, cursor:'pointer' }}>
                    Visit
                  </button>
                  <button onClick={() => onSelect(p)}
                    style={{ padding:'4px 8px', borderRadius:7, background:'var(--accent-surface)', border:'1px solid var(--border-color)', color:'var(--text-muted)', fontSize:10, cursor:'pointer' }}>
                    Profile
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        {shown.length === 0 && (
          <div style={{ textAlign:'center', color:'var(--text-muted)', fontSize:13, padding:'24px 0' }}>
            No patients found. <button onClick={onRegister} style={{ background:'none', border:'none', cursor:'pointer', color:'#10b981', fontWeight:700, fontSize:13 }}>Register one →</button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Dashboard ─── */
function Dashboard({ onGoToToday, onGoToPatients, onOpenPatient }: {
  onGoToToday:()=>void; onGoToPatients:()=>void; onOpenPatient:(id:string)=>void;
}) {
  const { patients, pendingSyncCount, lastSyncTime, getAlerts, getTodayVisits } = useASHAStore();
  const alerts    = getAlerts();
  const todayList = getTodayVisits();
  const critical  = patients.filter(p => p.riskLevel === 'critical').length;

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8 }}>
        {[
          { label:'Patients', value:patients.length, color:'var(--accent-primary)', onClick:onGoToPatients },
          { label:"Today's Visits", value:todayList.length, color:'#f59e0b', onClick:onGoToToday },
          { label:'Critical', value:critical, color:'#ef4444', onClick:onGoToPatients },
          { label:'Pending Sync', value:pendingSyncCount, color:'#64748b', onClick:()=>{}},
        ].map(s => (
          <button key={s.label} onClick={s.onClick}
            style={{ background:'var(--bg-card)', border:'1px solid var(--border-color)', borderRadius:14, padding:'14px 10px', textAlign:'center', cursor:'pointer' }}>
            <div style={{ fontSize:26, fontWeight:900, color:s.color, fontFamily:'Space Grotesk, sans-serif' }}>{s.value}</div>
            <div style={{ fontSize:10, color:'var(--text-muted)', marginTop:3 }}>{s.label}</div>
          </button>
        ))}
      </div>

      {/* Today's work quick-access */}
      {todayList.length > 0 && (
        <button onClick={onGoToToday} style={{
          display:'flex', alignItems:'center', gap:12, padding:'14px 16px', borderRadius:14,
          background:'#f59e0b08', border:'2px solid #f59e0b30', cursor:'pointer', width:'100%', textAlign:'left',
        }}>
          <CalendarCheck size={22} color="#f59e0b" />
          <div style={{ flex:1 }}>
            <div style={{ fontSize:14, fontWeight:700, color:'var(--text-primary)' }}>Today's Work Ready</div>
            <div style={{ fontSize:11, color:'var(--text-muted)' }}>{todayList.length} patients need a visit today</div>
          </div>
          <ChevronRight size={18} color="#f59e0b" />
        </button>
      )}

      {/* Smart Alerts */}
      <AlertsPanel alerts={alerts} onOpenPatient={onOpenPatient} />

      {/* Sync info */}
      <div style={{ background:'var(--bg-card)', border:'1px solid var(--border-color)', borderRadius:14, padding:'12px 14px', display:'flex', alignItems:'center', gap:10 }}>
        {pendingSyncCount > 0
          ? <WifiOff size={16} color="#f59e0b" />
          : <Wifi size={16} color="#10b981" />}
        <div style={{ flex:1, fontSize:12, color:'var(--text-muted)' }}>
          {pendingSyncCount > 0 ? `${pendingSyncCount} records waiting to sync` : 'All data synced'}
          {lastSyncTime && <span> · Last sync: {new Date(lastSyncTime).toLocaleTimeString('en-IN')}</span>}
        </div>
      </div>
    </div>
  );
}

/* ─── MAIN ─── */
type Tab = 'dashboard'|'patients'|'today'|'vaccination'|'sync';

export default function ASHAModule() {
  const { pendingSyncCount } = useASHAStore();
  const [tab, setTab]                         = useState<Tab>('dashboard');
  const [showRegister, setShowRegister]       = useState(false);
  const [visitPatient, setVisitPatient]       = useState<Patient|null>(null);
  const [profileId, setProfileId]             = useState<string|null>(null);

  const openProfile  = (p: Patient) => { setProfileId(p.id); };
  const openProfile2 = (id: string) => { setProfileId(id); setTab('patients'); };
  const closeProfile = () => setProfileId(null);
  const openVisit    = (p: Patient) => setVisitPatient(p);
  const closeVisit   = () => setVisitPatient(null);

  const tabs: { id:Tab; label:string; icon:React.ReactNode }[] = [
    { id:'dashboard',   label:'Dashboard',    icon:<LayoutDashboard size={14}/> },
    { id:'patients',    label:'Patients',     icon:<Users size={14}/> },
    { id:'today',       label:"Today's Work", icon:<CalendarCheck size={14}/> },
    { id:'vaccination', label:'Vaccination',  icon:<Syringe size={14}/> },
    { id:'sync',        label:`Sync${pendingSyncCount>0?` (${pendingSyncCount})`:''}`, icon:<RefreshCw size={14}/> },
  ];

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
      <style>{CSS}</style>

      {/* Header */}
      <div style={{ background:'linear-gradient(135deg,#064e3b,#10b981)', borderRadius:20, padding:'20px 24px', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', right:-30, top:-30, width:150, height:150, borderRadius:'50%', background:'rgba(255,255,255,0.06)' }} />
        <div style={{ fontSize:20, fontWeight:800, color:'white', fontFamily:'Outfit,sans-serif' }}>👩‍⚕️ ASHA Worker System</div>
        <div style={{ color:'rgba(255,255,255,0.7)', fontSize:12, marginTop:4 }}>
          Offline-first · Rural healthcare · NHM India
        </div>
        <div style={{ display:'flex', gap:10, marginTop:14, flexWrap:'wrap' }}>
          {[
            { label:'Patients', val: useASHAStore.getState().patients.length },
            { label:'Critical', val: useASHAStore.getState().patients.filter(p=>p.riskLevel==='critical').length },
            { label:'Pending Sync', val: pendingSyncCount },
          ].map(s => (
            <div key={s.label} style={{ background:'rgba(255,255,255,0.12)', borderRadius:10, padding:'7px 14px', backdropFilter:'blur(8px)' }}>
              <div style={{ fontSize:18, fontWeight:800, color:'white' }}>{s.val}</div>
              <div style={{ fontSize:10, color:'rgba(255,255,255,0.6)' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tab nav */}
      <div style={{ display:'flex', gap:4, overflowX:'auto', paddingBottom:2 }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => { setTab(t.id); setProfileId(null); }}
            className={`asha-tab${tab===t.id?' active':''}`}>
            {t.icon} {t.label}
          </button>
        ))}
        <div style={{ marginLeft:'auto' }}>
          <button onClick={() => setShowRegister(true)}
            style={{ padding:'9px 14px', borderRadius:10, background:'#10b981', border:'none', color:'white', fontSize:12, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', gap:5 }}>
            <Plus size={13} /> Register
          </button>
        </div>
      </div>

      {/* Content */}
      <Suspense fallback={<Skel/>}>
        {/* Patient profile overlay */}
        {profileId && tab==='patients' ? (
          <ASHAPatientProfile patientId={profileId} onBack={closeProfile} onAddVisit={openVisit} />
        ) : tab==='dashboard' ? (
          <Dashboard onGoToToday={() => setTab('today')} onGoToPatients={() => setTab('patients')} onOpenPatient={openProfile2} />
        ) : tab==='patients' ? (
          <PatientList onSelect={openProfile} onAddVisit={openVisit} onRegister={() => setShowRegister(true)} />
        ) : tab==='today' ? (
          <ASHATodayWork onSelectPatient={openProfile} onAddVisit={openVisit} />
        ) : tab==='vaccination' ? (
          <ASHAVaccination onViewPatient={openProfile2} />
        ) : (
          <ASHASyncStatus />
        )}
      </Suspense>

      {/* Modals */}
      {showRegister && <ASHARegistration onClose={() => setShowRegister(false)} />}
      {visitPatient && <ASHAVisitForm patient={visitPatient} onClose={closeVisit} onSaved={closeVisit} />}
    </div>
  );
}
