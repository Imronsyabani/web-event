import { Link } from 'react-router-dom'
import { Container, Button } from 'react-bootstrap'

export default function NotFoundPage() {
  return (
    <Container className="text-center py-5 my-5">
      <h1 className="display-1 fw-bold text-primary">404</h1>
      <h4 className="mb-3">Halaman tidak ditemukan</h4>
      <p className="text-muted mb-4">
        Maaf, halaman yang kamu cari tidak tersedia.
      </p>
      <Button as={Link} to="/" variant="primary">
        Kembali ke Beranda
      </Button>
    </Container>
  )
}
