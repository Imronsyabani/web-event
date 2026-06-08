import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// Membungkus route yang butuh login (dan opsional role tertentu)
export default function ProtectedRoute({ children, roles }) {
  const { isAuthenticated, user } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (roles && roles.length > 0 && !roles.includes(user?.role)) {
    return <Navigate to="/403" replace />
  }

  return children
}
