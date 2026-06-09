package database

import (
	"log"

	"github.com/Imronsyabani/web-event/backend/internal/config"
	"github.com/Imronsyabani/web-event/backend/internal/models"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

func Connect(cfg *config.Config) *gorm.DB {
	db, err := gorm.Open(postgres.Open(cfg.DB.DSN()), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Warn),
	})
	if err != nil {
		log.Fatalf("gagal konek database: %v", err)
	}
	return db
}

func Migrate(db *gorm.DB) {
	if err := db.AutoMigrate(models.AllModels()...); err != nil {
		log.Fatalf("gagal migrasi: %v", err)
	}
	log.Println("migrasi selesai")
}
