import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertShortUrlSchema, insertClickEventSchema } from "@shared/schema";
import { nanoid } from "nanoid";

export async function registerRoutes(app: Express): Promise<Server> {
  // put application routes here
  // prefix all routes with /api
  const api = express.Router();

  // Get all shortened URLs
  api.get("/urls", async (req, res) => {
    try {
      const urls = await storage.getAllShortUrls();
      res.json(urls);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch URLs" });
    }
  });

  // Create new shortened URL
  api.post("/urls", async (req, res) => {
    try {
      const result = insertShortUrlSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          error: "Invalid URL data", 
          details: result.error.format() 
        });
      }

      const { originalUrl, slug, expiresAt } = result.data;
      
      // Generate a random slug if not provided
      const finalSlug = slug || nanoid(8);
      
      // Check if slug already exists
      const existingUrl = await storage.getShortUrlBySlug(finalSlug);
      if (existingUrl) {
        return res.status(409).json({ error: "Slug already in use" });
      }

      // Create the short URL
      const shortUrl = await storage.createShortUrl({
        originalUrl,
        slug: finalSlug,
        expiresAt
      });

      res.status(201).json(shortUrl);
    } catch (error) {
      console.error("Error creating shortened URL:", error);
      res.status(500).json({ error: "Failed to create shortened URL" });
    }
  });

  // Get URL by slug
  api.get("/urls/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      const url = await storage.getShortUrlBySlug(slug);

      if (!url) {
        return res.status(404).json({ error: "URL not found" });
      }

      res.json(url);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch URL" });
    }
  });

  // Delete a shortened URL
  api.delete("/urls/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid ID" });
      }

      const url = await storage.getShortUrl(id);
      if (!url) {
        return res.status(404).json({ error: "URL not found" });
      }

      const success = await storage.deleteShortUrl(id);
      if (success) {
        res.status(204).send();
      } else {
        res.status(500).json({ error: "Failed to delete URL" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to delete URL" });
    }
  });

  // Record a click event and redirect
  api.get("/r/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      const url = await storage.getShortUrlBySlug(slug);

      if (!url) {
        return res.status(404).json({ error: "URL not found" });
      }

      if (!url.active) {
        return res.status(410).json({ error: "This link is no longer active" });
      }

      if (url.expiresAt && new Date(url.expiresAt) < new Date()) {
        return res.status(410).json({ error: "This link has expired" });
      }

      // Update click count
      await storage.updateShortUrlClicks(url.id);

      // Record analytics
      const userAgent = req.headers["user-agent"] || "";
      const referrer = req.headers.referer || "";
      
      // Simple device detection
      let device = "desktop";
      if (userAgent.toLowerCase().match(/mobile|android|iphone|ipad|ipod/i)) {
        device = userAgent.toLowerCase().match(/ipad/i) ? "tablet" : "mobile";
      }

      await storage.createClickEvent({
        shortUrlId: url.id,
        referrer,
        userAgent,
        device
      });

      // Redirect to the original URL
      res.redirect(url.originalUrl);
    } catch (error) {
      res.status(500).json({ error: "Failed to process redirect" });
    }
  });

  // Get analytics for all URLs
  api.get("/analytics", async (req, res) => {
    try {
      const stats = await storage.getClickStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch analytics" });
    }
  });

  // Get analytics for a specific URL
  api.get("/analytics/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid ID" });
      }

      const url = await storage.getShortUrl(id);
      if (!url) {
        return res.status(404).json({ error: "URL not found" });
      }

      const clickEvents = await storage.getClickEventsByShortUrlId(id);
      res.json({ url, clickEvents });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch URL analytics" });
    }
  });

  app.use("/api", api);

  const httpServer = createServer(app);

  return httpServer;
}
