import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'अमृत स्पर्श — Unified AI Healthcare Platform',
  description: 'Amrit Sparsh: India\'s AI-powered unified healthcare intelligence platform combining student health, MDR tracking, emergency SOS, ASHA worker tools, ABHA digital identity, and MahaKumbh mass gathering management.',
  keywords: ['healthcare', 'AI', 'ABHA', 'MDR', 'ASHA worker', 'digital health', 'India', 'Amrit Sparsh'],
  authors: [{ name: 'Amrit Sparsh Team' }],
  openGraph: {
    title: 'अमृत स्पर्श — Unified AI Healthcare Platform',
    description: 'AI-powered unified healthcare platform for India',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Outfit:wght@300;400;500;600;700;800;900&family=Space+Grotesk:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
