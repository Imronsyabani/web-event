import api from './api'
import { UseMockData } from '../config'
import { mockApi } from '../mocks/mockApi'

// Waiting queue untuk war ticket
const real = {
  // Masuk antrian sebuah event
  join: (eventId) => api.post(`/queue/${eventId}/join`).then((r) => r.data),
  // Cek posisi & status antrian (token antrian)
  status: (eventId) => api.get(`/queue/${eventId}/status`).then((r) => r.data),
  // Keluar dari antrian
  leave: (eventId) => api.post(`/queue/${eventId}/leave`).then((r) => r.data),
}

const mock = {
  join: (eventId) => mockApi.joinQueue(eventId),
  status: (eventId) => mockApi.queueStatus(eventId),
  leave: (eventId) => mockApi.leaveQueue(eventId),
}

export const queueService = UseMockData ? mock : real
