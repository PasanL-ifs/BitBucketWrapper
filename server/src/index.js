import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import scanRoutes from './routes/scan.js';
import statsRoutes from './routes/stats.js';
import authorsRoutes from './routes/authors.js';
import reposRoutes from './routes/repos.js';
import configRoutes from './routes/config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/scan', scanRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/authors', authorsRoutes);
app.use('/api/repos', reposRoutes);
app.use('/api/config', configRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Git Wrapped server running on http://localhost:${PORT}`);
});
