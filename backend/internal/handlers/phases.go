package handlers

import "time"

// Bentuk tiket & fase (selaras frontend) untuk hitung harga/kuota fase aktif.
type phase struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	Price       int    `json:"price"`
	Quota       int    `json:"quota"`
	StartAt     string `json:"startAt"`
	EndAt       string `json:"endAt"`
	IsWarTicket bool   `json:"isWarTicket"`
}

type ticketJSON struct {
	ID     string  `json:"id"`
	Name   string  `json:"name"`
	Price  int     `json:"price"`
	Quota  int     `json:"quota"`
	Phases []phase `json:"phases"`
}

var timeLayouts = []string{
	time.RFC3339,
	"2006-01-02T15:04:05",
	"2006-01-02T15:04",
	"2006-01-02",
}

func parseT(s string) (time.Time, bool) {
	for _, l := range timeLayouts {
		if t, err := time.Parse(l, s); err == nil {
			return t, true
		}
	}
	return time.Time{}, false
}

// Fase aktif: now ∈ [startAt, endAt] (kosong = tak dibatasi).
func activePhase(t ticketJSON, now time.Time) *phase {
	phases := t.Phases
	if len(phases) == 0 {
		return &phase{ID: t.ID + "-default", Name: "Normal", Price: t.Price, Quota: t.Quota}
	}
	for i := range phases {
		p := phases[i]
		okStart := true
		okEnd := true
		if s, ok := parseT(p.StartAt); ok {
			okStart = !now.Before(s)
		}
		if e, ok := parseT(p.EndAt); ok {
			okEnd = !now.After(e)
		}
		if okStart && okEnd {
			return &phases[i]
		}
	}
	return nil
}

func currentTicketPrice(t ticketJSON, now time.Time) int {
	if p := activePhase(t, now); p != nil {
		return p.Price
	}
	return t.Price
}
