import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Container, Row, Col, Card, Button, Form, Stack } from 'react-bootstrap'
import PageHeader from '../../components/common/PageHeader'
import Loader from '../../components/common/Loader'
import { eventService } from '../../services/eventService'
import { ticketService } from '../../services/ticketService'
import { formatRupiah } from '../../utils/format'

export default function CheckoutPage() {
  const { eventId } = useParams()
  const navigate = useNavigate()
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
      })
      navigate(`/payment/${order.id}`)
    } catch {
      setSubmitting(false)
    }
  }

  if (loading) return <Loader fullPage />

  return (
    <>
      <PageHeader title="Checkout" subtitle={event?.title} />
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
                      <Form.Control
                        type="number"
                        min={0}
                        max={t.quota}
                        value={qty[t.id] || 0}
                        onChange={(e) =>
                          setTicketQty(t.id, Number(e.target.value))
                        }
                        style={{ width: 90 }}
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
