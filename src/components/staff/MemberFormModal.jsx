import { useEffect, useState } from 'react'
import { Modal, Form, Button } from 'react-bootstrap'
import { ROLES, roleName } from '../../config/roles'

// Modal undang member baru (member=null) atau ubah role member (member terisi).
// assignableRoles = role yang boleh diberikan aktor (anti privilege escalation).
export default function MemberFormModal({
  show,
  onHide,
  member,
  assignableRoles,
  onSubmit,
}) {
  const isEdit = Boolean(member)
  const [email, setEmail] = useState('')
  const [roles, setRoles] = useState([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (show) {
      setEmail(member?.email || '')
      setRoles(member?.roles?.filter((r) => assignableRoles.includes(r)) || [])
    }
  }, [show, member, assignableRoles])

  const toggle = (code) =>
    setRoles((prev) =>
      prev.includes(code) ? prev.filter((r) => r !== code) : [...prev, code],
    )

  const submit = async (e) => {
    e.preventDefault()
    if (roles.length === 0) return
    setSaving(true)
    try {
      await onSubmit({ email, roles })
      onHide()
    } finally {
      setSaving(false)
    }
  }

  const options = ROLES.filter((r) => assignableRoles.includes(r.code))

  return (
    <Modal show={show} onHide={onHide} centered>
      <Form onSubmit={submit}>
        <Modal.Header closeButton>
          <Modal.Title>{isEdit ? 'Ubah Role' : 'Undang Staff'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@email.com"
              required
              disabled={isEdit}
            />
            {!isEdit && (
              <Form.Text className="text-muted">
                Undangan dikirim ke email ini untuk diterima.
              </Form.Text>
            )}
          </Form.Group>

          <Form.Label>Role {isEdit ? '' : '(boleh lebih dari satu)'}</Form.Label>
          {options.length === 0 ? (
            <p className="text-muted small">Kamu tidak punya hak memberi role.</p>
          ) : (
            options.map((r) => (
              <Form.Check
                key={r.code}
                type="checkbox"
                id={`role-${r.code}`}
                className="mb-2"
                checked={roles.includes(r.code)}
                onChange={() => toggle(r.code)}
                label={
                  <span>
                    <strong>{roleName(r.code)}</strong>
                    <span className="text-muted small d-block">{r.desc}</span>
                  </span>
                }
              />
            ))
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={onHide}>
            Batal
          </Button>
          <Button type="submit" variant="primary" disabled={saving || roles.length === 0}>
            {saving ? 'Menyimpan...' : isEdit ? 'Simpan' : 'Kirim Undangan'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}
