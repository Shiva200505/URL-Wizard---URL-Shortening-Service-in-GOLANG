package database

import (
	"context"
	"errors"
	"shortlink/internal/models"
	"sync"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// MemoryRepository is an in-memory implementation of the repository for development
type MemoryRepository struct {
	shortURLs      map[primitive.ObjectID]models.ShortURL
	shortURLsBySlug map[string]primitive.ObjectID
	clickEvents    map[primitive.ObjectID]models.ClickEvent
	mu             sync.RWMutex
	shortURLCount  int
	clickEventCount int
}

// NewMemoryRepository creates a new in-memory repository
func NewMemoryRepository() *MemoryRepository {
	return &MemoryRepository{
		shortURLs:      make(map[primitive.ObjectID]models.ShortURL),
		shortURLsBySlug: make(map[string]primitive.ObjectID),
		clickEvents:    make(map[primitive.ObjectID]models.ClickEvent),
		shortURLCount:  0,
		clickEventCount: 0,
	}
}

// GetShortURL retrieves a short URL by ID
func (r *MemoryRepository) GetShortURL(ctx context.Context, id primitive.ObjectID) (*models.ShortURL, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	
	shortURL, ok := r.shortURLs[id]
	if !ok {
		return nil, nil
	}
	
	return &shortURL, nil
}

// GetShortURLBySlug retrieves a short URL by slug
func (r *MemoryRepository) GetShortURLBySlug(ctx context.Context, slug string) (*models.ShortURL, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	
	id, ok := r.shortURLsBySlug[slug]
	if !ok {
		return nil, nil
	}
	
	shortURL, ok := r.shortURLs[id]
	if !ok {
		return nil, errors.New("inconsistent state: slug exists but short URL not found")
	}
	
	return &shortURL, nil
}

// CreateShortURL creates a new short URL
func (r *MemoryRepository) CreateShortURL(ctx context.Context, shortURL models.ShortURL) (*models.ShortURL, error) {
	r.mu.Lock()
	defer r.mu.Unlock()
	
	// Generate new ID if not set
	if shortURL.ID.IsZero() {
		shortURL.ID = primitive.NewObjectID()
	}
	
	// Check if slug already exists
	if _, ok := r.shortURLsBySlug[shortURL.Slug]; ok {
		return nil, errors.New("slug already exists")
	}
	
	// Set defaults
	shortURL.CreatedAt = time.Now()
	shortURL.Clicks = 0
	shortURL.Active = true
	
	// Store the short URL
	r.shortURLs[shortURL.ID] = shortURL
	r.shortURLsBySlug[shortURL.Slug] = shortURL.ID
	r.shortURLCount++
	
	return &shortURL, nil
}

// GetAllShortURLs retrieves all short URLs
func (r *MemoryRepository) GetAllShortURLs(ctx context.Context) ([]models.ShortURL, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	
	shortURLs := make([]models.ShortURL, 0, len(r.shortURLs))
	for _, shortURL := range r.shortURLs {
		shortURLs = append(shortURLs, shortURL)
	}
	
	return shortURLs, nil
}

// UpdateShortURLClicks increments the click count for a short URL
func (r *MemoryRepository) UpdateShortURLClicks(ctx context.Context, id primitive.ObjectID) (*models.ShortURL, error) {
	r.mu.Lock()
	defer r.mu.Unlock()
	
	shortURL, ok := r.shortURLs[id]
	if !ok {
		return nil, errors.New("short URL not found")
	}
	
	shortURL.Clicks++
	r.shortURLs[id] = shortURL
	
	return &shortURL, nil
}

// DeleteShortURL deletes a short URL by ID
func (r *MemoryRepository) DeleteShortURL(ctx context.Context, id primitive.ObjectID) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	
	shortURL, ok := r.shortURLs[id]
	if !ok {
		return errors.New("short URL not found")
	}
	
	// Remove the slug mapping
	delete(r.shortURLsBySlug, shortURL.Slug)
	
	// Remove the short URL
	delete(r.shortURLs, id)
	
	return nil
}

// CreateClickEvent creates a new click event
func (r *MemoryRepository) CreateClickEvent(ctx context.Context, clickEvent models.ClickEvent) (*models.ClickEvent, error) {
	r.mu.Lock()
	defer r.mu.Unlock()
	
	// Generate new ID if not set
	if clickEvent.ID.IsZero() {
		clickEvent.ID = primitive.NewObjectID()
	}
	
	// Set creation time
	clickEvent.CreatedAt = time.Now()
	
	// Store the click event
	r.clickEvents[clickEvent.ID] = clickEvent
	r.clickEventCount++
	
	return &clickEvent, nil
}

// GetClickEventsByShortURLID retrieves click events for a specific short URL
func (r *MemoryRepository) GetClickEventsByShortURLID(ctx context.Context, shortURLID primitive.ObjectID) ([]models.ClickEvent, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	
	var clickEvents []models.ClickEvent
	
	for _, clickEvent := range r.clickEvents {
		if clickEvent.ShortURLID == shortURLID {
			clickEvents = append(clickEvents, clickEvent)
		}
	}
	
	return clickEvents, nil
}

// GetClickStats retrieves aggregated analytics data
func (r *MemoryRepository) GetClickStats(ctx context.Context) (*models.StatsResponse, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	
	// Count total clicks
	totalClicks := 0
	deviceStats := models.DeviceStats{
		Mobile:  0,
		Desktop: 0,
		Tablet:  0,
	}
	
	referrerStats := make(map[string]int)
	
	for _, clickEvent := range r.clickEvents {
		totalClicks++
		
		// Count device stats
		switch clickEvent.Device {
		case "mobile":
			deviceStats.Mobile++
		case "desktop":
			deviceStats.Desktop++
		case "tablet":
			deviceStats.Tablet++
		}
		
		// Count referrer stats
		referer := clickEvent.Referer
		if referer == "" {
			referer = "direct"
		}
		
		referrerStats[referer]++
	}
	
	// Count active links
	activeLinks := 0
	now := time.Now()
	
	for _, shortURL := range r.shortURLs {
		if shortURL.Active {
			if shortURL.ExpiresAt == nil || shortURL.ExpiresAt.After(now) {
				activeLinks++
			}
		}
	}
	
	// Create the stats response
	stats := &models.StatsResponse{
		TotalClicks:   totalClicks,
		TotalLinks:    len(r.shortURLs),
		ActiveLinks:   activeLinks,
		DeviceStats:   deviceStats,
		ReferrerStats: referrerStats,
	}
	
	return stats, nil
}