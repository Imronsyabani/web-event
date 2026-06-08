import api from './api'
import { UseMockData } from '../config'
import { mockApi } from '../mocks/mockApi'

const real = {
  get: () => api.get('/workspace').then((r) => r.data),
  save: (payload) => api.put('/workspace', payload).then((r) => r.data),
  // Cek ketersediaan subdomain workspace
  checkSubdomain: (subdomain) =>
    api.get('/workspace/subdomain/check', { params: { subdomain } }).then((r) => r.data),
}

const mock = {
  get: () => mockApi.getWorkspace(),
  save: (payload) => mockApi.saveWorkspace(payload),
  checkSubdomain: (subdomain) => mockApi.checkSubdomain(subdomain),
}

export const workspaceService = UseMockData ? mock : real
