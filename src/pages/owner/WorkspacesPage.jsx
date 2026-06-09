import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Container, Row, Col, Card, Button, Badge, Modal, Form, Alert } from 'react-bootstrap'
import { useWorkspace } from '../../context/WorkspaceContext'
import { usePlan } from '../../context/PlanContext'
import UpgradeCard from '../../components/common/UpgradeCard'
import { BaseDomain } from '../../config'

export default function WorkspacesPage() {
  const { workspaces, current, switchTo, create } = useWorkspace()
  const { limit, isPro } = usePlan()
  const navigate = useNavigate()
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ name: '', subdomain: '' })
  const [saving, setSaving] = useState(false)

  const max = limit('workspaces')
  const atLimit = workspaces.length >= max

  const submit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await create(form)
      setShowCreate(false)
      setForm({ name: '', subdomain: '' })
      navigate('/owner/workspace')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Container fluid className="p-4">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-1">
        <h1 className="h3 mb-0">Workspace</h1>
        <Button
          variant="primary"
          onClick={() => setShowCreate(true)}
          disabled={atLimit}
        >
          <i className="bi bi-plus-lg me-1" />
          Buat Workspace
        </Button>
      </div>
      <p className="text-muted">
        {workspaces.length} dari {max} workspace terpakai (paket{' '}
        {isPro ? 'Pro' : 'Free'}).
      </p>

      {atLimit && (
        <Alert variant="warning" className="d-flex align-items-center gap-2">
          <i className="bi bi-exclamation-triangle" />
          <span>
            Kuota workspace paketmu sudah penuh.
            {!isPro && ' Upgrade ke Pro untuk menambah hingga 3 workspace.'}
          </span>
        </Alert>
      )}

      <Row className="g-3">
        {workspaces.map((w) => (
          <Col md={6} lg={4} key={w.id}>
            <Card className={`border-0 shadow-sm h-100 ${w.id === current?.id ? 'border-primary border-2' : ''}`}>
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <h5 className="mb-0">{w.name}</h5>
                  {w.status === 'suspended' ? (
                    <Badge bg="warning" text="dark">Suspended</Badge>
                  ) : w.id === current?.id ? (
                    <Badge bg="primary">Aktif</Badge>
                  ) : null}
                </div>
                <div className="small text-muted mb-3">
                  <i className="bi bi-globe me-1" />
                  {w.subdomain}.{BaseDomain}
                </div>
                <div className="d-flex gap-2">
                  {w.id !== current?.id && (
                    <Button size="sm" variant="outline-primary" onClick={() => switchTo(w.id)}>
                      Pilih
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline-secondary"
                    href={`/s/${w.subdomain}`}
                    target="_blank"
                  >
                    <i className="bi bi-box-arrow-up-right me-1" />
                    Situs
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {!isPro && atLimit && (
        <div className="mt-4" style={{ maxWidth: 420 }}>
          <UpgradeCard feature="Tambah workspace" compact />
        </div>
      )}

      {/* Modal buat workspace */}
      <Modal show={showCreate} onHide={() => setShowCreate(false)} centered>
        <Form onSubmit={submit}>
          <Modal.Header closeButton>
            <Modal.Title>Buat Workspace</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Nama Workspace</Form.Label>
              <Form.Control
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                required
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Subdomain</Form.Label>
              <div className="input-group">
                <Form.Control
                  value={form.subdomain}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      subdomain: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''),
                    }))
                  }
                  placeholder="nama-workspace"
                  required
                />
                <span className="input-group-text">.{BaseDomain}</span>
              </div>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="outline-secondary" onClick={() => setShowCreate(false)}>
              Batal
            </Button>
            <Button type="submit" variant="primary" disabled={saving}>
              {saving ? 'Membuat...' : 'Buat & Aktifkan'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  )
}
