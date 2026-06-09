package handlers

import (
	"encoding/json"
	"net/http"
	"strings"
	"time"

	"github.com/Imronsyabani/web-event/backend/internal/auth"
	"github.com/Imronsyabani/web-event/backend/internal/models"
	"github.com/go-chi/chi/v5"
)

type orderItem struct {
	TicketID string `json:"ticketId"`
	Qty      int    `json:"qty"`
}

func (h *Handler) eventTickets(ev models.Event) []ticketJSON {
	var ts []ticketJSON
	if len(ev.Tickets) > 0 {
		_ = json.Unmarshal(ev.Tickets, &ts)
	}
	return ts
}

func (h *Handler) CreateOrder(w http.ResponseWriter, r *http.Request) {
	var body struct {
		EventID string      `json:"eventId"`
		Items   []orderItem `json:"items"`
		Source  string      `json:"source"`
	}
	if err := decode(r, &body); err != nil {
		writeErr(w, http.StatusBadRequest, "payload tidak valid")
		return
	}
	var ev models.Event
	if err := h.DB.First(&ev, "id = ?", body.EventID).Error; err != nil {
		writeErr(w, http.StatusNotFound, "event tidak ditemukan")
		return
	}
	tickets := h.eventTickets(ev)
	now := time.Now()
	total := 0
	for _, it := range body.Items {
		for _, t := range tickets {
			if t.ID == it.TicketID {
				total += currentTicketPrice(t, now) * it.Qty
			}
		}
	}
	itemsJSON, _ := json.Marshal(body.Items)
	src := body.Source
	if src == "" {
		src = "direct"
	}
	order := models.Order{
		ID: genID("ord"), EventID: ev.ID, WorkspaceID: ev.WorkspaceID,
		BuyerID: auth.UserID(r), EventTitle: ev.Title, Items: itemsJSON,
		Total: total, Source: src, Status: "pending", CreatedAt: now,
	}
	h.DB.Create(&order)
	writeJSON(w, http.StatusOK, order)
}

func (h *Handler) GetOrder(w http.ResponseWriter, r *http.Request) {
	var o models.Order
	if err := h.DB.First(&o, "id = ?", chi.URLParam(r, "id")).Error; err != nil {
		writeJSON(w, http.StatusOK, map[string]any{"id": chi.URLParam(r, "id"), "total": 0, "status": "pending"})
		return
	}
	writeJSON(w, http.StatusOK, o)
}

func (h *Handler) MyTickets(w http.ResponseWriter, r *http.Request) {
	var list []models.IssuedTicket
	h.DB.Where("user_id = ?", auth.UserID(r)).Find(&list)
	writeJSON(w, http.StatusOK, map[string]any{"items": list})
}

func (h *Handler) ScanTicket(w http.ResponseWriter, r *http.Request) {
	var body struct{ Code string }
	decode(r, &body)
	code := strings.ToUpper(strings.TrimSpace(body.Code))
	var t models.IssuedTicket
	if err := h.DB.First(&t, "code = ?", code).Error; err != nil {
		writeJSON(w, http.StatusOK, map[string]any{"valid": false, "message": "Kode tiket tidak dikenal."})
		return
	}
	if t.Used {
		writeJSON(w, http.StatusOK, map[string]any{"valid": false, "message": "Tiket sudah pernah dipakai.", "ticket": t})
		return
	}
	t.Used = true
	h.DB.Save(&t)
	writeJSON(w, http.StatusOK, map[string]any{"valid": true, "message": "Check-in berhasil!", "ticket": t})
}

// issueTicketsForOrder dipanggil saat pembayaran lunas: terbitkan tiket + catat penjualan.
func (h *Handler) issueTicketsForOrder(order *models.Order) {
	if order.TicketsIssued {
		return
	}
	var ev models.Event
	if err := h.DB.First(&ev, "id = ?", order.EventID).Error; err != nil {
		return
	}
	tickets := h.eventTickets(ev)
	now := time.Now()
	var items []orderItem
	_ = json.Unmarshal(order.Items, &items)

	for _, it := range items {
		var def *ticketJSON
		for i := range tickets {
			if tickets[i].ID == it.TicketID {
				def = &tickets[i]
			}
		}
		name := "Tiket"
		price := 0
		if def != nil {
			name = def.Name
			price = currentTicketPrice(*def, now)
		}
		for i := 0; i < it.Qty; i++ {
			h.DB.Create(&models.IssuedTicket{
				ID: genID("tkt"), WorkspaceID: ev.WorkspaceID, UserID: order.BuyerID,
				Code: genCode(), EventTitle: ev.Title, EventStartAt: ev.StartAt,
				TicketName: name, HolderName: "Pembeli",
			})
		}
		h.DB.Create(&models.Sale{
			ID: genID("sale"), WorkspaceID: ev.WorkspaceID, EventID: ev.ID,
			EventTitle: ev.Title, TicketID: it.TicketID, TicketName: name,
			Qty: it.Qty, Amount: price * it.Qty, Status: "paid",
			Date: now.Format("2006-01-02"),
		})
	}
	order.TicketsIssued = true
	order.Status = "paid"
	h.DB.Save(order)
}
