package handlers

import (
	"net/http"
	"sort"
	"time"

	"github.com/Imronsyabani/web-event/backend/internal/auth"
	"github.com/Imronsyabani/web-event/backend/internal/models"
)

func (h *Handler) SalesSummary(w http.ResponseWriter, r *http.Request) {
	ws := h.currentWS(auth.UserID(r))
	eventID := r.URL.Query().Get("eventId")

	q := h.DB.Where("workspace_id = ?", ws)
	if eventID != "" {
		q = q.Where("event_id = ?", eventID)
	}
	var sales []models.Sale
	q.Find(&sales)

	byDay := map[string]*struct {
		Date    string `json:"date"`
		Tickets int    `json:"tickets"`
		Revenue int    `json:"revenue"`
	}{}
	byType := map[string]*struct {
		Name    string `json:"name"`
		Tickets int    `json:"tickets"`
		Revenue int    `json:"revenue"`
	}{}
	byEvent := map[string]*struct {
		EventID    string `json:"eventId"`
		EventTitle string `json:"eventTitle"`
		Tickets    int    `json:"tickets"`
		Revenue    int    `json:"revenue"`
	}{}
	status := map[string]int{"paid": 0, "pending": 0, "expired": 0}

	totalTickets, totalRevenue, totalOrders := 0, 0, 0
	for _, s := range sales {
		status[s.Status]++
		if s.Status != "paid" {
			continue
		}
		totalTickets += s.Qty
		totalRevenue += s.Amount
		totalOrders++
		if byDay[s.Date] == nil {
			byDay[s.Date] = &struct {
				Date    string `json:"date"`
				Tickets int    `json:"tickets"`
				Revenue int    `json:"revenue"`
			}{Date: s.Date}
		}
		byDay[s.Date].Tickets += s.Qty
		byDay[s.Date].Revenue += s.Amount
		if byType[s.TicketName] == nil {
			byType[s.TicketName] = &struct {
				Name    string `json:"name"`
				Tickets int    `json:"tickets"`
				Revenue int    `json:"revenue"`
			}{Name: s.TicketName}
		}
		byType[s.TicketName].Tickets += s.Qty
		byType[s.TicketName].Revenue += s.Amount
		if byEvent[s.EventID] == nil {
			byEvent[s.EventID] = &struct {
				EventID    string `json:"eventId"`
				EventTitle string `json:"eventTitle"`
				Tickets    int    `json:"tickets"`
				Revenue    int    `json:"revenue"`
			}{EventID: s.EventID, EventTitle: s.EventTitle}
		}
		byEvent[s.EventID].Tickets += s.Qty
		byEvent[s.EventID].Revenue += s.Amount
	}

	// urutkan byDay
	dayList := make([]any, 0, len(byDay))
	days := make([]string, 0, len(byDay))
	for d := range byDay {
		days = append(days, d)
	}
	sort.Strings(days)
	for _, d := range days {
		dayList = append(dayList, byDay[d])
	}
	typeList := make([]any, 0, len(byType))
	for _, v := range byType {
		typeList = append(typeList, v)
	}
	eventList := make([]any, 0, len(byEvent))
	for _, v := range byEvent {
		eventList = append(eventList, v)
	}

	var remaining any
	if eventID != "" {
		var ev models.Event
		if h.DB.First(&ev, "id = ?", eventID).Error == nil {
			now := time.Now()
			sum := 0
			for _, t := range h.eventTickets(ev) {
				if p := activePhase(t, now); p != nil {
					sum += p.Quota
				}
			}
			remaining = sum
		}
	}

	avg := 0
	if totalOrders > 0 {
		avg = totalRevenue / totalOrders
	}
	writeJSON(w, http.StatusOK, map[string]any{
		"totalTickets": totalTickets, "totalRevenue": totalRevenue,
		"totalOrders": totalOrders, "avgPerOrder": avg, "remaining": remaining,
		"byDay": dayList, "byType": typeList, "byEvent": eventList, "status": status,
	})
}
