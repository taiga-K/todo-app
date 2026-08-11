package repository_test

import (
	"context"
	"path/filepath"
	"testing"

	"github.com/k-taiga/todo-app/apps/api/internal/adapter/repository"
	"github.com/k-taiga/todo-app/apps/api/internal/domain"
	"github.com/k-taiga/todo-app/apps/api/internal/infrastructure"
)

func TestSQLiteCreateListUpdate(t *testing.T) {
	dbPath := filepath.Join(t.TempDir(), "todo.db")
	db, err := infrastructure.OpenSQLite(dbPath)
	if err != nil {
		t.Fatalf("open: %v", err)
	}
	t.Cleanup(func() { _ = db.Close() })

	repo := repository.NewSQLiteTaskRepository(db)
	ctx := context.Background()

	created, err := repo.Create(ctx, domain.CreateTaskInput{
		Title:   "夜ご飯の買い物",
		Details: "牛乳",
		Time:    "18:30",
		DueDate: "2026-08-11",
	})
	if err != nil {
		t.Fatalf("create: %v", err)
	}

	list, err := repo.ListByDate(ctx, "2026-08-11")
	if err != nil {
		t.Fatalf("list: %v", err)
	}
	if len(list) != 1 || list[0].Title != "夜ご飯の買い物" {
		t.Fatalf("unexpected list: %+v", list)
	}

	done := true
	details := "牛乳と卵"
	updated, err := repo.Update(ctx, created.ID, domain.UpdateTaskInput{
		Done:    &done,
		Details: &details,
	})
	if err != nil {
		t.Fatalf("update: %v", err)
	}
	if !updated.Done || updated.Details != "牛乳と卵" {
		t.Fatalf("unexpected update: %+v", updated)
	}
}
