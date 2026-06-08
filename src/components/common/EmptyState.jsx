export default function EmptyState({
  icon = 'bi-inbox',
  title = 'Belum ada data',
  description,
  action,
}) {
  return (
    <div className="text-center text-muted py-5">
      <i className={`bi ${icon}`} style={{ fontSize: '2.5rem' }} />
      <h5 className="mt-3 mb-1">{title}</h5>
      {description && <p className="mb-3">{description}</p>}
      {action}
    </div>
  )
}
