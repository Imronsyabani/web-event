import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Container, Card, Form, Button, Row, Col, Table } from 'react-bootstrap'
import Loader from '../../components/common/Loader'
import { eventService } from '../../services/eventService'
import { paymentMethods } from '../../mocks/data'
import { formatRupiah } from '../../utils/format'

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
  isWarTicket: false,
  published: false,
}

const newTicket = () => ({
  id: `tk-${Math.random().toString(36).slice(2, 8)}`,
  name: '',
  price: 0,
  quota: 0,
})

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

  // ---- tickets dinamis ----
  const addTicket = () =>
    setForm((p) => ({ ...p, tickets: [...p.tickets, newTicket()] }))
  const removeTicket = (idx) =>
    setForm((p) => ({ ...p, tickets: p.tickets.filter((_, i) => i !== idx) }))
  const updateTicket = (idx, field, value) =>
    setForm((p) => ({
      ...p,
      tickets: p.tickets.map((t, i) =>
        i === idx
          ? { ...t, [field]: field === 'name' ? value : Number(value) }
          : t,
      ),
    }))

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

        {/* Tiket / daftar harga */}
        <Card className="border-0 shadow-sm mb-4">
          <Card.Body className="p-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="mb-0">Daftar Harga Tiket</h6>
              <Button size="sm" variant="outline-primary" onClick={addTicket}>
                <i className="bi bi-plus-lg me-1" />
                Tambah Tiket
              </Button>
            </div>
            {form.tickets.length === 0 ? (
              <p className="text-muted small mb-0">
                Belum ada tiket. Klik &quot;Tambah Tiket&quot;.
              </p>
            ) : (
              <Table responsive className="align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Nama</th>
                    <th style={{ width: 160 }}>Harga (Rp)</th>
                    <th style={{ width: 110 }}>Kuota</th>
                    <th style={{ width: 50 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {form.tickets.map((t, idx) => (
                    <tr key={t.id}>
                      <td>
                        <Form.Control
                          value={t.name}
                          onChange={(e) => updateTicket(idx, 'name', e.target.value)}
                          placeholder="VIP / Regular / ..."
                        />
                      </td>
                      <td>
                        <Form.Control
                          type="number"
                          min={0}
                          value={t.price}
                          onChange={(e) => updateTicket(idx, 'price', e.target.value)}
                        />
                      </td>
                      <td>
                        <Form.Control
                          type="number"
                          min={0}
                          value={t.quota}
                          onChange={(e) => updateTicket(idx, 'quota', e.target.value)}
                        />
                      </td>
                      <td className="text-end">
                        <Button
                          size="sm"
                          variant="outline-danger"
                          onClick={() => removeTicket(idx)}
                        >
                          <i className="bi bi-trash" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
            {form.tickets.length > 0 && (
              <div className="text-muted small mt-2">
                Termurah:{' '}
                {formatRupiah(Math.min(...form.tickets.map((t) => t.price || 0)))}
              </div>
            )}
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
              id="isWarTicket"
              name="isWarTicket"
              label="Gunakan waiting queue (war ticket)"
              checked={form.isWarTicket}
              onChange={onChange}
              className="mb-2"
            />
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
