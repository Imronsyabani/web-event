import { Container, Row, Col, Card } from 'react-bootstrap'

const STATS = [
  { icon: 'bi-calendar-event', label: 'Total Event', value: '—', color: 'primary' },
  { icon: 'bi-ticket-perforated', label: 'Tiket Terjual', value: '—', color: 'success' },
  { icon: 'bi-cash-stack', label: 'Pendapatan', value: '—', color: 'info' },
  { icon: 'bi-people', label: 'Dalam Antrian', value: '—', color: 'warning' },
]

export default function DashboardPage() {
  return (
    <Container fluid className="p-4">
      <h1 className="h3 mb-1">Ringkasan</h1>
      <p className="text-muted">Pantau performa event kamu.</p>

      <Row className="g-3 mb-4">
        {STATS.map((s) => (
          <Col sm={6} xl={3} key={s.label}>
            <Card className="border-0 shadow-sm h-100">
              <Card.Body className="d-flex align-items-center">
                <div
                  className={`rounded-circle bg-${s.color} bg-opacity-10 text-${s.color} d-flex align-items-center justify-content-center me-3`}
                  style={{ width: 52, height: 52 }}
                >
                  <i className={`bi ${s.icon} fs-4`} />
                </div>
                <div>
                  <div className="text-muted small">{s.label}</div>
                  <div className="h4 mb-0">{s.value}</div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <Card className="border-0 shadow-sm">
        <Card.Body>
          <h5>Aktivitas Terbaru</h5>
          <p className="text-muted small mb-0">
            Data aktivitas akan tampil setelah terhubung dengan backend.
          </p>
        </Card.Body>
      </Card>
    </Container>
  )
}
