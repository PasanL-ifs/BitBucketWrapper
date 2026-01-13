import express from 'express';
import { getAuthorMapping, saveAuthorMapping } from '../services/authorMapper.js';

const router = express.Router();

// GET /api/config/authors - Get author mapping configuration
router.get('/authors', (req, res) => {
  try {
    const mapping = getAuthorMapping();
    res.json(mapping);
  } catch (error) {
    console.error('Config error:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/config/authors - Update author mapping configuration
router.post('/authors', async (req, res) => {
  try {
    const { mapping } = req.body;
    
    if (!mapping || typeof mapping !== 'object') {
      return res.status(400).json({ error: 'Invalid mapping format' });
    }

    await saveAuthorMapping(mapping);
    res.json({ success: true, message: 'Author mapping updated' });
  } catch (error) {
    console.error('Config save error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
