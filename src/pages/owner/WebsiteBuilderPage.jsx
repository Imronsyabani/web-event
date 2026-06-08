import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Container, Row, Col, Card, Button, Form, Badge } from 'react-bootstrap'
import Loader from '../../components/common/Loader'
import { builderService } from '../../services/builderService'

// Website builder: pilih template, atur tema & section, lalu publish.
// Versi awal: pemilihan template + pengaturan dasar (drag-drop menyusul).
export default function WebsiteBuilderPage() {
  const { eventId } = useParams()
  const [templates, setTemplates] = useState([])
  const [site, setSite] = useState({ templateId: '', primaryColor: '#6c5ce7', headline: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let active = true
    const calls = [builderService.templates()]
    if (eventId) calls.push(builderService.getSite(eventId))
    Promise.all(calls)
      .then(([tpls, existing]) => {
        if (!active) return
        setTemplates(tpls.items || tpls || [])
        if (existing) setSite((prev) => ({ ...prev, ...existing }))
      })
      .catch(() => {})
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [eventId])

  const onChange = (e) =>
    setSite((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSave = async (publish = false) => {
    if (!eventId) return
    setSaving(true)
    try {
      await builderService.saveSite(eventId, site)
      if (publish) await builderService.publish(eventId)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Loader fullPage />

  return (
    <Container fluid className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-1">Website Builder</h1>
          <p className="text-muted mb-0">
            Buat halaman event unik dari template siap pakai.
          </p>
        </div>
        <div className="d-flex gap-2">
          <Button
            variant="outline-primary"
            onClick={() => handleSave(false)}
            disabled={saving || !eventId}
          >
            Simpan Draf
          </Button>
          <Button
            variant="primary"
            onClick={() => handleSave(true)}
            disabled={saving || !eventId}
          >
            Publish
          </Button>
        </div>
      </div>

      {!eventId && (
        <Card className="border-0 shadow-sm mb-4">
          <Card.Body className="text-muted small">
            Pilih event dari menu <strong>Event Saya</strong> untuk mulai
            menyusun website-nya.
          </Card.Body>
        </Card>
      )}

      <Row className="g-4">
        {/* Panel pengaturan */}
        <Col lg={4}>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <h6 className="mb-3">Pengaturan</h6>
              <Form.Group className="mb-3">
                <Form.Label>Headline</Form.Label>
                <Form.Control
                  name="headline"
                  value={site.headline}
                  onChange={onChange}
                  placeholder="Judul utama halaman"
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Warna Utama</Form.Label>
                <Form.Control
                  type="color"
                  name="primaryColor"
                  value={site.primaryColor}
                  onChange={onChange}
                  title="Pilih warna utama"
                />
              </Form.Group>
            </Card.Body>
          </Card>
        </Col>

        {/* Galeri template */}
        <Col lg={8}>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <h6 className="mb-3">Pilih Template</h6>
              {templates.length === 0 ? (
                <p className="text-muted small">
                  Template belum tersedia dari server.
                </p>
              ) : (
                <Row className="g-3">
                  {templates.map((tpl) => {
                    const active = site.templateId === tpl.id
                    return (
                      <Col sm={6} md={4} key={tpl.id}>
                        <Card
                          className={`h-100 card-event ${
                            active ? 'border-primary border-2' : 'border'
                          }`}
                          onClick={() =>
                            setSite((p) => ({ ...p, templateId: tpl.id }))
                          }
                        >
                          <div className="ratio ratio-4x3 bg-light">
                            {tpl.thumbnail && (
                              <Card.Img src={tpl.thumbnail} alt={tpl.name} />
                            )}
                          </div>
                          <Card.Body className="d-flex justify-content-between align-items-center">
                            <span className="small fw-semibold">{tpl.name}</span>
                            {active && <Badge bg="primary">Dipilih</Badge>}
                          </Card.Body>
                        </Card>
                      </Col>
                    )
                  })}
                </Row>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}
