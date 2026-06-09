// ============================================================
//  Master Role Workspace (RBAC) — 1 sumber kebenaran
//  Penegakan asli WAJIB di backend; frontend untuk UI saja.
// ============================================================

export const WorkspaceRole = {
  Owner: 'owner',
  Administrator: 'administrator',
  StaffAdmin: 'staff-admin',
  StaffFinance: 'staff-finance',
  Staff: 'staff',
}

// Definisi role (urut privilege menurun) untuk ditampilkan/dipilih
export const ROLES = [
  {
    code: WorkspaceRole.Owner,
    name: 'Owner',
    desc: 'Pemilik — kontrol penuh, billing, hapus workspace',
    assignable: false, // tidak diundang; pemilik workspace
  },
  {
    code: WorkspaceRole.Administrator,
    name: 'Administrator',
    desc: 'Delegate penuh workspace (tanpa billing/kepemilikan)',
    assignable: true,
  },
  {
    code: WorkspaceRole.StaffAdmin,
    name: 'Staff Admin',
    desc: 'Kelola event/tiket/builder + staff biasa',
    assignable: true,
  },
  {
    code: WorkspaceRole.StaffFinance,
    name: 'Staff Finance',
    desc: 'Penjualan & keuangan (fitur Pro)',
    assignable: true,
  },
  {
    code: WorkspaceRole.Staff,
    name: 'Staff',
    desc: 'Scanner / check-in',
    assignable: true,
  },
]

export const roleName = (code) =>
  ROLES.find((r) => r.code === code)?.name || code

// ---- Helper permission (berbasis kumpulan role member) ----
const has = (roles, role) => roles?.includes(role)

export const can = {
  scan: (roles) =>
    has(roles, WorkspaceRole.Owner) ||
    has(roles, WorkspaceRole.Administrator) ||
    has(roles, WorkspaceRole.StaffAdmin) ||
    has(roles, WorkspaceRole.Staff),
  manageEvents: (roles) =>
    has(roles, WorkspaceRole.Owner) ||
    has(roles, WorkspaceRole.Administrator) ||
    has(roles, WorkspaceRole.StaffAdmin),
  manageStaff: (roles) =>
    has(roles, WorkspaceRole.Owner) ||
    has(roles, WorkspaceRole.Administrator) ||
    has(roles, WorkspaceRole.StaffAdmin),
  viewFinance: (roles) =>
    has(roles, WorkspaceRole.Owner) ||
    has(roles, WorkspaceRole.Administrator) ||
    has(roles, WorkspaceRole.StaffFinance),
  billing: (roles) => has(roles, WorkspaceRole.Owner),
}

// Role apa saja yang boleh DIBERIKAN oleh seorang aktor (anti escalation)
export function assignableRolesBy(actorRoles) {
  if (has(actorRoles, WorkspaceRole.Owner)) {
    // owner boleh angkat semua kecuali owner
    return [
      WorkspaceRole.Administrator,
      WorkspaceRole.StaffAdmin,
      WorkspaceRole.StaffFinance,
      WorkspaceRole.Staff,
    ]
  }
  if (has(actorRoles, WorkspaceRole.Administrator)) {
    // administrator: tidak boleh angkat administrator lain
    return [
      WorkspaceRole.StaffAdmin,
      WorkspaceRole.StaffFinance,
      WorkspaceRole.Staff,
    ]
  }
  if (has(actorRoles, WorkspaceRole.StaffAdmin)) {
    // staff-admin hanya boleh angkat staff biasa
    return [WorkspaceRole.Staff]
  }
  return []
}
