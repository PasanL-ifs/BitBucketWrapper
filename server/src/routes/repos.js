import express from 'express';
import { getCache } from '../services/cache.js';

const router = express.Router();

// GET /api/repos - Get all scanned repositories
router.get('/', (req, res) => {
  try {
    const lastScan = getCache('lastScan');
    
    if (!lastScan || !lastScan.repositories) {
      return res.json({ repositories: [] });
    }

    const repos = lastScan.repositories.map(repo => ({
      name: repo.name,
      path: repo.path,
      commitCount: repo.commitCount,
      authors: repo.authors || [],
      languages: repo.languages || {}
    }));

    res.json({ repositories: repos });
  } catch (error) {
    console.error('Repos error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/repos/:name - Get specific repository details
router.get('/:name', (req, res) => {
  try {
    const { name } = req.params;
    const lastScan = getCache('lastScan');
    
    if (!lastScan || !lastScan.repositories) {
      return res.status(404).json({ error: 'No repositories found' });
    }

    const repo = lastScan.repositories.find(r => r.name === name);
    
    if (!repo) {
      return res.status(404).json({ error: 'Repository not found' });
    }

    res.json(repo);
  } catch (error) {
    console.error('Repo error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
