import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { auditPage } from './src/controllers/auditController.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration - Allow all in development or restrict if needed
app.use(cors());
app.use(express.json());

// Main diagnostic endpoint
app.post('/api/audit', auditPage);

// Serve static assets from Vite client distribution build
const distPath = path.resolve(__dirname, '../client/dist');
app.use(express.static(distPath));

// Simple health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Page Pulse server is operational.' });
});

// Wildcard fallback for SPA client-side routing
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return next();
  }
  const indexFile = path.join(distPath, 'index.html');
  if (fs.existsSync(indexFile)) {
    res.sendFile(indexFile);
  } else {
    res.status(404).json({ success: false, errorMessage: 'API endpoint not found (Client build missing).' });
  }
});

// Start listening
app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`  PAGE PULSE DIAGNOSTICS BACKEND RUNNING  `);
  console.log(`  Port: http://localhost:${PORT}              `);
  console.log(`===============================================`);
});
