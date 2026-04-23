import { NextRequest, NextResponse } from 'next/server';
import { otpStore } from '@/lib/otpStore';

export async function POST(req: NextRequest) {
  try {
    const { identifier, otp } = await req.json();
    if (!identifier || !otp) return NextResponse.json({ success: false, error: 'Identifier and OTP required' }, { status: 400 });

    const stored = otpStore.get(identifier);
    if (!stored) return NextResponse.json({ success: false, error: 'OTP expired or not found. Please resend.' }, { status: 400 });
    if (stored.otp !== otp.trim()) return NextResponse.json({ success: false, error: 'Incorrect OTP. Please try again.' }, { status: 400 });

    otpStore.delete(identifier); // Consume OTP — single use
    return NextResponse.json({ success: true, message: 'Verified successfully' });
  } catch {
    return NextResponse.json({ success: false, error: 'Verification failed' }, { status: 500 });
  }
}
