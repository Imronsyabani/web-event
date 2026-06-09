import { Card, Button, Form, Row, Col, Badge } from 'react-bootstrap'

const rid = (p) => `${p}-${Math.random().toString(36).slice(2, 8)}`

export const newPhase = () => ({
  id: rid('ph'),
  name: 'Normal',
  price: 0,
  quota: 0,
  startAt: '',
  endAt: '',
  isWarTicket: false,
})

export const newTicket = () => ({
  id: rid('tk'),
  name: '',
  phases: [{ ...newPhase(), name: 'Early Bird' }],
})

// Editor tiket + fase. Satu tiket = beberapa fase berurut waktu
// (Early Bird, Normal, ...). Tiap fase: harga, kuota, periode, war ticket.
export default function TicketPhaseEditor({ tickets, onChange }) {
  const update = (next) => onChange(next)

  const setTicket = (ti, patch) =>
    update(tickets.map((t, i) => (i === ti ? { ...t, ...patch } : t)))

  const removeTicket = (ti) => update(tickets.filter((_, i) => i !== ti))

  const setPhase = (ti, pi, patch) =>
    update(
      tickets.map((t, i) =>
        i === ti
          ? { ...t, phases: t.phases.map((p, j) => (j === pi ? { ...p, ...patch } : p)) }
          : t,
      ),
    )

  const addPhase = (ti) =>
    update(
      tickets.map((t, i) =>
        i === ti ? { ...t, phases: [...t.phases, newPhase()] } : t,
      ),
    )

  const removePhase = (ti, pi) =>
    update(
      tickets.map((t, i) =>
        i === ti ? { ...t, phases: t.phases.filter((_, j) => j !== pi) } : t,
      ),
    )

  return (
    <>
      {tickets.length === 0 && (
        <p className="text-muted small mb-3">
          Belum ada tiket. Tambah tiket lalu atur fase (Early Bird / Normal).
        </p>
      )}

      {tickets.map((t, ti) => (
        <Card key={t.id} className="mb-3 border">
          <Card.Body>
            <div className="d-flex gap-2 align-items-end mb-3">
              <Form.Group className="flex-grow-1">
                <Form.Label className="small mb-1">Nama Tiket</Form.Label>
                <Form.Control
                  value={t.name}
                  onChange={(e) => setTicket(ti, { name: e.target.value })}
                  placeholder="Festival / VIP / ..."
                />
              </Form.Group>
              <Button variant="outline-danger" onClick={() => removeTicket(ti)}>
                <i className="bi bi-trash" />
              </Button>
            </div>

            <div className="text-muted small mb-2">Fase Penjualan</div>
            {t.phases.map((p, pi) => (
              <div key={p.id} className="border rounded p-2 mb-2 bg-light">
                <Row className="g-2 align-items-end">
                  <Col xs={6} md={3}>
                    <Form.Label className="small mb-1">Nama Fase</Form.Label>
                    <Form.Control
                      size="sm"
                      value={p.name}
                      onChange={(e) => setPhase(ti, pi, { name: e.target.value })}
                      placeholder="Early Bird"
                    />
                  </Col>
                  <Col xs={6} md={2}>
                    <Form.Label className="small mb-1">Harga</Form.Label>
                    <Form.Control
                      size="sm"
                      type="number"
                      min={0}
                      value={p.price}
                      onChange={(e) => setPhase(ti, pi, { price: Number(e.target.value) })}
                    />
                  </Col>
                  <Col xs={6} md={2}>
                    <Form.Label className="small mb-1">Kuota</Form.Label>
                    <Form.Control
                      size="sm"
                      type="number"
                      min={0}
                      value={p.quota}
                      onChange={(e) => setPhase(ti, pi, { quota: Number(e.target.value) })}
                    />
                  </Col>
                  <Col xs={6} md={2}>
                    <Form.Label className="small mb-1">Mulai</Form.Label>
                    <Form.Control
                      size="sm"
                      type="datetime-local"
                      value={p.startAt || ''}
                      onChange={(e) => setPhase(ti, pi, { startAt: e.target.value })}
                    />
                  </Col>
                  <Col xs={6} md={2}>
                    <Form.Label className="small mb-1">Selesai</Form.Label>
                    <Form.Control
                      size="sm"
                      type="datetime-local"
                      value={p.endAt || ''}
                      onChange={(e) => setPhase(ti, pi, { endAt: e.target.value })}
                    />
                  </Col>
                  <Col xs={12} md={1} className="text-md-end">
                    <Button
                      size="sm"
                      variant="outline-danger"
                      className="border-0"
                      onClick={() => removePhase(ti, pi)}
                      disabled={t.phases.length <= 1}
                    >
                      <i className="bi bi-x-lg" />
                    </Button>
                  </Col>
                </Row>
                <Form.Check
                  type="switch"
                  id={`war-${p.id}`}
                  className="mt-2 small"
                  label={
                    <>
                      War ticket (lewat antrian) untuk fase ini
                      {p.isWarTicket && (
                        <Badge bg="danger" className="ms-2">War</Badge>
                      )}
                    </>
                  }
                  checked={p.isWarTicket}
                  onChange={(e) => setPhase(ti, pi, { isWarTicket: e.target.checked })}
                />
              </div>
            ))}

            <Button size="sm" variant="outline-secondary" onClick={() => addPhase(ti)}>
              <i className="bi bi-plus-lg me-1" />
              Tambah Fase
            </Button>
          </Card.Body>
        </Card>
      ))}

      <Button variant="outline-primary" onClick={() => update([...tickets, newTicket()])}>
        <i className="bi bi-plus-lg me-1" />
        Tambah Tiket
      </Button>
    </>
  )
}
