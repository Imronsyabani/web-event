import api from './api'
import { UseMockData } from '../config'
import { mockApi } from '../mocks/mockApi'

// Website builder untuk owner event (pilih template + konten)
const real = {
  templates: () => api.get('/builder/templates').then((r) => r.data),
  // Ambil konfigurasi website sebuah event
  getSite: (eventId) => api.get(`/builder/${eventId}`).then((r) => r.data),
  // Simpan konfigurasi website (template, section, tema)
  saveSite: (eventId, payload) =>
    api.put(`/builder/${eventId}`, payload).then((r) => r.data),
  // Publish website
  publish: (eventId) =>
    api.post(`/builder/${eventId}/publish`).then((r) => r.data),
}

const mock = {
  templates: () => mockApi.builderTemplates(),
  getSite: (eventId) => mockApi.getSite(eventId),
  saveSite: (eventId, payload) => mockApi.saveSite(eventId, payload),
  publish: (eventId) => mockApi.publishSite(eventId),
}

export const builderService = UseMockData ? mock : real
