import { useEffect, useState } from 'react'
import { Container, Row, Col, Form, InputGroup, Badge } from 'react-bootstrap'
import PageHeader from '../../components/common/PageHeader'
import EventCard from '../../components/event/EventCard'
import Loader from '../../components/common/Loader'
import EmptyState from '../../components/common/EmptyState'
import { eventService } from '../../services/eventService'

export default function EventListPage() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('Semua')

  useEffect(() => {
    let active = true
    setLoading(true)
    eventService
      .list()
      .then((data) => active && setEvents(data.items || data || []))
      .catch(() => active && setError('Gagal memuat event.'))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [])

  const categories = ['Semua', ...new Set(events.map((e) => e.category).filter(Boolean))]

  const filtered = events.filter((e) => {
    const matchSearch = e.title?.toLowerCase().includes(search.toLowerCase())
    const matchCategory = category === 'Semua' || e.category === category
    return matchSearch && matchCategory
  })

  return (
    <>
      <PageHeader
        title="Jelajahi Event"
        subtitle="Temukan event menarik dan amankan tiketmu."
      />
      <Container className="page-section">
        <Row className="mb-4 g-3 align-items-center">
          <Col md={6} lg={4}>
            <InputGroup>
              <InputGroup.Text>
                <i className="bi bi-search" />
              </InputGroup.Text>
              <Form.Control
                placeholder="Cari event..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </InputGroup>
          </Col>
          <Col xs={12}>
            <div className="d-flex flex-wrap gap-2">
              {categories.map((cat) => (
                <Badge
                  key={cat}
                  bg={category === cat ? 'primary' : 'light'}
                  text={category === cat ? 'light' : 'dark'}
                  className="px-3 py-2 border"
                  role="button"
                  onClick={() => setCategory(cat)}
                  style={{ cursor: 'pointer' }}
                >
                  {cat}
                </Badge>
              ))}
            </div>
          </Col>
        </Row>

        {loading ? (
          <Loader label="Memuat event..." />
        ) : error ? (
          <EmptyState icon="bi-exclamation-triangle" title={error} />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="bi-calendar-x"
            title="Belum ada event"
            description="Coba kata kunci lain atau kembali lagi nanti."
          />
        ) : (
          <Row className="g-4">
            {filtered.map((event) => (
              <Col sm={6} lg={4} xl={3} key={event.id}>
                <EventCard event={event} />
              </Col>
            ))}
          </Row>
        )}
      </Container>
    </>
  )
}
