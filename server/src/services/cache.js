import { existsSync, readFileSync, writeFileSync, mkdirSync, unlinkSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// In-memory cache for fast access
const memoryCache = new Map();

// Cache directory for persistence
const CACHE_DIR = join(__dirname, '..', '..', 'cache');

// Maximum cache size in bytes (50MB for disk, lighter for memory)
const MAX_CACHE_SIZE_BYTES = 50 * 1024 * 1024;
const MAX_MEMORY_COMMITS = 100000; // Limit commits in memory to prevent OOM

// Ensure cache directory exists
if (!existsSync(CACHE_DIR)) {
  mkdirSync(CACHE_DIR, { recursive: true });
}

/**
 * Estimate size of an object in bytes
 */
function estimateSize(obj) {
  try {
    return JSON.stringify(obj).length;
  } catch {
    return 0;
  }
}

/**
 * Trim large data to prevent memory issues
 */
function trimLargeData(data) {
  if (!data) return data;
  
  // If data has commits array that's too large, trim it
  if (data.commits && Array.isArray(data.commits) && data.commits.length > MAX_MEMORY_COMMITS) {
    console.log(`⚠️ Trimming commits from ${data.commits.length} to ${MAX_MEMORY_COMMITS} for memory cache`);
    return {
      ...data,
      commits: data.commits.slice(0, MAX_MEMORY_COMMITS),
      _trimmed: true,
      _originalCommitCount: data.commits.length
    };
  }
  
  // If repositories have large commit arrays, trim them too
  if (data.repositories && Array.isArray(data.repositories)) {
    const totalCommits = data.repositories.reduce((sum, r) => sum + (r.commits?.length || 0), 0);
    if (totalCommits > MAX_MEMORY_COMMITS) {
      console.log(`⚠️ Trimming repository commits from ${totalCommits} total for memory cache`);
      const maxPerRepo = Math.floor(MAX_MEMORY_COMMITS / data.repositories.length);
      return {
        ...data,
        repositories: data.repositories.map(r => ({
          ...r,
          commits: r.commits?.slice(0, maxPerRepo) || []
        })),
        _trimmed: true
      };
    }
  }
  
  return data;
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
      // Only store trimmed version in memory
      memoryCache.set(key, trimLargeData(data));
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
  const size = estimateSize(value);
  
  // Check if data is too large for disk
  if (size > MAX_CACHE_SIZE_BYTES) {
    console.warn(`⚠️ Cache data for '${key}' is ${(size / 1024 / 1024).toFixed(2)}MB - storing trimmed version only`);
    // Store trimmed version in memory only (no disk to prevent huge files)
    memoryCache.set(key, trimLargeData(value));
    return;
  }
  
  // Store trimmed version in memory to prevent OOM
  memoryCache.set(key, trimLargeData(value));

  // Persist full version to disk
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

/**
 * Get cache memory usage info
 */
export function getCacheInfo() {
  let totalSize = 0;
  const keys = [];
  
  for (const [key, value] of memoryCache.entries()) {
    const size = estimateSize(value);
    totalSize += size;
    keys.push({ key, sizeMB: (size / 1024 / 1024).toFixed(2) });
  }
  
  return {
    keys,
    totalSizeMB: (totalSize / 1024 / 1024).toFixed(2),
    maxSizeMB: (MAX_CACHE_SIZE_BYTES / 1024 / 1024).toFixed(2)
  };
}
