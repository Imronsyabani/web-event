import { Card, Badge } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { formatDateTime, formatRupiah } from '../../utils/format'
import { eventPriceFrom, eventIsWarNow } from '../../utils/ticketPhase'

export default function EventCard({ event }) {
  // Harga termurah dari fase aktif
  const priceFrom = eventPriceFrom(event) ?? event.priceFrom ?? 0
  const warNow = eventIsWarNow(event)

  return (
    <Card
      as={Link}
      to={`/events/${event.id}`}
      className="card-event h-100 shadow-sm text-decoration-none text-reset border-0"
    >
      <div className="ratio ratio-16x9 bg-light rounded-top overflow-hidden">
        {event.banner ? (
          <Card.Img variant="top" src={event.banner} alt={event.title} />
        ) : (
          <div className="d-flex align-items-center justify-content-center text-muted">
            <i className="bi bi-image" style={{ fontSize: '2rem' }} />
          </div>
        )}
      </div>
      <Card.Body>
        <div className="mb-2 d-flex gap-1">
          {event.category && <Badge bg="primary">{event.category}</Badge>}
          {warNow && <Badge bg="danger">War Ticket</Badge>}
        </div>
        <Card.Title className="h6 mb-1 text-truncate">{event.title}</Card.Title>
        <div className="small text-muted mb-2">
          <i className="bi bi-calendar-event me-1" />
          {formatDateTime(event.startAt)}
        </div>
        <div className="small text-muted">
          <i className="bi bi-geo-alt me-1" />
          {event.venue?.name || event.location || 'Online'}
        </div>
        <div className="fw-bold text-primary mt-2">
          {priceFrom > 0 ? `Mulai ${formatRupiah(priceFrom)}` : 'Gratis'}
        </div>
      </Card.Body>
    </Card>
  )
}
