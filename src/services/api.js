import axios from 'axios'
import { ApiBaseUrl } from '../config'

// Instance axios terpusat untuk semua request ke backend Go
const api = axios.create({
  baseURL: ApiBaseUrl,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

// Sisipkan token auth di setiap request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('we_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Tangani error global (mis. 401 -> logout)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('we_token')
      localStorage.removeItem('we_user')
      // Hindari loop redirect bila sudah di halaman login
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  },
)

export default api
