import api from './api'
import { UseMockData } from '../config'
import { mockApi } from '../mocks/mockApi'

const real = {
  // Entitlement (plan) akun yang sedang login — sumber kebenaran backend
  get: () => api.get('/account').then((r) => r.data),
  // Ganti plan asli lewat alur billing (bukan dipanggil langsung di UI)
  setPlan: (planCode) =>
    api.post('/account/plan', { planCode }).then((r) => r.data),
}

const mock = {
  get: () => mockApi.getAccount(),
  setPlan: (planCode) => mockApi.setPlan(planCode),
}

export const accountService = UseMockData ? mock : real
