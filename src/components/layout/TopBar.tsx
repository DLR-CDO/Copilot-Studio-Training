import { NavLink } from 'react-router-dom'
import { useLearner } from '../../lib/useLearner'
import { overallCompletionRatio } from '../../lib/progress'
import { ProgressRing } from './ProgressRing'

interface TopBarProps {
  onOpenSidebar: () => void
  onOpenSettings: () => void
  onOpenSearch: () => void
}

export function TopBar({ onOpenSidebar, onOpenSettings, onOpenSearch }: TopBarProps) {
  const { state, setTheme, session, serverStatus } = useLearner()
  const ratio = overallCompletionRatio(state)
  const isDark = state.theme === 'dark'
  const user = session.mode === 'server' ? session.user : null
  const navItems = [
    { to: '/', label: 'Home' },
    { to: '/progress', label: 'Progress' },
    ...(user ? [{ to: '/certificate', label: 'My Certificate' }] : []),
    { to: '/glossary', label: 'Glossary' },
    { to: '/cheatsheet', label: 'Cheat sheet' },
    { to: '/resources', label: 'Resources' },
    { to: '/help', label: 'Help' },
    ...(user?.isAdmin ? [{ to: '/admin/completions', label: 'Admin' }] : []),
  ]

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-card/95 backdrop-blur print:hidden">
      <div className="mx-auto flex max-w-[1400px] items-center gap-3 px-4 py-3 sm:px-6">
        <button
          type="button"
          className="rounded-pill border border-line px-3 py-1.5 font-mono text-xs uppercase tracking-wide lg:hidden"
          onClick={onOpenSidebar}
          aria-label="Open module navigation"
        >
          Menu
        </button>

        <div className="min-w-0 flex-1">
          <p className="hidden font-mono text-[11px] uppercase tracking-[0.14em] text-teal sm:block">
            Digital Realty
          </p>
          <p className="font-display text-base font-bold leading-tight sm:truncate sm:text-xl">
            <span className="sm:hidden">Copilot Studio Fundamentals</span>
            <span className="hidden sm:inline">
              Copilot Studio Fundamentals: Build Your First Agent
            </span>
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenSearch}
          className="inline-flex shrink-0 items-center gap-2 rounded-pill border border-line px-3 py-1.5 font-mono text-xs text-muted hover:border-violet hover:text-ink"
          aria-label="Search course (Ctrl+K)"
        >
          <span aria-hidden="true">⌕</span>
          <span className="hidden sm:inline">Search</span>
          <kbd className="hidden rounded border border-line px-1.5 py-0.5 text-[10px] sm:inline">
            Ctrl+K
          </kbd>
        </button>

        <button
          type="button"
          onClick={() => setTheme(isDark ? 'light' : 'dark')}
          className="hidden rounded-pill border border-line px-3 py-1.5 font-mono text-xs uppercase tracking-wide hover:border-violet sm:inline-block"
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          aria-pressed={isDark}
          title={isDark ? 'Light mode' : 'Dark mode'}
        >
          {isDark ? 'Light' : 'Dark'}
        </button>

        <button
          type="button"
          onClick={onOpenSettings}
          className="rounded-pill border border-line px-3 py-1.5 font-mono text-xs uppercase tracking-wide hover:border-violet"
        >
          Settings
        </button>

        <span className="hidden sm:block">
          <ProgressRing ratio={ratio} size={40} />
        </span>

        {user ? (
          <div className="hidden min-w-0 max-w-[14rem] shrink text-right sm:block">
            <p className="truncate text-sm font-semibold" title={user.email}>
              {serverStatus?.name || user.email}
            </p>
            <a
              href={user.logoutUrl}
              className="font-mono text-[11px] uppercase tracking-wide text-muted hover:text-ink"
            >
              Sign out
            </a>
          </div>
        ) : null}
      </div>

      <nav
        className="hidden border-t border-line bg-paper/80 px-4 py-2 sm:block sm:px-6"
        aria-label="Site sections"
      >
        <ul className="mx-auto flex max-w-[1400px] flex-wrap gap-x-4 gap-y-1 font-mono text-xs uppercase tracking-wide">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  isActive ? 'text-violet' : 'text-muted hover:text-ink'
                }
                end={item.to === '/'}
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  )
}
