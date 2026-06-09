package handlers

import (
	"net/http"

	"github.com/Imronsyabani/web-event/backend/internal/auth"
	"github.com/Imronsyabani/web-event/backend/internal/models"
)

func (h *Handler) GetAccount(w http.ResponseWriter, r *http.Request) {
	var acc models.Account
	if err := h.DB.Where("owner_id = ?", auth.UserID(r)).First(&acc).Error; err != nil {
		writeJSON(w, http.StatusOK, map[string]any{"planCode": "free", "status": "active"})
		return
	}
	writeJSON(w, http.StatusOK, acc)
}

func (h *Handler) SetPlan(w http.ResponseWriter, r *http.Request) {
	var body struct{ PlanCode string }
	if err := decode(r, &body); err != nil {
		writeErr(w, http.StatusBadRequest, "payload tidak valid")
		return
	}
	uid := auth.UserID(r)
	var acc models.Account
	if err := h.DB.Where("owner_id = ?", uid).First(&acc).Error; err != nil {
		acc = models.Account{ID: genID("acc"), OwnerID: uid, Status: "active"}
		acc.PlanCode = body.PlanCode
		h.DB.Create(&acc)
	} else {
		acc.PlanCode = body.PlanCode
		h.DB.Save(&acc)
	}
	writeJSON(w, http.StatusOK, acc)
}
