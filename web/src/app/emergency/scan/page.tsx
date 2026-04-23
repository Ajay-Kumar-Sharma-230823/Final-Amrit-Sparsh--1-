'use client';

import { Suspense } from 'react';
import EmergencyAccessPage from './EmergencyAccessClient';

export default function Page() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'white', fontSize: 18 }}>Loading Emergency Access...</div>
      </div>
    }>
      <EmergencyAccessPage />
    </Suspense>
  );
}
