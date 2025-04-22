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

	// Set client options
	clientOptions := options.Client().ApplyURI(mongoURI)

	// Connect to MongoDB
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	client, err := mongo.Connect(ctx, clientOptions)
	if err != nil {
		log.Fatal("Failed to connect to MongoDB:", err)
	}

	// Check the connection
	err = client.Ping(ctx, nil)
	if err != nil {
		log.Fatal("Failed to ping MongoDB:", err)
	}

	log.Println("Connected to MongoDB successfully")

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