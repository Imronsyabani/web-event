import { Link } from 'react-router-dom'

// Kerangka situs publik: terapkan tema (warna/font) + CSS owner + nav/footer.
export default function SiteFrame({ workspace, site, subdomain, children }) {
  const primary = site?.theme?.primary || '#6c5ce7'
  const font = site?.theme?.font || 'Inter'

  return (
    <div style={{ '--site-primary': primary, fontFamily: font }}>
      <style>{`:root{--site-primary:${primary}}`}</style>
      {site?.css && <style>{site.css}</style>}

      <nav className="navbar navbar-light bg-white border-bottom sticky-top">
        <div className="container">
          <Link
            to={`/s/${subdomain}`}
            className="navbar-brand fw-bold text-decoration-none"
            style={{ color: primary }}
          >
            {workspace?.logo && (
              <img
                src={workspace.logo}
                alt=""
                style={{ height: 28 }}
                className="me-2 rounded"
              />
            )}
            {workspace?.name}
          </Link>
        </div>
      </nav>

      {children}

      <footer className="border-top py-4 mt-5">
        <div className="container text-center text-muted small">
          © {workspace?.name} · dibuat dengan Web Event
        </div>
      </footer>
    </div>
  )
}
