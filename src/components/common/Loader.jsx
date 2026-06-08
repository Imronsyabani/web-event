import { Spinner } from 'react-bootstrap'

export default function Loader({ label = 'Memuat...', fullPage = false }) {
  const content = (
    <div className="text-center text-muted py-4">
      <Spinner animation="border" variant="primary" />
      <div className="mt-2">{label}</div>
    </div>
  )

  if (fullPage) {
    return (
      <div
        className="d-flex align-items-center justify-content-center"
        style={{ minHeight: '60vh' }}
      >
        {content}
      </div>
    )
  }
  return content
}
