import { Outlet } from 'react-router-dom'
import Navbar from './Navbar.tsx'

export default function AppShell() {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-50">
      <Navbar />
      <div className="flex-1 overflow-hidden">
        <Outlet />
      </div>
    </div>
  )
}
