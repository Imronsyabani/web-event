// Helper fase tiket: tiket yang sama bisa punya beberapa fase berurut waktu
// (mis. Early Bird → Normal). Fase aktif ditentukan tanggal sekarang dan
// menentukan harga, kuota, serta apakah pembelian lewat antrian (war ticket).

// Normalisasi: tiket tanpa phases dianggap punya 1 fase "Normal" tanpa batas waktu.
export function getPhases(ticket) {
  if (ticket?.phases?.length) return ticket.phases
  return [
    {
      id: `${ticket?.id}-default`,
      name: 'Normal',
      price: ticket?.price ?? 0,
      quota: ticket?.quota ?? 0,
      startAt: null,
      endAt: null,
      isWarTicket: false,
    },
  ]
}

const ms = (v) => (v ? new Date(v).getTime() : null)

// Fase yang sedang aktif (now ∈ [startAt, endAt]); null = tak dibatasi.
export function activePhase(ticket, now = new Date()) {
  const t = new Date(now).getTime()
  return (
    getPhases(ticket).find((p) => {
      const s = ms(p.startAt)
      const e = ms(p.endAt)
      return (s == null || t >= s) && (e == null || t <= e)
    }) || null
  )
}

// Fase mendatang terdekat (untuk info "early bird mulai ...").
export function upcomingPhase(ticket, now = new Date()) {
  const t = new Date(now).getTime()
  return (
    getPhases(ticket)
      .filter((p) => ms(p.startAt) != null && ms(p.startAt) > t)
      .sort((a, b) => ms(a.startAt) - ms(b.startAt))[0] || null
  )
}

// Status efektif tiket saat ini.
export function ticketStatus(ticket, now = new Date()) {
  const phase = activePhase(ticket, now)
  if (!phase) {
    return {
      available: false,
      phase: null,
      upcoming: upcomingPhase(ticket, now),
      price: null,
      quota: 0,
      isWarTicket: false,
    }
  }
  return {
    available: (phase.quota ?? 0) > 0,
    phase,
    upcoming: null,
    price: phase.price,
    quota: phase.quota ?? 0,
    isWarTicket: !!phase.isWarTicket,
  }
}

// Event sedang "war" bila ADA tiket dengan fase aktif war (gate antrian per event).
export function eventIsWarNow(event, now = new Date()) {
  return (event?.tickets || []).some((t) => activePhase(t, now)?.isWarTicket)
}

// Harga termurah dari fase aktif yang tersedia (untuk "Mulai Rp ...").
export function eventPriceFrom(event, now = new Date()) {
  const prices = (event?.tickets || [])
    .map((t) => activePhase(t, now))
    .filter((p) => p && (p.quota ?? 0) >= 0)
    .map((p) => p.price)
  return prices.length ? Math.min(...prices) : null
}
