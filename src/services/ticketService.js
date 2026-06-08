import api from './api'
import { UseMockData } from '../config'
import { mockApi } from '../mocks/mockApi'

const real = {
  // Daftar tipe tiket untuk sebuah event
  listByEvent: (eventId) =>
    api.get(`/events/${eventId}/tickets`).then((r) => r.data),
  // Pesan/checkout tiket
  order: (payload) => api.post('/orders', payload).then((r) => r.data),
  getOrder: (orderId) => api.get(`/orders/${orderId}`).then((r) => r.data),
  myTickets: () => api.get('/tickets/mine').then((r) => r.data),
  // Validasi tiket via scanner staff (kode QR)
  scan: (code) => api.post('/tickets/scan', { code }).then((r) => r.data),
}

const mock = {
  listByEvent: (eventId) => mockApi.listTicketsByEvent(eventId),
  order: (payload) => mockApi.createOrder(payload),
  getOrder: (orderId) => mockApi.getOrder(orderId),
  myTickets: () => mockApi.myTickets(),
  scan: (code) => mockApi.scanTicket(code),
}

export const ticketService = UseMockData ? mock : real
