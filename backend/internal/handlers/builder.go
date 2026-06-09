package handlers

import (
	"net/http"

	"github.com/Imronsyabani/web-event/backend/internal/auth"
	"github.com/Imronsyabani/web-event/backend/internal/models"
	"github.com/go-chi/chi/v5"
	"gorm.io/datatypes"
)

// Default template (Aurora) — dipakai bila workspace belum punya site.
const auroraLanding = `<section class="site-hero py-5">
  <div class="container text-center py-5">
    <img src="{{workspace.logo}}" alt="logo" style="height:64px" class="rounded mb-3" />
    <h1 class="display-4 fw-bold">{{workspace.name}}</h1>
    <p class="lead mx-auto" style="max-width:640px">{{workspace.about}}</p>
  </div>
</section>
<section class="container py-5">
  <h2 class="fw-bold mb-4 text-center">Event Kami</h2>
  {{events}}
</section>`

const auroraEvent = `<section class="site-hero py-5">
  <div class="container py-4">
    <h1 class="fw-bold">{{event.name}}</h1>
    <p class="lead mb-0">{{event.date}} · {{event.venue.name}}</p>
  </div>
</section>
<section class="container py-5">
  <div class="row g-4">
    <div class="col-lg-8">
      <img src="{{event.banner}}" alt="banner" class="img-fluid rounded mb-4" />
      <h4>Deskripsi</h4>
      <p style="white-space:pre-line">{{event.description}}</p>
      <h5 class="mt-4">Lokasi</h5>
      <p>{{event.venue.name}} — {{event.venue.address}}</p>
    </div>
    <div class="col-lg-4">
      <div class="border rounded p-3">
        <h5>Tiket</h5>
        {{ticket_list}}
        {{buy_button}}
      </div>
    </div>
  </div>
</section>`

const auroraCSS = `.site-hero{background:linear-gradient(135deg,var(--site-primary),#0984e3);color:#fff}
.site-card{transition:transform .2s} .site-card:hover{transform:translateY(-4px)}`

func defaultSite(workspaceID string) models.Site {
	return models.Site{
		WorkspaceID: workspaceID, Mode: "template", TemplateID: "aurora",
		LandingHTML: auroraLanding, EventHTML: auroraEvent, CSS: auroraCSS,
		Theme: datatypes.JSON([]byte(`{"primary":"#6c5ce7","font":"Inter"}`)),
		Status: "draft",
	}
}

func (h *Handler) BuilderTemplates(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, map[string]any{"items": []map[string]string{
		{"id": "aurora", "name": "Aurora"}, {"id": "minimal", "name": "Minimal"},
	}})
}

func (h *Handler) GetSite(w http.ResponseWriter, r *http.Request) {
	ws := h.currentWS(auth.UserID(r))
	var s models.Site
	if err := h.DB.First(&s, "workspace_id = ?", ws).Error; err != nil {
		writeJSON(w, http.StatusOK, defaultSite(ws))
		return
	}
	writeJSON(w, http.StatusOK, s)
}

func (h *Handler) SaveSite(w http.ResponseWriter, r *http.Request) {
	ws := h.currentWS(auth.UserID(r))
	var in models.Site
	if err := decode(r, &in); err != nil {
		writeErr(w, http.StatusBadRequest, "payload tidak valid")
		return
	}
	in.WorkspaceID = ws
	var existing models.Site
	if h.DB.First(&existing, "workspace_id = ?", ws).Error == nil {
		in.Status = existing.Status
		in.PublishedAt = existing.PublishedAt
		h.DB.Save(&in)
	} else {
		if in.Status == "" {
			in.Status = "draft"
		}
		h.DB.Create(&in)
	}
	writeJSON(w, http.StatusOK, in)
}

func (h *Handler) PublishSite(w http.ResponseWriter, r *http.Request) {
	ws := h.currentWS(auth.UserID(r))
	var s models.Site
	if h.DB.First(&s, "workspace_id = ?", ws).Error != nil {
		s = defaultSite(ws)
		h.DB.Create(&s)
	}
	s.Status = "published"
	s.PublishedAt = nowPtr()
	h.DB.Save(&s)
	writeJSON(w, http.StatusOK, s)
}

// Publik: resolusi subdomain → site published + event. Suspended/unpublished → 404.
func (h *Handler) PublicSite(w http.ResponseWriter, r *http.Request) {
	sub := chi.URLParam(r, "subdomain")
	var ws models.Workspace
	if err := h.DB.First(&ws, "subdomain = ?", sub).Error; err != nil || ws.Status == "suspended" {
		writeErr(w, http.StatusNotFound, "situs tidak ditemukan")
		return
	}
	var site models.Site
	if err := h.DB.First(&site, "workspace_id = ?", ws.ID).Error; err != nil || site.Status != "published" {
		writeErr(w, http.StatusNotFound, "situs belum dipublish")
		return
	}
	var events []models.Event
	h.DB.Where("workspace_id = ? AND published = ?", ws.ID, true).Find(&events)
	writeJSON(w, http.StatusOK, map[string]any{"workspace": ws, "site": site, "events": events})
}
