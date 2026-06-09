import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Loader from '../../components/common/Loader'
import RenderTemplate from '../../builder/render'
import SiteFrame from './SiteFrame'
import Site404 from './Site404'
import { builderService } from '../../services/builderService'
import { formatDateTime, formatRupiah } from '../../utils/format'
import { eventPriceFrom } from '../../utils/ticketPhase'

// Grid event (mengisi token {{events}})
function EventsGrid({ events, subdomain }) {
  if (!events.length)
    return <p className="text-muted text-center">Belum ada event.</p>
  return (
    <div className="row g-4">
      {events.map((ev) => {
        const price = eventPriceFrom(ev) ?? 0
        return (
          <div className="col-sm-6 col-lg-4" key={ev.id}>
            <Link
              to={`/s/${subdomain}/event/${ev.id}`}
              className="card site-card h-100 border-0 shadow-sm text-decoration-none text-reset"
            >
              <div className="ratio ratio-16x9 bg-light rounded-top overflow-hidden">
                {ev.banner && (
                  <img src={ev.banner} alt="" style={{ objectFit: 'cover' }} />
                )}
              </div>
              <div className="card-body">
                <h6 className="mb-1">{ev.title}</h6>
                <div className="small text-muted">{formatDateTime(ev.startAt)}</div>
                <div className="fw-bold mt-2" style={{ color: 'var(--site-primary)' }}>
                  {price > 0 ? `Mulai ${formatRupiah(price)}` : 'Gratis'}
                </div>
              </div>
            </Link>
          </div>
        )
      })}
    </div>
  )
}

export default function SitePage() {
  const { subdomain } = useParams()
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

  if (loading) return <Loader fullPage label="Memuat situs..." />
  if (notFound || !data) return <Site404 />

  const { workspace, site, events } = data
  return (
    <SiteFrame workspace={workspace} site={site} subdomain={subdomain}>
      <RenderTemplate
        html={site.landingHtml}
        data={{ workspace }}
        components={{
          '{{events}}': () => <EventsGrid events={events} subdomain={subdomain} />,
        }}
      />
    </SiteFrame>
  )
}
