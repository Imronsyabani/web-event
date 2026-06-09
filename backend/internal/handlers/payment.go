package handlers

import (
	"net/http"
	"time"

	"github.com/Imronsyabani/web-event/backend/internal/models"
	"github.com/go-chi/chi/v5"
)

var paymentMethods = []map[string]string{
	{"code": "qris", "name": "QRIS (semua e-wallet)"},
	{"code": "va_bca", "name": "Virtual Account BCA"},
	{"code": "va_mandiri", "name": "Virtual Account Mandiri"},
	{"code": "gopay", "name": "GoPay"},
	{"code": "cc", "name": "Kartu Kredit"},
}

func (h *Handler) PaymentMethods(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, map[string]any{"items": paymentMethods})
}

func (h *Handler) CreatePayment(w http.ResponseWriter, r *http.Request) {
	var body struct{ OrderID, Method string }
	decode(r, &body)
	var order models.Order
	if err := h.DB.First(&order, "id = ?", body.OrderID).Error; err != nil {
		writeErr(w, http.StatusNotFound, "order tidak ditemukan")
		return
	}
	p := models.Payment{
		ID: genID("pay"), OrderID: body.OrderID, Method: body.Method,
		Amount: order.Total, Status: "pending", CreatedAt: time.Now(),
	}
	h.DB.Create(&p)
	writeJSON(w, http.StatusOK, p)
}

func (h *Handler) PaymentStatus(w http.ResponseWriter, r *http.Request) {
	var p models.Payment
	if err := h.DB.First(&p, "id = ?", chi.URLParam(r, "id")).Error; err != nil {
		writeJSON(w, http.StatusOK, map[string]any{"id": chi.URLParam(r, "id"), "status": "pending", "amount": 0})
		return
	}
	// Sandbox: lunas otomatis setelah 8 detik (meniru konfirmasi gateway).
	if h.Cfg.PaymentMode == "sandbox" && p.Status == "pending" &&
		time.Since(p.CreatedAt) > 8*time.Second {
		p.Status = "paid"
		h.DB.Save(&p)
		var order models.Order
		if h.DB.First(&order, "id = ?", p.OrderID).Error == nil {
			h.issueTicketsForOrder(&order)
		}
	}
	writeJSON(w, http.StatusOK, p)
}
