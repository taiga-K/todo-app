package usecase_test

import (
	"context"
	"errors"
	"testing"
	"time"

	"github.com/k-taiga/todo-app/apps/api/internal/domain"
	"github.com/k-taiga/todo-app/apps/api/internal/usecase"
)

type memoryRepo struct {
	nextID int64
	tasks  map[int64]domain.Task
}

func newMemoryRepo() *memoryRepo {
	return &memoryRepo{
		nextID: 1,
		tasks:  map[int64]domain.Task{},
	}
}

func (r *memoryRepo) ListByDate(_ context.Context, dueDate string) ([]domain.Task, error) {
	out := make([]domain.Task, 0)
	for _, task := range r.tasks {
		if task.DueDate == dueDate {
			out = append(out, task)
		}
	}
	return out, nil
}

func (r *memoryRepo) Create(_ context.Context, input domain.CreateTaskInput) (domain.Task, error) {
	id := r.nextID
	r.nextID++
	task := domain.Task{
		ID:        id,
		Title:     input.Title,
		Details:   input.Details,
		Time:      input.Time,
		DueDate:   input.DueDate,
		Done:      false,
		CreatedAt: time.Now().UTC(),
	}
	r.tasks[id] = task
	return task, nil
}

func (r *memoryRepo) Update(_ context.Context, id int64, input domain.UpdateTaskInput) (domain.Task, error) {
	task, ok := r.tasks[id]
	if !ok {
		return domain.Task{}, domain.ErrTaskNotFound
	}
	if input.Title != nil {
		task.Title = *input.Title
	}
	if input.Details != nil {
		task.Details = *input.Details
	}
	if input.Time != nil {
		task.Time = *input.Time
	}
	if input.Done != nil {
		task.Done = *input.Done
	}
	r.tasks[id] = task
	return task, nil
}

func (r *memoryRepo) GetByID(_ context.Context, id int64) (domain.Task, error) {
	task, ok := r.tasks[id]
	if !ok {
		return domain.Task{}, domain.ErrTaskNotFound
	}
	return task, nil
}

func TestCreateRejectsEmptyTitle(t *testing.T) {
	svc := usecase.NewTaskService(newMemoryRepo())
	_, err := svc.Create(context.Background(), domain.CreateTaskInput{
		Title:   "   ",
		DueDate: "2026-08-11",
	})
	if !errors.Is(err, domain.ErrEmptyTitle) {
		t.Fatalf("expected ErrEmptyTitle, got %v", err)
	}
}

func TestCreateAndListByDate(t *testing.T) {
	svc := usecase.NewTaskService(newMemoryRepo())
	created, err := svc.Create(context.Background(), domain.CreateTaskInput{
		Title:   "朝のランニング",
		Details: "",
		Time:    "07:00",
		DueDate: "2026-08-11",
	})
	if err != nil {
		t.Fatalf("create: %v", err)
	}
	list, err := svc.ListByDate(context.Background(), "2026-08-11")
	if err != nil {
		t.Fatalf("list: %v", err)
	}
	if len(list) != 1 || list[0].ID != created.ID {
		t.Fatalf("unexpected list: %+v", list)
	}
}

func TestUpdateMarksDone(t *testing.T) {
	svc := usecase.NewTaskService(newMemoryRepo())
	created, err := svc.Create(context.Background(), domain.CreateTaskInput{
		Title:   "仕事報告の準備",
		DueDate: "2026-08-11",
	})
	if err != nil {
		t.Fatalf("create: %v", err)
	}
	done := true
	updated, err := svc.Update(context.Background(), created.ID, domain.UpdateTaskInput{Done: &done})
	if err != nil {
		t.Fatalf("update: %v", err)
	}
	if !updated.Done {
		t.Fatalf("expected done=true")
	}
}
