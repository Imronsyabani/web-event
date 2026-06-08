import { Link } from 'react-router-dom'
import { Container, Button } from 'react-bootstrap'

export default function ForbiddenPage() {
  return (
    <Container className="text-center py-5 my-5">
      <h1 className="display-1 fw-bold text-danger">403</h1>
      <h4 className="mb-3">Akses ditolak</h4>
      <p className="text-muted mb-4">
        Kamu tidak memiliki izin untuk membuka halaman ini.
      </p>
      <Button as={Link} to="/" variant="primary">
        Kembali ke Beranda
      </Button>
    </Container>
  )
}
