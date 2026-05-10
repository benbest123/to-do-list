// TTL (time-to-live) map for storing short-lived values with automatic expiry.
// Generic so it can hold any value type without serialisation overhead.
export default class TTLMap<T = string> {
  private store = new Map<string, { value: T; expiresAt: number }>();
  private ttlMs: number;

  constructor(ttlMs: number) {
    this.ttlMs = ttlMs; // time to live in ms
  }

  set(key: string, value: T) {
    this.store.set(key, { value, expiresAt: Date.now() + this.ttlMs });
  }

  get(key: string): T | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;

    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return undefined;
    }

    return entry.value;
  }

  delete(key: string) {
    this.store.delete(key);
  }
}
