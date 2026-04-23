'use client';

import { useState } from 'react';
import AuthPage from './AuthPage';
import AppLayout from './AppLayout';
import { useAppStore, User, UserRole, Gender } from '@/store/appStore';

/** Shape of the form data passed from AuthPage — mirrors AuthPage's internal FormData */
interface AuthProfile {
  name: string; institute: string; role: string; gender: string;
  mobile: string; email: string; password: string; identifier: string;
  diseases: string[]; medHistory: string; primaryColor: string; avatar: string;
}

export default function Home() {
  const [authed, setAuthed] = useState(false);
  const setActiveModule     = useAppStore((s) => s.setActiveModule);
  const setUser             = useAppStore((s) => s.setUser);

  /**
   * Called by AuthPage when login/register + video ends.
   * `profile` carries whatever the user filled in the registration form.
   * For login (password mode), only identifier/mobile is available.
   */
  const handleComplete = (profile: AuthProfile) => {
    const user: User = {
      id:           `user-${Date.now()}`,
      name:         profile.name         || profile.identifier || 'Amrit Sparsh User',
      role:         (profile.role as UserRole) || 'patient',
      gender:       (profile.gender as Gender) || '',
      institute:    profile.institute    || '',
      phone:        profile.mobile       || profile.identifier || '',
      email:        profile.email        || (profile.identifier?.includes('@') ? profile.identifier : ''),
      avatar:       profile.avatar       || '',
      primaryColor: profile.primaryColor || '#8B5E34',
      diseases:     profile.diseases     || [],
      medHistory:   profile.medHistory   || '',
      character:    'guardian',
    };
    setUser(user);            // ← persisted in Zustand + localStorage
    setActiveModule('about'); // ← always land on About Us after auth
    setAuthed(true);
  };

  return authed
    ? <AppLayout />
    : <AuthPage onComplete={handleComplete} />;
}
