/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  AMRIT SPARSH — AI KNOWLEDGE BASE
 *  ► This file is the single source of truth for the Gemini AI assistant.
 *  ► Paste content from your PDF, PPT, Word docs, or any text here.
 *  ► The AI will use this to answer ANY question about Amrit Sparsh.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const AMRIT_SPARSH_KNOWLEDGE = `
=============================================================================
SECTION 1: PROJECT OVERVIEW
=============================================================================

Project Name: Amrit Sparsh
Tagline: India's Unified AI Healthcare Platform
Competition: Smart India Hackathon 2025 (SIH 2025) — Finalist
Problem Statement: Fragmented healthcare system in India — scattered records,
  slow emergency response, and rural healthcare inaccessibility.

Mission: To make healthcare faster, smarter, and truly life-saving for every
  Indian — from cities to villages, from hospitals to mass gatherings.

Tech Stack: Next.js 16, Firebase, TypeScript, Tailwind CSS, Three.js,
  Framer Motion, Leaflet Maps, React 19, Zustand state management.
Compliance: ABHA (Ayushman Bharat Health Account) compliant.

=============================================================================
SECTION 2: THE 6 CORE PILLARS / FEATURES
=============================================================================

--- PILLAR 1: DIGITAL HEALTH RECORDS ---
- Complete medical history stored securely in the cloud
- Includes: prescriptions, lab reports, X-rays, vaccination records, allergies, chronic conditions
- Accessible in one tap by any authorized doctor, anywhere in India
- No more carrying physical files or losing critical reports
- Linked to ABHA (Ayushman Bharat Health Account) national health ID
- End-to-end encrypted, patient-consent-based access

--- PILLAR 2: AI SYMPTOM CHECKER ---
- Real-time symptom analysis using pattern recognition
- Covers thousands of medical conditions
- Suggests possible conditions and recommends the right specialist
- Available 24/7 — like having a doctor in your pocket
- Supports Hindi and multiple regional Indian languages
- Does NOT replace a doctor — guides patients to seek proper care

--- PILLAR 3: EMERGENCY SOS ---
- One-press SOS button triggers immediate emergency response
- Instantly shares complete medical history with nearest hospitals
- Sends live GPS location to emergency contacts
- Coordinates ambulance dispatch — all within seconds
- Protects the "golden hour" / "golden minutes" critical for survival
- AI-prioritizes alerts based on patient's medical history and condition severity
- Works even with low connectivity

--- PILLAR 4: DOCTOR CONSULTATIONS (TELEMEDICINE) ---
- Video and chat consultations with verified, licensed doctors
- Available in Hindi, English, and regional Indian languages
- No travel, no waiting rooms — healthcare delivered to your screen
- Every consultation automatically recorded in your health record
- Digital prescriptions issued and stored
- Appointment scheduling built-in

--- PILLAR 5: ASHA WORKER MODULE ---
- ASHA = Accredited Social Health Activist — India's frontline healthcare warriors
- There are ~1 million ASHA workers across India
- Module works offline-first — records patient data WITHOUT internet
- Automatic data sync when internet connectivity returns
- Features: patient tracking, vaccination schedules, antenatal care records
- Real-time reporting to district health officers
- Designed for last-mile healthcare — remotest villages and tribal areas
- Reduces data entry burden, eliminates paper records

--- PILLAR 6: MAHAKUMBH MODULE ---
- Purpose-built for healthcare management at mass gatherings
- Specifically designed for Maha Kumbh Mela (the world's largest human gathering)
- Maha Kumbh 2025: ~40-45 crore (400-450 million) pilgrims expected
- Features:
  * Live crowd health monitoring
  * AI-assisted missing person coordination
  * Emergency zone mapping with real-time updates
  * Medical resource allocation (ambulances, doctors, medicine)
  * Crowd density heat maps
  * Lost and found system
- Can be adapted for any mass gathering: concerts, elections, festivals

=============================================================================
SECTION 3: PROBLEM WE SOLVE
=============================================================================

India's healthcare challenges:
1. Fragmented records: A patient visiting 5 different hospitals has 5 different
   files — no doctor has the complete picture
2. Slow emergency response: Average ambulance response time in India is 20-30
   minutes in cities, 1+ hour in rural areas
3. Doctor shortage: India has 0.7 doctors per 1000 people (WHO recommends 1:1000)
4. Rural healthcare gap: 70% of India lives in rural areas but only 30% of
   doctors practice there
5. Mass gathering chaos: No coordinated healthcare at large events causes
   preventable deaths

Amrit Sparsh solves ALL of these with one unified, AI-powered platform.

=============================================================================
SECTION 4: SECURITY & COMPLIANCE
=============================================================================

- Fully ABHA (Ayushman Bharat Health Account) compliant
- ABHA is India's national digital health ID system under Ayushman Bharat scheme
- End-to-end encryption for all health records
- Data accessible ONLY with explicit patient consent
- Role-based access: patients, doctors, ASHA workers, admins have different permissions
- Meets all Government of India data protection standards
- No data sold to third parties
- HIPAA-inspired data privacy practices adapted for Indian healthcare laws
- Firebase security rules with user authentication via OTP + ABHA ID

=============================================================================
SECTION 5: TEAM & COMPETITION
=============================================================================

- Team of passionate engineering students building for Bharat (India)
- Competing in Smart India Hackathon 2025 (SIH 2025)
- SIH is India's premier innovation challenge organized by Ministry of Education
- Our approach: comprehensive, scalable, real-world impact
- Platform is scalable: from a single college campus to an entire nation
- Open to partnerships with government health departments (NHM, MoHFW)

=============================================================================
SECTION 6: TECHNICAL ARCHITECTURE
=============================================================================

Frontend:
- Next.js 16 with App Router
- React 19 with TypeScript
- Framer Motion for animations
- Three.js for 3D visualizations
- Tailwind CSS for styling
- Zustand for state management
- Lucide React for icons
- Recharts for health data charts
- React Leaflet for maps

Backend / Infrastructure:
- Firebase Firestore (real-time database)
- Firebase Authentication (OTP-based)
- Firebase Storage (medical files/images)
- Next.js API Routes (server-side logic)
- Gemini AI API (AI features)

Key Technical Features:
- Offline-first PWA capabilities for ASHA module
- Real-time sync with Firebase
- QR code generation for patient health cards
- PDF generation for prescriptions and reports
- Voice interface with Web Speech API

=============================================================================
SECTION 7: ADD YOUR OWN CONTENT BELOW
=============================================================================

[PASTE YOUR PPT SLIDES CONTENT HERE]
[PASTE YOUR PDF DOCUMENT CONTENT HERE]
[PASTE ANY OTHER PROJECT DETAILS HERE]

For example:
- Team member names and roles
- Specific research data and statistics
- Detailed feature descriptions from your PPT
- Use cases and user stories
- Future roadmap / upcoming features
- Any awards or recognition details
- Mentor names
- College / institution name

=============================================================================
`;
