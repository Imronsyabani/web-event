import { useEffect, useState } from 'react'
import { Container, Row, Col, Card, Badge } from 'react-bootstrap'
import PageHeader from '../../components/common/PageHeader'
import Loader from '../../components/common/Loader'
import EmptyState from '../../components/common/EmptyState'
import { ticketService } from '../../services/ticketService'
import { formatDateTime } from '../../utils/format'

export default function MyTicketsPage() {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    ticketService
      .myTickets()
      .then((data) => active && setTickets(data.items || data || []))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [])

  return (
    <>
      <PageHeader title="Tiket Saya" subtitle="Semua tiket yang kamu miliki." />
      <Container className="page-section">
        {loading ? (
          <Loader />
        ) : tickets.length === 0 ? (
          <EmptyState
            icon="bi-ticket-detailed"
            title="Belum ada tiket"
            description="Tiket yang kamu beli akan muncul di sini."
          />
        ) : (
          <Row className="g-4">
            {tickets.map((t) => (
              <Col md={6} lg={4} key={t.id}>
                <Card className="border-0 shadow-sm h-100">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h6 className="mb-0">{t.eventTitle}</h6>
                      <Badge bg={t.used ? 'secondary' : 'success'}>
                        {t.used ? 'Terpakai' : 'Aktif'}
                      </Badge>
                    </div>
                    <p className="small text-muted mb-2">
                      <i className="bi bi-calendar-event me-1" />
                      {formatDateTime(t.eventStartAt)}
                    </p>
                    <p className="small mb-3">
                      {t.ticketName} · {t.code}
                    </p>
                    <div className="text-center bg-light rounded py-3">
                      <i
                        className="bi bi-qr-code"
                        style={{ fontSize: '3rem' }}
                      />
                      <div className="small text-muted mt-1">{t.code}</div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Container>
    </>
  )
}
