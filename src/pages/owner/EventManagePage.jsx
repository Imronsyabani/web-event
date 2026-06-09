import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Container, Table, Button, Badge } from 'react-bootstrap'
import Loader from '../../components/common/Loader'
import EmptyState from '../../components/common/EmptyState'
import { eventService } from '../../services/eventService'
import { formatDateTime } from '../../utils/format'

export default function EventManagePage() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    eventService
      .mine()
      .then((data) => setEvents(data.items || data || []))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const handleDelete = async (id) => {
    if (!window.confirm('Hapus event ini?')) return
    await eventService.remove(id)
    load()
  }

  return (
    <Container fluid className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-1">Event Saya</h1>
          <p className="text-muted mb-0">Kelola semua event yang kamu buat.</p>
        </div>
        <Button as={Link} to="/owner/events/new" variant="primary">
          <i className="bi bi-plus-lg me-1" />
          Buat Event
        </Button>
      </div>

      {loading ? (
        <Loader />
      ) : events.length === 0 ? (
        <EmptyState
          icon="bi-calendar-plus"
          title="Belum ada event"
          description="Mulai dengan membuat event pertamamu."
          action={
            <Button as={Link} to="/owner/events/new" variant="primary">
              Buat Event
            </Button>
          }
        />
      ) : (
        <div className="bg-white rounded shadow-sm">
          <Table responsive hover className="mb-0 align-middle">
            <thead className="table-light">
              <tr>
                <th>Event</th>
                <th>Tanggal</th>
                <th>Status</th>
                <th className="text-end">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {events.map((ev) => (
                <tr key={ev.id}>
                  <td className="fw-semibold">{ev.title}</td>
                  <td>{formatDateTime(ev.startAt)}</td>
                  <td>
                    <Badge bg={ev.published ? 'success' : 'secondary'}>
                      {ev.published ? 'Terbit' : 'Draf'}
                    </Badge>
                  </td>
                  <td className="text-end">
                    <Button
                      as={Link}
                      to={`/owner/events/${ev.id}/edit`}
                      size="sm"
                      variant="outline-primary"
                      className="me-2"
                    >
                      <i className="bi bi-pencil" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline-danger"
                      onClick={() => handleDelete(ev.id)}
                    >
                      <i className="bi bi-trash" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}
    </Container>
  )
}
