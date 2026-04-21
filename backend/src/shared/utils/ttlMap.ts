// TTL (time-to-live) map for storing codeVerifier during PKCE handshake
// Prevents memory leaks and prevents break on restart (use instead of regular Map)
export default class TTLMap {
  private store = new Map<string, { value: string; expiresAt: number }>();
  private ttlMs: number;

  constructor(ttlMs: number) {
    this.ttlMs = ttlMs; // time to live in ms
  }

  set(key: string, value: string) {
    this.store.set(key, { value, expiresAt: Date.now() + this.ttlMs });
  }

  get(key: string) {
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
