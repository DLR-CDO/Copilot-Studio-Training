import { COURSE_NAME, formatCertificateDate, isExpired } from '../src/lib/completion'
import type { MockUser } from './config'
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

export type VerifyResult =
  | { kind: 'empty' }
  | { kind: 'invalid'; query: string }
  | { kind: 'not-found'; query: string }
  | { kind: 'found'; query: string; certificate: CertificateRecord; now: Date }

/** Public page. Shows only name, course, completion date, and status — never email or score. */
export function renderVerifyPage(result: VerifyResult): string {
  const query = result.kind === 'empty' ? '' : result.query
  let outcome = ''
  if (result.kind === 'invalid') {
    outcome = `<div class="card error" role="alert">That doesn't look like a certificate ID. IDs look like DR-CSA-XXXX-XXXX-XXXX.</div>`
  } else if (result.kind === 'not-found') {
    outcome = `<div class="card error" role="alert">No certificate was found with that ID.</div>`
  } else if (result.kind === 'found') {
    const c = result.certificate
    const expired = isExpired(c.expiresAt, result.now)
    outcome = `<div class="card" role="status">
  <dl>
    <dt>Learner</dt><dd>${escapeHtml(c.name)}</dd>
    <dt>Course</dt><dd>${escapeHtml(c.course)}</dd>
    <dt>Completed</dt><dd>${escapeHtml(formatCertificateDate(c.completedAt))}</dd>
    <dt>Status</dt><dd class="${expired ? 'expired' : 'valid'}">${expired ? 'Expired' : 'Valid'}</dd>
  </dl>
</div>`
  }

  return layout(
    'Verify a certificate',
    `<p class="eyebrow">Digital University</p>
<h1>Verify a certificate</h1>
<form method="get" action="/verify">
  <label for="id" class="muted" style="width:100%">Certificate ID</label>
  <input id="id" name="id" value="${escapeHtml(query)}" placeholder="DR-CSA-XXXX-XXXX-XXXX" autocomplete="off" maxlength="40" required>
  <button type="submit">Verify</button>
</form>
${outcome}`,
  )
}

export function renderSignedOutPage(): string {
  return layout(
    'Signed out',
    `<p class="eyebrow">Digital University</p>
<h1>You're signed out</h1>
<p><a class="button" href="/">Sign in again</a></p>`,
  )
}

export function renderAdminPage(count: number): string {
  return layout(
    'Completions',
    `<p class="eyebrow">Admin</p>
<h1>Course completions</h1>
<p>${count} certificate${count === 1 ? '' : 's'} issued.</p>
<p><a class="button" href="/admin/completions.csv" download>Download CSV</a></p>
<p class="muted">Columns: name, email, completion date, expiration date, score, certificate ID.</p>`,
  )
}

export function renderForbiddenPage(message: string): string {
  return layout(
    'Not allowed',
    `<h1>Not allowed</h1><p>${escapeHtml(message)}</p><p><a href="/">Back to the course</a></p>`,
  )
}

export function renderMockLoginPage(users: MockUser[], returnTo: string): string {
  const items = users
    .map(
      (u, i) =>
        `<li><a href="/.auth/login/mock?user=${i}&amp;post_login_redirect_uri=${encodeURIComponent(returnTo)}">${escapeHtml(u.name)} (${escapeHtml(u.email)})</a></li>`,
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
