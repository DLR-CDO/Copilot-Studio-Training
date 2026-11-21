import type { AdminAuditEntry, Store } from './store'
import { isValidEmail } from './auth'
import type { ServerConfig } from './config'
import { ValidationError } from './learnerService'

export interface AdminView {
  email: string
  /** Listed in ADMIN_EMAILS: can't be removed from the Admin page. */
  permanent: boolean
  addedBy: string | null
  addedAt: string | null
}

export interface AdminOverview {
  admins: AdminView[]
  audit: AdminAuditEntry[]
}

const AUDIT_LIMIT = 50

/** Course admins: `ADMIN_EMAILS` plus anyone another admin added from the Admin page. */
export class AdminService {
  private readonly store: Store
  private readonly config: ServerConfig
  private readonly now: () => Date

  constructor(store: Store, config: ServerConfig, now: () => Date = () => new Date()) {
    this.store = store
    this.config = config
    this.now = now
  }

  async isAdmin(email: string): Promise<boolean> {
    if (this.config.adminEmails.has(email)) return true
    return (await this.store.getAdmin(email)) != null
  }

  async overview(): Promise<AdminOverview> {
    const added = await this.store.listAdmins()
    const permanent: AdminView[] = [...this.config.adminEmails].map((email) => ({
      email,
      permanent: true,
      addedBy: null,
      addedAt: null,
    }))
    const others: AdminView[] = added
      .filter((a) => !this.config.adminEmails.has(a.email))
      .map((a) => ({ email: a.email, permanent: false, addedBy: a.addedBy, addedAt: a.addedAt }))
    return {
      admins: [...permanent, ...others].sort((a, b) => a.email.localeCompare(b.email)),
      audit: await this.store.listAdminAudit(AUDIT_LIMIT),
    }
  }

  async add(actor: string, raw: unknown): Promise<AdminOverview> {
    const email = this.parseEmail(raw)
    if (await this.isAdmin(email)) throw new ValidationError(`${email} is already an admin.`, 409)
    const at = this.now().toISOString()
    await this.store.saveAdmin({ email, addedBy: actor, addedAt: at })
    await this.store.appendAdminAudit({ at, actor, action: 'added', target: email })
    return this.overview()
  }

  async remove(actor: string, raw: unknown): Promise<AdminOverview> {
    const email = this.parseEmail(raw)
    if (this.config.adminEmails.has(email)) {
      throw new ValidationError(`${email} is a permanent admin and can't be removed here.`)
    }
    if (email === actor) throw new ValidationError("You can't remove yourself as an admin.")
    if (!(await this.store.getAdmin(email))) {
      throw new ValidationError(`${email} is not an admin.`, 404)
    }
    await this.store.deleteAdmin(email)
    await this.store.appendAdminAudit({
      at: this.now().toISOString(),
      actor,
      action: 'removed',
      target: email,
    })
    return this.overview()
  }

  private parseEmail(raw: unknown): string {
    const email = typeof raw === 'string' ? raw.trim().toLowerCase() : ''
    if (!isValidEmail(email)) throw new ValidationError('Enter a valid email address.')
    if (!email.endsWith(`@${this.config.allowedEmailDomain}`)) {
      throw new ValidationError(`Only @${this.config.allowedEmailDomain} accounts can be admins.`)
    }
    return email
  }
}
