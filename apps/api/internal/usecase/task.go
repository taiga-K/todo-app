package usecase

import (
	"context"
	"fmt"
	"strings"
	"time"
	"unicode/utf8"

	"github.com/k-taiga/todo-app/apps/api/internal/domain"
)

type TaskService struct {
	repo domain.TaskRepository
}

func NewTaskService(repo domain.TaskRepository) *TaskService {
	return &TaskService{repo: repo}
}

func (s *TaskService) ListByDate(ctx context.Context, dueDate string) ([]domain.Task, error) {
	if err := validateDate(dueDate); err != nil {
		return nil, err
	}
	return s.repo.ListByDate(ctx, dueDate)
}

func (s *TaskService) Create(ctx context.Context, input domain.CreateTaskInput) (domain.Task, error) {
	title := strings.TrimSpace(input.Title)
	if title == "" {
		return domain.Task{}, domain.ErrEmptyTitle
	}
	if utf8.RuneCountInString(title) > 200 {
		return domain.Task{}, fmt.Errorf("%w: title too long", domain.ErrInvalidInput)
	}
	if err := validateDate(input.DueDate); err != nil {
		return domain.Task{}, err
	}
	if err := validateTime(input.Time); err != nil {
		return domain.Task{}, err
	}
	return s.repo.Create(ctx, domain.CreateTaskInput{
		Title:   title,
		Details: strings.TrimSpace(input.Details),
		Time:    input.Time,
		DueDate: input.DueDate,
	})
}

func (s *TaskService) Update(ctx context.Context, id int64, input domain.UpdateTaskInput) (domain.Task, error) {
	if id <= 0 {
		return domain.Task{}, fmt.Errorf("%w: invalid id", domain.ErrInvalidInput)
	}
	if input.Title != nil {
		trimmed := strings.TrimSpace(*input.Title)
		if trimmed == "" {
			return domain.Task{}, domain.ErrEmptyTitle
		}
		if utf8.RuneCountInString(trimmed) > 200 {
			return domain.Task{}, fmt.Errorf("%w: title too long", domain.ErrInvalidInput)
		}
		input.Title = &trimmed
	}
	if input.Details != nil {
		trimmed := strings.TrimSpace(*input.Details)
		input.Details = &trimmed
	}
	if input.Time != nil {
		if err := validateTime(*input.Time); err != nil {
			return domain.Task{}, err
		}
	}
	return s.repo.Update(ctx, id, input)
}

func validateDate(value string) error {
	if _, err := time.Parse("2006-01-02", value); err != nil {
		return domain.ErrInvalidDate
	}
	return nil
}

func validateTime(value string) error {
	if value == "" {
		return nil
	}
	if _, err := time.Parse("15:04", value); err != nil {
		return domain.ErrInvalidTime
	}
	return nil
}
