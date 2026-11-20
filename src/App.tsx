import { Routes, Route, useParams } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { HomePage } from './pages/HomePage'
import { ModulePage } from './pages/ModulePage'
import { GlossaryPage } from './pages/GlossaryPage'
import { CheatSheetPage } from './pages/CheatSheetPage'
import { ProgressPage } from './pages/ProgressPage'
import { ResourcesPage } from './pages/ResourcesPage'
import { CertificatePage } from './pages/CertificatePage'
import { NotFoundPage } from './pages/NotFoundPage'
import { VerifyPage } from './pages/VerifyPage'
import { SignedOutPage } from './pages/SignedOutPage'
import { AdminPage } from './pages/AdminPage'
import { LearnerProvider } from './lib/LearnerProvider'

/** Remounts the module page per module so quiz answers and other local state start fresh. */
function ModuleRoute() {
  const { id } = useParams()
  return <ModulePage key={id} />
}

function Course() {
  return (
    <LearnerProvider>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/module/:id" element={<ModuleRoute />} />
          <Route path="/glossary" element={<GlossaryPage />} />
          <Route path="/cheatsheet" element={<CheatSheetPage />} />
          <Route path="/progress" element={<ProgressPage />} />
          <Route path="/resources" element={<ResourcesPage />} />
          <Route path="/certificate" element={<CertificatePage />} />
          <Route path="/admin/completions" element={<AdminPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </LearnerProvider>
  )
}

export default function App() {
  return (
    <Routes>
      {/* Public pages: no sign-in and no learner data. */}
      <Route path="/verify" element={<VerifyPage />} />
      <Route path="/signed-out" element={<SignedOutPage />} />
      <Route path="/*" element={<Course />} />
    </Routes>
  )
}
