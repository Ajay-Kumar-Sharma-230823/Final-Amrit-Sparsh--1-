import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme      = 'light' | 'dark' | 'pink' | 'brown';
export type UserRole   = 'doctor' | 'nurse' | 'patient' | 'admin' | 'paramedic' | 'student' | 'hospital_admin' | 'asha_worker' | 'government' | 'emergency_responder';
export type AICharacter = 'guardian' | 'herald' | 'nova' | 'aria';
export type Gender     = 'male' | 'female' | 'other' | '';

/** Full profile — populated from registration form */
export interface User {
  id:           string;
  name:         string;
  role:         UserRole;
  gender:       Gender;
  institute:    string;
  phone:        string;
  email:        string;
  avatar:       string;          // emoji avatar id
  primaryColor: string;          // accent color chosen during reg
  diseases:     string[];        // health conditions
  medHistory:   string;          // free-text med history
  abhaId?:      string;
  bloodGroup?:  string;
  age?:         number;
  location?:    string;
  character:    AICharacter;
}

export interface HealthMetric {
  label:  string;
  value:  number;
  unit:   string;
  trend:  'up' | 'down' | 'stable';
  status: 'normal' | 'warning' | 'critical';
}

export interface Alert {
  id:        string;
  type:      'mdr' | 'sos' | 'reminder' | 'system' | 'ai';
  title:     string;
  message:   string;
  timestamp: string;
  read:      boolean;
  severity:  'low' | 'medium' | 'high' | 'critical';
}

interface AppState {
  // Theme
  theme: Theme;
  setTheme: (theme: Theme) => void;

  // Auth
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User) => void;
  logout: () => void;

  // Navigation
  activeModule: string;
  setActiveModule: (module: string) => void;
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;

  // AI Character
  aiCharacterOpen: boolean;
  toggleAICharacter: () => void;
  aiMessages: Array<{ role: 'user' | 'ai'; content: string; timestamp: string }>;
  addAIMessage: (role: 'user' | 'ai', content: string) => void;

  // Alerts
  alerts: Alert[];
  unreadCount: number;
  markAlertRead: (id: string) => void;
  addAlert: (alert: Omit<Alert, 'id' | 'timestamp' | 'read'>) => void;

  // SOS
  sosActive: boolean;
  setSosActive: (active: boolean) => void;

  // Health Metrics
  healthMetrics: HealthMetric[];
  setHealthMetrics: (metrics: HealthMetric[]) => void;

  // MDR
  mdrAlertCount: number;
  setMdrAlertCount: (count: number) => void;
}

const initialAlerts: Alert[] = [
  {
    id: '1', type: 'mdr', title: 'MDR Cluster Detected',
    message: 'New MDR-TB cluster detected in Sector 14. 3 confirmed cases.',
    timestamp: new Date(Date.now() - 3600000).toISOString(), read: false, severity: 'critical',
  },
  {
    id: '2', type: 'reminder', title: 'Vaccination Due',
    message: 'Annual influenza vaccination is due for Group B students.',
    timestamp: new Date(Date.now() - 7200000).toISOString(), read: false, severity: 'medium',
  },
  {
    id: '3', type: 'ai', title: 'Health Trend Alert',
    message: 'Your blood pressure trend has been elevated for 3 consecutive days.',
    timestamp: new Date(Date.now() - 1800000).toISOString(), read: false, severity: 'high',
  },
];

const initialMetrics: HealthMetric[] = [
  { label: 'Heart Rate',     value: 72,   unit: 'bpm',    trend: 'stable', status: 'normal' },
  { label: 'Blood Pressure', value: 128,  unit: 'mmHg',   trend: 'up',     status: 'warning' },
  { label: 'SpO2',           value: 98,   unit: '%',      trend: 'stable', status: 'normal' },
  { label: 'Temperature',    value: 36.8, unit: '°C',     trend: 'stable', status: 'normal' },
  { label: 'BMI',            value: 22.4, unit: 'kg/m²',  trend: 'stable', status: 'normal' },
  { label: 'Blood Glucose',  value: 95,   unit: 'mg/dL',  trend: 'down',   status: 'normal' },
];

/** Default guest — replaced by real data after login/register */
const guestUser: User = {
  id:           'guest-001',
  name:         'Guest User',
  role:         'patient',
  gender:       '',
  institute:    '',
  phone:        '',
  email:        '',
  avatar:       '',
  primaryColor: '#8B5E34',
  diseases:     [],
  medHistory:   '',
  character:    'guardian',
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      theme: 'dark',
      setTheme: (theme) => {
        set({ theme });
        document.documentElement.setAttribute('data-theme', theme);
      },

      user: null,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: true }),
      logout: () => set({ user: null, isAuthenticated: false }),

      activeModule: 'about',
      setActiveModule: (module) => set({ activeModule: module }),
      sidebarCollapsed: false,
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

      aiCharacterOpen: false,
      toggleAICharacter: () => set((s) => ({ aiCharacterOpen: !s.aiCharacterOpen })),
      aiMessages: [
        {
          role: 'ai',
          content: 'Namaste! I\'m your health guardian. How can I help you today?',
          timestamp: new Date().toISOString(),
        },
      ],
      addAIMessage: (role, content) => set((s) => ({
        aiMessages: [...s.aiMessages, { role, content, timestamp: new Date().toISOString() }],
      })),

      alerts: initialAlerts,
      unreadCount: initialAlerts.filter((a) => !a.read).length,
      markAlertRead: (id) => set((s) => {
        const alerts = s.alerts.map((a) => (a.id === id ? { ...a, read: true } : a));
        return { alerts, unreadCount: alerts.filter((a) => !a.read).length };
      }),
      addAlert: (alert) => set((s) => {
        const newAlert: Alert = {
          ...alert, id: Date.now().toString(),
          timestamp: new Date().toISOString(), read: false,
        };
        const alerts = [newAlert, ...s.alerts];
        return { alerts, unreadCount: alerts.filter((a) => !a.read).length };
      }),

      sosActive: false,
      setSosActive: (active) => set({ sosActive: active }),

      healthMetrics: initialMetrics,
      setHealthMetrics: (metrics) => set({ healthMetrics: metrics }),

      mdrAlertCount: 3,
      setMdrAlertCount: (count) => set({ mdrAlertCount: count }),
    }),
    {
      name: 'amrit-sparsh-store-v3',
      partialize: (state) => ({
        theme:           state.theme,
        user:            state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
