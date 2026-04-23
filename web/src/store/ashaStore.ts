/**
 * ASHA Worker Store — Offline-first data layer
 * All data persisted to localStorage (falls back from IndexedDB)
 * Real data types matching NHM India ASHA workflow
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/* ─────────────────── TYPES ─────────────────── */

export type PatientCategory = 'pregnant' | 'child' | 'tb' | 'general';
export type VisitStatus     = 'pending' | 'completed' | 'missed' | 'rescheduled';
export type RiskLevel       = 'low' | 'medium' | 'high' | 'critical';
export type VaccineStatus   = 'pending' | 'given' | 'overdue';
export type SyncStatus      = 'synced' | 'pending' | 'failed';
export type TBPhase         = 'intensive' | 'continuation' | 'completed';
export type Gender          = 'female' | 'male' | 'other';

export interface Vaccination {
  id:         string;
  vaccine:    string;  // e.g. "BCG", "OPV-1", "Pentavalent-1"
  dose:       number;
  dueDate:    string;  // ISO
  givenDate?: string;
  status:     VaccineStatus;
  givenBy?:   string;  // ASHA name
  nextDue?:   string;
}

export interface VisitRecord {
  id:          string;
  patientId:   string;
  date:        string;   // ISO
  bp?:         string;   // "120/80"
  sugar?:      string;   // "102 mg/dL"
  weight?:     string;   // "58 kg"
  temp?:       string;   // "37.2"
  spo2?:       string;   // "98%"
  symptoms:    string;
  notes:       string;
  isCritical:  boolean;
  imageUri?:   string;
  syncStatus:  SyncStatus;
  ashaId:      string;
  createdAt:   string;
}

export interface Patient {
  id:             string;
  name:           string;
  age:            number;
  gender:         Gender;
  village:        string;
  mobile?:        string;
  aadhaar?:       string;
  category:       PatientCategory;
  riskLevel:      RiskLevel;
  syncStatus:     SyncStatus;
  createdAt:      string;
  lastVisitDate?: string;
  ashaId:         string;

  // Category-specific
  pregnancyMonth?: number;       // 1-9
  lmp?:           string;        // Last menstrual period ISO date
  edd?:           string;        // Expected delivery date
  childDob?:      string;        // ISO date for children
  tbPhase?:       TBPhase;
  tbStartDate?:   string;

  // Computed (read-only)
  nextVisitDate?: string;
  mapX?:          number;        // 0-100 for map rendering
  mapY?:          number;
}

export interface SmartAlert {
  id:         string;
  patientId:  string;
  patientName: string;
  type:       'missed_visit' | 'high_risk_pregnancy' | 'tb_overdue' | 'vaccine_due' | 'high_bp' | 'abnormal_vitals';
  message:    string;
  suggestion: string;           // AI action suggestion
  severity:   RiskLevel;
  createdAt:  string;
  dismissed:  boolean;
}

/* ─────────────────── HELPERS ─────────────────── */

function today(): string { return new Date().toISOString().split('T')[0]; }

function addDays(date: string, days: number): string {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

function daysBetween(a: string, b: string): number {
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000);
}

export function computeVaccinationSchedule(childDob: string): Vaccination[] {
  const vaccines = [
    { vaccine: 'BCG', dose: 1, offset: 0 },
    { vaccine: 'OPV', dose: 0, offset: 0 },       // OPV-0 at birth
    { vaccine: 'Hepatitis B', dose: 1, offset: 0 },
    { vaccine: 'OPV', dose: 1, offset: 42 },       // 6 weeks
    { vaccine: 'Pentavalent', dose: 1, offset: 42 },
    { vaccine: 'IPV', dose: 1, offset: 42 },
    { vaccine: 'OPV', dose: 2, offset: 70 },       // 10 weeks
    { vaccine: 'Pentavalent', dose: 2, offset: 70 },
    { vaccine: 'OPV', dose: 3, offset: 98 },       // 14 weeks
    { vaccine: 'Pentavalent', dose: 3, offset: 98 },
    { vaccine: 'IPV', dose: 2, offset: 98 },
    { vaccine: 'Measles', dose: 1, offset: 274 },  // 9 months
    { vaccine: 'Vitamin A', dose: 1, offset: 274 },
    { vaccine: 'MR', dose: 1, offset: 456 },       // 15 months
    { vaccine: 'DPT Booster', dose: 1, offset: 548 },// 18 months
    { vaccine: 'Measles', dose: 2, offset: 730 },  // 2 years
  ];
  const t = today();
  return vaccines.map(v => {
    const due = addDays(childDob, v.offset);
    let status: VaccineStatus = 'pending';
    if (daysBetween(due, t) > 0) status = 'overdue';
    return {
      id: `${childDob}-${v.vaccine}-${v.dose}`,
      vaccine: v.vaccine,
      dose: v.dose,
      dueDate: due,
      status,
    };
  });
}

export function computeRisk(patient: Patient, visits: VisitRecord[]): RiskLevel {
  const t = today();
  const lastVisit = patient.lastVisitDate;
  const daysGap = lastVisit ? daysBetween(lastVisit, t) : 999;

  if (patient.category === 'pregnant') {
    const month = patient.pregnancyMonth ?? 1;
    if (month >= 8 || daysGap > 14) return 'critical';
    if (month >= 6 || daysGap > 7) return 'high';
    return 'medium';
  }
  if (patient.category === 'tb') {
    if (daysGap > 7) return 'critical';
    if (daysGap > 3) return 'high';
    return 'medium';
  }
  if (patient.category === 'child') {
    if (daysGap > 30) return 'medium';
    return 'low';
  }
  if (daysGap > 30) return 'medium';
  return 'low';
}

export function generateAlerts(patients: Patient[], visits: VisitRecord[]): SmartAlert[] {
  const alerts: SmartAlert[] = [];
  const t = today();

  for (const p of patients) {
    const daysGap = p.lastVisitDate ? daysBetween(p.lastVisitDate, t) : 999;

    if (p.category === 'pregnant' && daysGap > 14) {
      alerts.push({
        id: `alert-${p.id}-missed`,
        patientId: p.id,
        patientName: p.name,
        type: 'missed_visit',
        message: `${p.name} (${p.village}) has not been visited in ${daysGap} days — ${p.pregnancyMonth}th month pregnancy`,
        suggestion: daysGap > 21 ? 'Refer to PHC immediately' : 'Visit within 24 hours',
        severity: daysGap > 21 ? 'critical' : 'high',
        createdAt: new Date().toISOString(),
        dismissed: false,
      });
    }

    if (p.category === 'pregnant' && (p.pregnancyMonth ?? 0) >= 8) {
      alerts.push({
        id: `alert-${p.id}-highrisk`,
        patientId: p.id,
        patientName: p.name,
        type: 'high_risk_pregnancy',
        message: `${p.name} is in ${p.pregnancyMonth}th month — High-risk pregnancy`,
        suggestion: 'Ensure hospital delivery plan. Weekly visits mandatory.',
        severity: 'critical',
        createdAt: new Date().toISOString(),
        dismissed: false,
      });
    }

    if (p.category === 'tb' && daysGap > 7) {
      alerts.push({
        id: `alert-${p.id}-tb`,
        patientId: p.id,
        patientName: p.name,
        type: 'tb_overdue',
        message: `TB patient ${p.name} missed follow-up — ${daysGap} days without visit`,
        suggestion: 'Visit today. Check DOTS compliance.',
        severity: daysGap > 14 ? 'critical' : 'high',
        createdAt: new Date().toISOString(),
        dismissed: false,
      });
    }

    // High BP from last visit
    const lastVist = visits.filter(v => v.patientId === p.id).sort((a,b) => b.date.localeCompare(a.date))[0];
    if (lastVist?.bp) {
      const systolic = parseInt(lastVist.bp.split('/')[0]);
      if (systolic > 140) {
        alerts.push({
          id: `alert-${p.id}-bp`,
          patientId: p.id,
          patientName: p.name,
          type: 'high_bp',
          message: `${p.name} had BP ${lastVist.bp} on last visit — needs follow-up`,
          suggestion: 'Check BP again. Refer to PHC if still high.',
          severity: systolic > 160 ? 'critical' : 'high',
          createdAt: new Date().toISOString(),
          dismissed: false,
        });
      }
    }
  }

  return alerts;
}

export function buildTodayVisits(patients: Patient[]): Patient[] {
  const t = today();
  return patients
    .filter(p => {
      const risk = p.riskLevel;
      const daysGap = p.lastVisitDate ? daysBetween(p.lastVisitDate, t) : 999;
      if (risk === 'critical') return true;
      if (risk === 'high' && daysGap >= 3) return true;
      if (risk === 'medium' && daysGap >= 7) return true;
      if (risk === 'low' && daysGap >= 14) return true;
      return false;
    })
    .sort((a, b) => {
      const order = { critical: 0, high: 1, medium: 2, low: 3 };
      return order[a.riskLevel] - order[b.riskLevel];
    });
}

/* ─────────────────── SEED DATA ─────────────────── */

function seedPatients(): Patient[] {
  return [
    {
      id: 'P001', name: 'Sunita Devi', age: 28, gender: 'female',
      village: 'Rampur', mobile: '9876543210', category: 'pregnant',
      riskLevel: 'critical', syncStatus: 'synced',
      createdAt: addDays(today(), -60),
      lastVisitDate: addDays(today(), -16),
      ashaId: 'ASHA001',
      pregnancyMonth: 8, lmp: addDays(today(), -240),
      edd: addDays(today(), 30), mapX: 22, mapY: 28,
    },
    {
      id: 'P002', name: 'Ram Prasad', age: 45, gender: 'male',
      village: 'Khera', mobile: '9876500001', category: 'tb',
      riskLevel: 'critical', syncStatus: 'pending',
      createdAt: addDays(today(), -120),
      lastVisitDate: addDays(today(), -9),
      ashaId: 'ASHA001',
      tbPhase: 'intensive', tbStartDate: addDays(today(), -45),
      mapX: 55, mapY: 18,
    },
    {
      id: 'P003', name: 'Geeta Kumari', age: 34, gender: 'female',
      village: 'Dhanipur', category: 'pregnant',
      riskLevel: 'high', syncStatus: 'synced',
      createdAt: addDays(today(), -40),
      lastVisitDate: addDays(today(), -5),
      ashaId: 'ASHA001',
      pregnancyMonth: 6, mapX: 75, mapY: 42,
    },
    {
      id: 'P004', name: 'Riya Yadav', age: 0, gender: 'female',
      village: 'Rampur', category: 'child',
      riskLevel: 'medium', syncStatus: 'synced',
      createdAt: addDays(today(), -180),
      lastVisitDate: addDays(today(), -25),
      ashaId: 'ASHA001',
      childDob: addDays(today(), -180),
      mapX: 35, mapY: 60,
    },
    {
      id: 'P005', name: 'Kavita Singh', age: 24, gender: 'female',
      village: 'Rampur', category: 'pregnant',
      riskLevel: 'medium', syncStatus: 'pending',
      createdAt: addDays(today(), -30),
      lastVisitDate: addDays(today(), -4),
      ashaId: 'ASHA001',
      pregnancyMonth: 5, mapX: 45, mapY: 72,
    },
    {
      id: 'P006', name: 'Mohan Lal', age: 60, gender: 'male',
      village: 'Khera', category: 'general',
      riskLevel: 'low', syncStatus: 'synced',
      createdAt: addDays(today(), -90),
      lastVisitDate: addDays(today(), -10),
      ashaId: 'ASHA001',
      mapX: 68, mapY: 55,
    },
  ];
}

function seedVisits(): VisitRecord[] {
  const t = today();
  return [
    {
      id: 'V001', patientId: 'P001', date: addDays(t, -16),
      bp: '138/88', weight: '65', temp: '37.1',
      symptoms: 'Mild headache, swelling in feet',
      notes: 'BP elevated. Advised rest and less salt. Next visit in 7 days.',
      isCritical: false, syncStatus: 'synced',
      ashaId: 'ASHA001', createdAt: addDays(t, -16),
    },
    {
      id: 'V002', patientId: 'P001', date: addDays(t, -30),
      bp: '128/82', weight: '63', temp: '36.9',
      symptoms: 'None', notes: 'Routine checkup. All normal.',
      isCritical: false, syncStatus: 'synced',
      ashaId: 'ASHA001', createdAt: addDays(t, -30),
    },
    {
      id: 'V003', patientId: 'P002', date: addDays(t, -9),
      bp: '118/76', weight: '58', temp: '37.8',
      symptoms: 'Cough, fatigue', notes: 'DOTS given. Remind to take medication daily.',
      isCritical: false, syncStatus: 'pending',
      ashaId: 'ASHA001', createdAt: addDays(t, -9),
    },
    {
      id: 'V004', patientId: 'P003', date: addDays(t, -5),
      bp: '122/78', weight: '70', temp: '36.8',
      symptoms: 'None', notes: 'Routine checkup. Advised iron tablets.',
      isCritical: false, syncStatus: 'synced',
      ashaId: 'ASHA001', createdAt: addDays(t, -5),
    },
  ];
}

/* ─────────────────── STORE ─────────────────── */

interface ASHAState {
  patients:          Patient[];
  visits:            VisitRecord[];
  vaccinations:      Record<string, Vaccination[]>;   // patientId → vaccines
  lastSyncTime:      string | null;
  pendingSyncCount:  number;
  activePatientId:   string | null;
  activeTab:         'dashboard' | 'patients' | 'today' | 'vaccination' | 'sync';

  // Actions
  addPatient:        (p: Omit<Patient, 'id' | 'createdAt' | 'syncStatus' | 'ashaId'>) => string;
  updatePatient:     (id: string, updates: Partial<Patient>) => void;
  deletePatient:     (id: string) => void;
  addVisit:          (v: Omit<VisitRecord, 'id' | 'syncStatus' | 'ashaId' | 'createdAt'>) => void;
  markVaccineGiven:  (patientId: string, vaccineId: string) => void;
  initVaccines:      (patientId: string, dob: string) => void;
  setActivePatient:  (id: string | null) => void;
  setActiveTab:      (tab: ASHAState['activeTab']) => void;
  syncNow:           () => void;
  recomputeRisks:    () => void;
  getAlerts:         () => SmartAlert[];
  getTodayVisits:    () => Patient[];
  getPatientVisits:  (patientId: string) => VisitRecord[];
}

export const useASHAStore = create<ASHAState>()(
  persist(
    (set, get) => ({
      patients:         seedPatients(),
      visits:           seedVisits(),
      vaccinations:     { 'P004': computeVaccinationSchedule(addDays(today(), -180)) },
      lastSyncTime:     null,
      pendingSyncCount: 3,
      activePatientId:  null,
      activeTab:        'dashboard',

      addPatient: (data) => {
        const id = `P${Date.now()}`;
        const patient: Patient = {
          ...data,
          id,
          syncStatus: 'pending',
          createdAt: new Date().toISOString(),
          ashaId: 'ASHA001',
          riskLevel: data.riskLevel || 'low',
        };
        set(s => ({
          patients: [...s.patients, patient],
          pendingSyncCount: s.pendingSyncCount + 1,
        }));
        // Auto-init vaccination schedule for children
        if (data.category === 'child' && data.childDob) {
          get().initVaccines(id, data.childDob);
        }
        return id;
      },

      updatePatient: (id, updates) => {
        set(s => ({
          patients: s.patients.map(p =>
            p.id === id ? { ...p, ...updates, syncStatus: 'pending' } : p
          ),
          pendingSyncCount: s.pendingSyncCount + 1,
        }));
      },

      deletePatient: (id) => {
        set(s => ({ patients: s.patients.filter(p => p.id !== id) }));
      },

      addVisit: (data) => {
        const visit: VisitRecord = {
          ...data,
          id: `V${Date.now()}`,
          syncStatus: 'pending',
          ashaId: 'ASHA001',
          createdAt: new Date().toISOString(),
        };
        set(s => {
          const updatedPatients = s.patients.map(p =>
            p.id === data.patientId
              ? { ...p, lastVisitDate: data.date, syncStatus: 'pending' as SyncStatus }
              : p
          );
          return {
            visits: [...s.visits, visit],
            patients: updatedPatients,
            pendingSyncCount: s.pendingSyncCount + 1,
          };
        });
        get().recomputeRisks();
      },

      markVaccineGiven: (patientId, vaccineId) => {
        set(s => {
          const existing = s.vaccinations[patientId] ?? [];
          const updated = existing.map(v =>
            v.id === vaccineId
              ? { ...v, status: 'given' as VaccineStatus, givenDate: today() }
              : v
          );
          return { vaccinations: { ...s.vaccinations, [patientId]: updated } };
        });
      },

      initVaccines: (patientId, dob) => {
        const schedule = computeVaccinationSchedule(dob);
        set(s => ({ vaccinations: { ...s.vaccinations, [patientId]: schedule } }));
      },

      setActivePatient: (id) => set({ activePatientId: id }),
      setActiveTab: (tab) => set({ activeTab: tab }),

      syncNow: () => {
        // Simulate sync (mark all pending as synced)
        set(s => ({
          patients: s.patients.map(p => ({ ...p, syncStatus: 'synced' as SyncStatus })),
          visits:   s.visits.map(v => ({ ...v, syncStatus: 'synced' as SyncStatus })),
          pendingSyncCount: 0,
          lastSyncTime: new Date().toISOString(),
        }));
      },

      recomputeRisks: () => {
        set(s => ({
          patients: s.patients.map(p => ({
            ...p,
            riskLevel: computeRisk(p, s.visits),
          })),
        }));
      },

      getAlerts: () => {
        const { patients, visits } = get();
        return generateAlerts(patients, visits);
      },

      getTodayVisits: () => {
        const { patients } = get();
        return buildTodayVisits(patients);
      },

      getPatientVisits: (patientId) => {
        return get().visits
          .filter(v => v.patientId === patientId)
          .sort((a, b) => b.date.localeCompare(a.date));
      },
    }),
    {
      name: 'asha-worker-store-v2',
      partialize: (s) => ({
        patients: s.patients,
        visits: s.visits,
        vaccinations: s.vaccinations,
        lastSyncTime: s.lastSyncTime,
        pendingSyncCount: s.pendingSyncCount,
      }),
    }
  )
);
