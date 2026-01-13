import express from 'express';
import { getCache } from '../services/cache.js';
import { getAuthorMapping, resolveAuthor } from '../services/authorMapper.js';

const router = express.Router();

// GET /api/authors - Get all discovered authors
router.get('/', (req, res) => {
  try {
    const lastScan = getCache('lastScan');
    
    if (!lastScan || !lastScan.authors) {
      return res.json({ authors: [] });
    }

    const authorMapping = getAuthorMapping();
    
    // Enrich authors with mapping info
    const enrichedAuthors = lastScan.authors.map(author => {
      const resolved = resolveAuthor(author.email);
      return {
        ...author,
        displayName: resolved.name || author.name,
        color: resolved.color || null,
        isMapped: !!resolved.name
      };
    });

    res.json({ authors: enrichedAuthors });
  } catch (error) {
    console.error('Authors error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
