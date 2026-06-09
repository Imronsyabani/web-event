package models

import (
	"time"

	"gorm.io/datatypes"
)

// Catatan: struktur nested (venue, tickets+phases, items, theme, dst.) disimpan
// sebagai JSONB agar selaras dengan bentuk data frontend.

type User struct {
	ID           string    `gorm:"primaryKey" json:"id"`
	Name         string    `json:"name"`
	Email        string    `gorm:"uniqueIndex" json:"email"`
	PasswordHash string    `json:"-"`
	Role         string    `json:"role"` // owner | buyer | staff (level akun)
	CreatedAt    time.Time `json:"createdAt"`
}

// Account: entitlement/plan milik owner + workspace aktif.
type Account struct {
	ID                 string `gorm:"primaryKey" json:"-"`
	OwnerID            string `gorm:"index" json:"ownerId"`
	PlanCode           string `json:"planCode"` // free | pro
	Status             string `json:"status"`
	DefaultWorkspaceID string `json:"defaultWorkspaceId"`
	CurrentWorkspaceID string `json:"-"`
}

type Workspace struct {
	ID        string         `gorm:"primaryKey" json:"id"`
	OwnerID   string         `gorm:"index" json:"ownerId"`
	Name      string         `json:"name"`
	Subdomain string         `gorm:"uniqueIndex" json:"subdomain"`
	Logo      string         `json:"logo"`
	Banner    string         `json:"banner"`
	About     string         `json:"about"`
	Theme     datatypes.JSON `json:"theme"`
	Status    string         `json:"status"` // active | suspended
	CreatedAt time.Time      `json:"-"`
}

type WorkspaceMember struct {
	ID          string         `gorm:"primaryKey" json:"id"`
	WorkspaceID string         `gorm:"index" json:"workspaceId"`
	UserID      string         `json:"userId"`
	Name        string         `json:"name"`
	Email       string         `json:"email"`
	Roles       datatypes.JSON `json:"roles"`  // ["staff-admin", ...]
	Status      string         `json:"status"` // invited | active | revoked
	Token       string         `json:"token,omitempty"`
	InvitedBy   string         `json:"invitedBy"`
	InvitedAt   *time.Time     `json:"invitedAt,omitempty"`
	AcceptedAt  *time.Time     `json:"acceptedAt,omitempty"`
}

type Event struct {
	ID            string         `gorm:"primaryKey" json:"id"`
	WorkspaceID   string         `gorm:"index" json:"workspaceId"`
	Title         string         `json:"title"`
	Category      string         `json:"category"`
	Description   string         `json:"description"`
	StartAt       string         `json:"startAt"`
	EndAt         string         `json:"endAt"`
	Banner        string         `json:"banner"`
	Venue         datatypes.JSON `json:"venue"`
	Tickets       datatypes.JSON `json:"tickets"` // [{id,name,phases:[...]}]
	PaymentConfig datatypes.JSON `json:"paymentConfig"`
	Published     bool           `json:"published"`
	CreatedAt     time.Time      `json:"-"`
}

type Order struct {
	ID            string         `gorm:"primaryKey" json:"id"`
	EventID       string         `gorm:"index" json:"eventId"`
	WorkspaceID   string         `json:"workspaceId"`
	BuyerID       string         `gorm:"index" json:"-"`
	EventTitle    string         `json:"eventTitle"`
	Items         datatypes.JSON `json:"items"`
	Total         int            `json:"total"`
	Source        string         `json:"source"` // queue | direct
	Status        string         `json:"status"` // pending | paid
	TicketsIssued bool           `json:"-"`
	CreatedAt     time.Time      `json:"createdAt"`
}

type Payment struct {
	ID        string    `gorm:"primaryKey" json:"id"`
	OrderID   string    `gorm:"index" json:"orderId"`
	Method    string    `json:"method"`
	Amount    int       `json:"amount"`
	Status    string    `json:"status"` // pending | paid | expired | failed
	CreatedAt time.Time `json:"-"`
}

// IssuedTicket = tiket terbit (Tiket Saya + scanner).
type IssuedTicket struct {
	ID           string `gorm:"primaryKey" json:"id"`
	WorkspaceID  string `gorm:"index" json:"workspaceId"`
	UserID       string `gorm:"index" json:"userId"`
	Code         string `gorm:"uniqueIndex" json:"code"`
	EventTitle   string `json:"eventTitle"`
	EventStartAt string `json:"eventStartAt"`
	TicketName   string `json:"ticketName"`
	HolderName   string `json:"holderName"`
	Used         bool   `json:"used"`
}

type Sale struct {
	ID          string `gorm:"primaryKey" json:"id"`
	WorkspaceID string `gorm:"index" json:"workspaceId"`
	EventID     string `json:"eventId"`
	EventTitle  string `json:"eventTitle"`
	TicketID    string `json:"ticketId"`
	TicketName  string `json:"ticketName"`
	Qty         int    `json:"qty"`
	Amount      int    `json:"amount"`
	Status      string `json:"status"` // paid | pending | expired
	Date        string `json:"date"`   // YYYY-MM-DD
}

type BudgetCategory struct {
	ID          string `gorm:"primaryKey" json:"id"`
	WorkspaceID string `gorm:"index" json:"workspaceId"`
	Name        string `json:"name"`
	Type        string `json:"type"` // expense | income
}

type BudgetEntry struct {
	ID              string         `gorm:"primaryKey" json:"id"`
	WorkspaceID     string         `gorm:"index" json:"workspaceId"`
	EventID         string         `json:"eventId"`
	Type            string         `json:"type"`
	Title           string         `json:"title"`
	Amount          int            `json:"amount"`
	Description     string         `json:"description"`
	CategoryID      string         `json:"categoryId"`
	Receipts        datatypes.JSON `json:"receipts"`
	TransactionDate string         `json:"transactionDate"`
	CreatedBy       string         `json:"createdBy"`
	CreatedAt       time.Time      `json:"createdAt"`
}

type BudgetPlan struct {
	ID            string `gorm:"primaryKey" json:"id"`
	WorkspaceID   string `gorm:"index" json:"workspaceId"`
	EventID       string `json:"eventId"`
	CategoryID    string `json:"categoryId"`
	PlannedAmount int    `json:"plannedAmount"`
}

// Site = website builder per workspace.
type Site struct {
	WorkspaceID string         `gorm:"primaryKey" json:"workspaceId"`
	Mode        string         `json:"mode"`
	TemplateID  string         `json:"templateId"`
	LandingHTML string         `json:"landingHtml"`
	EventHTML   string         `json:"eventHtml"`
	CSS         string         `json:"css"`
	Theme       datatypes.JSON `json:"theme"`
	Status      string         `json:"status"`
	PublishedAt *time.Time     `json:"publishedAt"`
}

// AllModels untuk AutoMigrate.
func AllModels() []any {
	return []any{
		&User{}, &Account{}, &Workspace{}, &WorkspaceMember{}, &Event{},
		&Order{}, &Payment{}, &IssuedTicket{}, &Sale{},
		&BudgetCategory{}, &BudgetEntry{}, &BudgetPlan{}, &Site{},
	}
}
