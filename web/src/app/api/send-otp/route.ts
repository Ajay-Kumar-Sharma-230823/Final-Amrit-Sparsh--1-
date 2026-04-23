import { NextRequest, NextResponse } from 'next/server';
import { otpStore } from '@/lib/otpStore';

const ULTRAMSG_INSTANCE = 'instance169701';
const ULTRAMSG_TOKEN    = 'e8lsar0ms6b67agn';
const ULTRAMSG_BASE     = `https://api.ultramsg.com/${ULTRAMSG_INSTANCE}`;

/** Normalise mobile → WhatsApp format (91XXXXXXXXXX) */
function toWANumber(mobile: string): string {
  const digits = mobile.replace(/\D/g, '');
  if (digits.startsWith('91') && digits.length === 12) return digits;
  if (digits.length === 10) return `91${digits}`;
  return digits;
}

async function sendWhatsAppOTP(mobile: string, otp: string): Promise<boolean> {
  const waNumber = toWANumber(mobile);
  const message  = `🏥 *Amrit Sparsh — OTP Verification*\n\nYour one-time password is:\n\n*${otp}*\n\nValid for 10 minutes. Do not share with anyone.\n\n_– Amrit Sparsh Healthcare_`;

  const body = new URLSearchParams({
    token:  ULTRAMSG_TOKEN,
    to:     waNumber,
    body:   message,
  });

  const res = await fetch(`${ULTRAMSG_BASE}/messages/chat`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body:    body.toString(),
  });

  const json = await res.json();
  console.log('[UltraMsg]', json);
  return json?.sent === 'true' || json?.sent === true;
}

export async function POST(req: NextRequest) {
  try {
    const { identifier, channel } = await req.json();
    if (!identifier) {
      return NextResponse.json({ success: false, error: 'Phone number is required' }, { status: 400 });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore.set(identifier, otp); // Store for 10 min

    let sent = false;

    // ── WhatsApp via UltraMsg (primary) ──
    if (channel === 'mobile' || !identifier.includes('@')) {
      sent = await sendWhatsAppOTP(identifier, otp);
    }

    // ── Email fallback (not implemented yet — extend here) ──
    // if (channel === 'email') { sent = await sendEmailOTP(identifier, otp); }

    if (!sent) {
      // Even if WhatsApp delivery fails, we still let DEV mode use the hint
      console.warn(`[Amrit Sparsh] WhatsApp delivery failed for ${identifier}. OTP = ${otp}`);
    }

    console.log(`[Amrit Sparsh OTP] ${channel} → ${identifier}: ${otp}`);

    return NextResponse.json({
      success: true,
      message: `OTP sent via WhatsApp to ${identifier}`,
      channel,
      // DEV ONLY hint — remove in production:
      ...(process.env.NODE_ENV === 'development' && { hint: otp }),
    });
  } catch (err) {
    console.error('[send-otp]', err);
    return NextResponse.json({ success: false, error: 'Failed to send OTP' }, { status: 500 });
  }
}
