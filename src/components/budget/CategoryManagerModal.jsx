import { useState } from 'react'
import { Modal, Form, Button, Badge, ListGroup } from 'react-bootstrap'

// Modal kelola master kategori (tambah/hapus), terpisah per tipe
export default function CategoryManagerModal({
  show,
  onHide,
  categories,
  onCreate,
  onDelete,
}) {
  const [name, setName] = useState('')
  const [type, setType] = useState('expense')
  const [busy, setBusy] = useState(false)

  const add = async (e) => {
    e.preventDefault()
    if (!name.trim()) return
    setBusy(true)
    try {
      await onCreate({ name: name.trim(), type })
      setName('')
    } finally {
      setBusy(false)
    }
  }

  const render = (t) => (
    <>
      <div className="text-muted small text-uppercase mb-1">
        {t === 'expense' ? 'Pengeluaran' : 'Pemasukan'}
      </div>
      <ListGroup className="mb-3">
        {categories.filter((c) => c.type === t).map((c) => (
          <ListGroup.Item
            key={c.id}
            className="d-flex justify-content-between align-items-center py-2"
          >
            {c.name}
            <Button
              size="sm"
              variant="outline-danger"
              className="border-0"
              onClick={() => onDelete(c.id)}
            >
              <i className="bi bi-trash" />
            </Button>
          </ListGroup.Item>
        ))}
      </ListGroup>
    </>
  )

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Kelola Kategori</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={add} className="mb-4">
          <div className="d-flex gap-2 mb-2">
            <Badge
              bg={type === 'expense' ? 'danger' : 'light'}
              text={type === 'expense' ? 'light' : 'dark'}
              role="button"
              className="px-3 py-2 border"
              onClick={() => setType('expense')}
            >
              Pengeluaran
            </Badge>
            <Badge
              bg={type === 'income' ? 'success' : 'light'}
              text={type === 'income' ? 'light' : 'dark'}
              role="button"
              className="px-3 py-2 border"
              onClick={() => setType('income')}
            >
              Pemasukan
            </Badge>
          </div>
          <div className="d-flex gap-2">
            <Form.Control
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nama kategori baru"
            />
            <Button type="submit" variant="primary" disabled={busy}>
              Tambah
            </Button>
          </div>
        </Form>

        {render('expense')}
        {render('income')}
      </Modal.Body>
    </Modal>
  )
}
