import express from 'express';
import { scanRepositories, discoverRepositories } from '../services/gitParser.js';
import { getCache, setCache } from '../services/cache.js';

const router = express.Router();

// GET /api/scan/discover - Quickly discover repos without parsing
router.get('/discover', async (req, res) => {
  try {
    const { path } = req.query;
    
    if (!path) {
      return res.status(400).json({ error: 'Path is required' });
    }

    console.log(`🔍 Discovering repositories in: ${path}`);
    const repos = discoverRepositories(path);
    
    res.json({
      success: true,
      repos
    });
  } catch (error) {
    console.error('Discovery error:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/scan - Scan selected repositories
router.post('/', async (req, res) => {
  try {
    const { path, paths, year, startDate, endDate } = req.body;
    
    // Support both single path and array of paths
    const scanTarget = paths && paths.length > 0 ? paths : path;
    
    if (!scanTarget || (Array.isArray(scanTarget) && scanTarget.length === 0)) {
      return res.status(400).json({ error: 'Path or paths array is required' });
    }

    // Calculate date range (null for "All Time")
    let dateRange = null;
    if (year && year !== 'all') {
      dateRange = {
        start: startDate || `${year}-01-01`,
        end: endDate || `${year}-12-31`
      };
    } else if (startDate || endDate) {
      dateRange = {
        start: startDate || null,
        end: endDate || null
      };
    }
    // If year is 'all' or not provided and no dates, dateRange stays null (All Time)

    const result = await scanRepositories(scanTarget, dateRange);
    
    // Cache the results
    setCache('lastScan', {
      path: Array.isArray(scanTarget) ? scanTarget[0] : scanTarget,
      paths: Array.isArray(scanTarget) ? scanTarget : [scanTarget],
      dateRange,
      year: year || 'all',
      timestamp: new Date().toISOString(),
      ...result
    });

    res.json({
      success: true,
      repositoriesFound: result.repositories.length,
      totalCommits: result.totalCommits,
      authors: result.authors,
      repositories: result.repositories.map(r => ({
        name: r.name,
        path: r.path,
        commitCount: r.commitCount
      }))
    });
  } catch (error) {
    console.error('Scan error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/scan/status - Get last scan status
router.get('/status', (req, res) => {
  const lastScan = getCache('lastScan');
  if (lastScan) {
    res.json({
      hasData: true,
      path: lastScan.path,
      dateRange: lastScan.dateRange,
      timestamp: lastScan.timestamp,
      repositoriesCount: lastScan.repositories?.length || 0,
      totalCommits: lastScan.totalCommits || 0
    });
  } else {
    res.json({ hasData: false });
  }
});

export default router;
