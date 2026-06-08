import api from './api'
import { UseMockData } from '../config'
import { mockApi } from '../mocks/mockApi'

const real = {
  // kategori (master data)
  listCategories: () => api.get('/budget/categories').then((r) => r.data),
  createCategory: (payload) =>
    api.post('/budget/categories', payload).then((r) => r.data),
  deleteCategory: (id) =>
    api.delete(`/budget/categories/${id}`).then((r) => r.data),
  // entri buku kas
  listEntries: (params) =>
    api.get('/budget/entries', { params }).then((r) => r.data),
  createEntry: (payload) => api.post('/budget/entries', payload).then((r) => r.data),
  deleteEntry: (id) => api.delete(`/budget/entries/${id}`).then((r) => r.data),
  // target anggaran (plan vs aktual)
  listPlans: (params) => api.get('/budget/plans', { params }).then((r) => r.data),
  savePlan: (payload) => api.put('/budget/plans', payload).then((r) => r.data),
}

const mock = {
  listCategories: () => mockApi.listCategories(),
  createCategory: (payload) => mockApi.createCategory(payload),
  deleteCategory: (id) => mockApi.deleteCategory(id),
  listEntries: (params) => mockApi.listBudgetEntries(params || {}),
  createEntry: (payload) => mockApi.createBudgetEntry(payload),
  deleteEntry: (id) => mockApi.deleteBudgetEntry(id),
  listPlans: (params) => mockApi.listBudgetPlans(params || {}),
  savePlan: (payload) => mockApi.saveBudgetPlan(payload),
}

export const budgetService = UseMockData ? mock : real
