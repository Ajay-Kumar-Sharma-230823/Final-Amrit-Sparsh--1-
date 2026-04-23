import { NextRequest, NextResponse } from 'next/server';
import { otpStore } from '@/lib/otpStore';

const ULTRAMSG_INSTANCE = 'instance169701';
const ULTRAMSG_TOKEN    = 'e8lsar0ms6b67agn';
const ULTRAMSG_BASE     = `https://api.ultramsg.com/${ULTRAMSG_INSTANCE}`;

function toWANumber(mobile: string): string {
  const digits = mobile.replace(/\D/g, '');
  if (digits.startsWith('91') && digits.length === 12) return digits;
  if (digits.length === 10) return `91${digits}`;
  return digits;
}

async function sendWhatsAppMessage(mobile: string, message: string): Promise<boolean> {
  const waNumber = toWANumber(mobile);
  const body = new URLSearchParams({ token: ULTRAMSG_TOKEN, to: waNumber, body: message });
  try {
    const res = await fetch(`${ULTRAMSG_BASE}/messages/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });
    const json = await res.json();
    console.log('[UltraMsg SOS]', json);
    return json?.sent === 'true' || json?.sent === true;
  } catch (e) {
    console.error('[UltraMsg SOS Error]', e);
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    const {
      patientName,
      emergencyType,
      location,
      hospitalName,
      contacts,
      phone,
    } = await req.json();

    if (!contacts || !Array.isArray(contacts)) {
      return NextResponse.json({ success: false, error: 'contacts array required' }, { status: 400 });
    }

    // Log the SOS event
    const sosId = `AS-SOS-${Date.now()}`;
    const timestamp = new Date().toLocaleString('en-IN');
    const mapsLink = location?.lat
      ? `https://www.google.com/maps?q=${location.lat},${location.lng}`
      : 'https://maps.google.com';

    // Build WhatsApp emergency message
    const emergencyMessage = `🚨 *EMERGENCY ALERT — Amrit Sparsh*

Patient: *${patientName}*
Emergency: *${emergencyType}*
Status: *Being Treated / En Route to Hospital*
Hospital: *${hospitalName || 'Nearest Hospital'}*

📍 *Live Location:*
${mapsLink}

⏰ Time: ${timestamp}
🆔 SOS ID: ${sosId}

Please reach out immediately or contact the hospital.

_This is an automated alert from Amrit Sparsh Emergency System_`;

    // Send WhatsApp to all emergency contacts
    const results: Record<string, boolean> = {};
    for (const contact of contacts) {
      const sent = await sendWhatsAppMessage(contact.whatsapp || contact.phone, emergencyMessage);
      results[contact.name] = sent;
      // Small delay between messages
      await new Promise(r => setTimeout(r, 500));
    }

    // Also send OTP notification to patient's phone if provided
    if (phone) {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      otpStore.set(`sos_${phone}`, otp);
      const otpMsg = `🔐 *Amrit Sparsh SOS Verification*\n\nSOS has been triggered for your account.\nVerification OTP: *${otp}*\n\nIf this was NOT you, please reply immediately.\n\n_SOS ID: ${sosId}_`;
      await sendWhatsAppMessage(phone, otpMsg);
    }

    return NextResponse.json({
      success: true,
      sosId,
      timestamp,
      contactsNotified: results,
      hospitalAlerted: hospitalName,
      mapsLink,
    });
  } catch (err) {
    console.error('[sos-trigger]', err);
    return NextResponse.json({ success: false, error: 'Failed to trigger SOS' }, { status: 500 });
  }
}
