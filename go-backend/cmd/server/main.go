package main

import (
        "context"
        "log"
        "net/http"
        "os"
        "os/signal"
        "shortlink/internal/database"
        "shortlink/internal/handlers"
        "syscall"
        "time"

        "github.com/gorilla/mux"
        "github.com/joho/godotenv"
        "github.com/rs/cors"
)

func main() {
        // Load environment variables from .env file if it exists
        if err := godotenv.Load(); err != nil {
                log.Println("No .env file found, using environment variables")
        }

        // Get port from environment variable or use default
        port := os.Getenv("PORT")
        if port == "" {
                port = "5000"
        }

        // Create a new MongoDB client
        db := database.NewDBClient()

        // Create repositories and handlers
        repo := database.NewRepository(db)
        urlHandler := handlers.NewURLHandler(repo)

        // Create a new router
        router := mux.NewRouter()

        // Set up API routes
        apiRouter := router.PathPrefix("/api").Subrouter()
        
        // URL routes
        apiRouter.HandleFunc("/urls", urlHandler.CreateShortURL).Methods(http.MethodPost)
        apiRouter.HandleFunc("/urls", urlHandler.GetAllShortURLs).Methods(http.MethodGet)
        apiRouter.HandleFunc("/urls/{id}", urlHandler.GetShortURL).Methods(http.MethodGet)
        apiRouter.HandleFunc("/urls/{id}", urlHandler.DeleteShortURL).Methods(http.MethodDelete)
        
        // Redirect route
        apiRouter.HandleFunc("/r/{slug}", urlHandler.RedirectShortURL).Methods(http.MethodGet)
        
        // Analytics route
        apiRouter.HandleFunc("/analytics", urlHandler.GetAnalytics).Methods(http.MethodGet)

        // Configure CORS
        corsMiddleware := cors.New(cors.Options{
                AllowedOrigins:   []string{"*"}, // Allow all origins in development
                AllowedMethods:   []string{http.MethodGet, http.MethodPost, http.MethodPut, http.MethodDelete, http.MethodOptions},
                AllowedHeaders:   []string{"Content-Type", "Authorization"},
                AllowCredentials: true,
                MaxAge:           300, // Maximum value not ignored by any of major browsers
        })

        // Create HTTP server
        srv := &http.Server{
                Addr:         "0.0.0.0:" + port,
                WriteTimeout: time.Second * 15,
                ReadTimeout:  time.Second * 15,
                IdleTimeout:  time.Second * 60,
                Handler:      corsMiddleware.Handler(router),
        }

        // Start the server in a goroutine
        go func() {
                log.Printf("Starting server on port %s", port)
                if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
                        log.Fatalf("Error starting server: %v", err)
                }
        }()

        // Wait for interrupt signal to gracefully shut down the server
        quit := make(chan os.Signal, 1)
        signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
        <-quit
        log.Println("Shutting down server...")

        // Create a deadline to wait for
        ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
        defer cancel()

        // Disconnect from MongoDB
        if err := db.Disconnect(ctx); err != nil {
                log.Fatalf("Error disconnecting from MongoDB: %v", err)
        }

        // Shutdown the server
        if err := srv.Shutdown(ctx); err != nil {
                log.Fatalf("Server forced to shutdown: %v", err)
        }

        log.Println("Server gracefully stopped")
}