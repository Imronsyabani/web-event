import { useState } from 'react'
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap'
import QrScanner from '../../components/scanner/QrScanner'
import { ticketService } from '../../services/ticketService'

// Halaman scanner tiket untuk staff: kamera QR (ZXing) + input kode manual.
export default function ScannerPage() {
  const [code, setCode] = useState('')
  const [result, setResult] = useState(null) // { valid, message, ticket }
  const [loading, setLoading] = useState(false)

  // Validasi sebuah kode tiket ke backend/mock
  const validate = async (value) => {
    const clean = (value || '').trim()
    if (!clean || loading) return
    setLoading(true)
    setResult(null)
    try {
      const res = await ticketService.scan(clean)
      setResult({
        valid: res.valid ?? true,
        message: res.message || 'Tiket valid.',
        ticket: res.ticket,
      })
    } catch (err) {
      setResult({
        valid: false,
        message: err.response?.data?.message || 'Tiket tidak valid.',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleManual = (e) => {
    e.preventDefault()
    validate(code)
    setCode('')
  }

  return (
    <Container className="py-4">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <h3 className="text-center mb-4">
            <i className="bi bi-qr-code-scan me-2" />
            Scanner Tiket
          </h3>

          {/* Kamera scanner (ZXing) */}
          <Card className="we-gradient-bg border-0 mb-4">
            <Card.Body>
              <QrScanner onResult={validate} paused={!!result || loading} />
            </Card.Body>
          </Card>

          {/* Hasil scan */}
          {result && (
            <Alert
              variant={result.valid ? 'success' : 'danger'}
              dismissible
              onClose={() => setResult(null)}
            >
              <div className="d-flex align-items-center">
                <i
                  className={`bi ${
                    result.valid ? 'bi-check-circle-fill' : 'bi-x-circle-fill'
                  } me-2 fs-3`}
                />
                <div>
                  <strong>{result.message}</strong>
                  {result.ticket && (
                    <div className="small">
                      {result.ticket.eventTitle} · {result.ticket.ticketName}
                      {result.ticket.holderName
                        ? ` · ${result.ticket.holderName}`
                        : ''}
                    </div>
                  )}
                </div>
              </div>
            </Alert>
          )}

          {/* Input kode manual */}
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <Form onSubmit={handleManual}>
                <Form.Label>Atau masukkan kode tiket manual</Form.Label>
                <div className="d-flex gap-2">
                  <Form.Control
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Contoh: TKT-XXXX-XXXX"
                  />
                  <Button type="submit" variant="primary" disabled={loading}>
                    {loading ? '...' : 'Cek'}
                  </Button>
                </div>
                <Form.Text className="text-muted">
                  Tip demo: kode <code>TKT-DEMO-0001</code> valid, lalu jadi
                  &quot;sudah dipakai&quot; bila discan ulang.
                </Form.Text>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}
