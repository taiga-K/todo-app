package domain

import (
	"context"
	"errors"
	"time"
)

var (
	ErrTaskNotFound  = errors.New("task not found")
	ErrInvalidInput  = errors.New("invalid input")
	ErrEmptyTitle    = errors.New("title is required")
	ErrInvalidDate   = errors.New("date must be YYYY-MM-DD")
	ErrInvalidTime   = errors.New("time must be HH:MM or empty")
)

type Task struct {
	ID        int64
	Title     string
	Details   string
	Time      string
	DueDate   string
	Done      bool
	CreatedAt time.Time
}

type CreateTaskInput struct {
	Title   string
	Details string
	Time    string
	DueDate string
}

type UpdateTaskInput struct {
	Title   *string
	Details *string
	Time    *string
	Done    *bool
}

type TaskRepository interface {
	ListByDate(ctx context.Context, dueDate string) ([]Task, error)
	Create(ctx context.Context, input CreateTaskInput) (Task, error)
	Update(ctx context.Context, id int64, input UpdateTaskInput) (Task, error)
	GetByID(ctx context.Context, id int64) (Task, error)
}
