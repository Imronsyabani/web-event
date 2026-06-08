// Data dummy untuk pengembangan tanpa backend.
// Banner memakai picsum.photos (seed tetap agar gambar konsisten).

const img = (seed) => `https://picsum.photos/seed/${seed}/800/450`

// Workspace demo milik owner (1 workspace = banyak event)
export const workspace = {
  id: 'ws-demo',
  ownerId: 'u-owner',
  name: 'Korean Fest Organizer',
  subdomain: 'korean-fest',
  logo: img('ws-logo'),
  banner: img('ws-banner'),
  about:
    'Penyelenggara festival budaya dan musik Korea terbesar di Indonesia. Menghadirkan pengalaman tak terlupakan setiap tahunnya.',
  theme: { primary: '#e84393', font: 'Poppins' },
}

export const events = [
  {
    id: 'evt-soundrenaline',
    title: 'Soundrenaline 2026',
    category: 'Musik',
    location: 'GBK Senayan, Jakarta',
    startAt: '2026-08-15T19:00:00',
    endAt: '2026-08-15T23:00:00',
    banner: img('soundrenaline'),
    priceFrom: 350000,
    isWarTicket: true,
    published: true,
    description:
      'Festival musik tahunan terbesar di Indonesia. Menampilkan puluhan musisi lokal dan internasional di tiga panggung berbeda.\n\nSiapkan dirimu untuk malam penuh energi!',
  },
  {
    id: 'evt-techsummit',
    title: 'Tech Summit Jakarta 2026',
    category: 'Seminar',
    location: 'JCC, Jakarta',
    startAt: '2026-09-02T09:00:00',
    endAt: '2026-09-02T17:00:00',
    banner: img('techsummit'),
    priceFrom: 250000,
    isWarTicket: false,
    published: true,
    description:
      'Konferensi teknologi yang menghadirkan pembicara dari perusahaan teknologi terkemuka. Topik: AI, Cloud, dan masa depan startup Indonesia.',
  },
  {
    id: 'evt-standup',
    title: 'Stand Up Comedy Night',
    category: 'Komedi',
    location: 'Balai Sarbini, Jakarta',
    startAt: '2026-07-20T20:00:00',
    endAt: '2026-07-20T22:30:00',
    banner: img('standup'),
    priceFrom: 150000,
    isWarTicket: false,
    published: true,
    description:
      'Malam penuh tawa bersama komika-komika papan atas Indonesia. Dijamin perutmu sakit menahan tawa!',
  },
  {
    id: 'evt-senirupa',
    title: 'Pameran Seni Rupa Nusantara',
    category: 'Pameran',
    location: 'Galeri Nasional, Jakarta',
    startAt: '2026-06-25T10:00:00',
    endAt: '2026-07-10T20:00:00',
    banner: img('senirupa'),
    priceFrom: 0,
    isWarTicket: false,
    published: true,
    description:
      'Pameran karya seni rupa dari seniman lintas generasi se-Nusantara. Gratis untuk umum.',
  },
  {
    id: 'evt-fotografi',
    title: 'Workshop Fotografi: Cahaya & Komposisi',
    category: 'Workshop',
    location: 'Online (Zoom)',
    startAt: '2026-07-05T13:00:00',
    endAt: '2026-07-05T16:00:00',
    banner: img('fotografi'),
    priceFrom: 99000,
    isWarTicket: false,
    published: true,
    description:
      'Belajar dasar-dasar fotografi langsung dari fotografer profesional. Termasuk sesi tanya jawab dan review karya peserta.',
  },
  {
    id: 'evt-kuliner',
    title: 'Festival Kuliner Bandung',
    category: 'Festival',
    location: 'Lapangan Gasibu, Bandung',
    startAt: '2026-08-01T11:00:00',
    endAt: '2026-08-03T21:00:00',
    banner: img('kuliner'),
    priceFrom: 50000,
    isWarTicket: true,
    published: true,
    description:
      'Jelajahi ratusan tenant kuliner khas Nusantara dalam satu tempat. Hadirkan teman dan keluargamu!',
  },
]

// Tipe tiket per event
export const ticketsByEvent = {
  'evt-soundrenaline': [
    { id: 'tk-sr-fest', name: 'Festival', price: 350000, quota: 120 },
    { id: 'tk-sr-vip', name: 'VIP', price: 750000, quota: 30 },
    { id: 'tk-sr-vvip', name: 'VVIP', price: 1500000, quota: 0 },
  ],
  'evt-techsummit': [
    { id: 'tk-ts-reg', name: 'Regular', price: 250000, quota: 200 },
    { id: 'tk-ts-pro', name: 'Pro (+Workshop)', price: 450000, quota: 50 },
  ],
  'evt-standup': [{ id: 'tk-su-reg', name: 'Reguler', price: 150000, quota: 80 }],
  'evt-senirupa': [{ id: 'tk-sn-free', name: 'Tiket Masuk', price: 0, quota: 999 }],
  'evt-fotografi': [
    { id: 'tk-fo-reg', name: 'Peserta', price: 99000, quota: 40 },
  ],
  'evt-kuliner': [
    { id: 'tk-ku-day', name: 'Tiket Harian', price: 50000, quota: 300 },
    { id: 'tk-ku-pass', name: 'Festival Pass (3 hari)', price: 120000, quota: 100 },
  ],
}

export const paymentMethods = [
  { code: 'qris', name: 'QRIS (semua e-wallet)' },
  { code: 'va_bca', name: 'Virtual Account BCA' },
  { code: 'va_mandiri', name: 'Virtual Account Mandiri' },
  { code: 'gopay', name: 'GoPay' },
  { code: 'cc', name: 'Kartu Kredit' },
]

export const builderTemplates = [
  { id: 'tpl-aurora', name: 'Aurora', thumbnail: img('tpl-aurora') },
  { id: 'tpl-minimal', name: 'Minimal', thumbnail: img('tpl-minimal') },
  { id: 'tpl-vibrant', name: 'Vibrant', thumbnail: img('tpl-vibrant') },
  { id: 'tpl-classic', name: 'Classic', thumbnail: img('tpl-classic') },
  { id: 'tpl-gala', name: 'Gala', thumbnail: img('tpl-gala') },
  { id: 'tpl-festival', name: 'Festival', thumbnail: img('tpl-festival') },
]

// Akun demo untuk login mock (password bebas)
export const demoUsers = [
  { id: 'u-buyer', name: 'Budi Pembeli', email: 'buyer@demo.id', role: 'buyer' },
  { id: 'u-staff', name: 'Sari Staff', email: 'staff@demo.id', role: 'staff' },
  { id: 'u-owner', name: 'Owner Demo', email: 'owner@demo.id', role: 'owner' },
]
