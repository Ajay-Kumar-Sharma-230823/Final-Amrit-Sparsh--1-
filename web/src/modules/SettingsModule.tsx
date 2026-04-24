'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore, Theme } from '@/store/appStore';
import {
  Sun, Moon, Palette, Bell, Shield, User, LogOut, ChevronRight,
  Smartphone, Globe, Lock, Eye, EyeOff, Trash2, Download, Heart,
  Volume2, VolumeX, Wifi, Database, Info, Check, Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';

type SettingsTab = 'appearance' | 'account' | 'notifications' | 'privacy' | 'about';

const TABS: { id: SettingsTab; label: string; icon: React.ElementType }[] = [
  { id: 'appearance', label: 'Appearance',     icon: Palette  },
  { id: 'account',    label: 'Account',         icon: User     },
  { id: 'notifications', label: 'Notifications', icon: Bell   },
  { id: 'privacy',    label: 'Privacy & Data',  icon: Shield   },
  { id: 'about',      label: 'About',           icon: Info     },
];

const THEMES: { id: Theme; label: string; colors: string[] }[] = [
  { id: 'dark',  label: 'Dark',       colors: ['#0f0f1a', '#7c3aed', '#06b6d4'] },
  { id: 'light', label: 'Light',      colors: ['#f8faff', '#6d28d9', '#0891b2'] },
  { id: 'pink',  label: 'Rose',       colors: ['#1a0a0f', '#ec4899', '#f43f5e'] },
  { id: 'brown', label: 'Amber',      colors: ['#1a1000', '#b45309', '#d97706'] },
];

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <motion.div onClick={onToggle} style={{
      width: 44, height: 24, borderRadius: 12, cursor: 'pointer', position: 'relative',
      background: on ? 'var(--accent-primary)' : 'var(--border-color)',
      transition: 'background 0.25s', flexShrink: 0,
    }}>
      <motion.div animate={{ x: on ? 22 : 2 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        style={{ position: 'absolute', top: 2, width: 20, height: 20, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.3)' }} />
    </motion.div>
  );
}

function Row({ label, sub, children, icon: Icon }: { label: string; sub?: string; children: React.ReactNode; icon?: React.ElementType }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid var(--border-color)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {Icon && <div style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon size={16} color="var(--text-muted)" /></div>}
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{label}</div>
          {sub && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{sub}</div>}
        </div>
      </div>
      {children}
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 20, padding: '20px 24px', marginBottom: 16 }}>
      <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.12em', color: 'var(--text-muted)', marginBottom: 4 }}>{title.toUpperCase()}</div>
      {children}
    </div>
  );
}

export default function SettingsModule() {
  const { theme, setTheme, user, logout, setActiveModule } = useAppStore();
  const [tab, setTab] = useState<SettingsTab>('appearance');
  const [notifs, setNotifs] = useState({ push: true, sos: true, health: true, reminders: true, updates: false, sound: true });
  const [privacy, setPrivacy] = useState({ shareData: false, analytics: true, locationAccess: true, biometric: false });
  const [showPhone, setShowPhone] = useState(false);

  const toggleNotif = (k: keyof typeof notifs) => setNotifs(p => ({ ...p, [k]: !p[k] }));
  const togglePrivacy = (k: keyof typeof privacy) => setPrivacy(p => ({ ...p, [k]: !p[k] }));

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    setActiveModule('about');
  };

  const handleExport = () => toast.success('Health data export started — check your email');
  const handleDeleteAccount = () => toast.error('Please contact support to delete your account');

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', fontFamily: 'Outfit, sans-serif' }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.18em', color: 'var(--accent-primary)', marginBottom: 4 }}>AMRIT SPARSH</div>
        <h1 style={{ margin: 0, fontSize: 30, fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          Settings
        </h1>
        <p style={{ margin: '6px 0 0', fontSize: 14, color: 'var(--text-muted)' }}>Manage your preferences and account</p>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 24 }}>

        {/* Sidebar Tabs */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 20, padding: 12, height: 'fit-content' }}>
          {TABS.map((t, i) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <motion.button key={t.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                whileHover={{ x: 3 }} whileTap={{ scale: 0.97 }}
                onClick={() => setTab(t.id)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                  padding: '11px 14px', borderRadius: 12, border: 'none', cursor: 'pointer',
                  background: active ? 'var(--accent-surface)' : 'transparent',
                  color: active ? 'var(--accent-primary)' : 'var(--text-muted)',
                  fontFamily: 'Outfit, sans-serif', fontSize: 13, fontWeight: active ? 700 : 500,
                  marginBottom: 4, textAlign: 'left', transition: 'all 0.2s',
                }}>
                <Icon size={16} strokeWidth={active ? 2.5 : 2} />
                {t.label}
                {active && <ChevronRight size={14} style={{ marginLeft: 'auto' }} />}
              </motion.button>
            );
          })}
        </motion.div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}>

            {/* ── APPEARANCE ── */}
            {tab === 'appearance' && (
              <div>
                <Card title="Theme">
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginTop: 12 }}>
                    {THEMES.map(t => (
                      <motion.button key={t.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                        onClick={() => { setTheme(t.id); toast.success(`${t.label} theme applied`); }}
                        style={{
                          border: theme === t.id ? '2px solid var(--accent-primary)' : '2px solid var(--border-color)',
                          borderRadius: 16, padding: 14, cursor: 'pointer', background: 'var(--bg-secondary)',
                          textAlign: 'left', position: 'relative', overflow: 'hidden',
                        }}>
                        <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
                          {t.colors.map((c, i) => (
                            <div key={i} style={{ width: 20, height: 20, borderRadius: '50%', background: c, boxShadow: `0 2px 8px ${c}66` }} />
                          ))}
                        </div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{t.label}</div>
                        {theme === t.id && (
                          <div style={{ position: 'absolute', top: 10, right: 10, width: 20, height: 20, borderRadius: '50%', background: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Check size={11} color="#fff" strokeWidth={3} />
                          </div>
                        )}
                      </motion.button>
                    ))}
                  </div>
                </Card>

                <Card title="Display">
                  <Row label="Dark Mode" sub="Use dark background to reduce eye strain" icon={Moon}>
                    <Toggle on={theme !== 'light'} onToggle={() => setTheme(theme === 'light' ? 'dark' : 'light')} />
                  </Row>
                  <Row label="Compact View" sub="Show more content with smaller spacing" icon={Smartphone}>
                    <Toggle on={false} onToggle={() => toast('Coming soon!')} />
                  </Row>
                  <Row label="Language" sub="App interface language" icon={Globe}>
                    <select style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 8, padding: '6px 10px', color: 'var(--text-primary)', fontSize: 12, fontFamily: 'Outfit, sans-serif', cursor: 'pointer' }}
                      onChange={() => toast('Multi-language support coming soon!')}>
                      <option>English</option>
                      <option>हिन्दी (Hindi)</option>
                      <option>मराठी (Marathi)</option>
                      <option>বাংলা (Bengali)</option>
                    </select>
                  </Row>
                </Card>
              </div>
            )}

            {/* ── ACCOUNT ── */}
            {tab === 'account' && (
              <div>
                {user && (
                  <Card title="Profile">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 0 20px' }}>
                      <div style={{ width: 60, height: 60, borderRadius: '50%', background: user.primaryColor || 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 800, color: '#fff', flexShrink: 0 }}>
                        {user.name?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                      <div>
                        <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>{user.name || 'User'}</div>
                        <div style={{ fontSize: 12, color: 'var(--accent-primary)', fontWeight: 600, textTransform: 'capitalize' }}>{user.role?.replace('_', ' ') || 'Patient'}</div>
                        {user.institute && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{user.institute}</div>}
                      </div>
                    </div>
                    <Row label="Phone Number" sub="Your registered mobile number" icon={Smartphone}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 600 }}>
                          {showPhone ? (user.phone || '—') : '•••• ••' + (user.phone?.slice(-4) || '••••')}
                        </span>
                        <button onClick={() => setShowPhone(p => !p)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                          {showPhone ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                    </Row>
                    {user.abhaId && <Row label="ABHA ID" sub="Ayushman Bharat Health Account" icon={Heart}>
                      <span style={{ fontSize: 12, color: 'var(--accent-primary)', fontWeight: 700 }}>{user.abhaId}</span>
                    </Row>}
                    {user.bloodGroup && <Row label="Blood Group" sub="Registered blood type" icon={Heart}>
                      <span style={{ fontSize: 14, fontWeight: 800, color: '#ef4444' }}>{user.bloodGroup}</span>
                    </Row>}
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                      onClick={() => { setActiveModule('health'); toast('Redirecting to My Health…'); }}
                      style={{ width: '100%', marginTop: 16, padding: '12px', borderRadius: 12, border: 'none', background: 'var(--gradient-primary)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Outfit, sans-serif' }}>
                      Edit Profile →
                    </motion.button>
                  </Card>
                )}

                <Card title="Session">
                  <Row label="Sign Out" sub="Log out from your account" icon={LogOut}>
                    <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                      onClick={handleLogout}
                      style={{ padding: '8px 18px', borderRadius: 10, border: '1px solid #ef4444', background: 'transparent', color: '#ef4444', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'Outfit, sans-serif' }}>
                      Sign Out
                    </motion.button>
                  </Row>
                </Card>
              </div>
            )}

            {/* ── NOTIFICATIONS ── */}
            {tab === 'notifications' && (
              <div>
                <Card title="Alerts">
                  <Row label="Push Notifications" sub="Receive alerts on your device" icon={Bell}>
                    <Toggle on={notifs.push} onToggle={() => toggleNotif('push')} />
                  </Row>
                  <Row label="Emergency SOS Alerts" sub="Critical alerts — always recommended" icon={Bell}>
                    <Toggle on={notifs.sos} onToggle={() => { toggleNotif('sos'); if (notifs.sos) toast.error('SOS alerts disabled — not recommended!'); }} />
                  </Row>
                  <Row label="Health Reminders" sub="Medication, appointments, checkups" icon={Heart}>
                    <Toggle on={notifs.health} onToggle={() => toggleNotif('health')} />
                  </Row>
                  <Row label="Daily Reminders" sub="Water intake, exercise, vitals logging" icon={Bell}>
                    <Toggle on={notifs.reminders} onToggle={() => toggleNotif('reminders')} />
                  </Row>
                  <Row label="Platform Updates" sub="New features and announcements" icon={Sparkles}>
                    <Toggle on={notifs.updates} onToggle={() => toggleNotif('updates')} />
                  </Row>
                </Card>
                <Card title="Sound">
                  <Row label="Notification Sound" sub="Play audio for incoming alerts" icon={notifs.sound ? Volume2 : VolumeX}>
                    <Toggle on={notifs.sound} onToggle={() => toggleNotif('sound')} />
                  </Row>
                </Card>
              </div>
            )}

            {/* ── PRIVACY ── */}
            {tab === 'privacy' && (
              <div>
                <Card title="Data Sharing">
                  <Row label="Share Health Data" sub="Allow anonymized data for research" icon={Database}>
                    <Toggle on={privacy.shareData} onToggle={() => togglePrivacy('shareData')} />
                  </Row>
                  <Row label="Usage Analytics" sub="Help us improve the platform" icon={Globe}>
                    <Toggle on={privacy.analytics} onToggle={() => togglePrivacy('analytics')} />
                  </Row>
                  <Row label="Location Access" sub="Required for Emergency SOS & nearby doctors" icon={Wifi}>
                    <Toggle on={privacy.locationAccess} onToggle={() => togglePrivacy('locationAccess')} />
                  </Row>
                  <Row label="Biometric Login" sub="Use fingerprint or Face ID" icon={Lock}>
                    <Toggle on={privacy.biometric} onToggle={() => { togglePrivacy('biometric'); toast('Biometric setup coming soon!'); }} />
                  </Row>
                </Card>
                <Card title="Your Data">
                  <Row label="Export Health Data" sub="Download a copy of all your records" icon={Download}>
                    <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={handleExport}
                      style={{ padding: '8px 14px', borderRadius: 10, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'Outfit, sans-serif' }}>
                      Export
                    </motion.button>
                  </Row>
                  <Row label="Delete Account" sub="Permanently remove your data" icon={Trash2}>
                    <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={handleDeleteAccount}
                      style={{ padding: '8px 14px', borderRadius: 10, border: '1px solid #ef4444', background: 'transparent', color: '#ef4444', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'Outfit, sans-serif' }}>
                      Delete
                    </motion.button>
                  </Row>
                </Card>
                <Card title="Security">
                  <div style={{ padding: '10px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Shield size={18} color="#10b981" />
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>End-to-End Encrypted</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>All health records are encrypted and ABHA compliant. Only you control access.</div>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* ── ABOUT ── */}
            {tab === 'about' && (
              <div>
                <Card title="Platform">
                  <div style={{ textAlign: 'center', padding: '20px 0 16px' }}>
                    <div style={{ width: 72, height: 72, borderRadius: 22, background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', boxShadow: '0 8px 32px var(--accent-glow)' }}>
                      <Heart size={32} color="#fff" />
                    </div>
                    <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--text-primary)' }}>Amrit Sparsh</div>
                    <div style={{ fontSize: 12, color: 'var(--accent-primary)', fontWeight: 600, marginTop: 4 }}>AI Healthcare Platform</div>
                    <div style={{ display: 'inline-block', marginTop: 10, padding: '4px 14px', borderRadius: 999, background: 'linear-gradient(135deg,#7c3aed22,#06b6d422)', border: '1px solid var(--accent-primary)', fontSize: 11, fontWeight: 700, color: 'var(--accent-primary)' }}>
                      🏆 SIH 2025 Finalist
                    </div>
                  </div>
                  {[
                    { label: 'Version',     value: 'v1.0.0' },
                    { label: 'Build',       value: 'April 2025' },
                    { label: 'Tech Stack',  value: 'Next.js 16 · Firebase · AI' },
                    { label: 'Compliance',  value: 'ABHA · HIPAA-inspired' },
                  ].map(item => (
                    <Row key={item.label} label={item.label} icon={Info}>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>{item.value}</span>
                    </Row>
                  ))}
                </Card>
                <Card title="Legal">
                  {['Privacy Policy', 'Terms of Service', 'ABHA Compliance', 'Open Source Licenses'].map(item => (
                    <motion.button key={item} whileHover={{ x: 4 }} onClick={() => toast(`Opening ${item}…`)}
                      style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 0', borderBottom: '1px solid var(--border-color)', background: 'none', border: 'none', borderBottom: '1px solid var(--border-color)', cursor: 'pointer', color: 'var(--text-primary)', fontSize: 14, fontWeight: 500, fontFamily: 'Outfit, sans-serif' }}>
                      {item} <ChevronRight size={15} color="var(--text-muted)" />
                    </motion.button>
                  ))}
                </Card>
                <div style={{ textAlign: 'center', padding: '8px 0', fontSize: 11, color: 'var(--text-muted)', opacity: 0.6 }}>
                  Made with ❤️ for every Indian · Amrit Sparsh © 2025
                </div>
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
