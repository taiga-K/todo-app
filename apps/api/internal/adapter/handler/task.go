package handler

import (
	"encoding/json"
	"errors"
	"net/http"
	"strconv"
	"strings"

	"github.com/k-taiga/todo-app/apps/api/internal/domain"
	"github.com/k-taiga/todo-app/apps/api/internal/usecase"
)

type TaskHandler struct {
	service *usecase.TaskService
}

func NewTaskHandler(service *usecase.TaskService) *TaskHandler {
	return &TaskHandler{service: service}
}

type taskResponse struct {
	ID      int64  `json:"id"`
	Title   string `json:"title"`
	Details string `json:"details"`
	Time    string `json:"time"`
	DueDate string `json:"dueDate"`
	Done    bool   `json:"done"`
}

type createTaskRequest struct {
	Title   string `json:"title"`
	Details string `json:"details"`
	Time    string `json:"time"`
	DueDate string `json:"dueDate"`
}

type updateTaskRequest struct {
	Title   *string `json:"title"`
	Details *string `json:"details"`
	Time    *string `json:"time"`
	Done    *bool   `json:"done"`
}

type errorResponse struct {
	Error string `json:"error"`
}

func (h *TaskHandler) Register(mux *http.ServeMux) {
	mux.HandleFunc("GET /api/tasks", h.list)
	mux.HandleFunc("POST /api/tasks", h.create)
	mux.HandleFunc("PATCH /api/tasks/{id}", h.update)
	mux.HandleFunc("GET /healthz", func(w http.ResponseWriter, _ *http.Request) {
		writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
	})
}

func (h *TaskHandler) list(w http.ResponseWriter, r *http.Request) {
	date := strings.TrimSpace(r.URL.Query().Get("date"))
	if date == "" {
		writeError(w, http.StatusBadRequest, "date query is required")
		return
	}
	tasks, err := h.service.ListByDate(r.Context(), date)
	if err != nil {
		writeDomainError(w, err)
		return
	}
	out := make([]taskResponse, 0, len(tasks))
	for _, task := range tasks {
		out = append(out, toResponse(task))
	}
	writeJSON(w, http.StatusOK, out)
}

func (h *TaskHandler) create(w http.ResponseWriter, r *http.Request) {
	var req createTaskRequest
	if err := decodeJSON(r, &req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid json body")
		return
	}
	task, err := h.service.Create(r.Context(), domain.CreateTaskInput{
		Title:   req.Title,
		Details: req.Details,
		Time:    req.Time,
		DueDate: req.DueDate,
	})
	if err != nil {
		writeDomainError(w, err)
		return
	}
	writeJSON(w, http.StatusCreated, toResponse(task))
}

func (h *TaskHandler) update(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(r.PathValue("id"), 10, 64)
	if err != nil || id <= 0 {
		writeError(w, http.StatusBadRequest, "invalid task id")
		return
	}
	var req updateTaskRequest
	if err := decodeJSON(r, &req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid json body")
		return
	}
	if req.Title == nil && req.Details == nil && req.Time == nil && req.Done == nil {
		writeError(w, http.StatusBadRequest, "at least one field is required")
		return
	}
	task, err := h.service.Update(r.Context(), id, domain.UpdateTaskInput{
		Title:   req.Title,
		Details: req.Details,
		Time:    req.Time,
		Done:    req.Done,
	})
	if err != nil {
		writeDomainError(w, err)
		return
	}
	writeJSON(w, http.StatusOK, toResponse(task))
}

func toResponse(task domain.Task) taskResponse {
	return taskResponse{
		ID:      task.ID,
		Title:   task.Title,
		Details: task.Details,
		Time:    task.Time,
		DueDate: task.DueDate,
		Done:    task.Done,
	}
}

func decodeJSON(r *http.Request, dest any) error {
	decoder := json.NewDecoder(r.Body)
	decoder.DisallowUnknownFields()
	return decoder.Decode(dest)
}

func writeJSON(w http.ResponseWriter, status int, body any) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(body)
}

func writeError(w http.ResponseWriter, status int, message string) {
	writeJSON(w, status, errorResponse{Error: message})
}

func writeDomainError(w http.ResponseWriter, err error) {
	switch {
	case errors.Is(err, domain.ErrTaskNotFound):
		writeError(w, http.StatusNotFound, "task not found")
	case errors.Is(err, domain.ErrEmptyTitle),
		errors.Is(err, domain.ErrInvalidDate),
		errors.Is(err, domain.ErrInvalidTime),
		errors.Is(err, domain.ErrInvalidInput):
		writeError(w, http.StatusBadRequest, err.Error())
	default:
		writeError(w, http.StatusInternalServerError, "internal server error")
	}
}
