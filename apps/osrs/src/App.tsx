import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { OverviewPage } from './pages/OverviewPage'
import { SkillsPage } from './pages/SkillsPage'
import { DailyPage } from './pages/DailyPage'
import { PhasesPage } from './pages/PhasesPage'
import { GpPage } from './pages/GpPage'

export default function App() {
  return (
    <BrowserRouter basename="/apps/osrs">
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Navigate to="/overview" replace />} />
          <Route path="/overview" element={<OverviewPage />} />
          <Route path="/skills" element={<SkillsPage />} />
          <Route path="/daily" element={<DailyPage />} />
          <Route path="/phases" element={<PhasesPage />} />
          <Route path="/gp" element={<GpPage />} />
          <Route path="*" element={<Navigate to="/overview" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
