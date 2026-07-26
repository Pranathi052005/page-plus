import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { auditPage } from './src/controllers/auditController.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration - Allow all in development or restrict if needed
app.use(cors());
app.use(express.json());

// Main diagnostic endpoint
app.post('/api/audit', auditPage);

// Simple health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Page Pulse server is operational.' });
});

// Fallback for page not found
app.use((req, res) => {
  res.status(404).json({ success: false, errorMessage: 'API endpoint not found.' });
});

// Start listening
app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`  PAGE PULSE DIAGNOSTICS BACKEND RUNNING  `);
  console.log(`  Port: http://localhost:${PORT}              `);
  console.log(`===============================================`);
});
