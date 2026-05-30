package main

import (
	"encoding/json"
	"log"
	"net/http"
)

// Helpers
func writeJson(w http.ResponseWriter, status int, v interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	if err := json.NewEncoder(w).Encode(v); err != nil {
		log.Printf("Write Json error: %v", err)
	}
}

func writeError(w http.ResponseWriter, status int, msg string) {
	writeJson(w, status, map[string]string{"error": msg})
}

// Wiring the handler
func registerRoutes(mux *http.ServeMux, store *Store, hub *Hub) {
}

// Handlers
// Get /health
func handleHealth(w http.ResponseWriter, r *http.Request, store *Store, hub *Hub) {
	writeJson(w, http.StatusOK, map[string]string{
		"status":  "ok",
		"service": "karada-api",
		"version": "0.1.0",
	})
}

func handleIncident(w http.ResponseWriter, r *http.Request, store *Store, hub *Hub) {
}
