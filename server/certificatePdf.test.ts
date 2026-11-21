// @vitest-environment node
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { PDFDocument, PDFName } from 'pdf-lib'
import { describe, expect, it } from 'vitest'
import {
  PAGE_HEIGHT,
  PAGE_WIDTH,
  certificateContent,
  renderCertificatePdf,
  verifyUrlFor,
} from './certificatePdf'
import { CERT_TITLE } from '../src/lib/completion'
import type { CertificateRecord } from './store'

const cert: CertificateRecord = {
  id: 'DR-CSA-7K2M-Q9XD-4HTB',
  name: 'Alice Learner',
  email: 'alice@example.com',
  // Issued before tracks existed, under the course's former title.
  course: 'Copilot Studio Advanced',
  completedAt: '2026-11-17T15:00:00.000Z',
  expiresAt: '2027-11-17T15:00:00.000Z',
  scorePercent: 96,
  issuedAt: '2026-11-17T15:00:00.000Z',
}

// Smallest valid PNG: 1×1 transparent pixel.
const PNG_1X1 = Uint8Array.from(
  Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
    'base64',
  ),
)

async function imageCount(bytes: Uint8Array): Promise<number> {
  const doc = await PDFDocument.load(bytes)
  const xObjects = doc.getPage(0).node.Resources()?.lookup(PDFName.of('XObject'))
  return xObjects ? (xObjects as unknown as { keys(): unknown[] }).keys().length : 0
}

describe('certificate content', () => {
  it('shows the current title for certificates stored with the former title', () => {
    expect(certificateContent(cert, 'https://x.test').course).toBe(CERT_TITLE)
    expect(CERT_TITLE).not.toMatch(/advanced/i)
  })

  it('has every required field, with the name and dates from the stored record', () => {
    const url = verifyUrlFor('https://copilotstudio-academy.azurewebsites.net/', cert.id)
    expect(certificateContent(cert, url)).toEqual({
      title: 'Certificate of Completion',
      learnerName: 'Alice Learner',
      course: 'Copilot Studio Fundamentals: Build Your First Agent',
      issuedBy: 'Issued by Digital Realty',
      completionDate: 'November 17, 2026',
      expirationDate: 'November 17, 2027',
      finalScore: '96%',
      certificateId: 'DR-CSA-7K2M-Q9XD-4HTB',
      verifyUrl: 'https://copilotstudio-academy.azurewebsites.net/verify?id=DR-CSA-7K2M-Q9XD-4HTB',
    })
  })
})

describe('renderCertificatePdf', () => {
  const content = certificateContent(cert, verifyUrlFor('https://example.test', cert.id))

  it('renders one landscape US Letter page', async () => {
    const doc = await PDFDocument.load(await renderCertificatePdf(content, null))
    expect(doc.getPageCount()).toBe(1)
    expect(doc.getPage(0).getSize()).toEqual({ width: PAGE_WIDTH, height: PAGE_HEIGHT })
    expect([PAGE_WIDTH, PAGE_HEIGHT]).toEqual([792, 612])
    expect(doc.getSubject()).toBe(cert.id)
  })

  it('embeds the logo image when the file is present', async () => {
    expect(await imageCount(await renderCertificatePdf(content, PNG_1X1))).toBe(1)
  })

  it('embeds the Digital Realty logo shipped with the site', async () => {
    const logo = await readFile(
      fileURLToPath(new URL('../public/assets/digital-realty-logo.png', import.meta.url)),
    )
    expect(await imageCount(await renderCertificatePdf(content, logo))).toBe(1)
  })

  it('draws a placeholder instead of an image when the logo is missing', async () => {
    expect(await imageCount(await renderCertificatePdf(content, null))).toBe(0)
  })

  it('handles names outside the standard PDF font without failing', async () => {
    const bytes = await renderCertificatePdf({ ...content, learnerName: 'Łukasz Żółć 李' }, null)
    expect((await PDFDocument.load(bytes)).getPageCount()).toBe(1)
  })
})
