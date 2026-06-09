import { useEffect, useState } from 'react'
import {
  Container, Row, Col, Card, Button, Form, Badge, Tabs, Tab, Alert,
} from 'react-bootstrap'
import Loader from '../../components/common/Loader'
import RenderTemplate from '../../builder/render'
import { TEMPLATES, getTemplate } from '../../builder/templates'
import { ALL_TOKENS, WIDGETS } from '../../builder/catalog'
import { builderService } from '../../services/builderService'
import { eventService } from '../../services/eventService'
import { useWorkspace } from '../../context/WorkspaceContext'
import { BaseDomain } from '../../config'
import { formatRupiah } from '../../utils/format'

// Komponen dummy untuk preview marker
const previewComponents = (events) => ({
  '{{events}}': () => (
    <div className="row g-3">
      {(events.length ? events : [{ id: 'x', title: 'Contoh Event' }]).slice(0, 3).map((e) => (
        <div className="col-4" key={e.id}>
          <div className="card border-0 shadow-sm">
            <div className="ratio ratio-16x9 bg-light" />
            <div className="card-body p-2 small">{e.title}</div>
          </div>
        </div>
      ))}
    </div>
  ),
  '{{ticket_list}}': () => (
    <ul className="list-group list-group-flush mb-2">
      <li className="list-group-item d-flex justify-content-between px-0">
        <span>Regular</span>
        <strong>{formatRupiah(150000)}</strong>
      </li>
    </ul>
  ),
  '{{buy_button}}': () => (
    <button className="btn w-100 text-white" style={{ background: 'var(--site-primary)' }}>
      Beli Tiket
    </button>
  ),
})

export default function WebsiteBuilderPage() {
  const { current } = useWorkspace()
  const [site, setSite] = useState(null)
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState(null)

  useEffect(() => {
    Promise.all([builderService.getSite(), eventService.mine()])
      .then(([s, ev]) => {
        setSite(s)
        setEvents(ev.items || [])
      })
      .finally(() => setLoading(false))
  }, [])

  const update = (patch) => {
    setSite((s) => ({ ...s, ...patch }))
    setNotice(null)
  }
  const updateTheme = (patch) =>
    setSite((s) => ({ ...s, theme: { ...s.theme, ...patch } }))

  const pickTemplate = (id) => {
    const t = getTemplate(id)
    update({
      mode: 'template',
      templateId: id,
      landingHtml: t.landingHtml,
      eventHtml: t.eventHtml,
      css: t.css,
    })
  }

  const save = async (publish = false) => {
    setSaving(true)
    try {
      await builderService.saveSite(site)
      if (publish) {
        const s = await builderService.publish()
        setSite(s)
        setNotice({ type: 'success', text: 'Situs dipublish!' })
      } else {
        setNotice({ type: 'info', text: 'Draf tersimpan.' })
      }
    } finally {
      setSaving(false)
    }
  }

  if (loading || !site) return <Loader fullPage />

  const siteUrl = `/s/${current?.subdomain}`
  const previewStyle = {
    '--site-primary': site.theme?.primary,
    fontFamily: site.theme?.font,
    background: '#fff',
  }

  return (
    <Container fluid className="p-4">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-1">
        <div>
          <h1 className="h3 mb-1">Website Builder</h1>
          <p className="text-muted mb-0">
            {current?.subdomain}.{BaseDomain}
            <Badge bg={site.status === 'published' ? 'success' : 'secondary'} className="ms-2">
              {site.status === 'published' ? 'Published' : 'Draf'}
            </Badge>
          </p>
        </div>
        <div className="d-flex gap-2">
          {site.status === 'published' && (
            <Button variant="outline-secondary" href={siteUrl} target="_blank">
              <i className="bi bi-box-arrow-up-right me-1" />
              Lihat
            </Button>
          )}
          <Button variant="outline-primary" onClick={() => save(false)} disabled={saving}>
            Simpan Draf
          </Button>
          <Button variant="primary" onClick={() => save(true)} disabled={saving}>
            Publish
          </Button>
        </div>
      </div>

      {notice && (
        <Alert variant={notice.type} className="py-2">
          {notice.text}
        </Alert>
      )}

      <Tabs defaultActiveKey="template" className="mb-3">
        {/* Galeri template */}
        <Tab eventKey="template" title="Template">
          <Row className="g-3">
            {TEMPLATES.map((t) => (
              <Col sm={6} md={4} key={t.id}>
                <Card
                  className={`card-event ${site.templateId === t.id && site.mode === 'template' ? 'border-primary border-2' : 'border'}`}
                  onClick={() => pickTemplate(t.id)}
                  role="button"
                >
                  <Card.Body className="d-flex justify-content-between align-items-center">
                    <span className="fw-semibold">{t.name}</span>
                    {site.templateId === t.id && <Badge bg="primary">Dipakai</Badge>}
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Tab>

        {/* Tema */}
        <Tab eventKey="theme" title="Tema">
          <Card className="border-0 shadow-sm" style={{ maxWidth: 420 }}>
            <Card.Body>
              <Form.Group className="mb-3">
                <Form.Label>Warna Utama</Form.Label>
                <Form.Control
                  type="color"
                  value={site.theme?.primary || '#6c5ce7'}
                  onChange={(e) => updateTheme({ primary: e.target.value })}
                />
              </Form.Group>
              <Form.Group>
                <Form.Label>Font</Form.Label>
                <Form.Select
                  value={site.theme?.font || 'Inter'}
                  onChange={(e) => updateTheme({ font: e.target.value })}
                >
                  <option>Inter</option>
                  <option>Poppins</option>
                  <option>Roboto</option>
                  <option>Montserrat</option>
                </Form.Select>
              </Form.Group>
            </Card.Body>
          </Card>
        </Tab>

        {/* Advanced HTML/CSS */}
        <Tab eventKey="code" title="HTML / CSS (Advanced)">
          <Row className="g-3">
            <Col lg={8}>
              <Form.Group className="mb-3">
                <Form.Label>HTML Landing</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={10}
                  className="font-monospace small"
                  value={site.landingHtml}
                  onChange={(e) => update({ mode: 'custom', landingHtml: e.target.value })}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>HTML Detail Event</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={10}
                  className="font-monospace small"
                  value={site.eventHtml}
                  onChange={(e) => update({ mode: 'custom', eventHtml: e.target.value })}
                />
              </Form.Group>
              <Form.Group>
                <Form.Label>CSS</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={5}
                  className="font-monospace small"
                  value={site.css}
                  onChange={(e) => update({ mode: 'custom', css: e.target.value })}
                />
              </Form.Group>
            </Col>
            {/* Referensi token */}
            <Col lg={4}>
              <Card className="border-0 shadow-sm">
                <Card.Body>
                  <h6>Token Data</h6>
                  <div className="d-flex flex-wrap gap-1 mb-3">
                    {ALL_TOKENS.map((t) => (
                      <code
                        key={t.token}
                        className="small bg-light px-1 rounded"
                        title={t.desc}
                      >
                        {t.token}
                      </code>
                    ))}
                  </div>
                  <h6>Widget (posisi baku)</h6>
                  <div className="d-flex flex-wrap gap-1">
                    {WIDGETS.map((w) => (
                      <code key={w.tag} className="small bg-light px-1 rounded" title={w.desc}>
                        {w.tag.includes('buy') ? '{{buy_button}}' : w.tag}
                      </code>
                    ))}
                  </div>
                  <p className="small text-muted mt-3 mb-0">
                    Token diganti data otomatis. <code>{'{{buy_button}}'}</code>,{' '}
                    <code>{'{{ticket_list}}'}</code>, <code>{'{{events}}'}</code> jadi
                    komponen kami.
                  </p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Tab>

        {/* Preview */}
        <Tab eventKey="preview" title="Preview">
          <div className="border rounded overflow-hidden">
            <div style={previewStyle}>
              <style>{`:root{--site-primary:${site.theme?.primary}}`}</style>
              {site.css && <style>{site.css}</style>}
              <RenderTemplate
                html={site.landingHtml}
                data={{ workspace: current || {} }}
                components={previewComponents(events)}
              />
            </div>
          </div>
        </Tab>
      </Tabs>
    </Container>
  )
}
