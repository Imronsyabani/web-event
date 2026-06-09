import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Container, Card, Form, Button, Row, Col } from 'react-bootstrap'
import Loader from '../../components/common/Loader'
import TicketPhaseEditor from '../../components/event/TicketPhaseEditor'
import { eventService } from '../../services/eventService'
import { paymentMethods } from '../../mocks/data'

const EMPTY = {
  title: '',
  category: '',
  description: '',
  startAt: '',
  endAt: '',
  banner: '',
  venue: { name: '', address: '', mapUrl: '' },
  tickets: [],
  paymentConfig: { methods: [] },
  published: false,
}

// Dipakai untuk buat (tanpa id) dan edit (dengan id) event
export default function EventFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)
  const [form, setForm] = useState(EMPTY)
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!isEdit) return
    eventService
      .get(id)
      .then((ev) =>
        setForm({
          ...EMPTY,
          ...ev,
          venue: { ...EMPTY.venue, ...(ev.venue || {}) },
          tickets: ev.tickets || [],
          paymentConfig: { methods: ev.paymentConfig?.methods || [] },
        }),
      )
      .finally(() => setLoading(false))
  }, [id, isEdit])

  const onChange = (e) => {
    const { name, type, checked, value } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const onVenueChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, venue: { ...prev.venue, [name]: value } }))
  }

  // ---- payment methods ----
  const togglePayment = (code) =>
    setForm((p) => {
      const set = new Set(p.paymentConfig.methods)
      set.has(code) ? set.delete(code) : set.add(code)
      return { ...p, paymentConfig: { methods: [...set] } }
    })

  const onSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (isEdit) await eventService.update(id, form)
      else await eventService.create(form)
      navigate('/owner/events')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Loader fullPage />

  return (
    <Container className="p-4" style={{ maxWidth: 860 }}>
      <h1 className="h3 mb-4">{isEdit ? 'Edit Event' : 'Buat Event'}</h1>
      <Form onSubmit={onSubmit}>
        {/* Data dasar */}
        <Card className="border-0 shadow-sm mb-4">
          <Card.Body className="p-4">
            <h6 className="mb-3">Informasi Dasar</h6>
            <Form.Group className="mb-3">
              <Form.Label>Nama Event</Form.Label>
              <Form.Control
                name="title"
                value={form.title}
                onChange={onChange}
                required
              />
            </Form.Group>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Kategori</Form.Label>
                  <Form.Control
                    name="category"
                    value={form.category}
                    onChange={onChange}
                    placeholder="Musik, Seminar, ..."
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
                  <Form.Label>Mulai</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    name="startAt"
                    value={form.startAt}
                    onChange={onChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Selesai</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    name="endAt"
                    value={form.endAt}
                    onChange={onChange}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group>
              <Form.Label>Deskripsi</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                name="description"
                value={form.description}
                onChange={onChange}
              />
            </Form.Group>
          </Card.Body>
        </Card>

        {/* Venue */}
        <Card className="border-0 shadow-sm mb-4">
          <Card.Body className="p-4">
            <h6 className="mb-3">Venue</h6>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Nama Tempat</Form.Label>
                  <Form.Control
                    name="name"
                    value={form.venue.name}
                    onChange={onVenueChange}
                    placeholder="GBK Senayan / Online"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>URL Google Maps</Form.Label>
                  <Form.Control
                    name="mapUrl"
                    value={form.venue.mapUrl}
                    onChange={onVenueChange}
                    placeholder="https://maps.google.com/..."
                  />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group>
              <Form.Label>Alamat Lengkap</Form.Label>
              <Form.Control
                name="address"
                value={form.venue.address}
                onChange={onVenueChange}
              />
            </Form.Group>
          </Card.Body>
        </Card>

        {/* Tiket & fase (Early Bird / Normal) */}
        <Card className="border-0 shadow-sm mb-4">
          <Card.Body className="p-4">
            <h6 className="mb-1">Tiket & Fase Penjualan</h6>
            <p className="text-muted small">
              Tiap tiket bisa punya beberapa fase berurut waktu (mis. Early Bird →
              Normal). Fase aktif menentukan harga & apakah lewat antrian.
            </p>
            <TicketPhaseEditor
              tickets={form.tickets}
              onChange={(tickets) => setForm((p) => ({ ...p, tickets }))}
            />
          </Card.Body>
        </Card>

        {/* Konfigurasi pembayaran */}
        <Card className="border-0 shadow-sm mb-4">
          <Card.Body className="p-4">
            <h6 className="mb-1">Metode Pembayaran</h6>
            <p className="text-muted small">
              Pilih metode yang diaktifkan. Proses bayar memakai gateway bersama.
            </p>
            <Row>
              {paymentMethods.map((m) => (
                <Col sm={6} md={4} key={m.code}>
                  <Form.Check
                    type="checkbox"
                    id={`pm-${m.code}`}
                    label={m.name}
                    checked={form.paymentConfig.methods.includes(m.code)}
                    onChange={() => togglePayment(m.code)}
                    className="mb-2"
                  />
                </Col>
              ))}
            </Row>
          </Card.Body>
        </Card>

        {/* Opsi */}
        <Card className="border-0 shadow-sm mb-4">
          <Card.Body className="p-4">
            <Form.Check
              type="switch"
              id="published"
              name="published"
              label="Terbitkan event (tampil di publik)"
              checked={form.published}
              onChange={onChange}
            />
          </Card.Body>
        </Card>

        <div className="d-flex gap-2">
          <Button type="submit" variant="primary" disabled={saving}>
            {saving ? 'Menyimpan...' : 'Simpan'}
          </Button>
          <Button
            variant="outline-secondary"
            onClick={() => navigate('/owner/events')}
          >
            Batal
          </Button>
        </div>
      </Form>
    </Container>
  )
}
