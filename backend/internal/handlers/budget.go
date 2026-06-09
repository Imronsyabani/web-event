package handlers

import (
	"net/http"
	"time"

	"github.com/Imronsyabani/web-event/backend/internal/auth"
	"github.com/Imronsyabani/web-event/backend/internal/models"
	"github.com/go-chi/chi/v5"
)

// ---- kategori (master) ----
func (h *Handler) ListCategories(w http.ResponseWriter, r *http.Request) {
	ws := h.currentWS(auth.UserID(r))
	var list []models.BudgetCategory
	h.DB.Where("workspace_id = ?", ws).Find(&list)
	writeJSON(w, http.StatusOK, map[string]any{"items": list})
}

func (h *Handler) CreateCategory(w http.ResponseWriter, r *http.Request) {
	var body struct{ Name, Type string }
	decode(r, &body)
	c := models.BudgetCategory{
		ID: genID("cat"), WorkspaceID: h.currentWS(auth.UserID(r)),
		Name: body.Name, Type: body.Type,
	}
	h.DB.Create(&c)
	writeJSON(w, http.StatusOK, c)
}

func (h *Handler) DeleteCategory(w http.ResponseWriter, r *http.Request) {
	h.DB.Where("id = ? AND workspace_id = ?", chi.URLParam(r, "id"),
		h.currentWS(auth.UserID(r))).Delete(&models.BudgetCategory{})
	writeJSON(w, http.StatusOK, map[string]bool{"ok": true})
}

// ---- entri buku kas ----
func (h *Handler) ListEntries(w http.ResponseWriter, r *http.Request) {
	ws := h.currentWS(auth.UserID(r))
	q := h.DB.Where("workspace_id = ?", ws)
	if ev := r.URL.Query().Get("eventId"); ev != "" {
		q = q.Where("event_id = ?", ev)
	}
	var list []models.BudgetEntry
	q.Order("transaction_date desc").Find(&list)
	writeJSON(w, http.StatusOK, map[string]any{"items": list})
}

func (h *Handler) CreateEntry(w http.ResponseWriter, r *http.Request) {
	var e models.BudgetEntry
	if err := decode(r, &e); err != nil {
		writeErr(w, http.StatusBadRequest, "payload tidak valid")
		return
	}
	e.ID = genID("be")
	e.WorkspaceID = h.currentWS(auth.UserID(r))
	e.CreatedAt = time.Now()
	h.DB.Create(&e)
	writeJSON(w, http.StatusOK, e)
}

func (h *Handler) DeleteEntry(w http.ResponseWriter, r *http.Request) {
	h.DB.Where("id = ? AND workspace_id = ?", chi.URLParam(r, "id"),
		h.currentWS(auth.UserID(r))).Delete(&models.BudgetEntry{})
	writeJSON(w, http.StatusOK, map[string]bool{"ok": true})
}

// ---- target anggaran (plan vs aktual) ----
func (h *Handler) ListPlans(w http.ResponseWriter, r *http.Request) {
	ws := h.currentWS(auth.UserID(r))
	q := h.DB.Where("workspace_id = ?", ws)
	if ev := r.URL.Query().Get("eventId"); ev != "" {
		q = q.Where("event_id = ?", ev)
	}
	var list []models.BudgetPlan
	q.Find(&list)
	writeJSON(w, http.StatusOK, map[string]any{"items": list})
}

func (h *Handler) SavePlan(w http.ResponseWriter, r *http.Request) {
	var body struct {
		EventID       string `json:"eventId"`
		CategoryID    string `json:"categoryId"`
		PlannedAmount int    `json:"plannedAmount"`
	}
	decode(r, &body)
	ws := h.currentWS(auth.UserID(r))
	var p models.BudgetPlan
	err := h.DB.Where("workspace_id = ? AND event_id = ? AND category_id = ?",
		ws, body.EventID, body.CategoryID).First(&p).Error
	if err != nil {
		h.DB.Create(&models.BudgetPlan{
			ID: genID("bp"), WorkspaceID: ws, EventID: body.EventID,
			CategoryID: body.CategoryID, PlannedAmount: body.PlannedAmount,
		})
	} else {
		p.PlannedAmount = body.PlannedAmount
		h.DB.Save(&p)
	}
	writeJSON(w, http.StatusOK, map[string]bool{"ok": true})
}
