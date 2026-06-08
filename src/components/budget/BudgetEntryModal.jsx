import { useState } from 'react'
import { Modal, Form, Button, Row, Col, Image, Badge } from 'react-bootstrap'
import { useAuth } from '../../context/AuthContext'
import { filesToDataUrls } from '../../utils/file'

const today = () => new Date().toISOString().slice(0, 10)

const emptyForm = () => ({
  type: 'expense',
  title: '',
  amount: '',
  categoryId: '',
  description: '',
  transactionDate: today(),
  receipts: [],
})

// Modal tambah entri buku kas (pemasukan/pengeluaran)
export default function BudgetEntryModal({ show, onHide, categories, onSubmit }) {
  const { user } = useAuth()
  const [form, setForm] = useState(emptyForm())
  const [saving, setSaving] = useState(false)

  const reset = () => setForm(emptyForm())

  const onChange = (e) => {
    const { name, value } = e.target
    setForm((p) => ({ ...p, [name]: value }))
  }

  // Ganti tipe → reset kategori (karena master kategori terpisah per tipe)
  const onTypeChange = (type) =>
    setForm((p) => ({ ...p, type, categoryId: '' }))

  const onFiles = async (e) => {
    const urls = await filesToDataUrls(e.target.files)
    setForm((p) => ({ ...p, receipts: [...p.receipts, ...urls] }))
  }
  const removeReceipt = (idx) =>
    setForm((p) => ({ ...p, receipts: p.receipts.filter((_, i) => i !== idx) }))

  const submit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await onSubmit({
        ...form,
        amount: Number(form.amount) || 0,
        createdBy: user?.name || 'Saya',
      })
      reset()
      onHide()
    } finally {
      setSaving(false)
    }
  }

  const catOptions = categories.filter((c) => c.type === form.type)

  return (
    <Modal show={show} onHide={onHide} centered>
      <Form onSubmit={submit}>
        <Modal.Header closeButton>
          <Modal.Title>Tambah Transaksi</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* Tipe */}
          <div className="d-flex gap-2 mb-3">
            <Button
              type="button"
              variant={form.type === 'expense' ? 'danger' : 'outline-danger'}
              className="flex-fill"
              onClick={() => onTypeChange('expense')}
            >
              <i className="bi bi-arrow-down-circle me-1" />
              Pengeluaran
            </Button>
            <Button
              type="button"
              variant={form.type === 'income' ? 'success' : 'outline-success'}
              className="flex-fill"
              onClick={() => onTypeChange('income')}
            >
              <i className="bi bi-arrow-up-circle me-1" />
              Pemasukan
            </Button>
          </div>

          <Form.Group className="mb-3">
            <Form.Label>Judul</Form.Label>
            <Form.Control
              name="title"
              value={form.title}
              onChange={onChange}
              placeholder="Pembayaran makan siang staff"
              required
            />
          </Form.Group>

          <Row>
            <Col xs={7}>
              <Form.Group className="mb-3">
                <Form.Label>Nominal (Rp)</Form.Label>
                <Form.Control
                  type="number"
                  min={0}
                  name="amount"
                  value={form.amount}
                  onChange={onChange}
                  placeholder="560000"
                  required
                />
              </Form.Group>
            </Col>
            <Col xs={5}>
              <Form.Group className="mb-3">
                <Form.Label>Tanggal</Form.Label>
                <Form.Control
                  type="date"
                  name="transactionDate"
                  value={form.transactionDate}
                  onChange={onChange}
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Kategori</Form.Label>
            <Form.Select
              name="categoryId"
              value={form.categoryId}
              onChange={onChange}
              required
            >
              <option value="">Pilih kategori...</option>
              {catOptions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Deskripsi</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              name="description"
              value={form.description}
              onChange={onChange}
              placeholder="Opsional"
            />
          </Form.Group>

          {/* Foto struk (multi) */}
          <Form.Group className="mb-2">
            <Form.Label>Foto Struk (boleh lebih dari 1)</Form.Label>
            <Form.Control
              type="file"
              accept="image/*"
              multiple
              onChange={onFiles}
            />
          </Form.Group>
          {form.receipts.length > 0 && (
            <div className="d-flex flex-wrap gap-2 mb-2">
              {form.receipts.map((src, idx) => (
                <div key={idx} className="position-relative">
                  <Image
                    src={src}
                    thumbnail
                    style={{ width: 64, height: 64, objectFit: 'cover' }}
                  />
                  <Button
                    size="sm"
                    variant="danger"
                    className="position-absolute top-0 end-0 p-0 px-1 lh-1"
                    onClick={() => removeReceipt(idx)}
                  >
                    ×
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className="text-muted small">
            <i className="bi bi-person me-1" />
            Dibuat oleh: <Badge bg="light" text="dark">{user?.name || 'Saya'}</Badge>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={onHide}>
            Batal
          </Button>
          <Button type="submit" variant="primary" disabled={saving}>
            {saving ? 'Menyimpan...' : 'Simpan'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}
