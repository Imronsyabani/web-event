import { Navbar, Nav, Container, Button, NavDropdown } from 'react-bootstrap'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { AppName, Roles } from '../../config'
import { useAuth } from '../../context/AuthContext'

export default function AppNavbar() {
  const { isAuthenticated, user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <Navbar bg="white" expand="lg" sticky="top" className="shadow-sm">
      <Container>
        <Navbar.Brand as={Link} to="/" className="text-primary">
          <i className="bi bi-ticket-perforated-fill me-2" />
          {AppName}
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="main-nav" />
        <Navbar.Collapse id="main-nav">
          <Nav className="me-auto">
            <Nav.Link as={NavLink} to="/events">
              Jelajahi Event
            </Nav.Link>
            {isAuthenticated && (
              <Nav.Link as={NavLink} to="/my-tickets">
                Tiket Saya
              </Nav.Link>
            )}
          </Nav>
          <Nav className="align-items-lg-center gap-lg-2">
            {!isAuthenticated ? (
              <>
                <Nav.Link as={NavLink} to="/login">
                  Masuk
                </Nav.Link>
                <Button as={Link} to="/register" variant="primary" size="sm">
                  Daftar
                </Button>
              </>
            ) : (
              <NavDropdown
                align="end"
                title={
                  <>
                    <i className="bi bi-person-circle me-1" />
                    {user?.name || 'Akun'}
                  </>
                }
                id="account-menu"
              >
                {(user?.role === Roles.Owner || user?.role === Roles.Admin) && (
                  <NavDropdown.Item as={Link} to="/owner">
                    <i className="bi bi-speedometer2 me-2" />
                    Dashboard Owner
                  </NavDropdown.Item>
                )}
                {(user?.role === Roles.Staff || user?.role === Roles.Admin) && (
                  <NavDropdown.Item as={Link} to="/staff/scanner">
                    <i className="bi bi-qr-code-scan me-2" />
                    Scanner Tiket
                  </NavDropdown.Item>
                )}
                <NavDropdown.Item as={Link} to="/my-tickets">
                  <i className="bi bi-ticket-detailed me-2" />
                  Tiket Saya
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={handleLogout}>
                  <i className="bi bi-box-arrow-right me-2" />
                  Keluar
                </NavDropdown.Item>
              </NavDropdown>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}
