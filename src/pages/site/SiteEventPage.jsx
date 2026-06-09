import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Loader from '../../components/common/Loader'
import RenderTemplate from '../../builder/render'
import SiteFrame from './SiteFrame'
import Site404 from './Site404'
import { builderService } from '../../services/builderService'
import { formatDateTime, formatRupiah } from '../../utils/format'

// Daftar tiket (mengisi token {{ticket_list}})
function TicketList({ event }) {
  if (!event.tickets?.length)
    return <p className="text-muted small">Tiket belum tersedia.</p>
  return (
    <ul className="list-group list-group-flush mb-3">
      {event.tickets.map((t) => (
        <li
          key={t.id}
          className="list-group-item d-flex justify-content-between px-0"
        >
          <span>{t.name}</span>
          <strong>{formatRupiah(t.price)}</strong>
        </li>
      ))}
    </ul>
  )
}

// Tombol beli — posisi BAKU (widget kita). War ticket → antrian.
function BuyButton({ event, navigate }) {
  const go = () =>
    navigate(event.isWarTicket ? `/queue/${event.id}` : `/checkout/${event.id}`)
  return (
    <button
      className="btn w-100 text-white"
      style={{ background: 'var(--site-primary)' }}
      onClick={go}
      disabled={!event.tickets?.length}
    >
      {event.isWarTicket ? 'Masuk Antrian' : 'Beli Tiket'}
    </button>
  )
}

export default function SiteEventPage() {
  const { subdomain, id } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    setLoading(true)
    builderService
      .publicSite(subdomain)
      .then(setData)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [subdomain])

  if (loading) return <Loader fullPage label="Memuat..." />
  if (notFound || !data) return <Site404 />

  const { workspace, site, events } = data
  const event = events.find((e) => e.id === id)
  if (!event) return <Site404 />

  // Data untuk token; ratakan tanggal & venue agar mudah dipakai template
  const eventData = {
    event: {
      ...event,
      date: formatDateTime(event.startAt),
      venue: event.venue || { name: '', address: '' },
    },
  }

  return (
    <SiteFrame workspace={workspace} site={site} subdomain={subdomain}>
      <RenderTemplate
        html={site.eventHtml}
        data={eventData}
        components={{
          '{{ticket_list}}': () => <TicketList event={event} />,
          '{{buy_button}}': () => <BuyButton event={event} navigate={navigate} />,
        }}
      />
    </SiteFrame>
  )
}
