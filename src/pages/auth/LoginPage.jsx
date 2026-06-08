import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap'
import { AppName } from '../../config'
import { useAuth } from '../../context/AuthContext'

export default function LoginPage() {
  const { login, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/'

  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState(null)

  const onChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const onSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    try {
      await login(form)
      navigate(from, { replace: true })
    } catch {
      setError('Email atau password salah.')
    }
  }

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={6} lg={4}>
          <div className="text-center mb-4">
            <h3 className="text-primary fw-bold">
              <i className="bi bi-ticket-perforated-fill me-2" />
              {AppName}
            </h3>
            <p className="text-muted">Masuk ke akunmu</p>
          </div>
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-4">
              {error && <Alert variant="danger">{error}</Alert>}
              <Form onSubmit={onSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={onChange}
                    placeholder="nama@email.com"
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
                    placeholder="••••••••"
                    required
                  />
                </Form.Group>
                <Button
                  type="submit"
                  variant="primary"
                  className="w-100"
                  disabled={loading}
                >
                  {loading ? 'Memproses...' : 'Masuk'}
                </Button>
              </Form>
            </Card.Body>
          </Card>
          <p className="text-center text-muted mt-3 small">
            Belum punya akun?{' '}
            <Link to="/register" className="text-decoration-none">
              Daftar
            </Link>
          </p>
        </Col>
      </Row>
    </Container>
  )
}
