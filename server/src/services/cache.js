import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// In-memory cache for fast access
const memoryCache = new Map();

// Cache directory for persistence
const CACHE_DIR = join(__dirname, '..', '..', 'cache');

// Ensure cache directory exists
if (!existsSync(CACHE_DIR)) {
  mkdirSync(CACHE_DIR, { recursive: true });
}

/**
 * Get a value from cache (memory first, then disk)
 */
export function getCache(key) {
  // Check memory cache first
  if (memoryCache.has(key)) {
    return memoryCache.get(key);
  }

  // Try to load from disk
  const filePath = join(CACHE_DIR, `${key}.json`);
  if (existsSync(filePath)) {
    try {
      const data = JSON.parse(readFileSync(filePath, 'utf-8'));
      memoryCache.set(key, data);
      return data;
    } catch (error) {
      console.error(`Failed to read cache file ${key}:`, error);
    }
  }

  return null;
}

/**
 * Set a value in cache (both memory and disk)
 */
export function setCache(key, value) {
  // Store in memory
  memoryCache.set(key, value);

  // Persist to disk
  const filePath = join(CACHE_DIR, `${key}.json`);
  try {
    writeFileSync(filePath, JSON.stringify(value, null, 2));
  } catch (error) {
    console.error(`Failed to write cache file ${key}:`, error);
  }
}

/**
 * Clear a specific cache key
 */
export function clearCache(key) {
  memoryCache.delete(key);
  
  const filePath = join(CACHE_DIR, `${key}.json`);
  if (existsSync(filePath)) {
    try {
      unlinkSync(filePath);
    } catch (error) {
      console.error(`Failed to delete cache file ${key}:`, error);
    }
  }
}

/**
 * Clear all cache
 */
export function clearAllCache() {
  memoryCache.clear();
}
