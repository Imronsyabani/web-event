package handlers

import (
	"encoding/json"
	"net/http"
	"strings"

	"github.com/Imronsyabani/web-event/backend/internal/auth"
	"github.com/Imronsyabani/web-event/backend/internal/models"
	"github.com/go-chi/chi/v5"
	"gorm.io/datatypes"
)

func (h *Handler) ListMembers(w http.ResponseWriter, r *http.Request) {
	var list []models.WorkspaceMember
	h.DB.Where("workspace_id = ?", h.currentWS(auth.UserID(r))).Find(&list)
	writeJSON(w, http.StatusOK, map[string]any{"items": list})
}

func (h *Handler) InviteMember(w http.ResponseWriter, r *http.Request) {
	var body struct {
		Email string   `json:"email"`
		Roles []string `json:"roles"`
	}
	decode(r, &body)
	roles, _ := json.Marshal(body.Roles)
	m := models.WorkspaceMember{
		ID: genID("mbr"), WorkspaceID: h.currentWS(auth.UserID(r)),
		Email: body.Email, Roles: datatypes.JSON(roles), Status: "invited",
		Token: "INV-" + strings.ToUpper(genID("")[1:5]) + "-" + strings.ToUpper(genID("")[1:5]),
		InvitedAt: nowPtr(),
	}
	h.DB.Create(&m)
	writeJSON(w, http.StatusOK, m)
}

func (h *Handler) UpdateMemberRoles(w http.ResponseWriter, r *http.Request) {
	var body struct {
		Roles []string `json:"roles"`
	}
	decode(r, &body)
	roles, _ := json.Marshal(body.Roles)
	var m models.WorkspaceMember
	if err := h.DB.First(&m, "id = ? AND workspace_id = ?", chi.URLParam(r, "id"),
		h.currentWS(auth.UserID(r))).Error; err != nil {
		writeErr(w, http.StatusNotFound, "member tidak ditemukan")
		return
	}
	m.Roles = datatypes.JSON(roles)
	h.DB.Save(&m)
	writeJSON(w, http.StatusOK, m)
}

func (h *Handler) RevokeMember(w http.ResponseWriter, r *http.Request) {
	h.DB.Where("id = ? AND workspace_id = ?", chi.URLParam(r, "id"),
		h.currentWS(auth.UserID(r))).Delete(&models.WorkspaceMember{})
	writeJSON(w, http.StatusOK, map[string]bool{"ok": true})
}

// Publik: detail undangan untuk halaman terima.
func (h *Handler) GetInvite(w http.ResponseWriter, r *http.Request) {
	var m models.WorkspaceMember
	if err := h.DB.First(&m, "token = ? AND status = ?", chi.URLParam(r, "token"), "invited").Error; err != nil {
		writeErr(w, http.StatusNotFound, "undangan tidak ditemukan")
		return
	}
	var ws models.Workspace
	h.DB.First(&ws, "id = ?", m.WorkspaceID)
	var roles []string
	_ = json.Unmarshal(m.Roles, &roles)
	writeJSON(w, http.StatusOK, map[string]any{
		"email": m.Email, "roles": roles,
		"workspaceName": ws.Name, "invitedBy": m.InvitedBy,
	})
}

func (h *Handler) AcceptInvite(w http.ResponseWriter, r *http.Request) {
	var body struct{ Token, Name string }
	decode(r, &body)
	var m models.WorkspaceMember
	if err := h.DB.First(&m, "token = ? AND status = ?", body.Token, "invited").Error; err != nil {
		writeErr(w, http.StatusNotFound, "undangan tidak ditemukan")
		return
	}
	m.Status = "active"
	m.Name = body.Name
	m.UserID = genID("u")
	m.AcceptedAt = nowPtr()
	h.DB.Save(&m)
	writeJSON(w, http.StatusOK, m)
}
