import { createHash } from 'node:crypto'
import { RestError, TableClient, odata } from '@azure/data-tables'
import {
  ConflictError,
  type CertificateRecord,
  type LearnerRecord,
  type Store,
  type Versioned,
} from './store'

const LEARNER_PARTITION = 'learner'
const CERTIFICATE_PARTITION = 'certificate'

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

  private constructor(learners: TableClient, certificates: TableClient) {
    this.learners = learners
    this.certificates = certificates
  }

  static async connect(connectionString: string): Promise<TableStore> {
    // Azurite (local emulator) only speaks plain HTTP.
    const options = { allowInsecureConnection: connectionString.includes('UseDevelopmentStorage') }
    const learners = TableClient.fromConnectionString(connectionString, 'Learners', options)
    const certificates = TableClient.fromConnectionString(connectionString, 'Certificates', options)
    await Promise.all([learners.createTable(), certificates.createTable()])
    return new TableStore(learners, certificates)
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
