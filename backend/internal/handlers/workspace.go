package handlers

import (
	"encoding/json"
	"net/http"
	"regexp"

	"github.com/Imronsyabani/web-event/backend/internal/auth"
	"github.com/Imronsyabani/web-event/backend/internal/models"
	"github.com/go-chi/chi/v5"
	"gorm.io/datatypes"
)

var reservedSub = map[string]bool{
	"www": true, "api": true, "admin": true, "app": true, "mail": true,
	"static": true, "cdn": true,
}
var subRe = regexp.MustCompile(`^[a-z0-9](?:[a-z0-9-]{1,30}[a-z0-9])?$`)

func (h *Handler) ListWorkspaces(w http.ResponseWriter, r *http.Request) {
	uid := auth.UserID(r)
	var list []models.Workspace
	h.DB.Where("owner_id = ?", uid).Order("created_at").Find(&list)
	writeJSON(w, http.StatusOK, map[string]any{"items": list, "currentId": h.currentWS(uid)})
}

func (h *Handler) GetWorkspace(w http.ResponseWriter, r *http.Request) {
	var ws models.Workspace
	if err := h.DB.First(&ws, "id = ?", h.currentWS(auth.UserID(r))).Error; err != nil {
		writeErr(w, http.StatusNotFound, "workspace tidak ditemukan")
		return
	}
	writeJSON(w, http.StatusOK, ws)
}

func (h *Handler) SaveWorkspace(w http.ResponseWriter, r *http.Request) {
	var ws models.Workspace
	if err := h.DB.First(&ws, "id = ?", h.currentWS(auth.UserID(r))).Error; err != nil {
		writeErr(w, http.StatusNotFound, "workspace tidak ditemukan")
		return
	}
	var body map[string]any
	decode(r, &body)
	patch := map[string]any{}
	for _, k := range []string{"name", "subdomain", "logo", "banner", "about", "status"} {
		if v, ok := body[k].(string); ok {
			patch[k] = v
		}
	}
	if t, ok := body["theme"]; ok {
		if b, err := json.Marshal(t); err == nil {
			patch["theme"] = datatypes.JSON(b)
		}
	}
	h.DB.Model(&ws).Updates(patch)
	h.DB.First(&ws, "id = ?", ws.ID)
	writeJSON(w, http.StatusOK, ws)
}

func (h *Handler) CreateWorkspace(w http.ResponseWriter, r *http.Request) {
	uid := auth.UserID(r)
	var body struct{ Name, Subdomain string }
	decode(r, &body)
	ws := models.Workspace{
		ID: genID("ws"), OwnerID: uid, Name: body.Name, Subdomain: body.Subdomain,
		Status: "active", Theme: datatypes.JSON([]byte(`{"primary":"#6c5ce7","font":"Inter"}`)),
	}
	if err := h.DB.Create(&ws).Error; err != nil {
		writeErr(w, http.StatusBadRequest, "gagal membuat workspace (subdomain mungkin terpakai)")
		return
	}
	// langsung aktifkan
	h.DB.Model(&models.Account{}).Where("owner_id = ?", uid).
		Update("current_workspace_id", ws.ID)
	writeJSON(w, http.StatusOK, ws)
}

func (h *Handler) SwitchWorkspace(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	uid := auth.UserID(r)
	// pastikan workspace milik user
	var ws models.Workspace
	if err := h.DB.First(&ws, "id = ? AND owner_id = ?", id, uid).Error; err != nil {
		writeErr(w, http.StatusForbidden, "bukan workspace milikmu")
		return
	}
	h.DB.Model(&models.Account{}).Where("owner_id = ?", uid).
		Update("current_workspace_id", id)
	writeJSON(w, http.StatusOK, map[string]any{"currentId": id})
}

func (h *Handler) CheckSubdomain(w http.ResponseWriter, r *http.Request) {
	sub := r.URL.Query().Get("subdomain")
	valid := subRe.MatchString(sub)
	reserved := reservedSub[sub]
	var taken int64
	h.DB.Model(&models.Workspace{}).
		Where("subdomain = ? AND owner_id <> ?", sub, auth.UserID(r)).Count(&taken)
	writeJSON(w, http.StatusOK, map[string]any{
		"subdomain": sub, "valid": valid, "reserved": reserved,
		"taken": taken > 0, "available": valid && !reserved && taken == 0,
	})
}
