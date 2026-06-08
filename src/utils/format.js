// Format mata uang Rupiah
export function formatRupiah(value) {
  const num = Number(value) || 0
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(num)
}

// Format tanggal -> "08 Jun 2026, 19:00"
export function formatDateTime(input) {
  if (!input) return '-'
  const d = new Date(input)
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}

// Format tanggal saja -> "08 Jun 2026"
export function formatDate(input) {
  if (!input) return '-'
  const d = new Date(input)
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(d)
}
