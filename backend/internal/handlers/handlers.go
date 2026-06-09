package handlers

import (
	"encoding/json"
	"fmt"
	"math/rand"
	"net/http"
	"time"

	"github.com/Imronsyabani/web-event/backend/internal/config"
	"github.com/Imronsyabani/web-event/backend/internal/models"
	"gorm.io/gorm"
)

type Handler struct {
	DB  *gorm.DB
	Cfg *config.Config
}

func New(db *gorm.DB, cfg *config.Config) *Handler { return &Handler{DB: db, Cfg: cfg} }

// ---- helper respons ----
func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}

func writeErr(w http.ResponseWriter, status int, msg string) {
	writeJSON(w, status, map[string]string{"message": msg})
}

func decode(r *http.Request, v any) error {
	return json.NewDecoder(r.Body).Decode(v)
}

// ---- id generator (string, prefix-acak) ----
const alphabet = "0123456789abcdefghijklmnopqrstuvwxyz"

func genID(prefix string) string {
	b := make([]byte, 8)
	for i := range b {
		b[i] = alphabet[rand.Intn(len(alphabet))]
	}
	return fmt.Sprintf("%s-%s", prefix, string(b))
}

func genCode() string {
	up := "0123456789ABCDEFGHJKLMNPQRSTUVWXYZ"
	part := func() string {
		b := make([]byte, 4)
		for i := range b {
			b[i] = up[rand.Intn(len(up))]
		}
		return string(b)
	}
	return fmt.Sprintf("TKT-%s-%s", part(), part())
}

// ---- workspace aktif untuk owner yang login ----
func (h *Handler) currentWS(userID string) string {
	var acc models.Account
	if err := h.DB.Where("owner_id = ?", userID).First(&acc).Error; err == nil {
		if acc.CurrentWorkspaceID != "" {
			return acc.CurrentWorkspaceID
		}
		if acc.DefaultWorkspaceID != "" {
			return acc.DefaultWorkspaceID
		}
	}
	var ws models.Workspace
	h.DB.Where("owner_id = ?", userID).Order("created_at").First(&ws)
	return ws.ID
}

func nowPtr() *time.Time { t := time.Now(); return &t }
