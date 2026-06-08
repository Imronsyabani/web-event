import { usePlan } from '../../context/PlanContext'
import UpgradeCard from './UpgradeCard'

// Membungkus konten yang butuh fitur Pro tertentu.
// Pemakaian: <Gate feature="budgeting" name="Budgeting">...</Gate>
export default function Gate({ feature, name, fallback, children }) {
  const { can, loading } = usePlan()
  if (loading) return null
  if (can(feature)) return children
  return fallback ?? <UpgradeCard feature={name || 'Fitur'} />
}
