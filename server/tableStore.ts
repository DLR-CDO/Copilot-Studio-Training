import { createHash, randomBytes } from 'node:crypto'
import { RestError, TableClient, odata } from '@azure/data-tables'
import {
  ConflictError,
  type AdminAuditEntry,
  type AdminRecord,
  type CertificateRecord,
  type LearnerRecord,
  type Store,
  type Versioned,
} from './store'

const LEARNER_PARTITION = 'learner'
const CERTIFICATE_PARTITION = 'certificate'
const ADMIN_PARTITION = 'admin'
const AUDIT_PARTITION = 'audit'
/** Row keys sort ascending, so newest-first audit rows use the time remaining until this. */
const AUDIT_EPOCH_END = 9_999_999_999_999

/** Emails can contain characters Table Storage forbids in keys, so key by a hash. */
function learnerKey(email: string): string {
  return createHash('sha256').update(email).digest('hex')
}

function parseJson<T>(raw: unknown, fallback: T): T {
  if (typeof raw !== 'string') return fallback
  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

/** Quizzes had 5 questions before scores were stored as percents. */
const LEGACY_QUIZ_SIZE = 5

function readBestPercent(e: Record<string, unknown>): Record<string, number> {
  if (typeof e.bestPercent === 'string') return parseJson(e.bestPercent, {})
  const legacy = parseJson<Record<string, number>>(e.scores, {})
  return Object.fromEntries(
    Object.entries(legacy).map(([k, v]) => [k, Math.floor((Number(v) * 100) / LEGACY_QUIZ_SIZE)]),
  )
}

function optionalString(value: unknown): string | undefined {
  return typeof value === 'string' && value !== '' ? value : undefined
}

function isConflict(err: unknown): boolean {
  return err instanceof RestError && (err.statusCode === 409 || err.statusCode === 412)
}

export class TableStore implements Store {
  private readonly learners: TableClient
  private readonly certificates: TableClient
  private readonly admins: TableClient

  private constructor(learners: TableClient, certificates: TableClient, admins: TableClient) {
    this.learners = learners
    this.certificates = certificates
    this.admins = admins
  }

  static async connect(connectionString: string): Promise<TableStore> {
    // Azurite (local emulator) only speaks plain HTTP.
    const options = { allowInsecureConnection: connectionString.includes('UseDevelopmentStorage') }
    const learners = TableClient.fromConnectionString(connectionString, 'Learners', options)
    const certificates = TableClient.fromConnectionString(connectionString, 'Certificates', options)
    const admins = TableClient.fromConnectionString(connectionString, 'Admins', options)
    await Promise.all([learners.createTable(), certificates.createTable(), admins.createTable()])
    return new TableStore(learners, certificates, admins)
  }

  async getLearner(email: string): Promise<Versioned<LearnerRecord> | null> {
    try {
      const e = await this.learners.getEntity<Record<string, unknown>>(
        LEARNER_PARTITION,
        learnerKey(email),
      )
      return { value: toLearner(e), etag: String(e.etag) }
    } catch (err) {
      if (err instanceof RestError && err.statusCode === 404) return null
      throw err
    }
  }

  async saveLearner(record: LearnerRecord, etag: string | null): Promise<void> {
    const entity = {
      partitionKey: LEARNER_PARTITION,
      rowKey: learnerKey(record.email),
      email: record.email,
      name: record.name,
      bestPercent: JSON.stringify(record.bestPercent),
      attempts: JSON.stringify(record.attempts),
      passedAt: JSON.stringify(record.passedAt),
      attemptLog: JSON.stringify(record.attemptLog),
      pending: JSON.stringify(record.pending),
      lastQuestionIds: JSON.stringify(record.lastQuestionIds),
      cooldowns: JSON.stringify(record.cooldowns),
      cycleStart: record.cycleStart,
      completionStatus: record.completionStatus,
      completedAt: record.completedAt ?? '',
      finalPercent: record.finalPercent ?? -1,
      certificateId: record.certificateId ?? '',
      certificateExpiresAt: record.certificateExpiresAt ?? '',
      uiState: record.uiState ?? '',
      updatedAt: record.updatedAt,
    }
    try {
      if (etag === null) await this.learners.createEntity(entity)
      else await this.learners.updateEntity(entity, 'Replace', { etag })
    } catch (err) {
      if (isConflict(err)) throw new ConflictError()
      throw err
    }
  }

  async getCertificate(id: string): Promise<CertificateRecord | null> {
    try {
      const e = await this.certificates.getEntity<Record<string, unknown>>(
        CERTIFICATE_PARTITION,
        id,
      )
      return toCertificate(e)
    } catch (err) {
      if (err instanceof RestError && err.statusCode === 404) return null
      throw err
    }
  }

  async saveCertificate(record: CertificateRecord): Promise<void> {
    await this.certificates.createEntity({
      partitionKey: CERTIFICATE_PARTITION,
      rowKey: record.id,
      name: record.name,
      email: record.email,
      course: record.course,
      ...(record.track ? { track: record.track } : {}),
      completedAt: record.completedAt,
      expiresAt: record.expiresAt,
      scorePercent: record.scorePercent,
      issuedAt: record.issuedAt,
    })
  }

  async listCertificates(): Promise<CertificateRecord[]> {
    const results: CertificateRecord[] = []
    const entities = this.certificates.listEntities<Record<string, unknown>>({
      queryOptions: { filter: odata`PartitionKey eq ${CERTIFICATE_PARTITION}` },
    })
    for await (const e of entities) results.push(toCertificate(e))
    return results
  }

  async listLearners(): Promise<LearnerRecord[]> {
    const results: LearnerRecord[] = []
    const entities = this.learners.listEntities<Record<string, unknown>>({
      queryOptions: { filter: odata`PartitionKey eq ${LEARNER_PARTITION}` },
    })
    for await (const e of entities) results.push(toLearner(e))
    return results
  }

  async getAdmin(email: string): Promise<AdminRecord | null> {
    try {
      const e = await this.admins.getEntity<Record<string, unknown>>(
        ADMIN_PARTITION,
        learnerKey(email),
      )
      return toAdmin(e)
    } catch (err) {
      if (err instanceof RestError && err.statusCode === 404) return null
      throw err
    }
  }

  async listAdmins(): Promise<AdminRecord[]> {
    const results: AdminRecord[] = []
    const entities = this.admins.listEntities<Record<string, unknown>>({
      queryOptions: { filter: odata`PartitionKey eq ${ADMIN_PARTITION}` },
    })
    for await (const e of entities) results.push(toAdmin(e))
    return results
  }

  async saveAdmin(record: AdminRecord): Promise<void> {
    await this.admins.upsertEntity(
      { partitionKey: ADMIN_PARTITION, rowKey: learnerKey(record.email), ...record },
      'Replace',
    )
  }

  async deleteAdmin(email: string): Promise<void> {
    try {
      await this.admins.deleteEntity(ADMIN_PARTITION, learnerKey(email))
    } catch (err) {
      if (!(err instanceof RestError && err.statusCode === 404)) throw err
    }
  }

  async appendAdminAudit(entry: AdminAuditEntry): Promise<void> {
    const inverted = String(AUDIT_EPOCH_END - Date.parse(entry.at)).padStart(13, '0')
    await this.admins.createEntity({
      partitionKey: AUDIT_PARTITION,
      rowKey: `${inverted}-${randomBytes(4).toString('hex')}`,
      ...entry,
    })
  }

  async listAdminAudit(limit: number): Promise<AdminAuditEntry[]> {
    const results: AdminAuditEntry[] = []
    const entities = this.admins.listEntities<Record<string, unknown>>({
      queryOptions: { filter: odata`PartitionKey eq ${AUDIT_PARTITION}` },
    })
    for await (const e of entities) {
      results.push({
        at: String(e.at),
        actor: String(e.actor),
        action: e.action === 'removed' ? 'removed' : 'added',
        target: String(e.target),
      })
      if (results.length >= limit) break
    }
    return results
  }
}

function toAdmin(e: Record<string, unknown>): AdminRecord {
  return { email: String(e.email), addedBy: String(e.addedBy), addedAt: String(e.addedAt) }
}

function toLearner(e: Record<string, unknown>): LearnerRecord {
  return {
    email: String(e.email),
    name: String(e.name),
    bestPercent: readBestPercent(e),
    attempts: parseJson(e.attempts, {}),
    passedAt: parseJson(e.passedAt, {}),
    attemptLog: parseJson(e.attemptLog, []),
    pending: parseJson(e.pending, {}),
    lastQuestionIds: parseJson(e.lastQuestionIds, {}),
    cooldowns: parseJson(e.cooldowns, {}),
    cycleStart: String(e.cycleStart),
    completionStatus: e.completionStatus === 'complete' ? 'complete' : 'in-progress',
    completedAt: optionalString(e.completedAt),
    finalPercent:
      typeof e.finalPercent === 'number' && e.finalPercent >= 0 ? e.finalPercent : undefined,
    certificateId: optionalString(e.certificateId),
    certificateExpiresAt: optionalString(e.certificateExpiresAt),
    uiState: optionalString(e.uiState),
    updatedAt: String(e.updatedAt),
  }
}

function toCertificate(e: Record<string, unknown>): CertificateRecord {
  return {
    id: String(e.rowKey),
    name: String(e.name),
    email: String(e.email),
    course: String(e.course),
    ...(e.track === 'fundamentals' || e.track === 'practitioner' ? { track: e.track } : {}),
    completedAt: String(e.completedAt),
    expiresAt: String(e.expiresAt),
    scorePercent: Number(e.scorePercent),
    issuedAt: String(e.issuedAt),
  }
}
