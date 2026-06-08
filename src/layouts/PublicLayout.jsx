import { Outlet } from 'react-router-dom'
import AppNavbar from '../components/layout/AppNavbar'
import AppFooter from '../components/layout/AppFooter'

// Layout untuk halaman publik (buyer): navbar + konten + footer
export default function PublicLayout() {
  return (
    <div className="d-flex flex-column min-vh-100">
      <AppNavbar />
      <main className="flex-grow-1">
        <Outlet />
      </main>
      <AppFooter />
    </div>
  )
}
