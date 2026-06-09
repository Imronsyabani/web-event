package main

import (
	"flag"
	"log"
	"net/http"

	"github.com/Imronsyabani/web-event/backend/internal/auth"
	"github.com/Imronsyabani/web-event/backend/internal/config"
	"github.com/Imronsyabani/web-event/backend/internal/database"
	"github.com/Imronsyabani/web-event/backend/internal/handlers"
	"github.com/Imronsyabani/web-event/backend/internal/router"
)

func main() {
	migrateOnly := flag.Bool("migrate", false, "jalankan migrasi lalu keluar")
	flag.Parse()

	cfg := config.Load()
	auth.Init(cfg.JWTSecret)

	db := database.Connect(cfg)
	database.Migrate(db)

	if *migrateOnly {
		log.Println("migrate-only selesai")
		return
	}

	h := handlers.New(db, cfg)
	addr := cfg.Host + ":" + cfg.Port
	log.Printf("Web Event API berjalan di http://%s (env=%s, payment=%s)",
		addr, cfg.AppEnv, cfg.PaymentMode)
	if err := http.ListenAndServe(addr, router.New(h, cfg)); err != nil {
		log.Fatal(err)
	}
}
