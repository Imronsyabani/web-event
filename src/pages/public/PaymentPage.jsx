import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Container, Row, Col, Card, Button, Form } from 'react-bootstrap'
import PageHeader from '../../components/common/PageHeader'
import Loader from '../../components/common/Loader'
import { ticketService } from '../../services/ticketService'
import { paymentService } from '../../services/paymentService'
import { formatRupiah } from '../../utils/format'

export default function PaymentPage() {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [methods, setMethods] = useState([])
  const [selected, setSelected] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let active = true
    Promise.all([ticketService.getOrder(orderId), paymentService.methods()])
      .then(([ord, mth]) => {
        if (!active) return
        setOrder(ord)
        const list = mth.items || mth || []
        setMethods(list)
        if (list[0]) setSelected(list[0].code)
      })
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [orderId])

  const handlePay = async () => {
    setSubmitting(true)
    try {
      const payment = await paymentService.create({
        orderId,
        method: selected,
      })
      navigate(`/payment/${orderId}/status?paymentId=${payment.id}`)
    } catch {
      setSubmitting(false)
    }
  }

  if (loading) return <Loader fullPage />

  return (
    <>
      <PageHeader title="Pembayaran" subtitle={`Order #${orderId}`} />
      <Container className="page-section">
        <Row className="g-4 justify-content-center">
          <Col lg={6}>
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <h5 className="mb-3">Pilih metode pembayaran</h5>
                <Form>
                  {methods.length === 0 ? (
                    <p className="text-muted small">
                      Metode pembayaran belum tersedia.
                    </p>
                  ) : (
                    methods.map((m) => (
                      <Form.Check
                        key={m.code}
                        type="radio"
                        id={`method-${m.code}`}
                        name="payment-method"
                        className="border rounded p-3 ps-5 mb-2"
                        label={m.name}
                        value={m.code}
                        checked={selected === m.code}
                        onChange={(e) => setSelected(e.target.value)}
                      />
                    ))
                  )}
                </Form>

                <hr />
                <div className="d-flex justify-content-between fw-bold mb-3">
                  <span>Total Bayar</span>
                  <span className="text-primary">
                    {formatRupiah(order?.total)}
                  </span>
                </div>
                <Button
                  variant="primary"
                  className="w-100"
                  disabled={!selected || submitting}
                  onClick={handlePay}
                >
                  {submitting ? 'Memproses...' : 'Bayar Sekarang'}
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  )
}
