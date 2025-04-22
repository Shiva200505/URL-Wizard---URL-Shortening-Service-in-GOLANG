package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// ShortURL represents a shortened URL record
type ShortURL struct {
	ID          primitive.ObjectID  `bson:"_id,omitempty" json:"id"`
	OriginalURL string              `bson:"originalUrl" json:"originalUrl"`
	Slug        string              `bson:"slug" json:"slug"`
	Clicks      int                 `bson:"clicks" json:"clicks"`
	Active      bool                `bson:"active" json:"active"`
	CreatedAt   time.Time           `bson:"createdAt" json:"createdAt"`
	ExpiresAt   *time.Time          `bson:"expiresAt,omitempty" json:"expiresAt"`
}

// ClickEvent represents a click event on a shortened URL
type ClickEvent struct {
	ID          primitive.ObjectID  `bson:"_id,omitempty" json:"id"`
	ShortURLID  primitive.ObjectID  `bson:"shortUrlId" json:"shortUrlId"`
	IPAddress   string              `bson:"ipAddress" json:"ipAddress"`
	UserAgent   string              `bson:"userAgent" json:"userAgent"`
	Referer     string              `bson:"referer" json:"referer"`
	CreatedAt   time.Time           `bson:"createdAt" json:"createdAt"`
	Device      string              `bson:"device" json:"device"`
}

// URLRequest is the request model for creating a short URL
type URLRequest struct {
	OriginalURL string  `json:"originalUrl"`
	Slug        string  `json:"slug"`
	ExpiresAt   *string `json:"expiresAt"`
}

// StatsResponse holds the analytics data returned for the dashboard
type StatsResponse struct {
	TotalClicks   int                 `json:"totalClicks"`
	TotalLinks    int                 `json:"totalLinks"`
	ActiveLinks   int                 `json:"activeLinks"`
	DeviceStats   DeviceStats         `json:"deviceStats"`
	ReferrerStats map[string]int      `json:"referrerStats"`
}

// DeviceStats holds statistics about device types used
type DeviceStats struct {
	Mobile  int `json:"mobile"`
	Desktop int `json:"desktop"`
	Tablet  int `json:"tablet"`
}