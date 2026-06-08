import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts'
import { Row, Col, Card } from 'react-bootstrap'
import { formatRupiah, formatDate } from '../../utils/format'

const COLORS = ['#6c5ce7', '#00b894', '#0984e3', '#fdcb6e', '#e17055', '#d63031']
const STATUS_COLORS = { paid: '#00b894', pending: '#fdcb6e', expired: '#b2bec3' }

const rpShort = (v) => {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}jt`
  if (v >= 1_000) return `${Math.round(v / 1000)}rb`
  return v
}

// Komponen grafik penjualan (dipisah agar Recharts bisa di-lazy-load)
export default function SalesCharts({ summary, showPerEvent }) {
  const statusData = Object.entries(summary.status || {})
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({ name, value }))

  return (
    <Row className="g-4">
      {/* Pendapatan harian */}
      <Col lg={showPerEvent ? 12 : 8}>
        <Card className="border-0 shadow-sm h-100">
          <Card.Body>
            <h6 className="mb-3">Pendapatan Harian</h6>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={summary.byDay}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6c5ce7" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6c5ce7" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tickFormatter={(d) => formatDate(d).slice(0, 6)} fontSize={11} />
                <YAxis tickFormatter={rpShort} fontSize={11} />
                <Tooltip formatter={(v) => formatRupiah(v)} labelFormatter={formatDate} />
                <Area type="monotone" dataKey="revenue" name="Pendapatan" stroke="#6c5ce7" fill="url(#rev)" />
              </AreaChart>
            </ResponsiveContainer>
          </Card.Body>
        </Card>
      </Col>

      {/* Status pesanan */}
      <Col lg={showPerEvent ? 6 : 4}>
        <Card className="border-0 shadow-sm h-100">
          <Card.Body>
            <h6 className="mb-3">Status Pesanan</h6>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85}>
                  {statusData.map((s) => (
                    <Cell key={s.name} fill={STATUS_COLORS[s.name] || '#ccc'} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card.Body>
        </Card>
      </Col>

      {/* Penjualan per tipe tiket */}
      <Col lg={6}>
        <Card className="border-0 shadow-sm h-100">
          <Card.Body>
            <h6 className="mb-3">Pendapatan per Tipe Tiket</h6>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={summary.byType}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" fontSize={11} />
                <YAxis tickFormatter={rpShort} fontSize={11} />
                <Tooltip formatter={(v) => formatRupiah(v)} />
                <Bar dataKey="revenue" name="Pendapatan" radius={[6, 6, 0, 0]}>
                  {summary.byType.map((t, i) => (
                    <Cell key={t.name} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card.Body>
        </Card>
      </Col>

      {/* Per event (hanya level workspace) */}
      {showPerEvent && (
        <Col lg={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <h6 className="mb-3">Pendapatan per Event</h6>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={summary.byEvent} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" tickFormatter={rpShort} fontSize={11} />
                  <YAxis type="category" dataKey="eventTitle" width={120} fontSize={10} />
                  <Tooltip formatter={(v) => formatRupiah(v)} />
                  <Bar dataKey="revenue" name="Pendapatan" fill="#0984e3" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>
      )}
    </Row>
  )
}
