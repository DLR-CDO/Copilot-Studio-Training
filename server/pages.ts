import { COURSE_NAME } from '../src/lib/completion'
import type { CertificateRecord } from './store'

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function layout(title: string, body: string): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)} · ${escapeHtml(COURSE_NAME)}</title>
<style>
  :root { color-scheme: dark; }
  body { margin: 0; font-family: system-ui, -apple-system, "Segoe UI", sans-serif; background: #12141c; color: #e8e9ee; }
  main { max-width: 560px; margin: 0 auto; padding: 48px 20px; }
  .eyebrow { font: 12px ui-monospace, monospace; letter-spacing: .14em; text-transform: uppercase; color: #5fd3bc; margin: 0; }
  h1 { font-size: 28px; margin: 6px 0 20px; }
  form { display: flex; gap: 8px; flex-wrap: wrap; }
  input { flex: 1; min-width: 220px; padding: 10px 12px; border-radius: 8px; border: 1px solid #3a3d4a; background: #1b1e29; color: inherit; font: 15px ui-monospace, monospace; text-transform: uppercase; }
  button, .button { padding: 10px 18px; border: 0; border-radius: 999px; background: #7c6cf2; color: #fff; font-weight: 600; font-size: 14px; cursor: pointer; text-decoration: none; display: inline-block; }
  .card { margin-top: 24px; padding: 18px 20px; border: 1px solid #3a3d4a; border-radius: 12px; background: #1b1e29; }
  dl { display: grid; grid-template-columns: max-content 1fr; gap: 8px 16px; margin: 0; }
  dt { color: #9a9db0; }
  dd { margin: 0; font-weight: 600; }
  .valid { color: #5fd3bc; }
  .expired, .error { color: #f2876c; }
  .muted { color: #9a9db0; font-size: 14px; }
  ul { padding-left: 18px; }
  a { color: #a99cff; }
</style>
</head>
<body><main>${body}</main></body>
</html>`
}

export function renderMockLoginPage(emails: string[], returnTo: string): string {
  const items = emails
    .map(
      (email, i) =>
        `<li><a href="/.auth/login/mock?user=${i}&amp;post_login_redirect_uri=${encodeURIComponent(returnTo)}">${escapeHtml(email)}</a></li>`,
    )
    .join('')
  return layout(
    'Local sign-in',
    `<p class="eyebrow">Local development only</p>
<h1>Sign in as a mock learner</h1>
<ul>${items}</ul>`,
  )
}

/** Neutralize spreadsheet formulas (CSV injection) and quote every cell. */
function csvCell(value: string | number): string {
  let text = String(value)
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`
  return `"${text.replace(/"/g, '""')}"`
}

export function completionsCsv(certificates: CertificateRecord[]): string {
  const header = [
    'Name',
    'Email',
    'Completion date',
    'Expiration date',
    'Score (%)',
    'Certificate ID',
  ]
  const rows = certificates.map((c) => [
    c.name,
    c.email,
    c.completedAt.slice(0, 10),
    c.expiresAt.slice(0, 10),
    c.scorePercent,
    c.id,
  ])
  return [header, ...rows].map((row) => row.map(csvCell).join(',')).join('\r\n') + '\r\n'
}
