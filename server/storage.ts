import { 
  users, type User, type InsertUser, 
  shortUrls, type ShortUrl, type InsertShortUrl,
  clickEvents, type ClickEvent, type InsertClickEvent
} from "@shared/schema";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // ShortURL methods
  getShortUrl(id: number): Promise<ShortUrl | undefined>;
  getShortUrlBySlug(slug: string): Promise<ShortUrl | undefined>;
  createShortUrl(shortUrl: InsertShortUrl): Promise<ShortUrl>;
  getAllShortUrls(): Promise<ShortUrl[]>;
  updateShortUrlClicks(id: number): Promise<ShortUrl | undefined>;
  deleteShortUrl(id: number): Promise<boolean>;
  
  // ClickEvent methods
  createClickEvent(clickEvent: InsertClickEvent): Promise<ClickEvent>;
  getClickEventsByShortUrlId(shortUrlId: number): Promise<ClickEvent[]>;
  getClickStats(): Promise<{
    totalClicks: number;
    totalLinks: number;
    activeLinks: number;
    deviceStats: { mobile: number; desktop: number; tablet: number; };
    referrerStats: { [key: string]: number };
  }>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private shortUrls: Map<number, ShortUrl>;
  private shortUrlsBySlug: Map<string, number>;
  private clickEvents: Map<number, ClickEvent>;
  currentUserId: number;
  currentShortUrlId: number;
  currentClickEventId: number;

  constructor() {
    this.users = new Map();
    this.shortUrls = new Map();
    this.shortUrlsBySlug = new Map();
    this.clickEvents = new Map();
    this.currentUserId = 1;
    this.currentShortUrlId = 1;
    this.currentClickEventId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // ShortURL methods
  async getShortUrl(id: number): Promise<ShortUrl | undefined> {
    return this.shortUrls.get(id);
  }

  async getShortUrlBySlug(slug: string): Promise<ShortUrl | undefined> {
    const id = this.shortUrlsBySlug.get(slug);
    if (id === undefined) return undefined;
    return this.shortUrls.get(id);
  }

  async createShortUrl(insertShortUrl: InsertShortUrl): Promise<ShortUrl> {
    const id = this.currentShortUrlId++;
    
    // Convert string date to Date object if provided
    let expiresAt: Date | null = null;
    if (insertShortUrl.expiresAt) {
      expiresAt = new Date(insertShortUrl.expiresAt);
    }
    
    const shortUrl: ShortUrl = {
      id,
      originalUrl: insertShortUrl.originalUrl,
      slug: insertShortUrl.slug,
      clicks: 0,
      active: true,
      createdAt: new Date(),
      expiresAt
    };
    
    this.shortUrls.set(id, shortUrl);
    this.shortUrlsBySlug.set(shortUrl.slug, id);
    return shortUrl;
  }

  async getAllShortUrls(): Promise<ShortUrl[]> {
    return Array.from(this.shortUrls.values()).sort((a, b) => 
      // Sort by newest first
      b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  async updateShortUrlClicks(id: number): Promise<ShortUrl | undefined> {
    const shortUrl = this.shortUrls.get(id);
    if (!shortUrl) return undefined;
    
    const updatedShortUrl = {
      ...shortUrl,
      clicks: shortUrl.clicks + 1,
    };
    
    this.shortUrls.set(id, updatedShortUrl);
    return updatedShortUrl;
  }

  async deleteShortUrl(id: number): Promise<boolean> {
    const shortUrl = this.shortUrls.get(id);
    if (!shortUrl) return false;
    
    this.shortUrlsBySlug.delete(shortUrl.slug);
    return this.shortUrls.delete(id);
  }

  // ClickEvent methods
  async createClickEvent(insertClickEvent: InsertClickEvent): Promise<ClickEvent> {
    const id = this.currentClickEventId++;
    const clickEvent: ClickEvent = {
      ...insertClickEvent,
      id,
      timestamp: new Date(),
    };
    
    this.clickEvents.set(id, clickEvent);
    return clickEvent;
  }

  async getClickEventsByShortUrlId(shortUrlId: number): Promise<ClickEvent[]> {
    return Array.from(this.clickEvents.values())
      .filter(event => event.shortUrlId === shortUrlId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async getClickStats(): Promise<{
    totalClicks: number;
    totalLinks: number;
    activeLinks: number;
    deviceStats: { mobile: number; desktop: number; tablet: number; };
    referrerStats: { [key: string]: number };
  }> {
    const shortUrlsArray = Array.from(this.shortUrls.values());
    const clickEventsArray = Array.from(this.clickEvents.values());
    
    // Calculate total clicks from all short URLs
    const totalClicks = shortUrlsArray.reduce((sum, url) => sum + url.clicks, 0);
    
    // Count total and active links
    const totalLinks = shortUrlsArray.length;
    const activeLinks = shortUrlsArray.filter(url => url.active).length;
    
    // Calculate device stats
    const deviceStats = {
      mobile: 0,
      desktop: 0,
      tablet: 0
    };
    
    // Calculate referrer stats
    const referrerStats: { [key: string]: number } = {};
    
    clickEventsArray.forEach(event => {
      // Count devices
      if (event.device) {
        deviceStats[event.device as keyof typeof deviceStats] = 
          (deviceStats[event.device as keyof typeof deviceStats] || 0) + 1;
      }
      
      // Count referrers
      if (event.referrer) {
        const referrer = event.referrer.toLowerCase();
        
        // Extract domain from URL
        let domain = referrer;
        try {
          if (referrer.startsWith('http')) {
            domain = new URL(referrer).hostname;
          }
          
          // Group common social media domains
          if (domain.includes('facebook')) domain = 'facebook';
          else if (domain.includes('twitter') || domain.includes('x.com')) domain = 'twitter';
          else if (domain.includes('instagram')) domain = 'instagram';
          else if (domain.includes('linkedin')) domain = 'linkedin';
          else if (domain === '' || domain === 'direct') domain = 'direct';
          else domain = 'other';
          
          referrerStats[domain] = (referrerStats[domain] || 0) + 1;
        } catch (e) {
          referrerStats['other'] = (referrerStats['other'] || 0) + 1;
        }
      } else {
        referrerStats['direct'] = (referrerStats['direct'] || 0) + 1;
      }
    });
    
    return {
      totalClicks,
      totalLinks,
      activeLinks,
      deviceStats,
      referrerStats
    };
  }
}

export const storage = new MemStorage();
