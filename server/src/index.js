import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import scanRoutes from './routes/scan.js';
import statsRoutes from './routes/stats.js';
import authorsRoutes from './routes/authors.js';
import reposRoutes from './routes/repos.js';
import configRoutes from './routes/config.js';
import { clearAllCache, getCacheInfo } from './services/cache.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Clear cache on startup to prevent stale data issues
clearAllCache();
console.log('🧹 Memory cache cleared on startup');

// Middleware
app.use(cors());
app.use(express.json({ limit: '100mb' })); // Increased limit for large scans

// Routes
app.use('/api/scan', scanRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/authors', authorsRoutes);
app.use('/api/repos', reposRoutes);
app.use('/api/config', configRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    cache: getCacheInfo()
  });
});

// Global error handler for JSON parsing issues
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'Invalid JSON in request body' });
  }
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🚀 Git Wrapped server running on http://localhost:${PORT}`);
});
