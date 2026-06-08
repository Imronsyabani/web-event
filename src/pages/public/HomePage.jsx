import { useEffect, useState } from 'react'
import { Container, Row, Col, Button, Card } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import EventCard from '../../components/event/EventCard'
import Loader from '../../components/common/Loader'
import { eventService } from '../../services/eventService'

const FEATURES = [
  {
    icon: 'bi-ticket-perforated',
    title: 'Pembelian Tiket',
    text: 'Beli tiket event favoritmu dengan cepat dan aman.',
  },
  {
    icon: 'bi-people',
    title: 'Waiting Queue',
    text: 'Sistem antrian adil untuk war ticket event populer.',
  },
  {
    icon: 'bi-qr-code-scan',
    title: 'Scanner Tiket',
    text: 'Validasi tiket di lokasi secara instan untuk staff.',
  },
  {
    icon: 'bi-window-stack',
    title: 'Website Builder',
    text: 'Buat halaman event custom dari template siap pakai.',
  },
]

export default function HomePage() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    eventService
      .list()
      .then((data) => active && setEvents((data.items || data || []).slice(0, 4)))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [])

  return (
    <>
      {/* Hero */}
      <section className="we-hero">
        <Container className="py-5">
          <Row className="align-items-center py-lg-5">
            <Col lg={7}>
              <h1 className="display-5 fw-bold mb-3">
                Temukan & Kelola Event dalam Satu Platform
              </h1>
              <p className="lead mb-4 opacity-75">
                Beli tiket, ikut antrian war ticket, dan buat website event-mu
                sendiri. Semua mudah dari satu tempat.
              </p>
              <div className="d-flex gap-2 flex-wrap">
                <Button as={Link} to="/events" variant="light" size="lg">
                  Jelajahi Event
                </Button>
                <Button
                  as={Link}
                  to="/register"
                  variant="outline-light"
                  size="lg"
                >
                  Jadi Penyelenggara
                </Button>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Event pilihan */}
      <Container className="page-section">
        <div className="d-flex justify-content-between align-items-end mb-4">
          <div>
            <h2 className="fw-bold mb-1">Event Pilihan</h2>
            <p className="text-muted mb-0">Jangan lewatkan event-event populer.</p>
          </div>
          <Link to="/events" className="text-decoration-none fw-semibold">
            Lihat semua <i className="bi bi-arrow-right" />
          </Link>
        </div>
        {loading ? (
          <Loader label="Memuat event..." />
        ) : (
          <Row className="g-4">
            {events.map((event) => (
              <Col sm={6} lg={3} key={event.id}>
                <EventCard event={event} />
              </Col>
            ))}
          </Row>
        )}
      </Container>

      {/* Fitur */}
      <section className="bg-white">
        <Container className="page-section">
          <div className="text-center mb-5">
            <h2 className="fw-bold">Semua yang Kamu Butuhkan</h2>
            <p className="text-muted">
              Solusi lengkap untuk buyer, staff, dan penyelenggara event.
            </p>
          </div>
          <Row className="g-4">
            {FEATURES.map((f) => (
              <Col md={6} lg={3} key={f.title}>
                <Card className="h-100 border-0 shadow-sm text-center">
                  <Card.Body>
                    <div className="text-primary mb-3">
                      <i
                        className={`bi ${f.icon}`}
                        style={{ fontSize: '2.5rem' }}
                      />
                    </div>
                    <Card.Title className="h6">{f.title}</Card.Title>
                    <Card.Text className="text-muted small">{f.text}</Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* CTA */}
      <Container className="page-section text-center">
        <h3 className="fw-bold mb-3">Siap menyelenggarakan event-mu?</h3>
        <p className="text-muted mb-4">
          Daftar gratis dan mulai jual tiket dalam hitungan menit.
        </p>
        <Button as={Link} to="/register" variant="primary" size="lg">
          Mulai Sekarang
        </Button>
      </Container>
    </>
  )
}
