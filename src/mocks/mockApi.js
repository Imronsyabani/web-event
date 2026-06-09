// Mock API stateful untuk demo tanpa backend.
// State workspace/event/order/payment/queue/tiket disimpan di localStorage.
import {
  workspace as seedWorkspace,
  events as seedEvents,
  ticketsByEvent,
  paymentMethods,
  builderTemplates,
  demoUsers,
} from './data'

const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms))

// ---- helper localStorage ----
const read = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}
const write = (key, value) => localStorage.setItem(key, JSON.stringify(value))

const KEYS = {
  account: 'we_mock_account',
  workspace: 'we_mock_workspace',
  events: 'we_mock_events',
  orders: 'we_mock_orders',
  payments: 'we_mock_payments',
  queue: 'we_mock_queue',
  tickets: 'we_mock_tickets',
  sites: 'we_mock_sites',
  budgetCategories: 'we_mock_budget_categories',
  budgetEntries: 'we_mock_budget_entries',
  budgetPlans: 'we_mock_budget_plans',
  sales: 'we_mock_sales',
  members: 'we_mock_members',
}

const RESERVED_SUBDOMAINS = ['www', 'api', 'admin', 'app', 'mail', 'static', 'cdn']

const rand = (n) => Math.floor(Math.random() * n)
const pad = () =>
  Array.from({ length: 4 }, () => '0123456789ABCDEFGHJKLMNPQRSTUVWXYZ'[rand(34)]).join('')
const genCode = () => `TKT-${pad()}-${pad()}`
const genId = (prefix) => `${prefix}-${Date.now().toString(36)}-${pad()}`

// ---- store event terstruktur (di-seed dari data dummy) ----
function eventStore() {
  let list = read(KEYS.events, null)
  if (list) return list
  list = seedEvents.map((ev) => ({
    ...ev,
    workspaceId: seedWorkspace.id,
    venue: {
      name: ev.location,
      address: ev.location,
      mapUrl: '',
    },
    tickets: ticketsByEvent[ev.id] || [],
    paymentConfig: { methods: paymentMethods.map((m) => m.code) },
  }))
  write(KEYS.events, list)
  return list
}
const saveEvents = (list) => write(KEYS.events, list)
const findEvent = (id) => eventStore().find((e) => e.id === id)

// Seed beberapa tiket demo agar "Tiket Saya" & scanner tidak kosong
function seedTickets() {
  let list = read(KEYS.tickets, null)
  if (list) return list
  list = [
    {
      id: genId('tkt'),
      code: 'TKT-DEMO-0001',
      eventTitle: 'Tech Summit Jakarta 2026',
      eventStartAt: '2026-09-02T09:00:00',
      ticketName: 'Regular',
      holderName: 'Budi Pembeli',
      used: false,
    },
    {
      id: genId('tkt'),
      code: 'TKT-DEMO-0002',
      eventTitle: 'Stand Up Comedy Night',
      eventStartAt: '2026-07-20T20:00:00',
      ticketName: 'Reguler',
      holderName: 'Budi Pembeli',
      used: true,
    },
  ]
  write(KEYS.tickets, list)
  return list
}

// Seed kategori budget (master data per workspace)
function seedCategories() {
  let list = read(KEYS.budgetCategories, null)
  if (list) return list
  const ws = seedWorkspace.id
  const mk = (name, type) => ({ id: genId('cat'), workspaceId: ws, name, type })
  list = [
    mk('Konsumsi', 'expense'),
    mk('Venue', 'expense'),
    mk('Marketing', 'expense'),
    mk('Vendor', 'expense'),
    mk('Operasional', 'expense'),
    mk('Lainnya', 'expense'),
    mk('Sponsor', 'income'),
    mk('Merchandise', 'income'),
    mk('Donasi', 'income'),
    mk('Lainnya', 'income'),
  ]
  write(KEYS.budgetCategories, list)
  return list
}

// Seed data penjualan demo agar grafik tidak kosong
function seedSales() {
  let list = read(KEYS.sales, null)
  if (list) return list
  list = []
  const now = Date.now()
  const DAY = 86400000
  eventStore()
    .filter((e) => e.published)
    .forEach((ev) => {
      (ev.tickets || []).forEach((tk) => {
        // sebar penjualan selama 14 hari terakhir
        for (let d = 13; d >= 0; d--) {
          const count = rand(4) // 0-3 order per hari per tipe
          for (let i = 0; i < count; i++) {
            const qty = 1 + rand(3)
            const roll = rand(10)
            const status = roll < 8 ? 'paid' : roll < 9 ? 'pending' : 'expired'
            list.push({
              id: genId('sale'),
              eventId: ev.id,
              eventTitle: ev.title,
              ticketId: tk.id,
              ticketName: tk.name,
              qty,
              amount: tk.price * qty,
              status,
              date: new Date(now - d * DAY).toISOString().slice(0, 10),
            })
          }
        }
      })
    })
  write(KEYS.sales, list)
  return list
}

// Seed anggota workspace (semua terikat workspaceId → owner)
function seedMembers() {
  let list = read(KEYS.members, null)
  if (list) return list
  const ws = seedWorkspace.id
  list = [
    {
      id: genId('mbr'),
      workspaceId: ws,
      userId: seedWorkspace.ownerId,
      name: 'Owner Demo',
      email: 'owner@demo.id',
      roles: ['owner'],
      status: 'active',
      invitedBy: null,
      acceptedAt: Date.now(),
    },
    {
      id: genId('mbr'),
      workspaceId: ws,
      userId: 'u-admin1',
      name: 'Andi Administrator',
      email: 'andi@demo.id',
      roles: ['administrator'],
      status: 'active',
      invitedBy: 'owner@demo.id',
      acceptedAt: Date.now(),
    },
    {
      id: genId('mbr'),
      workspaceId: ws,
      userId: 'u-fin1',
      name: 'Fina Finance',
      email: 'fina@demo.id',
      roles: ['staff-finance'],
      status: 'active',
      invitedBy: 'owner@demo.id',
      acceptedAt: Date.now(),
    },
    {
      id: genId('mbr'),
      workspaceId: ws,
      userId: 'u-staff',
      name: 'Sari Staff',
      email: 'staff@demo.id',
      roles: ['staff'],
      status: 'active',
      invitedBy: 'andi@demo.id',
      acceptedAt: Date.now(),
    },
    {
      id: genId('mbr'),
      workspaceId: ws,
      userId: null,
      name: null,
      email: 'calon@demo.id',
      roles: ['staff'],
      status: 'invited',
      token: 'INV-DEMO-1234',
      invitedBy: 'owner@demo.id',
      invitedAt: Date.now(),
    },
  ]
  write(KEYS.members, list)
  return list
}

export const mockApi = {
  // ---------- AUTH ----------
  async login({ email }) {
    await delay()
    const user =
      demoUsers.find((u) => u.email === email) || {
        id: 'u-buyer',
        name: email?.split('@')[0] || 'Pengguna',
        email,
        role: 'buyer',
      }
    return { token: `mock-token-${user.id}`, user }
  },
  async register({ name, email, role }) {
    await delay()
    const user = { id: genId('u'), name, email, role: role || 'buyer' }
    return { token: `mock-token-${user.id}`, user }
  },

  // ---------- ACCOUNT / PLAN ----------
  async getAccount() {
    await delay(150)
    const stored = read(KEYS.account, null)
    // Default demo: akun owner = Pro agar fitur Pro bisa dilihat.
    // Setiap akun terikat ke owner (ownerId) — konsistensi kepemilikan data.
    return (
      stored || {
        ownerId: seedWorkspace.ownerId,
        planCode: 'pro',
        status: 'active',
        defaultWorkspaceId: seedWorkspace.id,
      }
    )
  },
  async setPlan(planCode) {
    await delay(150)
    const current = read(KEYS.account, {
      ownerId: seedWorkspace.ownerId,
      status: 'active',
      defaultWorkspaceId: seedWorkspace.id,
    })
    const next = { ...current, planCode }
    write(KEYS.account, next)
    return next
  },

  // ---------- WORKSPACE ----------
  async getWorkspace() {
    await delay()
    return read(KEYS.workspace, seedWorkspace)
  },
  async saveWorkspace(payload) {
    await delay()
    const current = read(KEYS.workspace, seedWorkspace)
    const next = { ...current, ...payload }
    write(KEYS.workspace, next)
    return next
  },
  async checkSubdomain(subdomain) {
    await delay(200)
    const sub = (subdomain || '').toLowerCase()
    const valid = /^[a-z0-9](?:[a-z0-9-]{1,30}[a-z0-9])?$/.test(sub)
    const current = read(KEYS.workspace, seedWorkspace)
    const reserved = RESERVED_SUBDOMAINS.includes(sub)
    // Tersedia bila format valid, bukan reserved (atau milik workspace ini)
    const available = valid && (!reserved || sub === current.subdomain)
    return { subdomain: sub, valid, reserved, available }
  },

  // ---------- EVENTS ----------
  async listEvents() {
    await delay()
    return { items: eventStore().filter((e) => e.published) }
  },
  async getEvent(id) {
    await delay()
    const ev = findEvent(id)
    if (!ev) throw { response: { status: 404 } }
    return ev
  },
  async listEventsByOwner() {
    await delay()
    return { items: eventStore() }
  },
  async createEvent(payload) {
    await delay()
    const list = eventStore()
    const ev = {
      id: genId('evt'),
      workspaceId: seedWorkspace.id,
      tickets: [],
      paymentConfig: { methods: [] },
      ...payload,
    }
    list.unshift(ev)
    saveEvents(list)
    return ev
  },
  async updateEvent(id, payload) {
    await delay()
    const list = eventStore()
    const idx = list.findIndex((e) => e.id === id)
    if (idx === -1) throw { response: { status: 404 } }
    list[idx] = { ...list[idx], ...payload, id }
    saveEvents(list)
    return list[idx]
  },
  async deleteEvent(id) {
    await delay()
    saveEvents(eventStore().filter((e) => e.id !== id))
    return { ok: true }
  },

  // ---------- TICKETS ----------
  async listTicketsByEvent(eventId) {
    await delay()
    const ev = findEvent(eventId)
    return { items: ev?.tickets || [] }
  },
  async createOrder({ eventId, items }) {
    await delay()
    const ev = findEvent(eventId)
    const tickets = ev?.tickets || []
    const total = items.reduce((sum, it) => {
      const t = tickets.find((x) => x.id === it.ticketId)
      return sum + (t ? t.price * it.qty : 0)
    }, 0)
    const order = {
      id: genId('ord'),
      eventId,
      eventTitle: ev?.title,
      items,
      total,
      status: 'pending',
      createdAt: Date.now(),
    }
    const orders = read(KEYS.orders, {})
    orders[order.id] = order
    write(KEYS.orders, orders)
    return order
  },
  async getOrder(orderId) {
    await delay()
    const orders = read(KEYS.orders, {})
    return orders[orderId] || { id: orderId, total: 0, status: 'pending' }
  },
  async myTickets() {
    await delay()
    return { items: seedTickets() }
  },

  // ---------- PAYMENTS ----------
  async paymentMethods() {
    await delay(200)
    return { items: paymentMethods }
  },
  async createPayment({ orderId, method }) {
    await delay()
    const orders = read(KEYS.orders, {})
    const order = orders[orderId]
    const payment = {
      id: genId('pay'),
      orderId,
      method,
      amount: order?.total || 0,
      status: 'pending',
      createdAt: Date.now(),
    }
    const payments = read(KEYS.payments, {})
    payments[payment.id] = payment
    write(KEYS.payments, payments)
    return payment
  },
  async paymentStatus(paymentId) {
    await delay(300)
    const payments = read(KEYS.payments, {})
    const payment = payments[paymentId]
    if (!payment) return { id: paymentId, status: 'pending', amount: 0 }
    // Simulasi: lunas otomatis setelah 8 detik
    if (payment.status === 'pending' && Date.now() - payment.createdAt > 8000) {
      payment.status = 'paid'
      payments[paymentId] = payment
      write(KEYS.payments, payments)
      issueTicketsForOrder(payment.orderId)
    }
    return payment
  },

  // ---------- QUEUE (war ticket) ----------
  async joinQueue(eventId) {
    await delay()
    const queue = read(KEYS.queue, {})
    const entry = {
      eventId,
      position: 5 + rand(8),
      startAt: Date.now(),
      status: 'waiting',
    }
    queue[eventId] = entry
    write(KEYS.queue, queue)
    return computeQueue(entry)
  },
  async queueStatus(eventId) {
    await delay(250)
    const queue = read(KEYS.queue, {})
    const entry = queue[eventId]
    if (!entry) return { eventId, status: 'none' }
    const result = computeQueue(entry)
    queue[eventId] = result
    write(KEYS.queue, queue)
    return result
  },
  async leaveQueue(eventId) {
    await delay(200)
    const queue = read(KEYS.queue, {})
    delete queue[eventId]
    write(KEYS.queue, queue)
    return { eventId, status: 'none' }
  },

  // ---------- SCANNER ----------
  async scanTicket(code) {
    await delay(250)
    const tickets = seedTickets()
    const t = tickets.find((x) => x.code === code?.toUpperCase())
    if (!t) {
      if (/^TKT-[A-Z0-9]{4}-[A-Z0-9]{4}$/i.test(code || '')) {
        return {
          valid: true,
          message: 'Tiket valid (demo).',
          ticket: {
            eventTitle: 'Event Demo',
            ticketName: 'Reguler',
            holderName: 'Tamu',
          },
        }
      }
      return { valid: false, message: 'Kode tiket tidak dikenal.' }
    }
    if (t.used) {
      return { valid: false, message: 'Tiket sudah pernah dipakai.', ticket: t }
    }
    t.used = true
    write(KEYS.tickets, tickets)
    return { valid: true, message: 'Check-in berhasil!', ticket: t }
  },

  // ---------- WORKSPACE MEMBERS (staff) ----------
  async listMembers() {
    await delay()
    return { items: seedMembers() }
  },
  async inviteMember({ email, roles }) {
    await delay()
    const list = seedMembers()
    const member = {
      id: genId('mbr'),
      workspaceId: seedWorkspace.id,
      userId: null,
      name: null,
      email,
      roles: roles || ['staff'],
      status: 'invited',
      token: `INV-${pad()}-${pad()}`,
      invitedAt: Date.now(),
    }
    list.push(member)
    write(KEYS.members, list)
    return member
  },
  async updateMemberRoles(id, roles) {
    await delay(200)
    const list = seedMembers()
    const idx = list.findIndex((m) => m.id === id)
    if (idx === -1) throw { response: { status: 404 } }
    list[idx] = { ...list[idx], roles }
    write(KEYS.members, list)
    return list[idx]
  },
  async revokeMember(id) {
    await delay(200)
    write(KEYS.members, seedMembers().filter((m) => m.id !== id))
    return { ok: true }
  },
  // Detail undangan untuk halaman terima
  async getInvite(token) {
    await delay(200)
    const m = seedMembers().find((x) => x.token === token && x.status === 'invited')
    if (!m) throw { response: { status: 404 } }
    const ws = read(KEYS.workspace, seedWorkspace)
    return {
      email: m.email,
      roles: m.roles,
      workspaceName: ws.name,
      invitedBy: m.invitedBy,
    }
  },
  async acceptInvite({ token, name }) {
    await delay()
    const list = seedMembers()
    const idx = list.findIndex((m) => m.token === token && m.status === 'invited')
    if (idx === -1) throw { response: { status: 404 } }
    list[idx] = {
      ...list[idx],
      status: 'active',
      name: name || list[idx].email,
      userId: genId('u'),
      acceptedAt: Date.now(),
    }
    write(KEYS.members, list)
    return list[idx]
  },

  // ---------- BUDGET CATEGORIES (master data) ----------
  async listCategories() {
    await delay(150)
    return { items: seedCategories() }
  },
  async createCategory({ name, type }) {
    await delay(200)
    const list = seedCategories()
    const cat = { id: genId('cat'), workspaceId: seedWorkspace.id, name, type }
    list.push(cat)
    write(KEYS.budgetCategories, list)
    return cat
  },
  async deleteCategory(id) {
    await delay(150)
    write(KEYS.budgetCategories, seedCategories().filter((c) => c.id !== id))
    return { ok: true }
  },

  // ---------- BUDGET ENTRIES (buku kas) ----------
  async listBudgetEntries({ eventId } = {}) {
    await delay()
    let list = read(KEYS.budgetEntries, [])
    if (eventId) list = list.filter((e) => e.eventId === eventId)
    return { items: list.sort((a, b) => (a.transactionDate < b.transactionDate ? 1 : -1)) }
  },
  async createBudgetEntry(payload) {
    await delay()
    const list = read(KEYS.budgetEntries, [])
    const entry = {
      id: genId('be'),
      workspaceId: seedWorkspace.id,
      createdAt: Date.now(),
      ...payload,
    }
    list.push(entry)
    write(KEYS.budgetEntries, list)
    return entry
  },
  async deleteBudgetEntry(id) {
    await delay(150)
    write(KEYS.budgetEntries, read(KEYS.budgetEntries, []).filter((e) => e.id !== id))
    return { ok: true }
  },

  // ---------- BUDGET PLANS (target anggaran) ----------
  async listBudgetPlans({ eventId } = {}) {
    await delay(200)
    let list = read(KEYS.budgetPlans, [])
    if (eventId) list = list.filter((p) => p.eventId === eventId)
    return { items: list }
  },
  async saveBudgetPlan(payload) {
    await delay(200)
    const list = read(KEYS.budgetPlans, [])
    // upsert per (eventId, categoryId)
    const idx = list.findIndex(
      (p) => p.eventId === payload.eventId && p.categoryId === payload.categoryId,
    )
    if (idx >= 0) list[idx] = { ...list[idx], ...payload }
    else list.push({ id: genId('bp'), workspaceId: seedWorkspace.id, ...payload })
    write(KEYS.budgetPlans, list)
    return { ok: true }
  },

  // ---------- SALES (agregator penjualan) ----------
  async salesSummary({ eventId } = {}) {
    await delay()
    let sales = seedSales()
    if (eventId) sales = sales.filter((s) => s.eventId === eventId)
    return aggregateSales(sales, eventId)
  },

  // ---------- BUILDER ----------
  async builderTemplates() {
    await delay(200)
    return { items: builderTemplates }
  },
  async getSite(eventId) {
    await delay()
    const sites = read(KEYS.sites, {})
    return sites[eventId] || null
  },
  async saveSite(eventId, payload) {
    await delay()
    const sites = read(KEYS.sites, {})
    sites[eventId] = { ...payload, eventId }
    write(KEYS.sites, sites)
    return sites[eventId]
  },
  async publishSite(eventId) {
    await delay()
    return { eventId, published: true }
  },
}

// Agregasi penjualan → KPI + breakdown untuk grafik
function aggregateSales(sales, eventId) {
  const paid = sales.filter((s) => s.status === 'paid')
  const totalTickets = paid.reduce((n, s) => n + s.qty, 0)
  const totalRevenue = paid.reduce((n, s) => n + s.amount, 0)
  const totalOrders = paid.length

  const byDayMap = {}
  const byTypeMap = {}
  const byEventMap = {}
  const status = { paid: 0, pending: 0, expired: 0 }

  sales.forEach((s) => {
    status[s.status] = (status[s.status] || 0) + 1
    if (s.status !== 'paid') return
    byDayMap[s.date] = byDayMap[s.date] || { date: s.date, tickets: 0, revenue: 0 }
    byDayMap[s.date].tickets += s.qty
    byDayMap[s.date].revenue += s.amount
    byTypeMap[s.ticketName] = byTypeMap[s.ticketName] || {
      name: s.ticketName,
      tickets: 0,
      revenue: 0,
    }
    byTypeMap[s.ticketName].tickets += s.qty
    byTypeMap[s.ticketName].revenue += s.amount
    byEventMap[s.eventId] = byEventMap[s.eventId] || {
      eventId: s.eventId,
      eventTitle: s.eventTitle,
      tickets: 0,
      revenue: 0,
    }
    byEventMap[s.eventId].tickets += s.qty
    byEventMap[s.eventId].revenue += s.amount
  })

  // kuota tersisa (hanya bila drill-down 1 event)
  let remaining = null
  if (eventId) {
    const ev = findEvent(eventId)
    const quota = (ev?.tickets || []).reduce((n, t) => n + (t.quota || 0), 0)
    remaining = quota
  }

  return {
    totalTickets,
    totalRevenue,
    totalOrders,
    avgPerOrder: totalOrders ? Math.round(totalRevenue / totalOrders) : 0,
    remaining,
    byDay: Object.values(byDayMap).sort((a, b) => (a.date < b.date ? -1 : 1)),
    byType: Object.values(byTypeMap),
    byEvent: Object.values(byEventMap),
    status,
  }
}

// Hitung posisi antrian berdasarkan waktu (turun 1 tiap 3 detik)
function computeQueue(entry) {
  const elapsedSec = (Date.now() - entry.startAt) / 1000
  const position = Math.max(0, entry.position - Math.floor(elapsedSec / 3))
  const status = position <= 0 ? 'active' : 'waiting'
  return {
    ...entry,
    position: Math.max(1, position),
    totalWaiting: entry.position,
    etaMinutes: Math.ceil((position * 3) / 60),
    status,
  }
}

// Terbitkan tiket saat pembayaran lunas
function issueTicketsForOrder(orderId) {
  const orders = read(KEYS.orders, {})
  const order = orders[orderId]
  if (!order || order.ticketsIssued) return
  const tickets = seedTickets()
  const sales = seedSales()
  const ev = findEvent(order.eventId)
  const catalog = ev?.tickets || []
  const today = new Date().toISOString().slice(0, 10)
  order.items.forEach((it) => {
    const def = catalog.find((x) => x.id === it.ticketId)
    for (let i = 0; i < it.qty; i++) {
      tickets.push({
        id: genId('tkt'),
        code: genCode(),
        eventTitle: ev?.title,
        eventStartAt: ev?.startAt,
        ticketName: def?.name || 'Tiket',
        holderName: 'Budi Pembeli',
        used: false,
      })
    }
    // catat penjualan (untuk grafik & laporan keuangan)
    sales.push({
      id: genId('sale'),
      eventId: order.eventId,
      eventTitle: ev?.title,
      ticketId: it.ticketId,
      ticketName: def?.name || 'Tiket',
      qty: it.qty,
      amount: (def?.price || 0) * it.qty,
      status: 'paid',
      date: today,
    })
  })
  write(KEYS.tickets, tickets)
  write(KEYS.sales, sales)
  order.status = 'paid'
  order.ticketsIssued = true
  orders[orderId] = order
  write(KEYS.orders, orders)
}
