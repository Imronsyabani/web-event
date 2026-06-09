import { Fragment } from 'react'

// Marker blok dinamis/widget yang diganti komponen React
const MARKER_RE = /(\{\{events\}\}|\{\{ticket_list\}\}|\{\{buy_button\}\})/g

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

// Ambil nilai dari path token, mis. "event.venue.name"
function lookup(path, data) {
  return path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), data)
}

// Ganti token inline {{path}} dengan nilai data (di-escape → aman XSS)
function replaceInline(html, data) {
  return html.replace(/\{\{([\w.]+)\}\}/g, (_, path) => {
    const v = lookup(path, data)
    return v == null ? '' : escapeHtml(v)
  })
}

// Render template HTML → React. Bagian statis lewat dangerouslySetInnerHTML
// (token sudah di-escape); marker diganti komponen dari `components`.
export default function RenderTemplate({ html = '', data = {}, components = {} }) {
  const parts = html.split(MARKER_RE)
  return parts.map((part, i) => {
    if (components[part]) return <Fragment key={i}>{components[part]()}</Fragment>
    if (!part) return null
    return (
      <div
        key={i}
        dangerouslySetInnerHTML={{ __html: replaceInline(part, data) }}
      />
    )
  })
}
