import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import AppShell from './components/layout/AppShell'
import TodayPage from './pages/TodayPage'
import PlanPage from './pages/PlanPage'
import LogPage from './pages/LogPage'
import HistoryPage from './pages/HistoryPage'
import BodyWeightPage from './pages/BodyWeightPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30,
      retry: 1,
    },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <Routes>
          <Route element={<AppShell />}>
            <Route path="/" element={<TodayPage />} />
            <Route path="/plan" element={<PlanPage />} />
            <Route path="/log/:dayIndex" element={<LogPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/body-weight" element={<BodyWeightPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
