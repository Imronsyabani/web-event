package handlers

import (
	"math/rand"
	"net/http"
	"sync"
	"time"

	"github.com/Imronsyabani/web-event/backend/internal/auth"
	"github.com/go-chi/chi/v5"
)

// Waiting queue in-memory (demo). Realtime/Redis menyusul.
type queueEntry struct {
	Position int
	StartAt  time.Time
}

var (
	queueMu    sync.Mutex
	queueStore = map[string]queueEntry{}
)

func queueKey(userID, eventID string) string { return userID + "|" + eventID }

func computeQueue(e queueEntry) map[string]any {
	elapsed := int(time.Since(e.StartAt).Seconds())
	pos := e.Position - elapsed/3
	status := "waiting"
	if pos <= 0 {
		status = "active"
	}
	if pos < 1 {
		pos = 1
	}
	return map[string]any{
		"position": pos, "totalWaiting": e.Position,
		"etaMinutes": (pos*3 + 59) / 60, "status": status,
	}
}

func (h *Handler) QueueJoin(w http.ResponseWriter, r *http.Request) {
	eventID := chi.URLParam(r, "eventId")
	key := queueKey(auth.UserID(r), eventID)
	queueMu.Lock()
	e := queueEntry{Position: 5 + rand.Intn(8), StartAt: time.Now()}
	queueStore[key] = e
	queueMu.Unlock()
	writeJSON(w, http.StatusOK, computeQueue(e))
}

func (h *Handler) QueueStatus(w http.ResponseWriter, r *http.Request) {
	eventID := chi.URLParam(r, "eventId")
	key := queueKey(auth.UserID(r), eventID)
	queueMu.Lock()
	e, ok := queueStore[key]
	queueMu.Unlock()
	if !ok {
		writeJSON(w, http.StatusOK, map[string]any{"eventId": eventID, "status": "none"})
		return
	}
	writeJSON(w, http.StatusOK, computeQueue(e))
}

func (h *Handler) QueueLeave(w http.ResponseWriter, r *http.Request) {
	eventID := chi.URLParam(r, "eventId")
	queueMu.Lock()
	delete(queueStore, queueKey(auth.UserID(r), eventID))
	queueMu.Unlock()
	writeJSON(w, http.StatusOK, map[string]any{"eventId": eventID, "status": "none"})
}
