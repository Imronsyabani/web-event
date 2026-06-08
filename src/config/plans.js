// ============================================================
//  Definisi Plan & Entitlement
//  Frontend hanya untuk tampil/sembunyi UI. Penegakan asli
//  WAJIB di backend (mis. tolak workspace ke-2 di Free → 402).
// ============================================================

// Kode fitur berbayar (Pro). Fitur inti tidak perlu flag.
export const Features = {
  SalesChart: 'sales_chart',
  Budgeting: 'budgeting',
}

export const PLANS = {
  free: {
    code: 'free',
    name: 'Free',
    price: 0,
    limits: { workspaces: 1 },
    features: [],
    ticketFeePercent: 5, // fee per tiket (ditanggung pembeli)
  },
  pro: {
    code: 'pro',
    name: 'Pro',
    price: null, // ditentukan nanti; billing bulanan + tahunan
    limits: { workspaces: 3 },
    features: [Features.SalesChart, Features.Budgeting],
    ticketFeePercent: 2.5,
  },
}

export const DEFAULT_PLAN = 'free'

// Bentuk entitlement dari kode plan (yang dipakai usePlan)
export function entitlementsOf(planCode) {
  return PLANS[planCode] || PLANS[DEFAULT_PLAN]
}
