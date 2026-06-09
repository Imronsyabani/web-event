import { useEffect, useState, useMemo } from 'react'
import { Container, Card, Table, Button, Badge } from 'react-bootstrap'
import Loader from '../../components/common/Loader'
import EmptyState from '../../components/common/EmptyState'
import MemberFormModal from '../../components/staff/MemberFormModal'
import { memberService } from '../../services/memberService'
import { useAuth } from '../../context/AuthContext'
import { roleName, assignableRolesBy, WorkspaceRole } from '../../config/roles'

const STATUS = {
  active: { bg: 'success', label: 'Aktif' },
  invited: { bg: 'warning', label: 'Diundang' },
  revoked: { bg: 'secondary', label: 'Dicabut' },
}

export default function StaffPage() {
  const { user } = useAuth()
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)

  const load = () => {
    setLoading(true)
    memberService
      .list()
      .then((d) => setMembers(d.items || []))
      .finally(() => setLoading(false))
  }
  useEffect(load, [])

  // Role aktor (yang login). Demo: owner akun → role workspace owner.
  const actorRoles = useMemo(() => {
    const me = members.find((m) => m.email === user?.email)
    if (me) return me.roles
    return user?.role === 'owner' ? [WorkspaceRole.Owner] : []
  }, [members, user])

  const assignable = assignableRolesBy(actorRoles)
  const canManage = assignable.length > 0

  const openInvite = () => {
    setEditing(null)
    setShowModal(true)
  }
  const openEdit = (member) => {
    setEditing(member)
    setShowModal(true)
  }

  const submit = async ({ email, roles }) => {
    if (editing) await memberService.updateRoles(editing.id, roles)
    else await memberService.invite({ email, roles })
    load()
  }

  const revoke = async (m) => {
    if (!window.confirm(`Cabut akses ${m.name || m.email}?`)) return
    await memberService.revoke(m.id)
    load()
  }

  // Owner tidak bisa diubah/dicabut; member lain hanya jika aktor punya hak
  const editable = (m) => m.roles[0] !== WorkspaceRole.Owner && canManage

  return (
    <Container fluid className="p-4">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
        <div>
          <h1 className="h3 mb-1">Kelola Staff</h1>
          <p className="text-muted mb-0">Anggota workspace dan perannya.</p>
        </div>
        {canManage && (
          <Button variant="primary" onClick={openInvite}>
            <i className="bi bi-person-plus me-1" />
            Undang Staff
          </Button>
        )}
      </div>

      {loading ? (
        <Loader />
      ) : members.length === 0 ? (
        <EmptyState icon="bi-people" title="Belum ada anggota" />
      ) : (
        <Card className="border-0 shadow-sm">
          <Table responsive hover className="mb-0 align-middle">
            <thead className="table-light">
              <tr>
                <th>Nama / Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Diundang oleh</th>
                <th className="text-end">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => {
                const st = STATUS[m.status] || STATUS.revoked
                return (
                  <tr key={m.id}>
                    <td>
                      <div className="fw-semibold">{m.name || '(belum diterima)'}</div>
                      <div className="small text-muted">{m.email}</div>
                    </td>
                    <td>
                      <div className="d-flex flex-wrap gap-1">
                        {m.roles.map((r) => (
                          <Badge
                            key={r}
                            bg={r === 'owner' ? 'primary' : 'light'}
                            text={r === 'owner' ? 'light' : 'dark'}
                            className="border"
                          >
                            {roleName(r)}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td>
                      <Badge bg={st.bg}>{st.label}</Badge>
                      {m.status === 'invited' && m.token && (
                        <div className="small text-muted mt-1">
                          <i className="bi bi-link-45deg" />
                          /invite/{m.token}
                        </div>
                      )}
                    </td>
                    <td className="small text-muted">{m.invitedBy || '—'}</td>
                    <td className="text-end">
                      {editable(m) ? (
                        <>
                          <Button
                            size="sm"
                            variant="outline-primary"
                            className="me-2"
                            onClick={() => openEdit(m)}
                          >
                            <i className="bi bi-pencil" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline-danger"
                            onClick={() => revoke(m)}
                          >
                            <i className="bi bi-person-x" />
                          </Button>
                        </>
                      ) : (
                        <span className="text-muted small">—</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </Table>
        </Card>
      )}

      <MemberFormModal
        show={showModal}
        onHide={() => setShowModal(false)}
        member={editing}
        assignableRoles={assignable}
        onSubmit={submit}
      />
    </Container>
  )
}
