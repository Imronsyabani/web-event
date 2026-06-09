import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Container, Row, Col, Card, Form, Button, Alert, Badge } from 'react-bootstrap'
import Loader from '../../components/common/Loader'
import { memberService } from '../../services/memberService'
import { roleName } from '../../config/roles'
import { AppName } from '../../config'

export default function AcceptInvitePage() {
  const { token } = useParams()
  const navigate = useNavigate()
  const [invite, setInvite] = useState(null)
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [accepting, setAccepting] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    memberService
      .getInvite(token)
      .then(setInvite)
      .catch(() => setError('Undangan tidak ditemukan atau sudah kedaluwarsa.'))
      .finally(() => setLoading(false))
  }, [token])

  const accept = async (e) => {
    e.preventDefault()
    setAccepting(true)
    try {
      await memberService.acceptInvite({ token, name })
      navigate('/staff/scanner')
    } catch {
      setError('Gagal menerima undangan.')
      setAccepting(false)
    }
  }

  if (loading) return <Loader fullPage label="Memuat undangan..." />

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={6} lg={5}>
          <div className="text-center mb-4">
            <h3 className="text-primary fw-bold">
              <i className="bi bi-ticket-perforated-fill me-2" />
              {AppName}
            </h3>
          </div>
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-4">
              {error ? (
                <Alert variant="danger" className="mb-0">
                  {error}
                  <div className="mt-3">
                    <Button as={Link} to="/" variant="outline-secondary" size="sm">
                      Ke Beranda
                    </Button>
                  </div>
                </Alert>
              ) : (
                <>
                  <h5 className="mb-1">Undangan Bergabung</h5>
                  <p className="text-muted">
                    Kamu diundang ke workspace{' '}
                    <strong>{invite.workspaceName}</strong> sebagai:
                  </p>
                  <div className="mb-3 d-flex flex-wrap gap-1">
                    {invite.roles.map((r) => (
                      <Badge key={r} bg="primary">
                        {roleName(r)}
                      </Badge>
                    ))}
                  </div>
                  <Form onSubmit={accept}>
                    <Form.Group className="mb-3">
                      <Form.Label>Email</Form.Label>
                      <Form.Control value={invite.email} disabled />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Nama Lengkap</Form.Label>
                      <Form.Control
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Nama kamu"
                        required
                      />
                    </Form.Group>
                    <Button
                      type="submit"
                      variant="primary"
                      className="w-100"
                      disabled={accepting}
                    >
                      {accepting ? 'Memproses...' : 'Terima Undangan'}
                    </Button>
                  </Form>
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}
