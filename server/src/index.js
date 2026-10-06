import express from 'express';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { openDb } from './db.js';
import { createApp } from './app.js';

const PORT = Number(process.env.PORT) || 3001;
const dbFile = process.env.DB_FILE || fileURLToPath(new URL('../data/sumire.db', import.meta.url));
const app = createApp(openDb(dbFile));

// `npm start` serves the built client from the same port.
const dist = fileURLToPath(new URL('../../client/dist', import.meta.url));
if (existsSync(dist)) {
  app.use(express.static(dist));
  app.get('/{*splat}', (_req, res) => res.sendFile('index.html', { root: dist }));
}

app.listen(PORT, () => console.log(`Sumire's gym is open on http://localhost:${PORT}`));
