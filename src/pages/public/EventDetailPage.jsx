import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Container, Row, Col, Button, Card, Badge, ListGroup } from 'react-bootstrap'
import Loader from '../../components/common/Loader'
import EmptyState from '../../components/common/EmptyState'
import { eventService } from '../../services/eventService'
import { ticketService } from '../../services/ticketService'
import { formatDateTime, formatRupiah } from '../../utils/format'

export default function EventDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [event, setEvent] = useState(null)
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    setLoading(true)
    Promise.all([eventService.get(id), ticketService.listByEvent(id)])
      .then(([ev, tk]) => {
        if (!active) return
        setEvent(ev)
        setTickets(tk.items || tk || [])
      })
      .catch(() => active && setEvent(null))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [id])

  if (loading) return <Loader fullPage label="Memuat detail event..." />
  if (!event)
    return (
      <Container className="page-section">
        <EmptyState
          icon="bi-calendar-x"
          title="Event tidak ditemukan"
          action={
            <Button as={Link} to="/events" variant="primary">
              Kembali ke daftar event
            </Button>
          }
        />
      </Container>
    )

  // Jika event "war ticket", arahkan ke antrian; selain itu langsung checkout
  const goNext = () => {
    if (event.isWarTicket) navigate(`/queue/${event.id}`)
    else navigate(`/checkout/${event.id}`)
  }

  return (
    <>
      <div
        className="we-gradient-bg"
        style={{
          backgroundImage: event.banner ? `url(${event.banner})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          minHeight: 280,
        }}
      />
      <Container className="page-section">
        <Row className="g-4">
          <Col lg={8}>
            {event.category && (
              <Badge bg="primary" className="mb-2">
                {event.category}
              </Badge>
            )}
            {event.isWarTicket && (
              <Badge bg="danger" className="mb-2 ms-2">
                War Ticket
              </Badge>
            )}
            <h1 className="fw-bold">{event.title}</h1>
            <div className="text-muted mb-4">
              <div className="mb-1">
                <i className="bi bi-calendar-event me-2" />
                {formatDateTime(event.startAt)}
              </div>
              <div>
                <i className="bi bi-geo-alt me-2" />
                {event.location || 'Online'}
              </div>
            </div>
            <h5>Deskripsi</h5>
            <p style={{ whiteSpace: 'pre-line' }}>
              {event.description || 'Belum ada deskripsi untuk event ini.'}
            </p>
          </Col>

          <Col lg={4}>
            <Card className="shadow-sm border-0 sticky-lg-top" style={{ top: 80 }}>
              <Card.Body>
                <h5 className="mb-3">Pilihan Tiket</h5>
                {tickets.length === 0 ? (
                  <p className="text-muted small">Tiket belum tersedia.</p>
                ) : (
                  <ListGroup variant="flush" className="mb-3">
                    {tickets.map((t) => (
                      <ListGroup.Item
                        key={t.id}
                        className="d-flex justify-content-between align-items-center px-0"
                      >
                        <div>
                          <div className="fw-semibold">{t.name}</div>
                          <small className="text-muted">
                            {t.quota > 0 ? `Sisa ${t.quota}` : 'Habis'}
                          </small>
                        </div>
                        <span className="fw-bold text-primary">
                          {formatRupiah(t.price)}
                        </span>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                )}
                <Button
                  variant="primary"
                  className="w-100"
                  onClick={goNext}
                  disabled={tickets.length === 0}
                >
                  {event.isWarTicket ? 'Masuk Antrian' : 'Beli Tiket'}
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  )
}
