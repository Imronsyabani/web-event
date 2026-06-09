import { Container } from 'react-bootstrap'

// 404 untuk situs publik (workspace tak ada / suspended / belum publish)
export default function Site404() {
  return (
    <Container className="text-center py-5 my-5">
      <h1 className="display-1 fw-bold text-secondary">404</h1>
      <h4 className="mb-3">Situs tidak ditemukan</h4>
      <p className="text-muted">
        Alamat ini tidak tersedia, atau situsnya sedang tidak aktif.
      </p>
    </Container>
  )
}
