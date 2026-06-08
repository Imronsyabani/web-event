import { Container, Row, Col } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { AppName } from '../../config'

export default function AppFooter() {
  const year = new Date().getFullYear()
  return (
    <footer className="bg-dark text-light mt-auto pt-5 pb-4">
      <Container>
        <Row className="gy-4">
          <Col md={4}>
            <h5 className="text-white">
              <i className="bi bi-ticket-perforated-fill me-2" />
              {AppName}
            </h5>
            <p className="text-secondary small mb-0">
              Platform manajemen event, pembelian tiket, dan website builder
              untuk penyelenggara acara.
            </p>
          </Col>
          <Col md={2} xs={6}>
            <h6 className="text-white">Jelajahi</h6>
            <ul className="list-unstyled small">
              <li>
                <Link className="link-secondary text-decoration-none" to="/events">
                  Event
                </Link>
              </li>
              <li>
                <Link className="link-secondary text-decoration-none" to="/login">
                  Masuk
                </Link>
              </li>
            </ul>
          </Col>
          <Col md={2} xs={6}>
            <h6 className="text-white">Penyelenggara</h6>
            <ul className="list-unstyled small">
              <li>
                <Link className="link-secondary text-decoration-none" to="/owner">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  className="link-secondary text-decoration-none"
                  to="/register"
                >
                  Buat Event
                </Link>
              </li>
            </ul>
          </Col>
          <Col md={4}>
            <h6 className="text-white">Kontak</h6>
            <p className="text-secondary small mb-0">
              <i className="bi bi-envelope me-2" />
              support@webevent.id
            </p>
          </Col>
        </Row>
        <hr className="border-secondary my-4" />
        <div className="text-center text-secondary small">
          © {year} {AppName}. Dilisensikan di bawah GNU GPL v3.
        </div>
      </Container>
    </footer>
  )
}
