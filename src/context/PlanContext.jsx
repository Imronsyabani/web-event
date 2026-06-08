import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react'
import { accountService } from '../services/accountService'
import { entitlementsOf, DEFAULT_PLAN } from '../config/plans'

const PlanContext = createContext(null)

export function PlanProvider({ children }) {
  const [account, setAccount] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(() => {
    setLoading(true)
    return accountService
      .get()
      .then(setAccount)
      .catch(() => setAccount({ planCode: DEFAULT_PLAN }))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const planCode = account?.planCode || DEFAULT_PLAN
  const plan = entitlementsOf(planCode)

  // Hanya untuk DEMO (mock): ganti plan lalu refresh.
  // Di produksi, plan berubah lewat alur billing.
  const switchPlan = useCallback(
    async (code) => {
      await accountService.setPlan(code)
      await load()
    },
    [load],
  )

  const value = useMemo(
    () => ({
      account,
      plan,
      planCode,
      loading,
      isPro: planCode === 'pro',
      can: (feature) => plan.features.includes(feature),
      limit: (key) => plan.limits[key] ?? Infinity,
      refresh: load,
      switchPlan,
    }),
    [account, plan, planCode, loading, load, switchPlan],
  )

  return <PlanContext.Provider value={value}>{children}</PlanContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function usePlan() {
  const ctx = useContext(PlanContext)
  if (!ctx) throw new Error('usePlan harus dipakai di dalam <PlanProvider>')
  return ctx
}
