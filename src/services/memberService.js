import api from './api'
import { UseMockData } from '../config'
import { mockApi } from '../mocks/mockApi'

// Anggota workspace (staff) — semua terikat workspace aktif (scope di backend)
const real = {
  list: () => api.get('/workspace/members').then((r) => r.data),
  invite: (payload) =>
    api.post('/workspace/members/invite', payload).then((r) => r.data),
  updateRoles: (id, roles) =>
    api.put(`/workspace/members/${id}/roles`, { roles }).then((r) => r.data),
  revoke: (id) => api.delete(`/workspace/members/${id}`).then((r) => r.data),
  getInvite: (token) => api.get(`/invites/${token}`).then((r) => r.data),
  acceptInvite: (payload) =>
    api.post('/invites/accept', payload).then((r) => r.data),
}

const mock = {
  list: () => mockApi.listMembers(),
  invite: (payload) => mockApi.inviteMember(payload),
  updateRoles: (id, roles) => mockApi.updateMemberRoles(id, roles),
  revoke: (id) => mockApi.revokeMember(id),
  getInvite: (token) => mockApi.getInvite(token),
  acceptInvite: (payload) => mockApi.acceptInvite(payload),
}

export const memberService = UseMockData ? mock : real
