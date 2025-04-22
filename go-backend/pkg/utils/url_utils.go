package utils

import (
	"crypto/rand"
	"log"
	"math/big"
	"net/url"
	"regexp"
	"strings"
)

// Constants for slug generation
const (
	alphanumeric = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	slugRegex    = "^[a-zA-Z0-9-_]+$"
)

// IsValidURL checks if the provided string is a valid URL
func IsValidURL(str string) bool {
	// Parse the URL
	u, err := url.Parse(str)
	if err != nil {
		return false
	}
	
	// Check for scheme and host
	return u.Scheme != "" && u.Host != ""
}

// IsValidSlug checks if the provided slug is valid
func IsValidSlug(slug string) bool {
	matched, err := regexp.MatchString(slugRegex, slug)
	if err != nil {
		return false
	}
	return matched
}

// GenerateSlug creates a random alphanumeric string of the specified length
func GenerateSlug(length int) string {
	// Create a byte slice to hold the result
	result := make([]byte, length)
	
	// The maximum number we want to generate
	max := big.NewInt(int64(len(alphanumeric)))
	
	for i := 0; i < length; i++ {
		// Generate a random number in the range of our alphanumeric string
		n, err := rand.Int(rand.Reader, max)
		if err != nil {
			log.Printf("Error generating random number: %v", err)
			// Fallback to a simpler method if crypto/rand fails
			result[i] = alphanumeric[i%len(alphanumeric)]
			continue
		}
		
		// Use the random number to select a character from our alphanumeric string
		result[i] = alphanumeric[n.Int64()]
	}
	
	return string(result)
}

// DetectDevice determines the device type from the user agent string
func DetectDevice(userAgent string) string {
	ua := strings.ToLower(userAgent)
	
	// Check for mobile devices
	if strings.Contains(ua, "mobile") || 
	   strings.Contains(ua, "android") || 
	   strings.Contains(ua, "iphone") || 
	   strings.Contains(ua, "ipod") {
		return "mobile"
	}
	
	// Check for tablets
	if strings.Contains(ua, "ipad") || 
	   strings.Contains(ua, "tablet") {
		return "tablet"
	}
	
	// Default to desktop
	return "desktop"
}

// LogError logs an error with a custom message
func LogError(message string, err error) {
	log.Printf("%s: %v", message, err)
}