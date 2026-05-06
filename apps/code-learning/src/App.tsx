import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import HomePage from './pages/HomePage.tsx'
import LessonPage from './pages/LessonPage.tsx'

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/learn/:languageId" element={<LessonPage />} />
        <Route path="/learn/:languageId/:lessonId" element={<LessonPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
