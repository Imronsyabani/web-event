// Konfigurasi global aplikasi.
// Ubah nilai di sini sesuai environment (dev/staging/production).

export const AppName = 'Web Event'

export const ApiBaseUrl = 'http://localhost:8080/api'

// Saat true, semua service memakai data dummy (mock) tanpa backend.
// Ubah ke false ketika backend Go sudah siap.
export const UseMockData = true

// Domain utama untuk subdomain workspace (website builder).
// Contoh hasil: korean-fest.your-event.co.id
export const BaseDomain = 'your-event.co.id'

// Role pengguna
export const Roles = {
  Buyer: 'buyer',
  Staff: 'staff',
  Owner: 'owner',
  Admin: 'admin',
}

// Status pembayaran
export const PaymentStatus = {
  Pending: 'pending',
  Paid: 'paid',
  Expired: 'expired',
  Failed: 'failed',
  Refunded: 'refunded',
}
