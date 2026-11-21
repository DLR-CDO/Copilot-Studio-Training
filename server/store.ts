import type { AttemptLogEntry } from '../src/content/types'
import type { CertificateTrack } from '../src/lib/completion'

/** Questions drawn for an attempt that has not been submitted yet. */
export interface PendingAttempt {
  id: string
  questionIds: string[]
  startedAt: string
}

export interface Cooldown {
  /** Failed attempts since the last cooldown ended. */
  failures: number
  /** ISO time the learner may try again. */
  until?: string
}

export interface LearnerRecord {
  email: string
  /** Typed by the learner for their certificate; empty until entered. */
  name: string
  /** Best percent per quiz scope (module id or `final-1`), for the current certification cycle. */
  bestPercent: Record<string, number>
  attempts: Record<string, number>
  /** When each quiz scope was first passed in the current cycle (ISO). */
  passedAt: Record<string, string>
  /** Most recent submitted attempts, oldest first. */
  attemptLog: AttemptLogEntry[]
  pending: Record<string, PendingAttempt>
  /** Questions in the last submitted attempt per scope, so retakes draw different ones. */
  lastQuestionIds: Record<string, string[]>
  cooldowns: Record<string, Cooldown>
  /** Starts at first sign-in; restarts when the learner's certificate expires. */
  cycleStart: string
  completionStatus: 'in-progress' | 'complete'
  completedAt?: string
  /** Best final assessment percent when the certificate was issued. */
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
  /** Title at the time of issue, for the record. Pages show the current title for `track`. */
  course: string
  /** Missing on certificates issued before tracks existed, which are Fundamentals. */
  track?: CertificateTrack
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
  listLearners(): Promise<LearnerRecord[]>
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

  async listLearners(): Promise<LearnerRecord[]> {
    return [...this.learners.values()].map((l) => structuredClone(l.value))
  }
}
