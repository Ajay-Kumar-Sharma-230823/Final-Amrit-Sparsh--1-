// Shared in-memory OTP store
// NOTE: This works in development. In production with serverless, use Redis/DB.

const _store = new Map<string, { otp: string; expires: number }>();

export const otpStore = {
  set(id: string, otp: string, ttlMs = 10 * 60 * 1000) {
    _store.set(id, { otp, expires: Date.now() + ttlMs });
  },
  get(id: string) {
    const entry = _store.get(id);
    if (!entry) return null;
    if (Date.now() > entry.expires) { _store.delete(id); return null; }
    return entry;
  },
  delete(id: string) { _store.delete(id); },
};
