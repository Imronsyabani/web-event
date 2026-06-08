import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Container, Row, Col, Card, Button, ProgressBar } from 'react-bootstrap'
import Loader from '../../components/common/Loader'
import { queueService } from '../../services/queueService'

// Status antrian: waiting | active (giliran tiba) | expired
export default function WaitingQueuePage() {
  const { eventId } = useParams()
  const navigate = useNavigate()
  const [queue, setQueue] = useState(null)
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(false)

  const refresh = useCallback(() => {
    return queueService
      .status(eventId)
      .then(setQueue)
      .catch(() => setQueue(null))
      .finally(() => setLoading(false))
  }, [eventId])

  useEffect(() => {
    refresh()
    const timer = setInterval(refresh, 4000)
    return () => clearInterval(timer)
  }, [refresh])

  // Saat giliran tiba, arahkan ke checkout
  useEffect(() => {
    if (queue?.status === 'active') {
      navigate(`/checkout/${eventId}`)
    }
  }, [queue, eventId, navigate])

  const handleJoin = async () => {
    setJoining(true)
    try {
      const data = await queueService.join(eventId)
      setQueue(data)
    } finally {
      setJoining(false)
    }
  }

  const handleLeave = async () => {
    await queueService.leave(eventId)
    setQueue(null)
  }

  if (loading) return <Loader fullPage label="Memuat antrian..." />

  const inQueue = queue && queue.status === 'waiting'
  const ahead = queue?.position ? queue.position - 1 : 0
  const totalWaiting = queue?.totalWaiting || queue?.position || 1
  const progress = totalWaiting
    ? Math.round(((totalWaiting - ahead) / totalWaiting) * 100)
    : 0

  return (
    <Container className="page-section">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="border-0 shadow-sm text-center">
            <Card.Body className="py-5">
              <i
                className="bi bi-people-fill text-primary"
                style={{ fontSize: '3.5rem' }}
              />
              <h3 className="mt-3">Ruang Tunggu War Ticket</h3>

              {!inQueue ? (
                <>
                  <p className="text-muted">
                    Masuk antrian untuk mendapat giliran membeli tiket secara
                    adil.
                  </p>
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={handleJoin}
                    disabled={joining}
                  >
                    {joining ? 'Bergabung...' : 'Masuk Antrian'}
                  </Button>
                </>
              ) : (
                <>
                  <p className="text-muted mb-1">Posisi kamu di antrian</p>
                  <div className="display-4 fw-bold text-primary mb-2">
                    #{queue.position}
                  </div>
                  <p className="text-muted">
                    {ahead} orang di depanmu · estimasi{' '}
                    {queue.etaMinutes ? `${queue.etaMinutes} menit` : 'beberapa saat'}
                  </p>
                  <ProgressBar
                    now={progress}
                    label={`${progress}%`}
                    className="my-4"
                    animated
                  />
                  <p className="small text-muted">
                    Jangan tutup halaman ini. Kamu akan otomatis diarahkan saat
                    giliranmu tiba.
                  </p>
                  <Button variant="outline-secondary" onClick={handleLeave}>
                    Keluar Antrian
                  </Button>
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}
