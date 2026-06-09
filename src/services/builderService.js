import api from './api'
import { UseMockData } from '../config'
import { mockApi } from '../mocks/mockApi'

// Website builder — site per workspace (1 subdomain = 1 workspace)
const real = {
  templates: () => api.get('/builder/templates').then((r) => r.data),
  getSite: () => api.get('/builder/site').then((r) => r.data),
  saveSite: (payload) => api.put('/builder/site', payload).then((r) => r.data),
  publish: () => api.post('/builder/site/publish').then((r) => r.data),
  // Renderer publik (resolusi subdomain)
  publicSite: (subdomain) =>
    api.get(`/sites/by-subdomain/${subdomain}`).then((r) => r.data),
}

const mock = {
  templates: () => mockApi.builderTemplates(),
  getSite: () => mockApi.getSite(),
  saveSite: (payload) => mockApi.saveSite(payload),
  publish: () => mockApi.publishSite(),
  publicSite: (subdomain) => mockApi.getPublicSite(subdomain),
}

export const builderService = UseMockData ? mock : real
