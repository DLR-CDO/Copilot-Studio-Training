/**
 * Fixed-window limiter kept in memory. Each Functions instance counts separately, so this caps
 * scripted guessing rather than enforcing an exact global limit.
 */
export class RateLimiter {
  private readonly hits = new Map<string, { count: number; resetAt: number }>()
  private readonly limit: number
  private readonly windowMs: number
  private readonly maxKeys: number

  constructor(limit: number, windowMs: number, maxKeys = 10_000) {
    this.limit = limit
    this.windowMs = windowMs
    this.maxKeys = maxKeys
  }

  allow(key: string, now: number): boolean {
    const entry = this.hits.get(key)
    if (!entry || now >= entry.resetAt) {
      if (this.hits.size >= this.maxKeys) this.prune(now)
      this.hits.set(key, { count: 1, resetAt: now + this.windowMs })
      return true
    }
    entry.count += 1
    return entry.count <= this.limit
  }

  private prune(now: number): void {
    for (const [key, entry] of this.hits) if (now >= entry.resetAt) this.hits.delete(key)
    // Still full of live entries: start over rather than grow without bound.
    if (this.hits.size >= this.maxKeys) this.hits.clear()
  }
}

/** The caller's IP as reported by the Azure front end, without a port. */
export function clientIp(headers: Record<string, string | undefined>): string {
  const forwarded = headers['x-azure-clientip'] ?? headers['x-forwarded-for']?.split(',').pop()
  const ip = (forwarded ?? headers['x-client-ip'] ?? '').trim()
  // "1.2.3.4:5678" → "1.2.3.4"; IPv6 addresses keep their colons.
  return (/^[\d.]+:\d+$/.test(ip) ? ip.replace(/:\d+$/, '') : ip) || 'unknown'
}
