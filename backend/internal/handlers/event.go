package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/Imronsyabani/web-event/backend/internal/auth"
	"github.com/Imronsyabani/web-event/backend/internal/models"
	"github.com/go-chi/chi/v5"
)

// Publik: semua event yang sudah terbit (lintas workspace).
func (h *Handler) ListEvents(w http.ResponseWriter, r *http.Request) {
	var list []models.Event
	h.DB.Where("published = ?", true).Order("start_at").Find(&list)
	writeJSON(w, http.StatusOK, map[string]any{"items": list})
}

func (h *Handler) GetEvent(w http.ResponseWriter, r *http.Request) {
	var ev models.Event
	if err := h.DB.First(&ev, "id = ?", chi.URLParam(r, "id")).Error; err != nil {
		writeErr(w, http.StatusNotFound, "event tidak ditemukan")
		return
	}
	writeJSON(w, http.StatusOK, ev)
}

// Owner: event di workspace aktif.
func (h *Handler) MyEvents(w http.ResponseWriter, r *http.Request) {
	var list []models.Event
	h.DB.Where("workspace_id = ?", h.currentWS(auth.UserID(r))).Order("created_at desc").Find(&list)
	writeJSON(w, http.StatusOK, map[string]any{"items": list})
}

func (h *Handler) CreateEvent(w http.ResponseWriter, r *http.Request) {
	var ev models.Event
	if err := decode(r, &ev); err != nil {
		writeErr(w, http.StatusBadRequest, "payload tidak valid")
		return
	}
	ev.ID = genID("evt")
	ev.WorkspaceID = h.currentWS(auth.UserID(r))
	if err := h.DB.Create(&ev).Error; err != nil {
		writeErr(w, http.StatusInternalServerError, "gagal membuat event")
		return
	}
	writeJSON(w, http.StatusOK, ev)
}

func (h *Handler) UpdateEvent(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	var ev models.Event
	if err := h.DB.First(&ev, "id = ? AND workspace_id = ?", id, h.currentWS(auth.UserID(r))).Error; err != nil {
		writeErr(w, http.StatusNotFound, "event tidak ditemukan")
		return
	}
	var in models.Event
	decode(r, &in)
	in.ID = ev.ID
	in.WorkspaceID = ev.WorkspaceID
	in.CreatedAt = ev.CreatedAt
	h.DB.Save(&in)
	writeJSON(w, http.StatusOK, in)
}

func (h *Handler) DeleteEvent(w http.ResponseWriter, r *http.Request) {
	h.DB.Where("id = ? AND workspace_id = ?", chi.URLParam(r, "id"),
		h.currentWS(auth.UserID(r))).Delete(&models.Event{})
	writeJSON(w, http.StatusOK, map[string]bool{"ok": true})
}

func (h *Handler) TicketsByEvent(w http.ResponseWriter, r *http.Request) {
	var ev models.Event
	if err := h.DB.First(&ev, "id = ?", chi.URLParam(r, "id")).Error; err != nil {
		writeErr(w, http.StatusNotFound, "event tidak ditemukan")
		return
	}
	var tickets []any
	if len(ev.Tickets) > 0 {
		_ = json.Unmarshal(ev.Tickets, &tickets)
	}
	writeJSON(w, http.StatusOK, map[string]any{"items": tickets})
}
