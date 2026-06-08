import { useState } from 'react'
import { Container, Row, Col, Card, Button, Badge, ListGroup } from 'react-bootstrap'
import { usePlan } from '../../context/PlanContext'
import { PLANS } from '../../config/plans'
import { UseMockData } from '../../config'
import { formatRupiah } from '../../utils/format'

const FEATURE_LABELS = {
  sales_chart: 'Grafik penjualan',
  budgeting: 'Budgeting & laporan keuangan',
}

function PlanCard({ plan, current, onSelect, switching }) {
  const isPro = plan.code === 'pro'
  return (
    <Card className={`border-0 shadow-sm h-100 ${current ? 'border-primary border-2' : ''}`}>
      <Card.Body className="d-flex flex-column">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h4 className="mb-0">{plan.name}</h4>
          {current && <Badge bg="primary">Plan aktif</Badge>}
        </div>
        <div className="h3 mb-3">
          {plan.price === 0 ? (
            'Gratis'
          ) : plan.price == null ? (
            <span className="text-muted fs-5">Harga menyusul</span>
          ) : (
            formatRupiah(plan.price)
          )}
        </div>
        <ListGroup variant="flush" className="mb-3 flex-grow-1">
          <ListGroup.Item className="px-0 border-0 py-1">
            <i className="bi bi-check-lg text-success me-2" />
            {plan.limits.workspaces} workspace (= {plan.limits.workspaces} subdomain)
          </ListGroup.Item>
          <ListGroup.Item className="px-0 border-0 py-1">
            <i className="bi bi-check-lg text-success me-2" />
            Fee per tiket {plan.ticketFeePercent}%
          </ListGroup.Item>
          <ListGroup.Item className="px-0 border-0 py-1">
            <i className="bi bi-check-lg text-success me-2" />
            Jual tiket, scanner, queue, website builder
          </ListGroup.Item>
          {plan.features.length === 0 ? (
            <ListGroup.Item className="px-0 border-0 py-1 text-muted">
              <i className="bi bi-dash-lg me-2" />
              Tanpa fitur Pro
            </ListGroup.Item>
          ) : (
            plan.features.map((f) => (
              <ListGroup.Item key={f} className="px-0 border-0 py-1">
                <i className="bi bi-stars text-warning me-2" />
                {FEATURE_LABELS[f] || f}
              </ListGroup.Item>
            ))
          )}
        </ListGroup>
        {current ? (
          <Button variant="outline-secondary" disabled>
            Sedang dipakai
          </Button>
        ) : (
          <Button
            variant={isPro ? 'primary' : 'outline-secondary'}
            onClick={() => onSelect(plan.code)}
            disabled={switching}
          >
            {isPro ? 'Upgrade ke Pro' : 'Turunkan ke Free'}
          </Button>
        )}
      </Card.Body>
    </Card>
  )
}

export default function PlanPage() {
  const { planCode, switchPlan } = usePlan()
  const [switching, setSwitching] = useState(false)

  const select = async (code) => {
    setSwitching(true)
    try {
      await switchPlan(code)
    } finally {
      setSwitching(false)
    }
  }

  return (
    <Container className="p-4" style={{ maxWidth: 760 }}>
      <h1 className="h3 mb-1">Paket Langganan</h1>
      <p className="text-muted">Pilih paket sesuai kebutuhan event-mu.</p>

      <Row className="g-4">
        <Col md={6}>
          <PlanCard
            plan={PLANS.free}
            current={planCode === 'free'}
            onSelect={select}
            switching={switching}
          />
        </Col>
        <Col md={6}>
          <PlanCard
            plan={PLANS.pro}
            current={planCode === 'pro'}
            onSelect={select}
            switching={switching}
          />
        </Col>
      </Row>

      {UseMockData && (
        <p className="text-muted small mt-3">
          <i className="bi bi-info-circle me-1" />
          Mode demo: ganti plan langsung berlaku (tanpa pembayaran) untuk
          mencoba gating fitur Pro. Di produksi, upgrade lewat alur billing
          (langganan bulanan/tahunan).
        </p>
      )}
    </Container>
  )
}
