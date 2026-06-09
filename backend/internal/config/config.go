package config

import (
	"fmt"
	"os"

	"github.com/joho/godotenv"
)

// Config dibaca dari .env terpusat di root project (sumber kebenaran tunggal).
type Config struct {
	AppEnv      string
	Host        string
	Port        string
	JWTSecret   string
	JWTExpiry   string
	CORSOrigin  string
	BaseDomain  string
	PaymentMode string // sandbox | live
	SeedOnStart bool

	DB DBConfig
}

type DBConfig struct {
	Driver   string
	Host     string
	Port     string
	Name     string
	User     string
	Password string
	SSLMode  string
}

func (d DBConfig) DSN() string {
	return fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
		d.Host, d.Port, d.User, d.Password, d.Name, d.SSLMode,
	)
}

func env(key, def string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return def
}

// Load mencari .env di root project (backend dijalankan dari subfolder).
func Load() *Config {
	// .env ada di root; coba beberapa lokasi relatif.
	for _, p := range []string{".env", "../.env", "../../.env"} {
		if _, err := os.Stat(p); err == nil {
			_ = godotenv.Load(p)
			break
		}
	}

	return &Config{
		AppEnv:      env("APP_ENV", "development"),
		Host:        env("BACKEND_HOST", "0.0.0.0"),
		Port:        env("BACKEND_PORT", "8080"),
		JWTSecret:   env("JWT_SECRET", "dev-secret"),
		JWTExpiry:   env("JWT_EXPIRY", "24h"),
		CORSOrigin:  env("CORS_ORIGIN", "http://localhost:5173"),
		BaseDomain:  env("BASE_DOMAIN", "your-event.co.id"),
		PaymentMode: env("PAYMENT_MODE", "sandbox"),
		SeedOnStart: env("SEED_ON_START", "false") == "true",
		DB: DBConfig{
			Driver:   env("DB_DRIVER", "postgres"),
			Host:     env("DB_HOST", "localhost"),
			Port:     env("DB_PORT", "5432"),
			Name:     env("DB_NAME", "web_event"),
			User:     env("DB_USER", "web_event"),
			Password: env("DB_PASSWORD", "web_event"),
			SSLMode:  env("DB_SSLMODE", "disable"),
		},
	}
}
