import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap'
import { AppName, Roles } from '../../config'
import { useAuth } from '../../context/AuthContext'

export default function RegisterPage() {
  const { register, loading } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: Roles.Buyer,
  })
  const [error, setError] = useState(null)

  const onChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const onSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    try {
      await register(form)
      navigate('/')
    } catch {
      setError('Pendaftaran gagal. Coba lagi.')
    }
  }

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={6} lg={5}>
          <div className="text-center mb-4">
            <h3 className="text-primary fw-bold">
              <i className="bi bi-ticket-perforated-fill me-2" />
              {AppName}
            </h3>
            <p className="text-muted">Buat akun baru</p>
          </div>
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-4">
              {error && <Alert variant="danger">{error}</Alert>}
              <Form onSubmit={onSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Nama Lengkap</Form.Label>
                  <Form.Control
                    name="name"
                    value={form.name}
                    onChange={onChange}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={onChange}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={onChange}
                    minLength={6}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Daftar sebagai</Form.Label>
                  <Form.Select
                    name="role"
                    value={form.role}
                    onChange={onChange}
                  >
                    <option value={Roles.Buyer}>Pembeli Tiket</option>
                    <option value={Roles.Owner}>Penyelenggara Event</option>
                  </Form.Select>
                </Form.Group>
                <Button
                  type="submit"
                  variant="primary"
                  className="w-100"
                  disabled={loading}
                >
                  {loading ? 'Memproses...' : 'Daftar'}
                </Button>
              </Form>
            </Card.Body>
          </Card>
          <p className="text-center text-muted mt-3 small">
            Sudah punya akun?{' '}
            <Link to="/login" className="text-decoration-none">
              Masuk
            </Link>
          </p>
        </Col>
      </Row>
    </Container>
  )
}
