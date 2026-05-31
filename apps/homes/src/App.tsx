import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { ListingsPage } from './pages/ListingsPage'
import { FavoritesPage } from './pages/FavoritesPage'
import { DismissedPage } from './pages/DismissedPage'

export default function App() {
  return (
    <BrowserRouter basename="/apps/homes">
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Navigate to="/listings" replace />} />
          <Route path="/listings" element={<ListingsPage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/dismissed" element={<DismissedPage />} />
          <Route path="*" element={<Navigate to="/listings" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
