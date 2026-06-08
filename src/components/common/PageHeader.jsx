import { Container } from 'react-bootstrap'

export default function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="bg-white border-bottom">
      <Container className="py-4 d-flex flex-wrap justify-content-between align-items-center gap-3">
        <div>
          <h1 className="h3 mb-1">{title}</h1>
          {subtitle && <p className="text-muted mb-0">{subtitle}</p>}
        </div>
        {actions && <div className="d-flex gap-2">{actions}</div>}
      </Container>
    </div>
  )
}
