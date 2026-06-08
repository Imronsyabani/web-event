import { useEffect, useState, useCallback } from 'react'
import {
  Container, Row, Col, Card, Button, Table, Form, Badge, Tabs, Tab, ProgressBar,
} from 'react-bootstrap'
import Loader from '../../components/common/Loader'
import EmptyState from '../../components/common/EmptyState'
import Gate from '../../components/common/Gate'
import UpgradeCard from '../../components/common/UpgradeCard'
import BudgetEntryModal from '../../components/budget/BudgetEntryModal'
import CategoryManagerModal from '../../components/budget/CategoryManagerModal'
import { budgetService } from '../../services/budgetService'
import { eventService } from '../../services/eventService'
import { Features } from '../../config/plans'
import { formatRupiah, formatDate } from '../../utils/format'

function BudgetingInner() {
  const [events, setEvents] = useState([])
  const [eventId, setEventId] = useState('')
  const [categories, setCategories] = useState([])
  const [entries, setEntries] = useState([])
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [showEntry, setShowEntry] = useState(false)
  const [showCat, setShowCat] = useState(false)

  const catName = (id) => categories.find((c) => c.id === id)?.name || '-'

  const loadData = useCallback(() => {
    setLoading(true)
    return Promise.all([
      budgetService.listCategories(),
      budgetService.listEntries(eventId ? { eventId } : {}),
      budgetService.listPlans(eventId ? { eventId } : {}),
    ])
      .then(([cats, ent, pl]) => {
        setCategories(cats.items || [])
        setEntries(ent.items || [])
        setPlans(pl.items || [])
      })
      .finally(() => setLoading(false))
  }, [eventId])

  useEffect(() => {
    eventService.mine().then((d) => setEvents(d.items || []))
  }, [])
  useEffect(() => {
    loadData()
  }, [loadData])

  // ---- ringkasan ----
  const income = entries.filter((e) => e.type === 'income').reduce((s, e) => s + e.amount, 0)
  const expense = entries.filter((e) => e.type === 'expense').reduce((s, e) => s + e.amount, 0)
  const balance = income - expense

  // ---- handlers ----
  const addEntry = async (payload) => {
    await budgetService.createEntry({ ...payload, eventId: eventId || null })
    loadData()
  }
  const delEntry = async (id) => {
    if (!window.confirm('Hapus transaksi ini?')) return
    await budgetService.deleteEntry(id)
    loadData()
  }
  const addCat = async (payload) => {
    await budgetService.createCategory(payload)
    loadData()
  }
  const delCat = async (id) => {
    await budgetService.deleteCategory(id)
    loadData()
  }
  const savePlan = async (categoryId, planned) => {
    await budgetService.savePlan({
      eventId: eventId || null,
      categoryId,
      plannedAmount: Number(planned) || 0,
    })
    loadData()
  }

  // aktual pengeluaran per kategori (untuk plan vs aktual)
  const actualByCat = {}
  entries
    .filter((e) => e.type === 'expense')
    .forEach((e) => {
      actualByCat[e.categoryId] = (actualByCat[e.categoryId] || 0) + e.amount
    })
  const plannedOf = (catId) =>
    plans.find((p) => p.categoryId === catId)?.plannedAmount || 0
  const expenseCats = categories.filter((c) => c.type === 'expense')

  return (
    <Container fluid className="p-4">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
        <div>
          <h1 className="h3 mb-1">Budgeting</h1>
          <p className="text-muted mb-0">Catat pemasukan & pengeluaran event.</p>
        </div>
        <div className="d-flex gap-2">
          <Form.Select
            value={eventId}
            onChange={(e) => setEventId(e.target.value)}
            style={{ minWidth: 200 }}
          >
            <option value="">Umum (semua workspace)</option>
            {events.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.title}
              </option>
            ))}
          </Form.Select>
          <Button variant="outline-secondary" onClick={() => setShowCat(true)}>
            <i className="bi bi-tags" />
          </Button>
          <Button variant="primary" onClick={() => setShowEntry(true)}>
            <i className="bi bi-plus-lg me-1" />
            Transaksi
          </Button>
        </div>
      </div>

      {/* Ringkasan */}
      <Row className="g-3 mb-4">
        <Col md={4}>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <div className="text-muted small">Pemasukan</div>
              <div className="h4 text-success mb-0">{formatRupiah(income)}</div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <div className="text-muted small">Pengeluaran</div>
              <div className="h4 text-danger mb-0">{formatRupiah(expense)}</div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <div className="text-muted small">Saldo (non-tiket)</div>
              <div className={`h4 mb-0 ${balance >= 0 ? 'text-primary' : 'text-danger'}`}>
                {formatRupiah(balance)}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {loading ? (
        <Loader />
      ) : (
        <Tabs defaultActiveKey="ledger" className="mb-3">
          {/* Buku kas */}
          <Tab eventKey="ledger" title="Buku Kas">
            {entries.length === 0 ? (
              <EmptyState
                icon="bi-journal-text"
                title="Belum ada transaksi"
                description="Tambah pemasukan atau pengeluaran pertama."
              />
            ) : (
              <Card className="border-0 shadow-sm">
                <Table responsive hover className="mb-0 align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>Tanggal</th>
                      <th>Judul</th>
                      <th>Kategori</th>
                      <th>Oleh</th>
                      <th>Struk</th>
                      <th className="text-end">Nominal</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {entries.map((e) => (
                      <tr key={e.id}>
                        <td className="text-nowrap">{formatDate(e.transactionDate)}</td>
                        <td>
                          <div className="fw-semibold">{e.title}</div>
                          {e.description && (
                            <div className="small text-muted">{e.description}</div>
                          )}
                        </td>
                        <td>
                          <Badge bg="light" text="dark">{catName(e.categoryId)}</Badge>
                        </td>
                        <td className="small text-muted">{e.createdBy}</td>
                        <td>
                          {e.receipts?.length ? (
                            <Badge bg="info">
                              <i className="bi bi-paperclip me-1" />
                              {e.receipts.length}
                            </Badge>
                          ) : (
                            <span className="text-muted">—</span>
                          )}
                        </td>
                        <td
                          className={`text-end fw-bold ${
                            e.type === 'income' ? 'text-success' : 'text-danger'
                          }`}
                        >
                          {e.type === 'income' ? '+' : '−'} {formatRupiah(e.amount)}
                        </td>
                        <td className="text-end">
                          <Button
                            size="sm"
                            variant="outline-danger"
                            className="border-0"
                            onClick={() => delEntry(e.id)}
                          >
                            <i className="bi bi-trash" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card>
            )}
          </Tab>

          {/* Plan vs aktual */}
          <Tab eventKey="plan" title="Anggaran (Plan vs Aktual)">
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <p className="text-muted small">
                  Tetapkan target anggaran per kategori pengeluaran, lalu pantau
                  realisasinya.
                </p>
                {expenseCats.map((c) => {
                  const planned = plannedOf(c.id)
                  const actual = actualByCat[c.id] || 0
                  const pct = planned ? Math.min(100, Math.round((actual / planned) * 100)) : 0
                  const over = planned && actual > planned
                  return (
                    <div key={c.id} className="mb-3">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <strong>{c.name}</strong>
                        <div className="d-flex align-items-center gap-2">
                          <span className="small text-muted">
                            {formatRupiah(actual)} /
                          </span>
                          <Form.Control
                            size="sm"
                            type="number"
                            min={0}
                            defaultValue={planned || ''}
                            placeholder="target"
                            style={{ width: 130 }}
                            onBlur={(e) => savePlan(c.id, e.target.value)}
                          />
                        </div>
                      </div>
                      <ProgressBar
                        now={pct}
                        variant={over ? 'danger' : pct > 80 ? 'warning' : 'success'}
                        label={planned ? `${pct}%` : ''}
                      />
                      {over && (
                        <div className="small text-danger mt-1">
                          Melebihi anggaran {formatRupiah(actual - planned)}
                        </div>
                      )}
                    </div>
                  )
                })}
              </Card.Body>
            </Card>
          </Tab>
        </Tabs>
      )}

      <BudgetEntryModal
        show={showEntry}
        onHide={() => setShowEntry(false)}
        categories={categories}
        onSubmit={addEntry}
      />
      <CategoryManagerModal
        show={showCat}
        onHide={() => setShowCat(false)}
        categories={categories}
        onCreate={addCat}
        onDelete={delCat}
      />
    </Container>
  )
}

// Halaman budgeting di-gate fitur Pro
export default function BudgetingPage() {
  return (
    <Gate
      feature={Features.Budgeting}
      name="Budgeting"
      fallback={
        <Container className="p-4">
          <UpgradeCard feature="Budgeting" />
        </Container>
      }
    >
      <BudgetingInner />
    </Gate>
  )
}
