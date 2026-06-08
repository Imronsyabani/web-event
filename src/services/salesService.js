import api from './api'
import { UseMockData } from '../config'
import { mockApi } from '../mocks/mockApi'

// Agregator penjualan — dipakai grafik penjualan & komponen "pendapatan"
// pada laporan keuangan (laba bersih).
const real = {
  summary: (params) => api.get('/sales/summary', { params }).then((r) => r.data),
}

const mock = {
  summary: (params) => mockApi.salesSummary(params || {}),
}

export const salesService = UseMockData ? mock : real
