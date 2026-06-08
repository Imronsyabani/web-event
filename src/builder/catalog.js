// ============================================================
//  Katalog Token & Widget Website Builder
//  Fondasi untuk renderer (Fase 2) & editor advanced (Fase 3).
//
//  - TOKEN: placeholder yang diganti DATA terstruktur saat render
//           (di-escape → aman dari XSS).
//  - WIDGET: tag khusus yang diganti KOMPONEN React kita (transaksional).
//            Posisi pembayaran BAKU → tidak bebas diletakkan owner.
// ============================================================

// Token level WORKSPACE (dipakai di template landing)
export const WORKSPACE_TOKENS = [
  { token: '{{workspace.name}}', desc: 'Nama workspace' },
  { token: '{{workspace.logo}}', desc: 'URL logo' },
  { token: '{{workspace.banner}}', desc: 'URL banner utama' },
  { token: '{{workspace.about}}', desc: 'Deskripsi penyelenggara' },
  { token: '{{events}}', desc: 'Grid/daftar semua event (loop kartu event)' },
]

// Token level EVENT (dipakai di template detail event)
export const EVENT_TOKENS = [
  { token: '{{event.name}}', desc: 'Nama event' },
  { token: '{{event.banner}}', desc: 'URL banner event' },
  { token: '{{event.date}}', desc: 'Tanggal & waktu mulai (terformat)' },
  { token: '{{event.description}}', desc: 'Deskripsi event' },
  { token: '{{event.category}}', desc: 'Kategori event' },
  { token: '{{event.venue.name}}', desc: 'Nama venue' },
  { token: '{{event.venue.address}}', desc: 'Alamat venue' },
  { token: '{{event.venue.map}}', desc: 'Peta lokasi (embed)' },
  { token: '{{ticket_list}}', desc: 'Daftar harga tiket (dari data event)' },
]

// Widget bersama (komponen React kita) — transaksional, posisi baku
export const WIDGETS = [
  {
    tag: '<we-buy-button>',
    desc: 'Tombol beli tiket → memicu gateway pembayaran bersama',
    fixed: true,
  },
  {
    tag: '<we-payment-info>',
    desc: 'Ringkasan metode pembayaran aktif event',
    fixed: true,
  },
  {
    tag: '<we-waiting-queue>',
    desc: 'Antrian war ticket (muncul bila event.isWarTicket)',
    fixed: true,
  },
]

// Semua token sebagai satu daftar (untuk autocomplete editor)
export const ALL_TOKENS = [...WORKSPACE_TOKENS, ...EVENT_TOKENS]

// Subdomain: nama yang dicadangkan sistem (tidak boleh dipakai owner)
export const RESERVED_SUBDOMAINS = [
  'www',
  'api',
  'admin',
  'app',
  'mail',
  'static',
  'cdn',
]

// Validasi format subdomain (3-32 char, a-z 0-9 dan tanda hubung di tengah)
export const SUBDOMAIN_PATTERN = /^[a-z0-9](?:[a-z0-9-]{1,30}[a-z0-9])?$/
