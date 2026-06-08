import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { authService } from '../services/authService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('we_user')
    return raw ? JSON.parse(raw) : null
  })
  const [loading, setLoading] = useState(false)

  const persist = (token, userData) => {
    if (token) localStorage.setItem('we_token', token)
    if (userData) {
      localStorage.setItem('we_user', JSON.stringify(userData))
      setUser(userData)
    }
  }

  const login = async (credentials) => {
    setLoading(true)
    try {
      const data = await authService.login(credentials)
      persist(data.token, data.user)
      return data.user
    } finally {
      setLoading(false)
    }
  }

  const register = async (payload) => {
    setLoading(true)
    try {
      const data = await authService.register(payload)
      persist(data.token, data.user)
      return data.user
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('we_token')
    localStorage.removeItem('we_user')
    setUser(null)
  }

  // Sinkronisasi antar tab
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === 'we_user') {
        setUser(e.newValue ? JSON.parse(e.newValue) : null)
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: !!user,
      hasRole: (role) => user?.role === role,
      login,
      register,
      logout,
    }),
    [user, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth harus dipakai di dalam <AuthProvider>')
  return ctx
}
