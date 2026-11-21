import { MODULE_COUNT, type QuizScope } from '../content/types'
import { FINAL_ASSESSMENT, passPercentFor } from './assessments'

export type CertificateTrack = 'fundamentals' | 'practitioner'

/** Title and ID prefix per certificate. Change titles here only; every surface reads them. */
export const CERTIFICATES: Record<CertificateTrack, { title: string; idPrefix: string }> = {
  fundamentals: {
    title: 'Copilot Studio Fundamentals: Build Your First Agent',
    idPrefix: 'DR-CSF',
  },
  practitioner: { title: 'Copilot Studio Practitioner', idPrefix: 'DR-CSP' },
}

/** The certificate this course currently issues (Modules 1–10). */
export const CERT_TITLE = CERTIFICATES.fundamentals.title

/** Certificates issued before tracks existed have no track and are Fundamentals. */
export function certificateTitle(track?: CertificateTrack): string {
  return CERTIFICATES[track ?? 'fundamentals'].title
}

export const CERTIFICATE_ISSUER = 'Digital Realty'
export const CERTIFICATE_VALID_MONTHS = 12

export interface CompletionResult {
  /** Modules and the final assessment are both passed. */
  complete: boolean
  /** Every module quiz is passed, so the final assessment is open. */
  modulesComplete: boolean
  passedModules: number[]
  remainingModules: number[]
  assessmentPassed: boolean
  /** Best final assessment percent; this is the certificate's score. */
  finalPercent: number
}

export function isPercentPassing(percent: number, scope: QuizScope): boolean {
  return percent >= passPercentFor(scope)
}

/** Course completion rule: every module quiz passed, then the final assessment passed. */
export function evaluateCompletion(bestPercent: Record<string, number>): CompletionResult {
  const passedModules: number[] = []
  const remainingModules: number[] = []
  for (let id = 1; id <= MODULE_COUNT; id += 1) {
    if (isPercentPassing(bestPercent[String(id)] ?? 0, String(id))) passedModules.push(id)
    else remainingModules.push(id)
  }
  const finalPercent = bestPercent[FINAL_ASSESSMENT.scope] ?? 0
  const modulesComplete = remainingModules.length === 0
  const assessmentPassed = isPercentPassing(finalPercent, FINAL_ASSESSMENT.scope)
  return {
    complete: modulesComplete && assessmentPassed,
    modulesComplete,
    passedModules,
    remainingModules,
    assessmentPassed,
    finalPercent,
  }
}

/** Same calendar day `months` later in UTC; clamps to month end (Feb 29 → Feb 28). */
export function addMonthsUtc(date: Date, months: number): Date {
  const year = date.getUTCFullYear()
  const month = date.getUTCMonth() + months
  const lastDay = new Date(Date.UTC(year, month + 1, 0)).getUTCDate()
  return new Date(
    Date.UTC(
      year,
      month,
      Math.min(date.getUTCDate(), lastDay),
      date.getUTCHours(),
      date.getUTCMinutes(),
      date.getUTCSeconds(),
      date.getUTCMilliseconds(),
    ),
  )
}

export function certificateExpiration(completedAt: Date): Date {
  return addMonthsUtc(completedAt, CERTIFICATE_VALID_MONTHS)
}

export function isExpired(expiresAt: string, now: Date): boolean {
  return now.getTime() >= new Date(expiresAt).getTime()
}

/** e.g. "November 17, 2026" — fixed locale and UTC so server output never varies. */
export function formatCertificateDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  })
}
