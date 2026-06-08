import api from './api'
import { UseMockData } from '../config'
import { mockApi } from '../mocks/mockApi'

const real = {
  list: (params) => api.get('/events', { params }).then((r) => r.data),
  get: (id) => api.get(`/events/${id}`).then((r) => r.data),
  create: (payload) => api.post('/events', payload).then((r) => r.data),
  update: (id, payload) => api.put(`/events/${id}`, payload).then((r) => r.data),
  remove: (id) => api.delete(`/events/${id}`).then((r) => r.data),
  // Daftar event milik owner yang sedang login
  mine: (params) => api.get('/events/mine', { params }).then((r) => r.data),
}

const mock = {
  list: () => mockApi.listEvents(),
  get: (id) => mockApi.getEvent(id),
  create: (payload) => mockApi.createEvent(payload),
  update: (id, payload) => mockApi.updateEvent(id, payload),
  remove: (id) => mockApi.deleteEvent(id),
  mine: () => mockApi.listEventsByOwner(),
}

export const eventService = UseMockData ? mock : real
