package handlers

import (
	"net/http"
	"regexp"
	"strings"
	"time"

	"github.com/Imronsyabani/web-event/backend/internal/auth"
	"github.com/Imronsyabani/web-event/backend/internal/models"
	"gorm.io/datatypes"
)

func (h *Handler) expiry() time.Duration {
	d, err := time.ParseDuration(h.Cfg.JWTExpiry)
	if err != nil {
		return 24 * time.Hour
	}
	return d
}

func (h *Handler) issue(w http.ResponseWriter, u models.User) {
	tok, err := auth.GenerateToken(u.ID, h.expiry())
	if err != nil {
		writeErr(w, http.StatusInternalServerError, "gagal membuat token")
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"token": tok, "user": u})
}

func (h *Handler) Login(w http.ResponseWriter, r *http.Request) {
	var body struct{ Email, Password string }
	if err := decode(r, &body); err != nil {
		writeErr(w, http.StatusBadRequest, "payload tidak valid")
		return
	}
	var u models.User
	if err := h.DB.Where("email = ?", body.Email).First(&u).Error; err != nil {
		writeErr(w, http.StatusUnauthorized, "email atau password salah")
		return
	}
	if !auth.CheckPassword(u.PasswordHash, body.Password) {
		writeErr(w, http.StatusUnauthorized, "email atau password salah")
		return
	}
	h.issue(w, u)
}

var slugRe = regexp.MustCompile(`[^a-z0-9]+`)

func slugify(s string) string {
	s = strings.ToLower(strings.TrimSpace(s))
	s = slugRe.ReplaceAllString(s, "-")
	return strings.Trim(s, "-")
}

func (h *Handler) Register(w http.ResponseWriter, r *http.Request) {
	var body struct{ Name, Email, Password, Role string }
	if err := decode(r, &body); err != nil {
		writeErr(w, http.StatusBadRequest, "payload tidak valid")
		return
	}
	var exists int64
	h.DB.Model(&models.User{}).Where("email = ?", body.Email).Count(&exists)
	if exists > 0 {
		writeErr(w, http.StatusConflict, "email sudah terdaftar")
		return
	}
	hash, _ := auth.HashPassword(body.Password)
	role := body.Role
	if role == "" {
		role = "buyer"
	}
	u := models.User{ID: genID("u"), Name: body.Name, Email: body.Email, PasswordHash: hash, Role: role}
	if err := h.DB.Create(&u).Error; err != nil {
		writeErr(w, http.StatusInternalServerError, "gagal mendaftar")
		return
	}

	// Owner: siapkan account + workspace awal agar bisa langsung pakai dashboard.
	if role == "owner" {
		sub := slugify(strings.Split(body.Email, "@")[0])
		if sub == "" {
			sub = genID("ws")
		}
		ws := models.Workspace{
			ID: genID("ws"), OwnerID: u.ID, Name: body.Name + " Workspace",
			Subdomain: sub, Status: "active",
			Theme: datatypes.JSON([]byte(`{"primary":"#6c5ce7","font":"Inter"}`)),
		}
		h.DB.Create(&ws)
		h.DB.Create(&models.Account{
			ID: genID("acc"), OwnerID: u.ID, PlanCode: "free", Status: "active",
			DefaultWorkspaceID: ws.ID, CurrentWorkspaceID: ws.ID,
		})
	}
	h.issue(w, u)
}

func (h *Handler) Me(w http.ResponseWriter, r *http.Request) {
	var u models.User
	if err := h.DB.First(&u, "id = ?", auth.UserID(r)).Error; err != nil {
		writeErr(w, http.StatusUnauthorized, "unauthorized")
		return
	}
	writeJSON(w, http.StatusOK, u)
}

func (h *Handler) Logout(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, map[string]bool{"ok": true})
}
