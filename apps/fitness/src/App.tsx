import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import AppShell from './components/layout/AppShell'
import TodayPage from './pages/TodayPage'
import CalendarPage from './pages/CalendarPage'
import TemplatesPage from './pages/TemplatesPage'
import HistoryPage from './pages/HistoryPage'
import BodyWeightPage from './pages/BodyWeightPage'

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 1000 * 30, retry: 1 } },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <Routes>
          <Route element={<AppShell />}>
            <Route path="/" element={<TodayPage />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/templates" element={<TemplatesPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/body-weight" element={<BodyWeightPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
