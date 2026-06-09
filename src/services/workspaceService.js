import api from './api'
import { UseMockData } from '../config'
import { mockApi } from '../mocks/mockApi'

const real = {
  list: () => api.get('/workspaces').then((r) => r.data),
  get: () => api.get('/workspace').then((r) => r.data),
  save: (payload) => api.put('/workspace', payload).then((r) => r.data),
  create: (payload) => api.post('/workspaces', payload).then((r) => r.data),
  switch: (id) => api.post(`/workspaces/${id}/switch`).then((r) => r.data),
  bySubdomain: (sub) =>
    api.get(`/sites/by-subdomain/${sub}`).then((r) => r.data),
  checkSubdomain: (subdomain) =>
    api.get('/workspace/subdomain/check', { params: { subdomain } }).then((r) => r.data),
}

const mock = {
  list: () => mockApi.listWorkspaces(),
  get: () => mockApi.getWorkspace(),
  save: (payload) => mockApi.saveWorkspace(payload),
  create: (payload) => mockApi.createWorkspace(payload),
  switch: (id) => mockApi.switchWorkspace(id),
  bySubdomain: (sub) => mockApi.getWorkspaceBySubdomain(sub),
  checkSubdomain: (subdomain) => mockApi.checkSubdomain(subdomain),
}

export const workspaceService = UseMockData ? mock : real
