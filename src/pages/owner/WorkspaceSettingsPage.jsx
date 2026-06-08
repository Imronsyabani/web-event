import { useEffect, useState, useRef } from 'react'
import { Container, Card, Form, Button, Row, Col, InputGroup, Spinner } from 'react-bootstrap'
import Loader from '../../components/common/Loader'
import { workspaceService } from '../../services/workspaceService'
import { BaseDomain } from '../../config'

const EMPTY = {
  name: '',
  subdomain: '',
  logo: '',
  banner: '',
  about: '',
  theme: { primary: '#6c5ce7', font: 'Inter' },
}

export default function WorkspaceSettingsPage() {
  const [form, setForm] = useState(EMPTY)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [subCheck, setSubCheck] = useState(null) // { checking, available, reserved, valid }
  const debounceRef = useRef(null)

  useEffect(() => {
    workspaceService
      .get()
      .then((ws) => setForm({ ...EMPTY, ...ws, theme: { ...EMPTY.theme, ...ws.theme } }))
      .finally(() => setLoading(false))
  }, [])

  const onChange = (e) => {
    const { name, value } = e.target
    setSaved(false)
    if (name === 'primary' || name === 'font') {
      setForm((p) => ({ ...p, theme: { ...p.theme, [name]: value } }))
    } else {
      setForm((p) => ({ ...p, [name]: value }))
    }
  }

  // Cek subdomain dengan debounce saat diketik
  const onSubdomainChange = (e) => {
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')
    setForm((p) => ({ ...p, subdomain: value }))
    setSaved(false)
    setSubCheck({ checking: true })
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      workspaceService
        .checkSubdomain(value)
        .then((res) => setSubCheck({ checking: false, ...res }))
        .catch(() => setSubCheck(null))
    }, 400)
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await workspaceService.save(form)
      setSaved(true)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Loader fullPage />

  const subValid = subCheck && !subCheck.checking ? subCheck.available : true

  return (
    <Container className="p-4" style={{ maxWidth: 820 }}>
      <h1 className="h3 mb-1">Pengaturan Workspace</h1>
      <p className="text-muted">
        Identitas & subdomain untuk halaman publik event-mu.
      </p>

      <Form onSubmit={onSubmit}>
        <Card className="border-0 shadow-sm mb-4">
          <Card.Body className="p-4">
            <h6 className="mb-3">Identitas</h6>
            <Form.Group className="mb-3">
              <Form.Label>Nama Workspace</Form.Label>
              <Form.Control
                name="name"
                value={form.name}
                onChange={onChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Subdomain</Form.Label>
              <InputGroup>
                <Form.Control
                  name="subdomain"
                  value={form.subdomain}
                  onChange={onSubdomainChange}
                  placeholder="korean-fest"
                  isInvalid={subCheck && !subCheck.checking && !subValid}
                  isValid={subCheck && !subCheck.checking && subValid && !!form.subdomain}
                />
                <InputGroup.Text>.{BaseDomain}</InputGroup.Text>
              </InputGroup>
              <Form.Text className="d-flex align-items-center gap-2 mt-1">
                {subCheck?.checking ? (
                  <>
                    <Spinner size="sm" /> Mengecek...
                  </>
                ) : subCheck && !subValid ? (
                  <span className="text-danger">
                    {subCheck.reserved
                      ? 'Subdomain ini dicadangkan sistem.'
                      : 'Format subdomain tidak valid.'}
                  </span>
                ) : (
                  <span className="text-muted">
                    Halaman publik: <strong>https://{form.subdomain || 'nama'}.{BaseDomain}</strong>
                  </span>
                )}
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-1">
              <Form.Label>Tentang</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="about"
                value={form.about}
                onChange={onChange}
                placeholder="Deskripsi singkat penyelenggara"
              />
            </Form.Group>
          </Card.Body>
        </Card>

        <Card className="border-0 shadow-sm mb-4">
          <Card.Body className="p-4">
            <h6 className="mb-3">Branding</h6>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>URL Logo</Form.Label>
                  <Form.Control
                    name="logo"
                    value={form.logo}
                    onChange={onChange}
                    placeholder="https://..."
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>URL Banner</Form.Label>
                  <Form.Control
                    name="banner"
                    value={form.banner}
                    onChange={onChange}
                    placeholder="https://..."
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Warna Utama</Form.Label>
                  <Form.Control
                    type="color"
                    name="primary"
                    value={form.theme.primary}
                    onChange={onChange}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Font</Form.Label>
                  <Form.Select name="font" value={form.theme.font} onChange={onChange}>
                    <option>Inter</option>
                    <option>Poppins</option>
                    <option>Roboto</option>
                    <option>Montserrat</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        <div className="d-flex align-items-center gap-3">
          <Button type="submit" variant="primary" disabled={saving || !subValid}>
            {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
          </Button>
          {saved && (
            <span className="text-success small">
              <i className="bi bi-check-circle-fill me-1" />
              Tersimpan
            </span>
          )}
        </div>
      </Form>
    </Container>
  )
}
