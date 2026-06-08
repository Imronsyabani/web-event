import api from './api'
import { UseMockData } from '../config'
import { mockApi } from '../mocks/mockApi'

const real = {
  // Buat transaksi pembayaran untuk sebuah order
  create: (payload) => api.post('/payments', payload).then((r) => r.data),
  // Cek status pembayaran
  status: (paymentId) =>
    api.get(`/payments/${paymentId}/status`).then((r) => r.data),
  methods: () => api.get('/payments/methods').then((r) => r.data),
}

const mock = {
  create: (payload) => mockApi.createPayment(payload),
  status: (paymentId) => mockApi.paymentStatus(paymentId),
  methods: () => mockApi.paymentMethods(),
}

export const paymentService = UseMockData ? mock : real
