import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getModuleById } from '../content/modules'
import { useLearner } from '../lib/useLearner'
import {
  canMarkModuleComplete,
  getModuleProgress,
  getModuleStatus,
  isModuleUnlocked,
  isQuizPassed,
} from '../lib/progress'
import { ModuleDiagram } from '../components/diagrams'
import { ConceptSection } from '../components/module/ConceptSection'
import { BuildStepper } from '../components/module/BuildStepper'
import { WatchOut } from '../components/module/WatchOut'
import { ScreenshotFigure } from '../components/module/ScreenshotFigure'
import { HarnessBanner, HarnessTag } from '../components/module/Harness'
import { TryIt } from '../components/module/TryIt'
import { GoDeeper } from '../components/module/GoDeeper'
import { ModuleFooterNav } from '../components/module/ModuleFooterNav'
import { ModuleMiniMap } from '../components/module/ModuleMiniMap'
import { NotesBox } from '../components/module/NotesBox'
import { Quiz } from '../components/module/Quiz'
import { MODULE_QUIZ_SIZE, passPercentFor } from '../lib/assessments'
import { Celebration } from '../components/module/Celebration'
import { Callout } from '../components/ui/Callout'
import { formatMinutes, freshnessLine } from '../lib/moduleMeta'

export function ModulePage() {
  const { id } = useParams()
  const moduleId = Number(id)
  const { state, updateModule } = useLearner()
  const [celebrate, setCelebrate] = useState(false)

  // The page is keyed by module id, so this runs once per module visit.
  useEffect(() => {
    // Deep links with a hash (search results) are scrolled by useHashHighlight instead.
    if (window.location.hash) return
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [])

  const mod = getModuleById(moduleId)

  const progress = getModuleProgress(state, moduleId)
  const unlocked = isModuleUnlocked(state, moduleId)
  const status = getModuleStatus(state, moduleId)

  const stepIds = useMemo(() => mod?.buildSteps.map((s) => s.id) ?? [], [mod])
  const passPercent = passPercentFor(String(moduleId))

  const completion = useMemo(() => {
    if (!mod) return { ready: false, remaining: ['Module not found'] }
    // Treat build steps as the checklist gate. The quiz must be passed at the module's pass mark.
    return canMarkModuleComplete(
      {
        ...progress,
        checklist: Object.fromEntries(
          stepIds.map((sid) => [sid, progress.buildSteps[sid] === true]),
        ),
      },
      { checklistIds: stepIds, requireTryIt: true, passPercent },
    )
  }, [mod, progress, stepIds, passPercent])

  const onToggleStep = useCallback(
    (stepId: string, value: boolean) => {
      updateModule(moduleId, {
        buildSteps: { ...progress.buildSteps, [stepId]: value },
      })
    },
    [moduleId, progress.buildSteps, updateModule],
  )

  const onToggleTryIt = useCallback(
    (done: boolean) => {
      updateModule(moduleId, { tryItDone: done })
    },
    [moduleId, updateModule],
  )

  const onNotes = useCallback(
    (notes: string) => {
      updateModule(moduleId, { notes })
    },
    [moduleId, updateModule],
  )

  const onMarkComplete = useCallback(() => {
    if (!completion.ready || progress.completed) return
    updateModule(moduleId, { completed: true })
    setCelebrate(true)
  }, [completion.ready, progress.completed, moduleId, updateModule])

  if (!mod || !Number.isInteger(moduleId) || moduleId < 1 || moduleId > 10) {
    return (
      <div className="mx-auto max-w-xl py-16 text-center">
        <h1 className="font-display text-2xl font-bold">Module not found</h1>
        <Link to="/" className="mt-4 inline-block text-violet underline">
          Back home
        </Link>
      </div>
    )
  }

  const miniSections = [
    { id: 'concept', label: 'In plain words', done: true },
    { id: 'diagram', label: 'Diagram', done: true },
    {
      id: 'build',
      label: 'Build it',
      done: stepIds.every((sid) => progress.buildSteps[sid]),
    },
    { id: 'watch-out', label: 'Watch out', done: true },
    ...(mod.screenshots.length > 0
      ? [{ id: 'screenshots', label: 'Screenshots', done: true }]
      : []),
    { id: 'try-it', label: 'Try it', done: progress.tryItDone },
    {
      id: 'quiz',
      label: 'Knowledge check',
      done: isQuizPassed(progress, passPercent),
    },
    { id: 'notes', label: 'My notes', done: progress.notes.trim().length > 0 },
    { id: 'go-deeper', label: 'Go deeper', done: true },
  ]

  return (
    <div className="flex gap-8">
      <article className="mx-auto min-w-0 max-w-3xl flex-1 print:max-w-none">
        {!unlocked ? (
          <div
            role="status"
            className="mb-4 rounded-block border-l-4 border-sun bg-sun-soft px-4 py-3 text-sm"
          >
            This module is still locked in the recommended path. You can read ahead, but the quiz
            stays disabled until you complete prior modules — or turn on <strong>Free roam</strong>{' '}
            in Settings.
          </div>
        ) : null}

        {mod.harness === 'standard' ? <HarnessBanner className="mb-4" /> : null}

        <header className="rounded-card border border-line bg-card p-6 sm:p-8">
          <div className="flex flex-wrap items-baseline gap-4">
            <span className="font-display text-4xl font-extrabold text-violet">
              {String(moduleId).padStart(2, '0')}
            </span>
            <h1 className="font-display text-[26px] font-bold tracking-tight">{mod.title}</h1>
            <span className="rounded-pill border border-line px-3 py-1 font-mono text-xs capitalize text-muted">
              {status}
            </span>
            <HarnessTag harness={mod.harness} />
          </div>
          <p className="mt-2 font-mono text-xs text-muted">{freshnessLine(mod)}</p>
          <div className="mt-4">
            <Callout variant="why">
              <strong className="text-teal">Why it matters:</strong> {mod.whyItMatters}
            </Callout>
          </div>
          <p className="mt-3 font-mono text-xs text-muted">
            Estimated time: {formatMinutes(mod.estimatedMinutes)}
          </p>
          <div className="mt-4 flex flex-wrap gap-2 print:hidden">
            <button
              type="button"
              onClick={() => window.print()}
              className="rounded-pill border border-line px-3 py-1.5 font-mono text-xs uppercase tracking-wide hover:border-violet"
            >
              Print summary
            </button>
          </div>
        </header>

        <div className="mt-10 space-y-10">
          <ConceptSection blocks={mod.concept} goodToKnow={mod.goodToKnow} />

          <section id="diagram" className="scroll-mt-28">
            <h2 className="mb-3 font-display text-sm font-bold uppercase tracking-[0.06em]">
              Diagram
            </h2>
            <ModuleDiagram id={mod.diagram} />
          </section>

          <BuildStepper
            steps={mod.buildSteps}
            checked={progress.buildSteps}
            onToggle={onToggleStep}
          />

          <WatchOut items={mod.watchOuts} />

          {mod.screenshots.length > 0 ? (
            <section id="screenshots" className="scroll-mt-28 space-y-4">
              <h2 className="font-display text-sm font-bold uppercase tracking-[0.06em]">
                Screenshots
              </h2>
              {mod.screenshots.map((shot) => (
                <ScreenshotFigure key={shot.id} shot={shot} />
              ))}
            </section>
          ) : null}

          <TryIt text={mod.tryIt} done={progress.tryItDone} onToggle={onToggleTryIt} />

          <Quiz
            scope={String(moduleId)}
            summary={`${MODULE_QUIZ_SIZE} questions drawn at random · pass mark ${passPercent}%`}
            locked={!unlocked}
            bestPercent={progress.quizBestPercent}
            attempts={progress.quizAttempts}
          />

          <NotesBox value={progress.notes} onChange={onNotes} />

          <GoDeeper links={mod.goDeeper} />
        </div>

        <ModuleFooterNav
          moduleId={moduleId}
          canComplete={completion.ready}
          remaining={completion.remaining}
          completed={progress.completed}
          onMarkComplete={onMarkComplete}
        />
      </article>

      <ModuleMiniMap sections={miniSections} />

      <Celebration active={celebrate} onDone={() => setCelebrate(false)} />
    </div>
  )
}
