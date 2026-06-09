import { useEffect, useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { Container, Row, Col, Card, Button, Stack, Badge } from 'react-bootstrap'
import PageHeader from '../../components/common/PageHeader'
import Loader from '../../components/common/Loader'
import QuantityStepper from '../../components/common/QuantityStepper'
import { eventService } from '../../services/eventService'
import { ticketService } from '../../services/ticketService'
import { formatRupiah } from '../../utils/format'

export default function CheckoutPage() {
  const { eventId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  // Tanda apakah checkout ini berasal dari antrian (war ticket)
  const fromQueue = location.state?.fromQueue || false
  const [event, setEvent] = useState(null)
  const [tickets, setTickets] = useState([])
  const [qty, setQty] = useState({}) // { ticketId: jumlah }
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let active = true
    Promise.all([eventService.get(eventId), ticketService.listByEvent(eventId)])
      .then(([ev, tk]) => {
        if (!active) return
        setEvent(ev)
        setTickets(tk.items || tk || [])
      })
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [eventId])

  // War ticket WAJIB lewat antrian: akses langsung → dialihkan ke antrian.
  useEffect(() => {
    if (event?.isWarTicket && !fromQueue) {
      navigate(`/queue/${eventId}`, { replace: true })
    }
  }, [event, fromQueue, eventId, navigate])

  const setTicketQty = (id, value) =>
    setQty((prev) => ({ ...prev, [id]: Math.max(0, value) }))

  const items = tickets
    .map((t) => ({ ...t, count: qty[t.id] || 0 }))
    .filter((t) => t.count > 0)
  const total = items.reduce((sum, t) => sum + t.price * t.count, 0)

  const handleSubmit = async () => {
    if (items.length === 0) return
    setSubmitting(true)
    try {
      const order = await ticketService.order({
        eventId,
        items: items.map((t) => ({ ticketId: t.id, qty: t.count })),
        source: fromQueue ? 'queue' : 'direct', // tag asal checkout
      })
      navigate(`/payment/${order.id}`)
    } catch {
      setSubmitting(false)
    }
  }

  if (loading) return <Loader fullPage />

  return (
    <>
      <PageHeader
        title="Checkout"
        subtitle={event?.title}
        actions={
          fromQueue ? (
            <Badge bg="danger" className="fs-6">
              <i className="bi bi-people-fill me-1" />
              Via Antrian
            </Badge>
          ) : (
            <Badge bg="secondary" className="fs-6">
              Pembelian Langsung
            </Badge>
          )
        }
      />
      <Container className="page-section">
        <Row className="g-4">
          <Col lg={8}>
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <h5 className="mb-3">Pilih jumlah tiket</h5>
                <Stack gap={3}>
                  {tickets.map((t) => (
                    <div
                      key={t.id}
                      className="d-flex justify-content-between align-items-center border rounded p-3"
                    >
                      <div>
                        <div className="fw-semibold">{t.name}</div>
                        <small className="text-muted">
                          {formatRupiah(t.price)} · Sisa {t.quota}
                        </small>
                      </div>
                      <QuantityStepper
                        value={qty[t.id] || 0}
                        max={t.quota}
                        onChange={(n) => setTicketQty(t.id, n)}
                      />
                    </div>
                  ))}
                </Stack>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={4}>
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <h5 className="mb-3">Ringkasan</h5>
                {items.length === 0 ? (
                  <p className="text-muted small">Belum ada tiket dipilih.</p>
                ) : (
                  items.map((t) => (
                    <div
                      key={t.id}
                      className="d-flex justify-content-between small mb-2"
                    >
                      <span>
                        {t.name} × {t.count}
                      </span>
                      <span>{formatRupiah(t.price * t.count)}</span>
                    </div>
                  ))
                )}
                <hr />
                <div className="d-flex justify-content-between fw-bold mb-3">
                  <span>Total</span>
                  <span className="text-primary">{formatRupiah(total)}</span>
                </div>
                <Button
                  variant="primary"
                  className="w-100"
                  disabled={items.length === 0 || submitting}
                  onClick={handleSubmit}
                >
                  {submitting ? 'Memproses...' : 'Lanjut ke Pembayaran'}
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  )
}
