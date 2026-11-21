import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from 'pdf-lib'
import qrcode from 'qrcode-generator'
import { CERTIFICATE_ISSUER, certificateTitle, formatCertificateDate } from '../src/lib/completion'
import type { CertificateRecord } from './store'

/** US Letter, landscape, in PDF points. */
export const PAGE_WIDTH = 792
export const PAGE_HEIGHT = 612
const LOGO_BOX = { width: 240, height: 72 }
const QR_SIZE = 72

const INK = rgb(0, 0, 0)
const MUTED = rgb(0.38, 0.4, 0.47)
/** #8AAEFF, sampled from the Digital Realty artwork. Too light for text, so only for rules. */
const BRAND_BLUE = rgb(0x8a / 255, 0xae / 255, 1)

export interface CertificateContent {
  title: string
  learnerName: string
  course: string
  issuedBy: string
  completionDate: string
  expirationDate: string
  finalScore: string
  certificateId: string
  verifyUrl: string
}

export function verifyUrlFor(baseUrl: string, certificateId: string): string {
  return `${baseUrl.replace(/\/+$/, '')}/verify?id=${encodeURIComponent(certificateId)}`
}

export function certificateContent(cert: CertificateRecord, verifyUrl: string): CertificateContent {
  return {
    title: 'Certificate of Completion',
    learnerName: cert.name,
    course: certificateTitle(cert.track),
    issuedBy: `Issued by ${CERTIFICATE_ISSUER}`,
    completionDate: formatCertificateDate(cert.completedAt),
    expirationDate: formatCertificateDate(cert.expiresAt),
    finalScore: `${cert.scorePercent}%`,
    certificateId: cert.id,
    verifyUrl,
  }
}

/** Standard PDF fonts only cover Western European characters; fold accents, else use "?". */
function encodable(font: PDFFont, text: string): string {
  const fits = (s: string) => {
    try {
      font.encodeText(s)
      return true
    } catch {
      return false
    }
  }
  return Array.from(text)
    .map((ch) => {
      if (fits(ch)) return ch
      const folded = ch.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      return folded && fits(folded) ? folded : '?'
    })
    .join('')
}

function drawCentered(
  page: PDFPage,
  text: string,
  y: number,
  font: PDFFont,
  size: number,
  color = INK,
  maxWidth = PAGE_WIDTH - 140,
): void {
  const safe = encodable(font, text)
  let fitted = size
  while (fitted > 10 && font.widthOfTextAtSize(safe, fitted) > maxWidth) fitted -= 1
  const width = font.widthOfTextAtSize(safe, fitted)
  page.drawText(safe, { x: (PAGE_WIDTH - width) / 2, y, size: fitted, font, color })
}

async function drawLogo(
  doc: PDFDocument,
  page: PDFPage,
  logoPng: Uint8Array | null,
  font: PDFFont,
): Promise<void> {
  const boxX = (PAGE_WIDTH - LOGO_BOX.width) / 2
  const boxY = PAGE_HEIGHT - 64 - LOGO_BOX.height

  if (logoPng) {
    const image = await doc.embedPng(logoPng)
    // Uniform scale only: never stretch or recolor the brand mark.
    const { width, height } = image.scaleToFit(LOGO_BOX.width, LOGO_BOX.height)
    page.drawImage(image, {
      x: (PAGE_WIDTH - width) / 2,
      y: boxY + (LOGO_BOX.height - height) / 2,
      width,
      height,
    })
    return
  }

  page.drawRectangle({
    x: boxX,
    y: boxY,
    width: LOGO_BOX.width,
    height: LOGO_BOX.height,
    borderColor: MUTED,
    borderWidth: 1,
    borderDashArray: [4, 3],
  })
  drawCentered(
    page,
    'Digital Realty logo placeholder',
    boxY + LOGO_BOX.height / 2 - 4,
    font,
    10,
    MUTED,
  )
}

/** Draws the QR code as vector squares so it stays sharp at any print size. */
function drawQrCode(page: PDFPage, text: string, x: number, y: number, size: number): void {
  const qr = qrcode(0, 'M')
  qr.addData(text)
  qr.make()
  const count = qr.getModuleCount()
  const quiet = 2
  const cell = size / (count + quiet * 2)
  page.drawRectangle({ x, y, width: size, height: size, color: rgb(1, 1, 1) })
  for (let row = 0; row < count; row += 1) {
    for (let col = 0; col < count; col += 1) {
      if (!qr.isDark(row, col)) continue
      page.drawRectangle({
        x: x + (col + quiet) * cell,
        // PDF y grows upward; QR rows grow downward.
        y: y + size - (row + quiet + 1) * cell,
        width: cell,
        height: cell,
        color: INK,
      })
    }
  }
}

export async function renderCertificatePdf(
  content: CertificateContent,
  logoPng: Uint8Array | null,
): Promise<Uint8Array> {
  const doc = await PDFDocument.create()
  doc.setTitle(`${content.title} - ${content.course}`)
  doc.setAuthor(CERTIFICATE_ISSUER)
  doc.setSubject(content.certificateId)

  const page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT])
  const regular = await doc.embedFont(StandardFonts.Helvetica)
  const bold = await doc.embedFont(StandardFonts.HelveticaBold)

  page.drawRectangle({
    x: 24,
    y: 24,
    width: PAGE_WIDTH - 48,
    height: PAGE_HEIGHT - 48,
    borderColor: BRAND_BLUE,
    borderWidth: 3,
  })
  page.drawRectangle({
    x: 34,
    y: 34,
    width: PAGE_WIDTH - 68,
    height: PAGE_HEIGHT - 68,
    borderColor: BRAND_BLUE,
    borderWidth: 0.75,
  })

  await drawLogo(doc, page, logoPng, regular)

  drawCentered(page, content.title, 412, bold, 34, INK)
  drawCentered(page, 'This certifies that', 378, regular, 13, MUTED)
  drawCentered(page, content.learnerName, 340, bold, 30)
  page.drawLine({
    start: { x: 196, y: 330 },
    end: { x: PAGE_WIDTH - 196, y: 330 },
    thickness: 1.5,
    color: BRAND_BLUE,
  })
  drawCentered(page, 'has successfully completed', 302, regular, 13, MUTED)
  drawCentered(page, content.course, 270, bold, 22)
  drawCentered(page, content.issuedBy, 244, regular, 12, MUTED)

  const columns: [string, string][] = [
    ['COMPLETION DATE', content.completionDate],
    ['EXPIRATION DATE', content.expirationDate],
    ['FINAL SCORE', content.finalScore],
  ]
  const columnWidth = 200
  const startX = (PAGE_WIDTH - columnWidth * columns.length) / 2
  columns.forEach(([label, value], i) => {
    const centerX = startX + columnWidth * i + columnWidth / 2
    const labelWidth = regular.widthOfTextAtSize(label, 9)
    const valueWidth = bold.widthOfTextAtSize(value, 14)
    page.drawText(label, {
      x: centerX - labelWidth / 2,
      y: 182,
      size: 9,
      font: regular,
      color: MUTED,
    })
    page.drawText(value, { x: centerX - valueWidth / 2, y: 162, size: 14, font: bold, color: INK })
  })

  drawCentered(page, `Certificate ID: ${content.certificateId}`, 86, bold, 10)
  drawCentered(page, `Verify at ${content.verifyUrl}`, 70, regular, 10, MUTED, PAGE_WIDTH - 280)
  drawQrCode(page, content.verifyUrl, PAGE_WIDTH - 48 - QR_SIZE, 48, QR_SIZE)

  return doc.save()
}
