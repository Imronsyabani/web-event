import { lazy, Suspense, useEffect, useState, useCallback } from 'react'
import { Container, Row, Col, Card, Form } from 'react-bootstrap'
import Loader from '../../components/common/Loader'
import Gate from '../../components/common/Gate'
import UpgradeCard from '../../components/common/UpgradeCard'
import { salesService } from '../../services/salesService'
import { budgetService } from '../../services/budgetService'
import { eventService } from '../../services/eventService'
import { Features } from '../../config/plans'
import { formatRupiah } from '../../utils/format'

// Recharts berat → lazy-load (chunk terpisah)
const SalesCharts = lazy(() => import('../../components/sales/SalesCharts'))

function KpiCard({ label, value, icon, color }) {
  return (
    <Card className="border-0 shadow-sm h-100">
      <Card.Body className="d-flex align-items-center">
        <div
          className={`rounded-circle bg-${color} bg-opacity-10 text-${color} d-flex align-items-center justify-content-center me-3`}
          style={{ width: 48, height: 48, flexShrink: 0 }}
        >
          <i className={`bi ${icon} fs-5`} />
        </div>
        <div>
          <div className="text-muted small">{label}</div>
          <div className="h5 mb-0">{value}</div>
        </div>
      </Card.Body>
    </Card>
  )
}

function SalesFinanceInner() {
  const [events, setEvents] = useState([])
  const [eventId, setEventId] = useState('')
  const [summary, setSummary] = useState(null)
  const [finance, setFinance] = useState({ income: 0, expense: 0 })
  const [loading, setLoading] = useState(true)

  const load = useCallback(() => {
    setLoading(true)
    const params = eventId ? { eventId } : {}
    return Promise.all([
      salesService.summary(params),
      budgetService.listEntries(params),
    ])
      .then(([sum, ent]) => {
        setSummary(sum)
        const items = ent.items || []
        setFinance({
          income: items.filter((e) => e.type === 'income').reduce((s, e) => s + e.amount, 0),
          expense: items.filter((e) => e.type === 'expense').reduce((s, e) => s + e.amount, 0),
        })
      })
      .finally(() => setLoading(false))
  }, [eventId])

  useEffect(() => {
    eventService.mine().then((d) => setEvents(d.items || []))
  }, [])
  useEffect(() => {
    load()
  }, [load])

  if (loading || !summary) return <Loader fullPage label="Memuat data keuangan..." />

  const ticketRevenue = summary.totalRevenue
  const netProfit = ticketRevenue + finance.income - finance.expense

  return (
    <Container fluid className="p-4">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
        <div>
          <h1 className="h3 mb-1">Penjualan & Keuangan</h1>
          <p className="text-muted mb-0">
            {eventId ? 'Detail per event' : 'Ringkasan seluruh workspace'}
          </p>
        </div>
        <Form.Select
          value={eventId}
          onChange={(e) => setEventId(e.target.value)}
          style={{ minWidth: 220 }}
        >
          <option value="">Semua event (workspace)</option>
          {events.map((ev) => (
            <option key={ev.id} value={ev.id}>
              {ev.title}
            </option>
          ))}
        </Form.Select>
      </div>

      {/* KPI penjualan */}
      <Row className="g-3 mb-3">
        <Col sm={6} xl={3}>
          <KpiCard label="Tiket Terjual" value={summary.totalTickets} icon="bi-ticket-perforated" color="primary" />
        </Col>
        <Col sm={6} xl={3}>
          <KpiCard label="Penjualan Tiket" value={formatRupiah(ticketRevenue)} icon="bi-cash-stack" color="success" />
        </Col>
        <Col sm={6} xl={3}>
          <KpiCard label="Rata-rata / Transaksi" value={formatRupiah(summary.avgPerOrder)} icon="bi-receipt" color="info" />
        </Col>
        <Col sm={6} xl={3}>
          <KpiCard label="Total Pesanan" value={summary.totalOrders} icon="bi-bag-check" color="warning" />
        </Col>
      </Row>

      {/* Laba bersih (P&L) */}
      <Card className="border-0 shadow-sm mb-4">
        <Card.Body>
          <h6 className="mb-3">Laba Bersih</h6>
          <Row className="text-center g-3">
            <Col xs={6} md={3}>
              <div className="text-muted small">Penjualan Tiket</div>
              <div className="fw-bold text-success">{formatRupiah(ticketRevenue)}</div>
            </Col>
            <Col xs={6} md={3}>
              <div className="text-muted small">+ Pemasukan Lain</div>
              <div className="fw-bold text-success">{formatRupiah(finance.income)}</div>
            </Col>
            <Col xs={6} md={3}>
              <div className="text-muted small">− Pengeluaran</div>
              <div className="fw-bold text-danger">{formatRupiah(finance.expense)}</div>
            </Col>
            <Col xs={6} md={3}>
              <div className="text-muted small">= Laba Bersih</div>
              <div className={`h5 mb-0 ${netProfit >= 0 ? 'text-primary' : 'text-danger'}`}>
                {formatRupiah(netProfit)}
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Grafik */}
      <Suspense fallback={<Loader label="Memuat grafik..." />}>
        <SalesCharts summary={summary} showPerEvent={!eventId} />
      </Suspense>
    </Container>
  )
}

export default function SalesFinancePage() {
  return (
    <Gate
      feature={Features.SalesChart}
      name="Penjualan & Keuangan"
      fallback={
        <Container className="p-4">
          <UpgradeCard feature="Grafik Penjualan & Keuangan" />
        </Container>
      }
    >
      <SalesFinanceInner />
    </Gate>
  )
}
