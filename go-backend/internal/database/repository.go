package database

import (
        "context"
        "errors"
        "log"
        "shortlink/internal/models"
        "time"

        "go.mongodb.org/mongo-driver/bson"
        "go.mongodb.org/mongo-driver/bson/primitive"
        "go.mongodb.org/mongo-driver/mongo"
        "go.mongodb.org/mongo-driver/mongo/options"
)

// Repository handles database operations
type Repository struct {
        db            *DBClient
        memoryRepo    *MemoryRepository
        useMemoryRepo bool
}

// NewRepository creates a new repository instance
func NewRepository(db *DBClient) *Repository {
        // Check if we can ping MongoDB
        ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
        defer cancel()
        
        useMemoryRepo := false
        err := db.client.Ping(ctx, nil)
        if err != nil {
                log.Printf("Unable to ping MongoDB: %v", err)
                log.Println("Using in-memory repository for development")
                useMemoryRepo = true
        }
        
        return &Repository{
                db:            db,
                memoryRepo:    NewMemoryRepository(),
                useMemoryRepo: useMemoryRepo,
        }
}

// GetShortURL retrieves a short URL by ID
func (r *Repository) GetShortURL(ctx context.Context, id primitive.ObjectID) (*models.ShortURL, error) {
        if r.useMemoryRepo {
                return r.memoryRepo.GetShortURL(ctx, id)
        }
        
        collection := r.db.GetCollection(ShortURLCollection)
        
        var shortURL models.ShortURL
        err := collection.FindOne(ctx, bson.M{"_id": id}).Decode(&shortURL)
        if err != nil {
                if errors.Is(err, mongo.ErrNoDocuments) {
                        return nil, nil
                }
                return nil, err
        }
        
        return &shortURL, nil
}

// GetShortURLBySlug retrieves a short URL by slug
func (r *Repository) GetShortURLBySlug(ctx context.Context, slug string) (*models.ShortURL, error) {
        if r.useMemoryRepo {
                return r.memoryRepo.GetShortURLBySlug(ctx, slug)
        }
        
        collection := r.db.GetCollection(ShortURLCollection)
        
        var shortURL models.ShortURL
        err := collection.FindOne(ctx, bson.M{"slug": slug}).Decode(&shortURL)
        if err != nil {
                if errors.Is(err, mongo.ErrNoDocuments) {
                        return nil, nil
                }
                return nil, err
        }
        
        return &shortURL, nil
}

// GetAllShortURLs retrieves all short URLs for a specific user
func (r *Repository) GetAllShortURLs(ctx context.Context, userID primitive.ObjectID) ([]models.ShortURL, error) {
        if r.useMemoryRepo {
                return r.memoryRepo.GetAllShortURLs(ctx, userID)
        }
        
        collection := r.db.GetCollection(ShortURLCollection)
        
        // Find all documents for this user
        findOptions := options.Find()
        findOptions.SetSort(bson.D{{"createdAt", -1}}) // Sort by creation date, newest first
        
        cursor, err := collection.Find(ctx, bson.M{"userId": userID}, findOptions)
        if err != nil {
                return nil, err
        }
        defer cursor.Close(ctx)
        
        // Decode the documents
        var shortURLs []models.ShortURL
        if err := cursor.All(ctx, &shortURLs); err != nil {
                return nil, err
        }
        
        return shortURLs, nil
}

// CreateShortURL creates a new short URL
func (r *Repository) CreateShortURL(ctx context.Context, shortURL models.ShortURL) (*models.ShortURL, error) {
        if r.useMemoryRepo {
                return r.memoryRepo.CreateShortURL(ctx, shortURL)
        }
        
        collection := r.db.GetCollection(ShortURLCollection)
        
        // Set creation time
        shortURL.CreatedAt = time.Now()
        shortURL.Clicks = 0
        shortURL.Active = true
        
        // Insert document
        result, err := collection.InsertOne(ctx, shortURL)
        if err != nil {
                return nil, err
        }
        
        // Set ID from inserted document
        shortURL.ID = result.InsertedID.(primitive.ObjectID)
        
        return &shortURL, nil
}

// UpdateShortURLClicks increments the click count for a short URL
func (r *Repository) UpdateShortURLClicks(ctx context.Context, id primitive.ObjectID) (*models.ShortURL, error) {
        if r.useMemoryRepo {
                return r.memoryRepo.UpdateShortURLClicks(ctx, id)
        }
        
        collection := r.db.GetCollection(ShortURLCollection)
        
        // Update the click count
        filter := bson.M{"_id": id}
        update := bson.M{"$inc": bson.M{"clicks": 1}}
        
        after := options.After // Return the updated document
        updateOptions := options.FindOneAndUpdateOptions{
                ReturnDocument: &after,
        }
        
        var shortURL models.ShortURL
        err := collection.FindOneAndUpdate(ctx, filter, update, &updateOptions).Decode(&shortURL)
        if err != nil {
                return nil, err
        }
        
        return &shortURL, nil
}

// DeleteShortURL deletes a short URL by ID
func (r *Repository) DeleteShortURL(ctx context.Context, id primitive.ObjectID) error {
        if r.useMemoryRepo {
                return r.memoryRepo.DeleteShortURL(ctx, id)
        }
        
        collection := r.db.GetCollection(ShortURLCollection)
        
        // Delete the document
        _, err := collection.DeleteOne(ctx, bson.M{"_id": id})
        return err
}

// CreateClickEvent creates a new click event
func (r *Repository) CreateClickEvent(ctx context.Context, clickEvent models.ClickEvent) (*models.ClickEvent, error) {
        if r.useMemoryRepo {
                return r.memoryRepo.CreateClickEvent(ctx, clickEvent)
        }
        
        collection := r.db.GetCollection(ClickEventCollection)
        
        // Set creation time
        clickEvent.CreatedAt = time.Now()
        
        // Insert document
        result, err := collection.InsertOne(ctx, clickEvent)
        if err != nil {
                return nil, err
        }
        
        // Set ID from inserted document
        clickEvent.ID = result.InsertedID.(primitive.ObjectID)
        
        return &clickEvent, nil
}

// GetClickEventsByShortURLID retrieves click events for a specific short URL
func (r *Repository) GetClickEventsByShortURLID(ctx context.Context, shortURLID primitive.ObjectID) ([]models.ClickEvent, error) {
        if r.useMemoryRepo {
                return r.memoryRepo.GetClickEventsByShortURLID(ctx, shortURLID)
        }
        
        collection := r.db.GetCollection(ClickEventCollection)
        
        // Find documents for this short URL
        findOptions := options.Find()
        findOptions.SetSort(bson.D{{"createdAt", -1}}) // Sort by creation date, newest first
        
        cursor, err := collection.Find(ctx, bson.M{"shortUrlId": shortURLID}, findOptions)
        if err != nil {
                return nil, err
        }
        defer cursor.Close(ctx)
        
        // Decode the documents
        var clickEvents []models.ClickEvent
        if err := cursor.All(ctx, &clickEvents); err != nil {
                return nil, err
        }
        
        return clickEvents, nil
}

// GetClickStats retrieves aggregated analytics data
func (r *Repository) GetClickStats(ctx context.Context) (*models.StatsResponse, error) {
        if r.useMemoryRepo {
                return r.memoryRepo.GetClickStats(ctx)
        }
        
        // Get collections
        shortURLColl := r.db.GetCollection(ShortURLCollection)
        clickEventColl := r.db.GetCollection(ClickEventCollection)
        
        // Get total clicks count
        totalClicks, err := clickEventColl.CountDocuments(ctx, bson.M{})
        if err != nil {
                return nil, err
        }
        
        // Get total links count
        totalLinks, err := shortURLColl.CountDocuments(ctx, bson.M{})
        if err != nil {
                return nil, err
        }
        
        // Get active links count (not expired and active = true)
        now := time.Now()
        activeLinksFilter := bson.M{
                "active": true,
                "$or": []bson.M{
                        {"expiresAt": bson.M{"$exists": false}},
                        {"expiresAt": bson.M{"$gt": now}},
                },
        }
        activeLinks, err := shortURLColl.CountDocuments(ctx, activeLinksFilter)
        if err != nil {
                return nil, err
        }
        
        // Get device stats
        deviceStatsFilter := []bson.M{
                {
                        "$group": bson.M{
                                "_id": "$device",
                                "count": bson.M{"$sum": 1},
                        },
                },
        }
        
        deviceStatsCursor, err := clickEventColl.Aggregate(ctx, deviceStatsFilter)
        if err != nil {
                return nil, err
        }
        defer deviceStatsCursor.Close(ctx)
        
        // Process device stats results
        deviceStats := models.DeviceStats{
                Mobile:  0,
                Desktop: 0,
                Tablet:  0,
        }
        
        var deviceResults []struct {
                ID    string `bson:"_id"`
                Count int    `bson:"count"`
        }
        
        if err := deviceStatsCursor.All(ctx, &deviceResults); err != nil {
                return nil, err
        }
        
        for _, result := range deviceResults {
                switch result.ID {
                case "mobile":
                        deviceStats.Mobile = result.Count
                case "desktop":
                        deviceStats.Desktop = result.Count
                case "tablet":
                        deviceStats.Tablet = result.Count
                }
        }
        
        // Get referrer stats
        referrerStatsFilter := []bson.M{
                {
                        "$group": bson.M{
                                "_id": "$referer",
                                "count": bson.M{"$sum": 1},
                        },
                },
        }
        
        referrerStatsCursor, err := clickEventColl.Aggregate(ctx, referrerStatsFilter)
        if err != nil {
                return nil, err
        }
        defer referrerStatsCursor.Close(ctx)
        
        // Process referrer stats results
        referrerStats := make(map[string]int)
        
        var referrerResults []struct {
                ID    string `bson:"_id"`
                Count int    `bson:"count"`
        }
        
        if err := referrerStatsCursor.All(ctx, &referrerResults); err != nil {
                return nil, err
        }
        
        for _, result := range referrerResults {
                referrerId := result.ID
                if referrerId == "" {
                        referrerId = "direct"
                }
                referrerStats[referrerId] = result.Count
        }
        
        // Create and return the stats response
        stats := &models.StatsResponse{
                TotalClicks:   int(totalClicks),
                TotalLinks:    int(totalLinks),
                ActiveLinks:   int(activeLinks),
                DeviceStats:   deviceStats,
                ReferrerStats: referrerStats,
        }
        
        return stats, nil
}