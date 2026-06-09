import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react'
import { workspaceService } from '../services/workspaceService'

const WorkspaceContext = createContext(null)

export function WorkspaceProvider({ children }) {
  const [workspaces, setWorkspaces] = useState([])
  const [currentId, setCurrentId] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(() => {
    setLoading(true)
    return workspaceService
      .list()
      .then((d) => {
        setWorkspaces(d.items || [])
        setCurrentId(d.currentId || d.items?.[0]?.id || null)
      })
      .catch(() => setWorkspaces([]))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const switchTo = useCallback(
    async (id) => {
      await workspaceService.switch(id)
      setCurrentId(id)
      // muat ulang halaman agar data ter-scope ke workspace baru
      window.location.reload()
    },
    [],
  )

  const create = useCallback(
    async (payload) => {
      const ws = await workspaceService.create(payload)
      await load()
      return ws
    },
    [load],
  )

  const current = workspaces.find((w) => w.id === currentId) || null

  const value = useMemo(
    () => ({ workspaces, current, currentId, loading, switchTo, create, refresh: load }),
    [workspaces, current, currentId, loading, switchTo, create, load],
  )

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useWorkspace() {
  const ctx = useContext(WorkspaceContext)
  if (!ctx) throw new Error('useWorkspace harus dipakai di dalam <WorkspaceProvider>')
  return ctx
}
