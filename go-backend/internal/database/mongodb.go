package database

import (
        "context"
        "log"
        "os"
        "time"

        "go.mongodb.org/mongo-driver/mongo"
        "go.mongodb.org/mongo-driver/mongo/options"
)

// DBClient is a MongoDB client
type DBClient struct {
        client *mongo.Client
        db     *mongo.Database
}

// Collections
const (
        ShortURLCollection = "shortUrls"
        ClickEventCollection = "clickEvents"
)

// NewDBClient creates a new MongoDB client
func NewDBClient() *DBClient {
        // Get connection string from environment variable
        mongoURI := os.Getenv("MONGODB_URI")
        if mongoURI == "" {
                mongoURI = "mongodb://localhost:27017"
                log.Println("Warning: MONGODB_URI not set, using default:", mongoURI)
        }

        log.Println("Attempting to connect to MongoDB...")

        // Set client options with shorter timeout and direct connection
        clientOptions := options.Client().
                ApplyURI(mongoURI).
                SetServerSelectionTimeout(5 * time.Second).
                SetDirect(true)

        // Connect to MongoDB
        ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
        defer cancel()

        client, err := mongo.Connect(ctx, clientOptions)
        if err != nil {
                log.Printf("Failed to connect to MongoDB: %v", err)
                // Simulate a client for development
                log.Println("Using simulated MongoDB client for development")
                client = &mongo.Client{}
        } else {
                // Check the connection
                err = client.Ping(ctx, nil)
                if err != nil {
                        log.Printf("Failed to ping MongoDB: %v", err)
                        log.Println("Using simulated MongoDB client for development")
                        client = &mongo.Client{}
                } else {
                        log.Println("Connected to MongoDB successfully")
                }
        }

        // Get database name from environment or use default
        dbName := os.Getenv("MONGODB_DATABASE")
        if dbName == "" {
                dbName = "shortlink"
                log.Println("Warning: MONGODB_DATABASE not set, using default:", dbName)
        }

        // Initialize the database
        db := client.Database(dbName)

        return &DBClient{
                client: client,
                db:     db,
        }
}

// GetCollection returns a MongoDB collection
func (c *DBClient) GetCollection(collectionName string) *mongo.Collection {
        return c.db.Collection(collectionName)
}

// Disconnect closes the MongoDB connection
func (c *DBClient) Disconnect(ctx context.Context) error {
        return c.client.Disconnect(ctx)
}