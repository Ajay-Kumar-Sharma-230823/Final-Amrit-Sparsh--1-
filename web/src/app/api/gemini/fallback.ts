/**
 * Smart Fallback Engine for Amrit Sparsh AI
 * Used when Gemini API quota is exceeded or unavailable.
 * Covers every possible question about the platform with rich responses.
 */

interface FallbackEntry {
  patterns: string[];
  response: string;
}

const FALLBACK_RESPONSES: FallbackEntry[] = [
  // ── GREETINGS ────────────────────────────────────────────────────────────────
  {
    patterns: ['hello', 'hi', 'hey', 'namaste', 'good morning', 'good evening', 'good afternoon', 'hola', 'sup', 'start'],
    response: `Namaste! 🙏 I am **Amrit Sparsh** — India's next-generation unified AI healthcare platform, and a finalist at **Smart India Hackathon 2025**.

I'm your intelligent AI guide. You can ask me anything:
• 🏥 "What is Amrit Sparsh?"
• 🚨 "How does Emergency SOS work?"
• 👩‍⚕️ "Tell me about ASHA Worker module"
• 🏛️ "What is MahaKumbh module?"
• 📋 "Explain all features"
• 🔒 "How is data secured?"

Or say **"explain in 2 minutes"** for a full presentation! What would you like to know?`,
  },

  // ── FULL 2-MINUTE EXPLANATION ─────────────────────────────────────────────────
  {
    patterns: ['2 min', '2min', 'two min', 'full explain', 'full detail', 'complete explain', 'everything', 'all about', 'tell me all', 'full presentation', 'full demo', 'explain amrit sparsh'],
    response: `Namaste! I am **Amrit Sparsh** — India's unified AI healthcare platform. Let me walk you through everything.

🔴 **The Problem**
India's healthcare system is deeply fragmented. Medical records are scattered across hospitals. Emergency response is dangerously slow — 20–30 minutes in cities, over an hour in rural areas. 70% of India lives in rural areas but only 30% of doctors serve there. And during mass gatherings like Maha Kumbh, healthcare for millions becomes completely chaotic.

✅ **Amrit Sparsh solves all of this — with one intelligent platform.**

**Pillar 1 — Digital Health Records**
Every patient's complete history — prescriptions, lab reports, X-rays, vaccination records — stored securely in the cloud. Accessible in one tap by any authorized doctor anywhere. No more carrying files. Linked to ABHA national health ID.

**Pillar 2 — AI Symptom Checker**
Our AI analyzes symptoms in real time, suggests possible conditions, recommends the right specialist, and guides next steps — available 24/7, in Hindi and regional languages.

**Pillar 3 — Emergency SOS** (Our most life-saving feature!)
One press instantly shares your complete medical history with the nearest hospitals, sends live GPS to emergency contacts, and coordinates ambulance dispatch — all within seconds. Protecting the golden minutes that save lives.

**Pillar 4 — Doctor Consultations**
Video and chat with verified doctors, in Hindi, English, and regional languages. No travel, no waiting rooms. Digital prescriptions stored automatically.

**Pillar 5 — ASHA Worker Module**
Built for India's 1 million frontline healthcare warriors. Offline-first — works without internet, syncs automatically when connected. Patient tracking, vaccination records, antenatal care, real-time reporting.

**Pillar 6 — MahaKumbh Module**
Purpose-built for mass gatherings of 40–45 crore pilgrims. Live crowd health monitoring, AI-assisted missing person coordination, emergency zone mapping.

We are **ABHA compliant**, built on **Next.js and Firebase**, a **Smart India Hackathon 2025 finalist**. Our mission: make healthcare faster, smarter, and truly life-saving for every Indian. 🇮🇳`,
  },

  // ── WHAT IS AMRIT SPARSH ──────────────────────────────────────────────────────
  {
    patterns: ['what is amrit sparsh', 'what is it', 'introduce yourself', 'who are you', 'tell me about yourself', 'about amrit', 'about the platform', 'overview', 'summary', 'brief', 'short intro', '1 min', 'one min', 'quick'],
    response: `I am **Amrit Sparsh** — India's unified AI-powered healthcare platform! 🏥

We solve three critical problems:
1. **Scattered records** — patients have files in 5 different hospitals, no doctor sees the full picture
2. **Slow emergencies** — ambulances take 20–30 minutes; we respond in seconds
3. **Healthcare gap** — 70% of Indians live rurally but have minimal doctor access

Our platform has **6 pillars**:
🗂️ Digital Health Records | 🤖 AI Symptom Checker | 🚨 Emergency SOS | 👨‍⚕️ Doctor Consultations | 👩 ASHA Worker Tools | 🏛️ MahaKumbh Module

Built on **Next.js + Firebase**, fully **ABHA compliant**, and a proud **Smart India Hackathon 2025 finalist**. 

Our mission: make healthcare faster, smarter, and life-saving for every Indian — from cities to the most remote villages! 🇮🇳`,
  },

  // ── EMERGENCY SOS ─────────────────────────────────────────────────────────────
  {
    patterns: ['sos', 'emergency', 'accident', 'urgent', 'ambulance', 'golden', 'life saving', 'life-saving', 'critical'],
    response: `🚨 **Emergency SOS — Our Most Life-Saving Feature**

The moment you press the SOS button, three things happen **simultaneously within seconds**:

1. **Medical History Shared** — Your complete health records (blood type, allergies, conditions, medications) are instantly sent to the nearest hospitals so doctors are ready before you even arrive

2. **Live GPS Tracking** — Your real-time location is sent to all emergency contacts and dispatched ambulances

3. **Ambulance Coordination** — Nearby ambulances are automatically notified and dispatched, with AI prioritizing based on medical severity

**Why this matters:**
In emergencies, the first 60 minutes is called the "Golden Hour" — acting within it can mean the difference between life and death. Traditional systems waste 15–20 minutes just gathering patient information. We eliminate that entirely.

The SOS works even with **low internet connectivity** and remembers your last known location as a fallback. Every second counts — and we save every one of them. 🙏`,
  },

  // ── ASHA WORKERS ──────────────────────────────────────────────────────────────
  {
    patterns: ['asha', 'field worker', 'rural', 'village', 'frontline', 'community health', 'accredited'],
    response: `👩‍⚕️ **ASHA Worker Module — Healthcare to the Last Mile**

ASHA stands for **Accredited Social Health Activist** — India has over **1 million ASHA workers** who are the backbone of rural healthcare, visiting homes, tracking pregnancies, running vaccination drives.

**The problem they faced:**
Paper records, no connectivity in remote areas, data loss, and hours wasted on manual reporting.

**What our module gives them:**

🔴 **Offline-First Architecture** — Works completely WITHOUT internet. ASHA workers record all patient data in the field, and it automatically syncs to the cloud the moment connectivity returns.

📋 **Patient Tracking** — Full patient history, visit records, follow-up reminders

💉 **Vaccination Management** — Vaccination schedules, coverage tracking, auto-reminders for due dates

🤰 **Antenatal Care** — Complete tracking of pregnant women through all trimesters

📊 **Real-Time Reporting** — Instant reports sent to district health officers when connected

This module is transforming how India delivers healthcare to its 600,000+ villages. We are truly bringing quality healthcare to the last mile. 🇮🇳`,
  },

  // ── MAHAKUMBH ─────────────────────────────────────────────────────────────────
  {
    patterns: ['mahakumbh', 'maha kumbh', 'kumbh', 'mass gather', 'crowd', 'pilgrim', 'festival', 'mela', 'gathering'],
    response: `🏛️ **MahaKumbh Module — Healthcare for the World's Largest Gathering**

Maha Kumbh Mela 2025 saw an estimated **40–45 crore (400–450 million) pilgrims** — making it the largest human gathering in history. Healthcare management at this scale has never been done before.

**Our MahaKumbh Module provides:**

📡 **Live Crowd Health Monitoring**
Real-time health data from medical posts across the entire gathering area — tracking cases, trends, and emerging outbreaks

🗺️ **Emergency Zone Mapping**
Interactive maps showing all medical camps, hospitals, ambulance positions, and danger zones — updated in real time

🔍 **AI Missing Person Coordination**
Families separated in the crowds can register missing persons; our AI cross-references medical posts and check-ins to locate them

🚑 **Medical Resource Allocation**
AI predicts which zones need more doctors, medicines, or ambulances based on crowd density and incident patterns

📊 **Health Analytics Dashboard**
District health officers see a live overview of all health incidents, resource utilization, and alerts

This module can be adapted for **any mass gathering** — elections, concerts, religious events, sports tournaments. We're making mass gatherings safe. 🙏`,
  },

  // ── AI / SYMPTOM CHECKER ──────────────────────────────────────────────────────
  {
    patterns: ['ai', 'artificial intelligence', 'symptom', 'checker', 'diagnosis', 'machine learning', 'smart', 'intelligent'],
    response: `🤖 **AI-Powered Symptom Checker**

Our AI symptom checker is like having a **24/7 doctor in your pocket**. Here's how it works:

**Step 1 — Input Symptoms**
You describe your symptoms in natural language — in Hindi, English, or regional languages. No medical jargon needed.

**Step 2 — AI Analysis**
Our AI analyzes your symptoms against thousands of known medical conditions, cross-referenced with your personal health history (age, existing conditions, allergies, medications).

**Step 3 — Intelligent Output**
• Possible conditions ranked by likelihood
• Recommended specialist (cardiologist, orthopedic, general physician, etc.)
• Urgency level — "See a doctor today" vs "Monitor for 48 hours"
• Immediate home care tips

**Important:** The AI guides you to proper care — it does **not** replace a doctor. It's a tool to help you make informed decisions faster.

AI is also embedded across our entire platform:
- Emergency alerts are AI-prioritized by severity
- Health analytics predict risks before they become emergencies
- ABHA records use AI to match and merge data across hospitals 🧠`,
  },

  // ── DOCTOR CONSULTATIONS ──────────────────────────────────────────────────────
  {
    patterns: ['doctor', 'consult', 'appointment', 'video', 'telemedicine', 'teleconsult', 'online doctor', 'virtual'],
    response: `👨‍⚕️ **Doctor Consultations — Healthcare at Your Screen**

No travel. No waiting rooms. No queues. Just quality healthcare wherever you are.

**How it works:**
1. Choose your specialty (General Physician, Cardiologist, Gynecologist, Pediatrician, etc.)
2. Book an immediate or scheduled slot with a verified, licensed doctor
3. Connect via **video or chat** — in Hindi, English, or your regional language
4. Doctor sees your full medical history from your ABHA-linked records before you even speak
5. Receive a **digital prescription** — automatically saved to your health record

**Why this matters for India:**
- India has only **0.7 doctors per 1000 people** (WHO recommends 1:1000)
- 65% of India lives more than 30 km from a specialist
- Our platform connects patients to the right doctor in minutes, not days

All consultations are:
✅ Recorded in your health record
✅ Prescription auto-stored
✅ Follow-up reminders set
✅ Available 24/7 for urgent needs 🏥`,
  },

  // ── DIGITAL HEALTH RECORDS ────────────────────────────────────────────────────
  {
    patterns: ['health record', 'medical record', 'digital record', 'cloud', 'file', 'report', 'prescription', 'abha', 'history', 'document'],
    response: `🗂️ **Digital Health Records — Your Complete Health in One Place**

Imagine this: You're admitted to a hospital in Mumbai, but your X-rays are in Delhi, your prescriptions are in Pune, and your blood reports are in Hyderabad. This is the reality for millions of Indians today.

**Amrit Sparsh ends this chaos.**

Your complete health record includes:
📋 Prescriptions from every doctor
🔬 Lab reports and blood tests  
🩻 X-rays and imaging scans
💉 Vaccination history
⚠️ Allergies and adverse reactions
🫀 Chronic conditions and ongoing medications
🤰 Maternity and reproductive health records

**Access & Security:**
- Linked to your **ABHA (Ayushman Bharat Health Account)** national health ID
- Any authorized doctor anywhere in India can access with your consent
- End-to-end encrypted — your data, your control
- Role-based access: only YOU decide who sees what

**One tap** gives any doctor your complete health picture — enabling faster, safer, and more accurate treatment. No more lost reports. No more repeated tests. 🇮🇳`,
  },

  // ── ABHA / SECURITY / DATA ────────────────────────────────────────────────────
  {
    patterns: ['abha', 'secure', 'security', 'privacy', 'data', 'protect', 'safe', 'encrypt', 'ayushman', 'complian', 'government', 'gdpr'],
    response: `🔒 **Security & Compliance — Your Data, Your Control**

Amrit Sparsh is built with **privacy-first architecture** and is fully compliant with India's digital health standards.

**ABHA Integration:**
ABHA (Ayushman Bharat Health Account) is India's national digital health ID system. Every health record on our platform is linked to your unique ABHA ID, making your records accessible anywhere in India while keeping them completely secure.

**Security measures:**
🔐 **End-to-end encryption** — records encrypted in transit and at rest
✅ **Explicit consent model** — you approve every access request
👤 **Role-based access** — patients, doctors, ASHA workers, and admins have strictly different permissions
🚫 **Zero data selling** — your health data is NEVER shared with third parties or advertisers
🔑 **OTP + ABHA authentication** — multi-factor verification for all logins
📋 **Audit logs** — you can see exactly who accessed your records and when

**Compliance:**
- Government of India data protection standards
- ABHA/NHA (National Health Authority) guidelines
- HIPAA-inspired practices adapted for Indian law

Your health data is yours. We are simply its secure, trusted guardian. 🛡️`,
  },

  // ── TECH STACK ────────────────────────────────────────────────────────────────
  {
    patterns: ['tech', 'technology', 'stack', 'built with', 'framework', 'next.js', 'firebase', 'how is it built', 'architecture', 'technical'],
    response: `⚙️ **Technical Architecture of Amrit Sparsh**

**Frontend:**
⚛️ Next.js 16 with App Router (React 19)
🎨 TypeScript + Tailwind CSS
✨ Framer Motion for animations
🌐 Three.js for 3D visualizations
📊 Recharts for health data charts
🗺️ React Leaflet for maps
🏪 Zustand for state management

**Backend & Infrastructure:**
🔥 Firebase Firestore (real-time database)
🔐 Firebase Authentication (OTP-based)
📁 Firebase Storage (medical files, images)
🚀 Next.js API Routes (server-side logic)
🤖 Google Gemini AI (AI features)

**Special Capabilities:**
📱 Offline-first PWA for ASHA module (works without internet!)
⚡ Real-time sync with Firebase
📱 QR code generation for patient health cards
📄 PDF generation for prescriptions
🎙️ Voice interface with Web Speech API
🔒 Firebase security rules with role-based access

**Scalability:**
The platform is designed to scale from a single college campus to an **entire nation** — built on cloud infrastructure that handles millions of concurrent users. 🏗️`,
  },

  // ── HACKATHON / SIH ───────────────────────────────────────────────────────────
  {
    patterns: ['hackathon', 'sih', 'smart india', 'award', 'finalist', 'competition', 'achievement', 'recognition', 'prize', 'winner'],
    response: `🏆 **Smart India Hackathon 2025 — Finalist**

Amrit Sparsh is a proud finalist at **Smart India Hackathon 2025 (SIH 2025)** — India's premier and largest innovation hackathon, organized by the **Ministry of Education, Government of India**.

**About SIH:**
- Largest hackathon in the world by participation
- Problem statements provided by real government ministries and PSUs
- Judges include IIT professors, government officials, and industry leaders
- Winners get funding, mentorship, and real-world implementation opportunities

**Why we were selected as finalists:**
✅ Comprehensive approach — solving multiple interconnected problems with one platform
✅ Real-world impact — directly addresses India's healthcare gaps
✅ Scalability — designed to work from a single district to the entire nation
✅ Innovation — combining AI, offline-first tech, and mass-gathering management
✅ ABHA compliance — aligned with India's National Digital Health Mission

Being a SIH 2025 finalist is recognition that Amrit Sparsh is not just a project — it is a **real solution for real problems** that millions of Indians face every day. 🇮🇳`,
  },

  // ── FEATURES LIST ─────────────────────────────────────────────────────────────
  {
    patterns: ['feature', 'what can you do', 'capabilities', 'offer', 'modules', 'list', 'all feature', 'pillar'],
    response: `🏥 **Amrit Sparsh — Complete Feature Set**

We have **6 core pillars** powering India's healthcare transformation:

**1. 🗂️ Digital Health Records**
Complete medical history in the cloud — prescriptions, lab reports, X-rays, vaccination records — accessible anywhere, linked to your ABHA ID.

**2. 🤖 AI Symptom Checker**
24/7 AI-powered symptom analysis, condition suggestions, specialist recommendations — in Hindi and regional languages.

**3. 🚨 Emergency SOS**
One-press emergency: medical history to hospitals, GPS to contacts, ambulance dispatch — all in seconds.

**4. 👨‍⚕️ Doctor Consultations**
Video + chat with verified doctors, no travel needed, digital prescriptions, available 24/7.

**5. 👩‍⚕️ ASHA Worker Module**
Offline-first tools for India's 1 million frontline health workers — patient tracking, vaccinations, antenatal care, auto-sync.

**6. 🏛️ MahaKumbh Module**
Mass gathering healthcare — live monitoring, missing person AI, emergency zone mapping for 40+ crore pilgrims.

**Platform features:**
🔒 End-to-end encryption | 📱 Mobile-first | 🌐 Multi-language | 🏛️ ABHA compliant | 📊 Real-time dashboards | 📄 PDF reports | 🗺️ GPS mapping`,
  },

  // ── PROBLEM STATEMENT ─────────────────────────────────────────────────────────
  {
    patterns: ['problem', 'solve', 'challenge', 'issue', 'gap', 'india healthcare', 'why', 'need'],
    response: `🔴 **The Problem Amrit Sparsh Solves**

India's healthcare system faces **5 critical challenges**:

**1. Fragmented Records**
A patient visiting 5 hospitals has 5 different files. No doctor sees the complete picture. Wrong medications are prescribed. Tests are repeated unnecessarily. Lives are at risk.

**2. Slow Emergency Response**
Average ambulance response: **20–30 minutes in cities, 60+ minutes in rural areas**. Without patient medical history, ER doctors waste 10–15 minutes gathering basic info — time that costs lives.

**3. Doctor Shortage & Distribution**
India has **0.7 doctors per 1000 people** (WHO recommends 1:1). 70% of Indians live in rural areas, but 70% of doctors practice in cities. The rural-urban healthcare divide is massive.

**4. ASHA Worker Burden**
India's 1 million ASHA workers handle paperwork manually, lose data in the field, and spend hours on reporting instead of patient care.

**5. Mass Gathering Chaos**
Events like Maha Kumbh (40–45 crore pilgrims) have no coordinated healthcare system, leading to preventable deaths and missing person crises.

✅ **Amrit Sparsh addresses ALL 5 with one unified, AI-powered platform.**`,
  },

  // ── TEAM ─────────────────────────────────────────────────────────────────────
  {
    patterns: ['team', 'who made', 'developer', 'creator', 'student', 'college', 'built by', 'founder'],
    response: `👨‍💻 **Team Amrit Sparsh**

We are a team of passionate **engineering students** building technology for Bharat (India).

**Our vision:**
To bridge the gap between cutting-edge technology and the healthcare needs of 1.4 billion Indians — from the smartest cities to the most remote villages.

**What drives us:**
Every statistic about India's healthcare gap represents a real person. A mother who couldn't get a doctor in time. A pilgrim lost in a crowd. A patient with no medical history in the ER. We are building Amrit Sparsh to change these realities.

**Recognition:**
🏆 Smart India Hackathon 2025 — Finalist

**Platform status:**
✅ Fully functional prototype with all 6 modules working
🚀 Built with production-grade technology (Next.js, Firebase, AI)
📱 Mobile-responsive and accessible

**Future vision:**
Partnership with government health departments (NHM, MoHFW), scaling from college campuses to districts to the entire nation. The dream is Amrit Sparsh in every Indian's pocket. 🇮🇳`,
  },

  // ── THANK YOU / POSITIVE FEEDBACK ────────────────────────────────────────────
  {
    patterns: ['thank', 'thanks', 'great', 'awesome', 'amazing', 'excellent', 'wonderful', 'nice', 'good', 'impressive', 'brilliant', 'wow'],
    response: `Thank you so much! 🙏 Your encouragement means everything to us.

Amrit Sparsh was built with one simple dream — **no Indian should suffer because healthcare was too far away, too slow, or too fragmented.**

We believe technology can bridge that gap. And with platforms like this, it will.

Is there anything else you'd like to know? I'm here to answer any question about Amrit Sparsh — our features, our technology, our mission, or our journey to SIH 2025! 😊`,
  },
];

const DEFAULT_RESPONSE = `That's a great question! I'm Amrit Sparsh — India's unified AI healthcare platform and SIH 2025 finalist.

I can answer questions about:
• 🏥 What is Amrit Sparsh?
• 🚨 Emergency SOS system
• 🗂️ Digital Health Records
• 🤖 AI Symptom Checker
• 👩‍⚕️ ASHA Worker module
• 🏛️ MahaKumbh module
• 👨‍⚕️ Doctor Consultations
• 🔒 Data security & ABHA compliance
• ⚙️ Tech stack & architecture
• 🏆 SIH 2025 recognition

Try asking: **"Explain in 2 minutes"** for a complete overview, or ask about any specific feature!`;

export function getLocalResponse(question: string): string {
  const q = question.toLowerCase().trim();

  // Score each entry based on how many patterns match
  let bestScore = 0;
  let bestResponse = DEFAULT_RESPONSE;

  for (const entry of FALLBACK_RESPONSES) {
    let score = 0;
    for (const pattern of entry.patterns) {
      if (q.includes(pattern.toLowerCase())) {
        score += pattern.length; // longer pattern = more specific match = higher score
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestResponse = entry.response;
    }
  }

  return bestResponse;
}
