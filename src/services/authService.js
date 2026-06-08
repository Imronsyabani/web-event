import api from './api'
import { UseMockData } from '../config'
import { mockApi } from '../mocks/mockApi'

const real = {
  login: (payload) => api.post('/auth/login', payload).then((r) => r.data),
  register: (payload) => api.post('/auth/register', payload).then((r) => r.data),
  me: () => api.get('/auth/me').then((r) => r.data),
  logout: () => api.post('/auth/logout').then((r) => r.data),
}

const mock = {
  login: (payload) => mockApi.login(payload),
  register: (payload) => mockApi.register(payload),
  me: () => Promise.resolve(null),
  logout: () => Promise.resolve({ ok: true }),
}

export const authService = UseMockData ? mock : real
