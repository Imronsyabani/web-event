import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom'
import { Navbar, Nav, Container, Badge, NavDropdown } from 'react-bootstrap'
import { AppName } from '../config'
import { useAuth } from '../context/AuthContext'
import { usePlan } from '../context/PlanContext'
import { useWorkspace } from '../context/WorkspaceContext'

const MENU = [
  { to: '/owner', end: true, icon: 'bi-speedometer2', label: 'Ringkasan' },
  { to: '/owner/workspace', icon: 'bi-building-gear', label: 'Workspace' },
  { to: '/owner/staff', icon: 'bi-people', label: 'Kelola Staff' },
  { to: '/owner/events', icon: 'bi-calendar-event', label: 'Event Saya' },
  { to: '/owner/events/new', icon: 'bi-plus-circle', label: 'Buat Event' },
  { to: '/owner/sales', icon: 'bi-graph-up-arrow', label: 'Penjualan & Keuangan', pro: true },
  { to: '/owner/budgeting', icon: 'bi-wallet2', label: 'Budgeting', pro: true },
  { to: '/owner/builder', icon: 'bi-window-stack', label: 'Website Builder' },
  { to: '/owner/plan', icon: 'bi-gem', label: 'Paket' },
]

// Layout dashboard owner: topbar + sidebar + konten
export default function DashboardLayout() {
  const { user, logout } = useAuth()
  const { isPro } = usePlan()
  const { workspaces, current, switchTo } = useWorkspace()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar bg="white" className="shadow-sm" sticky="top">
        <Container fluid>
          <Navbar.Brand as={Link} to="/owner" className="text-primary">
            <i className="bi bi-grid-1x2-fill me-2" />
            {AppName} <span className="text-muted fw-normal">Owner</span>
          </Navbar.Brand>
          <Nav className="ms-auto align-items-center gap-3">
            {/* Switcher workspace aktif */}
            <NavDropdown
              align="end"
              title={
                <>
                  <i className="bi bi-building me-1" />
                  {current?.name || 'Workspace'}
                </>
              }
              id="ws-switcher"
            >
              {workspaces.map((w) => (
                <NavDropdown.Item
                  key={w.id}
                  active={w.id === current?.id}
                  onClick={() => w.id !== current?.id && switchTo(w.id)}
                >
                  <i
                    className={`bi ${
                      w.status === 'suspended' ? 'bi-pause-circle text-warning' : 'bi-building'
                    } me-2`}
                  />
                  {w.name}
                  <span className="text-muted small d-block ms-4">
                    {w.subdomain}
                  </span>
                </NavDropdown.Item>
              ))}
              <NavDropdown.Divider />
              <NavDropdown.Item as={Link} to="/owner/workspaces">
                <i className="bi bi-grid me-2" />
                Kelola Workspace
              </NavDropdown.Item>
            </NavDropdown>
            <Link to="/" className="text-decoration-none small text-muted">
              <i className="bi bi-box-arrow-up-right me-1" />
              Lihat situs
            </Link>
            <span className="small text-muted d-none d-sm-inline">
              <i className="bi bi-person-circle me-1" />
              {user?.name || 'Owner'}
            </span>
            <button
              className="btn btn-sm btn-outline-secondary"
              onClick={handleLogout}
            >
              Keluar
            </button>
          </Nav>
        </Container>
      </Navbar>

      <div className="d-flex flex-grow-1">
        <aside className="sidebar p-3 d-none d-md-block" style={{ width: 240 }}>
          <Nav className="flex-column">
            {MENU.map((m) => (
              <Nav.Link
                key={m.to}
                as={NavLink}
                to={m.to}
                end={m.end}
                className="px-3 py-2 d-flex align-items-center justify-content-between"
              >
                <span>
                  <i className={`bi ${m.icon} me-2`} />
                  {m.label}
                </span>
                {m.pro && !isPro && (
                  <Badge bg="warning" text="dark" pill>
                    Pro
                  </Badge>
                )}
              </Nav.Link>
            ))}
          </Nav>
        </aside>
        <main className="flex-grow-1 bg-light">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
