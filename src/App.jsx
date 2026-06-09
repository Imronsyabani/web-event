import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'

import PublicLayout from './layouts/PublicLayout'
import DashboardLayout from './layouts/DashboardLayout'
import ProtectedRoute from './routes/ProtectedRoute'
import Loader from './components/common/Loader'
import { Roles } from './config'

// Halaman publik (buyer)
import HomePage from './pages/public/HomePage'
import EventListPage from './pages/public/EventListPage'
import EventDetailPage from './pages/public/EventDetailPage'
import CheckoutPage from './pages/public/CheckoutPage'
import PaymentPage from './pages/public/PaymentPage'
import PaymentStatusPage from './pages/public/PaymentStatusPage'
import WaitingQueuePage from './pages/public/WaitingQueuePage'
import MyTicketsPage from './pages/public/MyTicketsPage'

// Auth
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import AcceptInvitePage from './pages/auth/AcceptInvitePage'

// Staff (lazy: ZXing scanner berat, hanya dimuat saat dibuka)
const ScannerPage = lazy(() => import('./pages/staff/ScannerPage'))

// Owner
import DashboardPage from './pages/owner/DashboardPage'
import WorkspaceSettingsPage from './pages/owner/WorkspaceSettingsPage'
import StaffPage from './pages/owner/StaffPage'
import EventManagePage from './pages/owner/EventManagePage'
import EventFormPage from './pages/owner/EventFormPage'
import WebsiteBuilderPage from './pages/owner/WebsiteBuilderPage'
import BudgetingPage from './pages/owner/BudgetingPage'
import SalesFinancePage from './pages/owner/SalesFinancePage'
import PlanPage from './pages/owner/PlanPage'

// Error
import NotFoundPage from './pages/error/NotFoundPage'
import ForbiddenPage from './pages/error/ForbiddenPage'

export default function App() {
  return (
    <Routes>
      {/* Auth (tanpa layout publik) */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/invite/:token" element={<AcceptInvitePage />} />

      {/* Area publik (buyer) */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/events" element={<EventListPage />} />
        <Route path="/events/:id" element={<EventDetailPage />} />

        <Route
          path="/queue/:eventId"
          element={
            <ProtectedRoute>
              <WaitingQueuePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/checkout/:eventId"
          element={
            <ProtectedRoute>
              <CheckoutPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payment/:orderId"
          element={
            <ProtectedRoute>
              <PaymentPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payment/:orderId/status"
          element={
            <ProtectedRoute>
              <PaymentStatusPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-tickets"
          element={
            <ProtectedRoute>
              <MyTicketsPage />
            </ProtectedRoute>
          }
        />

        <Route path="/403" element={<ForbiddenPage />} />
      </Route>

      {/* Staff scanner */}
      <Route
        path="/staff/scanner"
        element={
          <ProtectedRoute roles={[Roles.Staff, Roles.Admin]}>
            <Suspense fallback={<Loader fullPage label="Memuat scanner..." />}>
              <ScannerPage />
            </Suspense>
          </ProtectedRoute>
        }
      />

      {/* Dashboard owner */}
      <Route
        path="/owner"
        element={
          <ProtectedRoute roles={[Roles.Owner, Roles.Admin]}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="workspace" element={<WorkspaceSettingsPage />} />
        <Route path="staff" element={<StaffPage />} />
        <Route path="events" element={<EventManagePage />} />
        <Route path="events/new" element={<EventFormPage />} />
        <Route path="events/:id/edit" element={<EventFormPage />} />
        <Route path="sales" element={<SalesFinancePage />} />
        <Route path="budgeting" element={<BudgetingPage />} />
        <Route path="builder" element={<WebsiteBuilderPage />} />
        <Route path="builder/:eventId" element={<WebsiteBuilderPage />} />
        <Route path="plan" element={<PlanPage />} />
      </Route>

      {/* Fallback */}
      <Route path="/404" element={<NotFoundPage />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  )
}
