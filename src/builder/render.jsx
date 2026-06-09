import parse from 'html-react-parser'

// Marker blok/widget → custom tag (diganti komponen React saat parse).
// Pakai parser DOM agar STRUKTUR (grid/kolom/card) tetap utuh — tidak
// boleh memecah string lalu membungkus tiap potongan terpisah.
const MARKER_TAGS = {
  '{{events}}': 'we-events',
  '{{ticket_list}}': 'we-ticket-list',
  '{{buy_button}}': 'we-buy-button',
}
const TAG_TO_KEY = {
  'we-events': '{{events}}',
  'we-ticket-list': '{{ticket_list}}',
  'we-buy-button': '{{buy_button}}',
}

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

// 1) marker blok → custom tag, 2) token data inline → nilai (di-escape)
function prepare(html, data) {
  let out = html
  for (const [marker, tag] of Object.entries(MARKER_TAGS)) {
    out = out.split(marker).join(`<${tag}></${tag}>`)
  }
  return out.replace(/\{\{([\w.]+)\}\}/g, (_, path) => {
    const v = lookup(path, data)
    return v == null ? '' : escapeHtml(v)
  })
}

// Render template HTML → React, mempertahankan struktur DOM.
export default function RenderTemplate({ html = '', data = {}, components = {} }) {
  const prepared = prepare(html, data)
  return parse(prepared, {
    replace: (node) => {
      if (node.type === 'tag' && TAG_TO_KEY[node.name]) {
        const render = components[TAG_TO_KEY[node.name]]
        return render ? render() : <></>
      }
    },
  })
}
