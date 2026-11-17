export interface LearnerRecord {
  email: string
  name: string
  /** Best quiz score per module id, for the current certification cycle. */
  scores: Record<string, number>
  attempts: Record<string, number>
  /** When each module quiz was first passed in the current cycle (ISO). */
  passedAt: Record<string, string>
  /** Starts at first sign-in; restarts when the learner's certificate expires. */
  cycleStart: string
  completionStatus: 'in-progress' | 'complete'
  completedAt?: string
  finalPercent?: number
  certificateId?: string
  certificateExpiresAt?: string
  /** Checklist, build steps, notes, and settings from the course UI (JSON). */
  uiState?: string
  updatedAt: string
}

export interface CertificateRecord {
  id: string
  name: string
  email: string
  course: string
  completedAt: string
  expiresAt: string
  scorePercent: number
  issuedAt: string
}

export interface Versioned<T> {
  value: T
  etag: string
}

/** Another request changed the record first; re-read and retry. */
export class ConflictError extends Error {
  constructor() {
    super('Record was changed by another request')
  }
}

export interface Store {
  getLearner(email: string): Promise<Versioned<LearnerRecord> | null>
  /** Creates when `etag` is null; otherwise replaces only if the etag still matches. */
  saveLearner(record: LearnerRecord, etag: string | null): Promise<void>
  getCertificate(id: string): Promise<CertificateRecord | null>
  saveCertificate(record: CertificateRecord): Promise<void>
  listCertificates(): Promise<CertificateRecord[]>
}

/** For local development and tests only — everything is lost on restart. */
export class MemoryStore implements Store {
  private learners = new Map<string, Versioned<LearnerRecord>>()
  private certificates = new Map<string, CertificateRecord>()
  private version = 0

  async getLearner(email: string): Promise<Versioned<LearnerRecord> | null> {
    const found = this.learners.get(email)
    return found ? { value: structuredClone(found.value), etag: found.etag } : null
  }

  async saveLearner(record: LearnerRecord, etag: string | null): Promise<void> {
    const existing = this.learners.get(record.email)
    if (etag === null ? existing != null : existing?.etag !== etag) throw new ConflictError()
    this.version += 1
    this.learners.set(record.email, { value: structuredClone(record), etag: String(this.version) })
  }

  async getCertificate(id: string): Promise<CertificateRecord | null> {
    const found = this.certificates.get(id)
    return found ? { ...found } : null
  }

  async saveCertificate(record: CertificateRecord): Promise<void> {
    this.certificates.set(record.id, { ...record })
  }

  async listCertificates(): Promise<CertificateRecord[]> {
    return [...this.certificates.values()].map((c) => ({ ...c }))
  }
}
