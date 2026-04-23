import { NextRequest, NextResponse } from 'next/server';

const ULTRAMSG_INSTANCE = 'instance169701';
const ULTRAMSG_TOKEN    = 'e8lsar0ms6b67agn';
const ULTRAMSG_BASE     = `https://api.ultramsg.com/${ULTRAMSG_INSTANCE}`;

function toWANumber(mobile: string): string {
  const digits = mobile.replace(/\D/g, '');
  if (digits.startsWith('91') && digits.length === 12) return digits;
  if (digits.length === 10) return `91${digits}`;
  return digits;
}

export async function POST(req: NextRequest) {
  try {
    const { mobile, message } = await req.json();
    if (!mobile || !message) {
      return NextResponse.json({ success: false, error: 'mobile and message are required' }, { status: 400 });
    }

    const waNumber = toWANumber(mobile);

    const body = new URLSearchParams({
      token: ULTRAMSG_TOKEN,
      to:    waNumber,
      body:  message,
    });

    const res = await fetch(`${ULTRAMSG_BASE}/messages/chat`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body:    body.toString(),
    });

    const json = await res.json();
    console.log('[UltraMsg WhatsApp]', json);

    const sent = json?.sent === 'true' || json?.sent === true;
    return NextResponse.json({ success: sent, raw: json });
  } catch (err) {
    console.error('[send-whatsapp]', err);
    return NextResponse.json({ success: false, error: 'Failed to send WhatsApp message' }, { status: 500 });
  }
}
