import { Badge } from 'react-bootstrap'
import { PaymentStatus } from '../../config'

const MAP = {
  [PaymentStatus.Paid]: { bg: 'success', label: 'Lunas' },
  [PaymentStatus.Pending]: { bg: 'warning', label: 'Menunggu' },
  [PaymentStatus.Expired]: { bg: 'secondary', label: 'Kedaluwarsa' },
  [PaymentStatus.Failed]: { bg: 'danger', label: 'Gagal' },
  [PaymentStatus.Refunded]: { bg: 'info', label: 'Refund' },
}

export default function StatusBadge({ status }) {
  const cfg = MAP[status] || { bg: 'light', label: status || '-' }
  return (
    <Badge bg={cfg.bg} className="text-uppercase">
      {cfg.label}
    </Badge>
  )
}
