package repository

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"time"

	"github.com/k-taiga/todo-app/apps/api/internal/domain"
)

type SQLiteTaskRepository struct {
	db *sql.DB
}

func NewSQLiteTaskRepository(db *sql.DB) *SQLiteTaskRepository {
	return &SQLiteTaskRepository{db: db}
}

func (r *SQLiteTaskRepository) ListByDate(ctx context.Context, dueDate string) ([]domain.Task, error) {
	rows, err := r.db.QueryContext(ctx, `
SELECT id, title, details, time, due_date, done, created_at
FROM tasks
WHERE due_date = ?
ORDER BY
  CASE WHEN time = '' THEN 1 ELSE 0 END,
  time ASC,
  id ASC
`, dueDate)
	if err != nil {
		return nil, fmt.Errorf("list tasks: %w", err)
	}
	defer rows.Close()

	tasks := make([]domain.Task, 0)
	for rows.Next() {
		task, err := scanTask(rows)
		if err != nil {
			return nil, err
		}
		tasks = append(tasks, task)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("list tasks iterate: %w", err)
	}
	return tasks, nil
}

func (r *SQLiteTaskRepository) Create(ctx context.Context, input domain.CreateTaskInput) (domain.Task, error) {
	createdAt := time.Now().UTC().Format(time.RFC3339)
	result, err := r.db.ExecContext(ctx, `
INSERT INTO tasks (title, details, time, due_date, done, created_at)
VALUES (?, ?, ?, ?, 0, ?)
`, input.Title, input.Details, input.Time, input.DueDate, createdAt)
	if err != nil {
		return domain.Task{}, fmt.Errorf("create task: %w", err)
	}
	id, err := result.LastInsertId()
	if err != nil {
		return domain.Task{}, fmt.Errorf("create task id: %w", err)
	}
	return r.GetByID(ctx, id)
}

func (r *SQLiteTaskRepository) Update(ctx context.Context, id int64, input domain.UpdateTaskInput) (domain.Task, error) {
	current, err := r.GetByID(ctx, id)
	if err != nil {
		return domain.Task{}, err
	}

	title := current.Title
	details := current.Details
	taskTime := current.Time
	done := current.Done
	if input.Title != nil {
		title = *input.Title
	}
	if input.Details != nil {
		details = *input.Details
	}
	if input.Time != nil {
		taskTime = *input.Time
	}
	if input.Done != nil {
		done = *input.Done
	}

	doneInt := 0
	if done {
		doneInt = 1
	}
	_, err = r.db.ExecContext(ctx, `
UPDATE tasks
SET title = ?, details = ?, time = ?, done = ?
WHERE id = ?
`, title, details, taskTime, doneInt, id)
	if err != nil {
		return domain.Task{}, fmt.Errorf("update task: %w", err)
	}
	return r.GetByID(ctx, id)
}

func (r *SQLiteTaskRepository) GetByID(ctx context.Context, id int64) (domain.Task, error) {
	row := r.db.QueryRowContext(ctx, `
SELECT id, title, details, time, due_date, done, created_at
FROM tasks
WHERE id = ?
`, id)
	task, err := scanTask(row)
	if errors.Is(err, sql.ErrNoRows) {
		return domain.Task{}, domain.ErrTaskNotFound
	}
	if err != nil {
		return domain.Task{}, fmt.Errorf("get task: %w", err)
	}
	return task, nil
}

type rowScanner interface {
	Scan(dest ...any) error
}

func scanTask(scanner rowScanner) (domain.Task, error) {
	var (
		task      domain.Task
		doneInt   int
		createdAt string
	)
	if err := scanner.Scan(
		&task.ID,
		&task.Title,
		&task.Details,
		&task.Time,
		&task.DueDate,
		&doneInt,
		&createdAt,
	); err != nil {
		return domain.Task{}, err
	}
	task.Done = doneInt == 1
	parsed, err := time.Parse(time.RFC3339, createdAt)
	if err != nil {
		return domain.Task{}, fmt.Errorf("parse created_at: %w", err)
	}
	task.CreatedAt = parsed
	return task, nil
}
