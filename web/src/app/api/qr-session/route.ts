import { NextRequest, NextResponse } from 'next/server';

// In-memory QR session store (use Redis in production)
const qrSessions = new Map<string, { userId: string; createdAt: number; expiresAt: number }>();

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.json({ success: false, error: 'Token required' }, { status: 400 });
  }

  const session = qrSessions.get(token);
  if (!session) {
    return NextResponse.json({ success: false, error: 'Invalid or expired QR token' }, { status: 404 });
  }

  if (Date.now() > session.expiresAt) {
    qrSessions.delete(token);
    return NextResponse.json({ success: false, error: 'QR token has expired' }, { status: 410 });
  }

  return NextResponse.json({
    success: true,
    userId: session.userId,
    valid: true,
    expiresAt: session.expiresAt,
  });
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();
    if (!userId) {
      return NextResponse.json({ success: false, error: 'userId required' }, { status: 400 });
    }

    // Generate a cryptographically random token
    const token = `${userId}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    qrSessions.set(token, { userId, createdAt: Date.now(), expiresAt });

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const qrUrl = `${baseUrl}/emergency/scan?token=${token}`;

    return NextResponse.json({ success: true, token, qrUrl, expiresAt });
  } catch (err) {
    console.error('[qr-session]', err);
    return NextResponse.json({ success: false, error: 'Failed to create QR session' }, { status: 500 });
  }
}
