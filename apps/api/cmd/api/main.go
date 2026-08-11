package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"time"

	"github.com/k-taiga/todo-app/apps/api/internal/adapter/handler"
	"github.com/k-taiga/todo-app/apps/api/internal/adapter/repository"
	"github.com/k-taiga/todo-app/apps/api/internal/infrastructure"
	"github.com/k-taiga/todo-app/apps/api/internal/usecase"
)

func main() {
	dbPath := os.Getenv("SQLITE_DATABASE_PATH")
	if dbPath == "" {
		wd, err := os.Getwd()
		if err != nil {
			log.Fatalf("resolve working directory: %v", err)
		}
		// apps/api -> repo root/data/todo.db
		dbPath = filepath.Clean(filepath.Join(wd, "..", "..", "data", "todo.db"))
	}

	db, err := infrastructure.OpenSQLite(dbPath)
	if err != nil {
		log.Fatalf("open database: %v", err)
	}
	defer db.Close()

	repo := repository.NewSQLiteTaskRepository(db)
	service := usecase.NewTaskService(repo)
	taskHandler := handler.NewTaskHandler(service)

	mux := http.NewServeMux()
	taskHandler.Register(mux)

	addr := ":8080"
	if port := os.Getenv("PORT"); port != "" {
		addr = ":" + port
	}

	server := &http.Server{
		Addr:              addr,
		Handler:           mux,
		ReadHeaderTimeout: 5 * time.Second,
	}

	fmt.Printf("api listening on %s (db=%s)\n", addr, dbPath)
	if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		log.Fatalf("listen: %v", err)
	}
}
