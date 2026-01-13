import express from 'express';
import { calculateDeveloperStats, calculateTeamStats } from '../services/statsEngine.js';
import { getCache } from '../services/cache.js';

const router = express.Router();

// GET /api/stats/:email - Get individual developer stats
router.get('/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const lastScan = getCache('lastScan');
    
    if (!lastScan) {
      return res.status(400).json({ error: 'No scan data available. Please scan repositories first.' });
    }

    const stats = calculateDeveloperStats(email, lastScan);
    
    if (!stats) {
      return res.status(404).json({ error: 'No commits found for this author' });
    }

    res.json(stats);
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/stats/team/overview - Get team stats
router.get('/team/overview', async (req, res) => {
  try {
    const lastScan = getCache('lastScan');
    
    if (!lastScan) {
      return res.status(400).json({ error: 'No scan data available. Please scan repositories first.' });
    }

    const stats = calculateTeamStats(lastScan);
    res.json(stats);
  } catch (error) {
    console.error('Team stats error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
