import { Card, Button } from 'react-bootstrap'
import { Link } from 'react-router-dom'

// Ditampilkan saat fitur Pro diakses oleh akun Free
export default function UpgradeCard({ feature = 'Fitur ini', compact = false }) {
  return (
    <Card className={`border-0 shadow-sm text-center ${compact ? '' : 'py-4'}`}>
      <Card.Body>
        <div className="text-warning mb-2">
          <i className="bi bi-stars" style={{ fontSize: compact ? '1.8rem' : '2.5rem' }} />
        </div>
        <h5 className="mb-1">{feature} khusus Pro</h5>
        <p className="text-muted small mb-3">
          Upgrade ke paket Pro untuk membuka fitur ini.
        </p>
        <Button as={Link} to="/owner/plan" variant="primary">
          <i className="bi bi-arrow-up-circle me-1" />
          Upgrade ke Pro
        </Button>
      </Card.Body>
    </Card>
  )
}
