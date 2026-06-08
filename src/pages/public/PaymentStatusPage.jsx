import { useEffect, useState, useCallback } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import { Container, Row, Col, Card, Button } from 'react-bootstrap'
import Loader from '../../components/common/Loader'
import StatusBadge from '../../components/common/StatusBadge'
import { paymentService } from '../../services/paymentService'
import { PaymentStatus } from '../../config'
import { formatRupiah } from '../../utils/format'

const VISUAL = {
  [PaymentStatus.Paid]: { icon: 'bi-check-circle-fill', color: 'success' },
  [PaymentStatus.Pending]: { icon: 'bi-hourglass-split', color: 'warning' },
  [PaymentStatus.Expired]: { icon: 'bi-x-circle-fill', color: 'secondary' },
  [PaymentStatus.Failed]: { icon: 'bi-x-circle-fill', color: 'danger' },
  [PaymentStatus.Refunded]: { icon: 'bi-arrow-counterclockwise', color: 'info' },
}

export default function PaymentStatusPage() {
  const { orderId } = useParams()
  const [params] = useSearchParams()
  const paymentId = params.get('paymentId')
  const [payment, setPayment] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchStatus = useCallback(() => {
    if (!paymentId) return Promise.resolve()
    return paymentService
      .status(paymentId)
      .then(setPayment)
      .finally(() => setLoading(false))
  }, [paymentId])

  useEffect(() => {
    fetchStatus()
    // Polling status pembayaran selama masih pending
    const timer = setInterval(() => {
      setPayment((p) => {
        if (p && p.status !== PaymentStatus.Pending) return p
        fetchStatus()
        return p
      })
    }, 5000)
    return () => clearInterval(timer)
  }, [fetchStatus])

  if (loading) return <Loader fullPage label="Mengecek status pembayaran..." />

  const status = payment?.status || PaymentStatus.Pending
  const visual = VISUAL[status] || VISUAL[PaymentStatus.Pending]

  return (
    <Container className="page-section">
      <Row className="justify-content-center">
        <Col md={7} lg={5}>
          <Card className="border-0 shadow-sm text-center">
            <Card.Body className="py-5">
              <i
                className={`bi ${visual.icon} text-${visual.color}`}
                style={{ fontSize: '4rem' }}
              />
              <h3 className="mt-3 mb-2">Status Pembayaran</h3>
              <div className="mb-3">
                <StatusBadge status={status} />
              </div>

              <div className="text-start bg-light rounded p-3 mb-4">
                <div className="d-flex justify-content-between mb-1">
                  <span className="text-muted">Order</span>
                  <span>#{orderId}</span>
                </div>
                <div className="d-flex justify-content-between mb-1">
                  <span className="text-muted">Metode</span>
                  <span>{payment?.method || '-'}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-muted">Total</span>
                  <span className="fw-bold">{formatRupiah(payment?.amount)}</span>
                </div>
              </div>

              {status === PaymentStatus.Pending && (
                <p className="text-muted small">
                  Menunggu pembayaran. Halaman ini akan diperbarui otomatis.
                </p>
              )}

              <div className="d-flex gap-2 justify-content-center">
                {status === PaymentStatus.Paid ? (
                  <Button as={Link} to="/my-tickets" variant="primary">
                    Lihat Tiket Saya
                  </Button>
                ) : (
                  <Button as={Link} to="/events" variant="outline-primary">
                    Kembali ke Event
                  </Button>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}
