package handlers

import (
        "context"
        "encoding/json"
        "net/http"
        "shortlink/internal/database"
        "shortlink/internal/models"
        "shortlink/pkg/utils"
        "time"

        "github.com/gorilla/mux"
        "go.mongodb.org/mongo-driver/bson/primitive"
)

// URLHandler handles URL shortening API endpoints
type URLHandler struct {
        repo *database.Repository
}

// NewURLHandler creates a new URL handler
func NewURLHandler(repo *database.Repository) *URLHandler {
        return &URLHandler{
                repo: repo,
        }
}

// CreateShortURL handles the creation of a new short URL
func (h *URLHandler) CreateShortURL(w http.ResponseWriter, r *http.Request) {
        // Get user ID from context (set by auth middleware)
        userID, ok := r.Context().Value("userID").(primitive.ObjectID)
        if !ok {
                http.Error(w, "Unauthorized", http.StatusUnauthorized)
                return
        }

        // Parse the request body
        var req models.URLRequest
        err := json.NewDecoder(r.Body).Decode(&req)
        if err != nil {
                http.Error(w, "Invalid request body", http.StatusBadRequest)
                return
        }

        // Validate the request
        if req.OriginalURL == "" {
                http.Error(w, "Original URL is required", http.StatusBadRequest)
                return
        }

        // Check if URL is valid
        if !utils.IsValidURL(req.OriginalURL) {
                http.Error(w, "Invalid URL format", http.StatusBadRequest)
                return
        }

        // Generate a slug if not provided
        if req.Slug == "" {
                req.Slug = utils.GenerateSlug(6)
        } else {
                // Validate the custom slug
                if !utils.IsValidSlug(req.Slug) {
                        http.Error(w, "Invalid slug format. Use only letters, numbers, hyphens, and underscores", http.StatusBadRequest)
                        return
                }

                // Check if slug already exists
                existingURL, err := h.repo.GetShortURLBySlug(r.Context(), req.Slug)
                if err != nil {
                        http.Error(w, "Error checking slug availability", http.StatusInternalServerError)
                        return
                }
                if existingURL != nil {
                        http.Error(w, "Slug already in use", http.StatusConflict)
                        return
                }
        }

        // Parse expiry date if provided
        var expiresAt *time.Time
        if req.ExpiresAt != nil && *req.ExpiresAt != "" && *req.ExpiresAt != "never" {
                var expiry time.Time
                switch *req.ExpiresAt {
                case "1day":
                        expiry = time.Now().Add(24 * time.Hour)
                case "7days":
                        expiry = time.Now().Add(7 * 24 * time.Hour)
                case "30days":
                        expiry = time.Now().Add(30 * 24 * time.Hour)
                default:
                        // Try to parse as ISO string
                        parsedTime, err := time.Parse(time.RFC3339, *req.ExpiresAt)
                        if err != nil {
                                http.Error(w, "Invalid expiry date format", http.StatusBadRequest)
                                return
                        }
                        expiry = parsedTime
                }
                expiresAt = &expiry
        }

        // Create the short URL object
        shortURL := models.ShortURL{
                UserID:      userID,
                OriginalURL: req.OriginalURL,
                Slug:        req.Slug,
                ExpiresAt:   expiresAt,
        }

        // Save to the database
        createdURL, err := h.repo.CreateShortURL(r.Context(), shortURL)
        if err != nil {
                http.Error(w, "Error creating short URL", http.StatusInternalServerError)
                return
        }

        // Return the created URL
        w.Header().Set("Content-Type", "application/json")
        w.WriteHeader(http.StatusCreated)
        json.NewEncoder(w).Encode(createdURL)
}

// GetShortURL retrieves a short URL by ID
func (h *URLHandler) GetShortURL(w http.ResponseWriter, r *http.Request) {
        // Get ID from URL parameters
        vars := mux.Vars(r)
        idStr := vars["id"]

        // Convert string ID to ObjectID
        id, err := primitive.ObjectIDFromHex(idStr)
        if err != nil {
                http.Error(w, "Invalid ID format", http.StatusBadRequest)
                return
        }

        // Get the short URL from the database
        shortURL, err := h.repo.GetShortURL(r.Context(), id)
        if err != nil {
                http.Error(w, "Error retrieving short URL", http.StatusInternalServerError)
                return
        }

        if shortURL == nil {
                http.Error(w, "Short URL not found", http.StatusNotFound)
                return
        }

        // Return the short URL
        w.Header().Set("Content-Type", "application/json")
        json.NewEncoder(w).Encode(shortURL)
}

// GetAllShortURLs handles retrieving all short URLs for the current user
func (h *URLHandler) GetAllShortURLs(w http.ResponseWriter, r *http.Request) {
        // Get user ID from context (set by auth middleware)
        userID, ok := r.Context().Value("userID").(primitive.ObjectID)
        if !ok {
                http.Error(w, "Unauthorized", http.StatusUnauthorized)
                return
        }

        // Get all short URLs for this user
        shortURLs, err := h.repo.GetAllShortURLs(r.Context(), userID)
        if err != nil {
                http.Error(w, "Error retrieving short URLs", http.StatusInternalServerError)
                return
        }

        // Return the short URLs
        w.Header().Set("Content-Type", "application/json")
        json.NewEncoder(w).Encode(shortURLs)
}

// DeleteShortURL deletes a short URL by ID
func (h *URLHandler) DeleteShortURL(w http.ResponseWriter, r *http.Request) {
        // Get ID from URL parameters
        vars := mux.Vars(r)
        idStr := vars["id"]

        // Convert string ID to ObjectID
        id, err := primitive.ObjectIDFromHex(idStr)
        if err != nil {
                http.Error(w, "Invalid ID format", http.StatusBadRequest)
                return
        }

        // Delete the short URL from the database
        err = h.repo.DeleteShortURL(r.Context(), id)
        if err != nil {
                http.Error(w, "Error deleting short URL", http.StatusInternalServerError)
                return
        }

        // Return success message
        w.Header().Set("Content-Type", "application/json")
        w.WriteHeader(http.StatusOK)
        json.NewEncoder(w).Encode(map[string]string{"message": "Short URL deleted successfully"})
}

// RedirectShortURL handles the redirection of a short URL
func (h *URLHandler) RedirectShortURL(w http.ResponseWriter, r *http.Request) {
        // Get slug from URL parameters
        vars := mux.Vars(r)
        slug := vars["slug"]

        // Get the short URL from the database
        shortURL, err := h.repo.GetShortURLBySlug(r.Context(), slug)
        if err != nil {
                http.Error(w, "Error retrieving short URL", http.StatusInternalServerError)
                return
        }

        if shortURL == nil {
                http.Error(w, "Short URL not found", http.StatusNotFound)
                return
        }

        // Check if the URL is active and not expired
        if !shortURL.Active {
                http.Error(w, "This link is inactive", http.StatusGone)
                return
        }

        if shortURL.ExpiresAt != nil && shortURL.ExpiresAt.Before(time.Now()) {
                http.Error(w, "This link has expired", http.StatusGone)
                return
        }

        // Record the click event (in a goroutine to not block the redirection)
        go func() {
                // Create a new context for the background operation
                ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
                defer cancel()
                
                // Increment the click count
                _, err := h.repo.UpdateShortURLClicks(ctx, shortURL.ID)
                if err != nil {
                        // Just log the error, don't affect the user's redirect
                        utils.LogError("Failed to update click count", err)
                }
                
                // Create a click event
                referer := r.Header.Get("Referer")
                if referer == "" {
                        referer = "direct"
                }
                
                device := utils.DetectDevice(r.UserAgent())
                
                clickEvent := models.ClickEvent{
                        ShortURLID: shortURL.ID,
                        IPAddress:  r.RemoteAddr,
                        UserAgent:  r.UserAgent(),
                        Referer:    referer,
                        Device:     device,
                }
                
                _, err = h.repo.CreateClickEvent(ctx, clickEvent)
                if err != nil {
                        utils.LogError("Failed to create click event", err)
                }
        }()

        // Redirect to the original URL
        http.Redirect(w, r, shortURL.OriginalURL, http.StatusTemporaryRedirect)
}

// GetAnalytics retrieves analytics data for the dashboard
func (h *URLHandler) GetAnalytics(w http.ResponseWriter, r *http.Request) {
        // Get the analytics data
        stats, err := h.repo.GetClickStats(r.Context())
        if err != nil {
                http.Error(w, "Error retrieving analytics data", http.StatusInternalServerError)
                return
        }

        // Return the analytics data
        w.Header().Set("Content-Type", "application/json")
        json.NewEncoder(w).Encode(stats)
}