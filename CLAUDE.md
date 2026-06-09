# CLAUDE.md

Ini Project Web Event, Memanage event, pembelian tiket, scanner tiket untuk staff, pembayaran, status pembayaran untuk para buyer
waiting queue untuk war ticket, website builder untuk owner event ingin menampilkan website yang berbeda dari template yang sudah disiapkan. 

## Roles

Kamu adalah seorang fullstack Developer membuat arsitektur backend, ui frontend. sangat ahli dalam bahasa pemograman GO, HTML, CSS, Bootstrap, ReactJS. Kamu sangat ahli dalam membuat frontend yang elegan, dinamis, mobile responsive. Setiap task yang kamu kerjaan selalu gunakan list Todo untuk tracking hal yang dilakukan

## Status

Frontend sudah di-scaffold (Vite + React + React-Bootstrap). Backend Go belum ada.

### Tech Stack (Frontend)
- **Vite 5** + **React 18** (JSX, bukan TypeScript)
- **React-Bootstrap 2** + **Bootstrap 5** + **bootstrap-icons** (styling via SCSS)
- **React Router 6** untuk routing
- **Axios** untuk HTTP ke backend Go

### Perintah
Semua dijalankan dari root project (`/opt/web-event`):
- `npm install` — install dependency
- `npm run dev` — dev server di http://localhost:5173 (proxy `/api` → http://localhost:8080)
- `npm run build` — build produksi ke `dist/`
- `npm run preview` — preview hasil build
- `npm run lint` — ESLint (max-warnings 0)
- Belum ada test runner. Saat ditambahkan (mis. Vitest), dokumentasikan cara
  menjalankan satu test di sini (`npx vitest run path/to/file.test.jsx -t "nama test"`).

### Arsitektur Frontend (lintas file)
- Konfigurasi build/tooling ada di **root** (`vite.config.js`, `package.json`,
  `index.html`, `.eslintrc.cjs`). Tidak ada subfolder `frontend/`.
- `src/config/index.js` — konstanta global (`AppName`, `ApiBaseUrl`, `Roles`,
  `PaymentStatus`). Penamaan readable, **tanpa prefix `VITE_`**; tidak pakai env Vite.
- `src/services/` — satu modul per domain (`authService`, `eventService`,
  `ticketService`, `paymentService`, `queueService`, `builderService`). Semua
  lewat instance axios bersama di `src/services/api.js` (inject Bearer token,
  handle 401 → redirect login).
- `src/context/AuthContext.jsx` — state auth (token + user di localStorage),
  diakses via hook `useAuth()`. Dibungkus di `main.jsx`.
- `src/routes/ProtectedRoute.jsx` — guard login + role; dipakai di `App.jsx`.
- `src/App.jsx` — definisi semua route. Tiga area: publik (`PublicLayout`),
  staff scanner, dan dashboard owner (`DashboardLayout`).
- `src/layouts/` — `PublicLayout` (navbar+footer) & `DashboardLayout` (sidebar owner).
- `src/pages/` — dikelompokkan per peran: `public/`, `auth/`, `staff/`,
  `owner/`, `error/`.
- `src/components/` — `common/` (Loader, EmptyState, PageHeader, StatusBadge),
  `layout/` (AppNavbar, AppFooter), `event/` (EventCard).
- `src/styles/main.scss` — override variabel Bootstrap + style global (tema ungu).
- **Fase tiket**: tiket punya `phases[]` (`{name,price,quota,startAt,endAt,
  isWarTicket}`). `src/utils/ticketPhase.js` = `activePhase`, `ticketStatus`,
  `eventIsWarNow`, `eventPriceFrom`. Harga/kuota/war ditentukan **fase aktif**
  (by tanggal), bukan flag `event.isWarTicket` (dipensiunkan). Editor fase di
  `TicketPhaseEditor` (dipakai `EventFormPage`).
- Fitur war ticket: gating antrian ikut **fase aktif** — `EventDetailPage`/
  `CheckoutPage`/site mengarahkan ke `WaitingQueuePage` bila `eventIsWarNow`,
  lalu otomatis ke checkout (`state.fromQueue`) saat giliran tiba. Checkout
  war-ticket via akses langsung dialihkan ke antrian; `order.source`=queue|direct.
- **Mock data**: `config.UseMockData` (default `true`) membuat semua service
  memakai `src/mocks/`. `data.js` = seed (events, tickets, metode bayar,
  template). `mockApi.js` = mock stateful via localStorage (alur order →
  payment → status auto-lunas 8 detik → tiket terbit → scan). Setiap service
  mengekspor `UseMockData ? mock : real`. Set `false` saat backend Go siap.
  Akun demo login: `buyer@demo.id` / `staff@demo.id` / `owner@demo.id` (password bebas).
- **QR scanner**: `src/components/scanner/QrScanner.jsx` memakai `@zxing/browser`
  (pilih kamera, start/stop, debounce 2 detik). `ScannerPage` di-`lazy()` di
  `App.jsx` agar ZXing jadi chunk terpisah (tidak membebani bundle utama).
- **Plan & entitlement**: `src/config/plans.js` (Free/Pro: limits, features,
  ticketFeePercent). `PlanContext` (`usePlan()` → `can()`, `limit()`, `isPro`,
  `switchPlan()` khusus demo) dibungkus di `main.jsx`. Komponen `<Gate
  feature="...">` + `<UpgradeCard>` untuk membatasi fitur Pro. `accountService`
  ambil plan akun (mock: owner default Pro). Penegakan asli HARUS di backend.
- **Budgeting (Pro)**: `BudgetingPage` (buku kas, plan vs aktual) + modal
  `BudgetEntryModal` (multi-foto struk base64) & `CategoryManagerModal`.
  `budgetService` → entries/kategori(master)/plans. Kategori = master data per
  workspace.
- **Penjualan & Keuangan (Pro)**: `SalesFinancePage` — KPI + Laba Bersih
  (`penjualan tiket + pemasukan − pengeluaran`) + grafik `SalesCharts`
  (Recharts, di-`lazy()`). `salesService` agregator penjualan dipakai bersama
  budgeting. Mock penjualan di-seed agar grafik berisi.
- **Staff (workspace membership)**: `src/config/roles.js` = master RBAC 5 role
  (owner, administrator, staff-admin, staff-finance, staff) + helper `can.*` &
  `assignableRolesBy()` (anti privilege-escalation). `StaffPage` (`/owner/staff`):
  daftar member, invite by email (multi-role), ubah role, cabut. `memberService`
  + mock `workspace_members` (status invited/active). `AcceptInvitePage`
  (`/invite/:token`) untuk terima undangan. Semua member terikat `workspaceId`
  → owner (lihat aturan konsistensi data).
- **Aturan data**: semua entitas wajib terhubung owner/workspace (multi-tenant);
  staff = member workspace; penegakan asli HARUS di backend.
- **Multi-workspace**: `WorkspaceContext` (`useWorkspace()` → list/current/switch/
  create) dibungkus di `main.jsx`. Switcher di topbar `DashboardLayout`;
  `WorkspacesPage` (`/owner/workspaces`) list+buat (limit dari plan via
  `usePlan().limit('workspaces')`). Mock men-scope data owner (event/budget/
  member) ke workspace aktif (`curWsId`).
- **Website builder (renderer)**: site **per workspace** (`builderService` →
  getSite/saveSite/publish/publicSite). `src/builder/templates.js` = template
  HTML ber-token + `defaultSite`; `src/builder/render.jsx` = `RenderTemplate`
  (ganti token inline + marker `{{events}}`/`{{ticket_list}}`/`{{buy_button}}`
  jadi komponen). `WebsiteBuilderPage` = editor (template/tema/HTML-CSS advanced/
  preview/publish). Situs publik `src/pages/site/` di route **`/s/:subdomain`**
  & `/s/:subdomain/event/:id` (subdomain disimulasi; backend nanti via Host).
  Workspace suspended / site belum publish → **Site404**.

## License

Code in this repository is licensed under the **GNU GPL v3**. Keep new files
compatible with that license.

