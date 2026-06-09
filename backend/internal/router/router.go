package router

import (
	"net/http"

	"github.com/Imronsyabani/web-event/backend/internal/auth"
	"github.com/Imronsyabani/web-event/backend/internal/config"
	"github.com/Imronsyabani/web-event/backend/internal/handlers"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
)

func New(h *handlers.Handler, cfg *config.Config) http.Handler {
	r := chi.NewRouter()
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{cfg.CORSOrigin},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Authorization", "Content-Type"},
		AllowCredentials: false,
	}))

	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte(`{"status":"ok"}`))
	})

	r.Route("/api", func(r chi.Router) {
		// ---- publik ----
		r.Post("/auth/login", h.Login)
		r.Post("/auth/register", h.Register)
		r.Get("/events", h.ListEvents)
		r.Get("/events/{id}", h.GetEvent)
		r.Get("/events/{id}/tickets", h.TicketsByEvent)
		r.Get("/payments/methods", h.PaymentMethods)
		r.Get("/sites/by-subdomain/{subdomain}", h.PublicSite)
		r.Get("/builder/templates", h.BuilderTemplates)
		r.Get("/invites/{token}", h.GetInvite)
		r.Post("/invites/accept", h.AcceptInvite)

		// ---- butuh login ----
		r.Group(func(r chi.Router) {
			r.Use(auth.Required)

			r.Get("/auth/me", h.Me)
			r.Post("/auth/logout", h.Logout)

			r.Get("/account", h.GetAccount)
			r.Post("/account/plan", h.SetPlan)

			// workspaces
			r.Get("/workspaces", h.ListWorkspaces)
			r.Post("/workspaces", h.CreateWorkspace)
			r.Post("/workspaces/{id}/switch", h.SwitchWorkspace)
			r.Get("/workspace", h.GetWorkspace)
			r.Put("/workspace", h.SaveWorkspace)
			r.Get("/workspace/subdomain/check", h.CheckSubdomain)

			// staff/member
			r.Get("/workspace/members", h.ListMembers)
			r.Post("/workspace/members/invite", h.InviteMember)
			r.Put("/workspace/members/{id}/roles", h.UpdateMemberRoles)
			r.Delete("/workspace/members/{id}", h.RevokeMember)

			// events (owner)
			r.Get("/events/mine", h.MyEvents)
			r.Post("/events", h.CreateEvent)
			r.Put("/events/{id}", h.UpdateEvent)
			r.Delete("/events/{id}", h.DeleteEvent)

			// orders & tickets
			r.Post("/orders", h.CreateOrder)
			r.Get("/orders/{id}", h.GetOrder)
			r.Get("/tickets/mine", h.MyTickets)
			r.Post("/tickets/scan", h.ScanTicket)

			// payments
			r.Post("/payments", h.CreatePayment)
			r.Get("/payments/{id}/status", h.PaymentStatus)

			// queue
			r.Post("/queue/{eventId}/join", h.QueueJoin)
			r.Get("/queue/{eventId}/status", h.QueueStatus)
			r.Post("/queue/{eventId}/leave", h.QueueLeave)

			// budget
			r.Get("/budget/categories", h.ListCategories)
			r.Post("/budget/categories", h.CreateCategory)
			r.Delete("/budget/categories/{id}", h.DeleteCategory)
			r.Get("/budget/entries", h.ListEntries)
			r.Post("/budget/entries", h.CreateEntry)
			r.Delete("/budget/entries/{id}", h.DeleteEntry)
			r.Get("/budget/plans", h.ListPlans)
			r.Put("/budget/plans", h.SavePlan)

			// sales
			r.Get("/sales/summary", h.SalesSummary)

			// builder (owner)
			r.Get("/builder/site", h.GetSite)
			r.Put("/builder/site", h.SaveSite)
			r.Post("/builder/site/publish", h.PublishSite)
		})
	})

	return r
}
