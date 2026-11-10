import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Body parser with 50mb limit for high-res design uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Directories
const DATA_DIR = path.join(__dirname, 'data');
const UPLOADS_DIR = path.join(__dirname, 'uploads');
const ARTWORKS_FILE = path.join(DATA_DIR, 'artworks.json');
const ADMIN_CONFIG_FILE = path.join(DATA_DIR, 'admin-config.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}
if (!fs.existsSync(ARTWORKS_FILE)) {
  fs.writeFileSync(ARTWORKS_FILE, JSON.stringify([], null, 2), 'utf-8');
}

// Serve uploaded artwork images statically with permanent caching headers
app.use(
  '/uploads',
  express.static(UPLOADS_DIR, {
    maxAge: '7d',
    etag: true,
  })
);

// Admin Authentication Setup
// Password hash helper using SHA-256 with studio salt
const STUDIO_SALT = process.env.STUDIO_SALT || 'shahmeer_studio_private_salt_2026';
function hashPassword(pwd: string): string {
  return crypto.createHash('sha256').update(pwd + STUDIO_SALT).digest('hex');
}

// Get or initialize admin password hash
interface AdminConfig {
  passwordHash: string;
  updatedAt: number;
}

function getAdminConfig(): AdminConfig {
  if (fs.existsSync(ADMIN_CONFIG_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(ADMIN_CONFIG_FILE, 'utf-8'));
    } catch (e) {
      console.error('Error reading admin config:', e);
    }
  }

  // Initial config - if env var exists use it, otherwise default
  const initialPassword = process.env.ADMIN_PASSWORD || 'centerofexcellence';
  const initialConfig: AdminConfig = {
    passwordHash: hashPassword(initialPassword),
    updatedAt: Date.now(),
  };
  fs.writeFileSync(ADMIN_CONFIG_FILE, JSON.stringify(initialConfig, null, 2), 'utf-8');
  return initialConfig;
}

function updateAdminPassword(newPassword: string): void {
  const newConfig: AdminConfig = {
    passwordHash: hashPassword(newPassword),
    updatedAt: Date.now(),
  };
  fs.writeFileSync(ADMIN_CONFIG_FILE, JSON.stringify(newConfig, null, 2), 'utf-8');
}

// Active session token store (token -> expiresAt timestamp)
const activeSessions = new Map<string, number>();

// Clean expired sessions periodically
setInterval(() => {
  const now = Date.now();
  for (const [token, expiresAt] of activeSessions.entries()) {
    if (expiresAt < now) {
      activeSessions.delete(token);
    }
  }
}, 60 * 60 * 1000);

// Admin Auth Middleware
function verifyAdminToken(req: Request): boolean {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ')
    ? authHeader.slice(7).trim()
    : (req.headers['x-admin-token'] as string);

  if (!token) return false;
  const expiresAt = activeSessions.get(token);
  if (!expiresAt) return false;
  if (expiresAt < Date.now()) {
    activeSessions.delete(token);
    return false;
  }
  return true;
}

function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!verifyAdminToken(req)) {
    res.status(401).json({ error: 'Unauthorized: Admin authentication required' });
    return;
  }
  next();
}

// Data Helpers
interface ArtworkRecord {
  id: string;
  title: string;
  description: string;
  category: string;
  imageUrl: string;
  uploadDate: string;
  published: boolean;
  createdAt: number;
  updatedAt: number;
}

function getArtworks(): ArtworkRecord[] {
  try {
    const raw = fs.readFileSync(ARTWORKS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading artworks file:', err);
    return [];
  }
}

function saveArtworks(artworks: ArtworkRecord[]) {
  fs.writeFileSync(ARTWORKS_FILE, JSON.stringify(artworks, null, 2), 'utf-8');
  notifyClientsOfUpdate();
}

// Real-time synchronization: Server-Sent Events (SSE) for connected public & admin clients
type ClientResponse = Response;
const sseClients: Set<ClientResponse> = new Set();

function notifyClientsOfUpdate() {
  const publishedOnly = getArtworks().filter((item) => item.published);
  const data = JSON.stringify(publishedOnly);
  for (const client of sseClients) {
    try {
      client.write(`data: ${data}\n\n`);
    } catch {
      sseClients.delete(client);
    }
  }
}

// ======================== API ROUTES ======================== //

// 1. Admin Login (Secure - never exposes credentials)
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { password } = req.body;

  if (!password || typeof password !== 'string') {
    res.status(400).json({ success: false, error: 'Password is required' });
    return;
  }

  const adminConfig = getAdminConfig();
  const incomingHash = hashPassword(password);

  if (incomingHash !== adminConfig.passwordHash) {
    // Constant-time like delay to prevent brute-force timing
    setTimeout(() => {
      res.status(401).json({ success: false, error: 'Invalid admin credentials' });
    }, 450);
    return;
  }

  // Generate cryptographically secure session token
  const token = crypto.randomBytes(32).toString('hex');
  const sessionDurationMs = 24 * 60 * 60 * 1000; // 24 hours
  const expiresAt = Date.now() + sessionDurationMs;

  activeSessions.set(token, expiresAt);

  res.json({
    success: true,
    token,
    expiresAt,
    message: 'Authenticated successfully',
  });
});

// 2. Change Admin Password (Owner only - requires valid session token)
app.post('/api/auth/change-password', requireAdmin, (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body;

  if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 6) {
    res.status(400).json({
      success: false,
      error: 'New password must be at least 6 characters long',
    });
    return;
  }

  const adminConfig = getAdminConfig();
  if (currentPassword) {
    const checkHash = hashPassword(currentPassword);
    if (checkHash !== adminConfig.passwordHash) {
      res.status(401).json({ success: false, error: 'Current password incorrect' });
      return;
    }
  }

  updateAdminPassword(newPassword);

  res.json({
    success: true,
    message: 'Admin security password updated successfully. Please store it safely.',
  });
});

// 3. Admin Logout
app.post('/api/auth/logout', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ')
    ? authHeader.slice(7).trim()
    : (req.headers['x-admin-token'] as string);

  if (token) {
    activeSessions.delete(token);
  }
  res.json({ success: true, message: 'Logged out successfully' });
});

// 4. Admin Verify Session
app.get('/api/auth/verify', (req: Request, res: Response) => {
  const isValid = verifyAdminToken(req);
  res.json({ authenticated: isValid });
});

// 5. Get Artworks (Public sees published only; Admin sees all)
app.get('/api/artworks', (req: Request, res: Response) => {
  const isAdmin = verifyAdminToken(req);
  const artworks = getArtworks();

  if (isAdmin) {
    res.json(artworks);
  } else {
    // Only published artworks returned to public visitors
    const publishedOnly = artworks.filter((item) => item.published);
    res.json(publishedOnly);
  }
});

// 6. Real-time Live SSE Stream for Public Gallery
app.get('/api/artworks/stream', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  // Send initial data immediately
  const publishedOnly = getArtworks().filter((item) => item.published);
  res.write(`data: ${JSON.stringify(publishedOnly)}\n\n`);

  sseClients.add(res);

  req.on('close', () => {
    sseClients.delete(res);
  });
});

// 7. Create Artwork (Admin Only - Validated & Permanent)
app.post('/api/artworks', requireAdmin, (req: Request, res: Response) => {
  const { title, description, category, imageUrl, published } = req.body;

  if (!title || !category || !imageUrl) {
    res.status(400).json({ error: 'Title, category, and imageUrl are required' });
    return;
  }

  const artworks = getArtworks();
  const now = new Date();

  const newArtwork: ArtworkRecord = {
    id: 'art_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8),
    title: String(title).trim(),
    description: String(description || '').trim(),
    category: String(category).trim(),
    imageUrl: String(imageUrl).trim(),
    uploadDate: now.toISOString(),
    published: Boolean(published),
    createdAt: now.getTime(),
    updatedAt: now.getTime(),
  };

  artworks.unshift(newArtwork);
  saveArtworks(artworks);

  res.status(201).json(newArtwork);
});

// 8. Update Artwork (Admin Only)
app.put('/api/artworks/:id', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, description, category, imageUrl, published } = req.body;

  const artworks = getArtworks();
  const index = artworks.findIndex((item) => item.id === id);

  if (index === -1) {
    res.status(404).json({ error: 'Artwork not found' });
    return;
  }

  const existing = artworks[index];
  const updated: ArtworkRecord = {
    ...existing,
    title: title !== undefined ? String(title).trim() : existing.title,
    description: description !== undefined ? String(description).trim() : existing.description,
    category: category !== undefined ? String(category).trim() : existing.category,
    imageUrl: imageUrl !== undefined ? String(imageUrl).trim() : existing.imageUrl,
    published: published !== undefined ? Boolean(published) : existing.published,
    updatedAt: Date.now(),
  };

  artworks[index] = updated;
  saveArtworks(artworks);

  res.json(updated);
});

// 9. Delete Artwork (Admin Only)
app.delete('/api/artworks/:id', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const artworks = getArtworks();
  const index = artworks.findIndex((item) => item.id === id);

  if (index === -1) {
    res.status(404).json({ error: 'Artwork not found' });
    return;
  }

  const deleted = artworks.splice(index, 1)[0];
  saveArtworks(artworks);

  // If local upload image, remove the physical file
  if (deleted.imageUrl && deleted.imageUrl.startsWith('/uploads/')) {
    const filename = path.basename(deleted.imageUrl);
    const filePath = path.join(UPLOADS_DIR, filename);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (err) {
        console.error('Failed to unlink uploaded file:', err);
      }
    }
  }

  res.json({ success: true, message: 'Artwork deleted successfully', id });
});

// 10. Upload Artwork Image (Admin Only - saves permanently to disk storage)
app.post('/api/upload', requireAdmin, (req: Request, res: Response) => {
  const { dataUrl, filename } = req.body;

  if (!dataUrl || typeof dataUrl !== 'string') {
    res.status(400).json({ error: 'dataUrl is required' });
    return;
  }

  // Parse data URL (e.g. data:image/png;base64,iVBORw0KGgo...)
  const match = dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  if (!match) {
    res.status(400).json({ error: 'Invalid data URL format' });
    return;
  }

  const mimeType = match[1];
  const base64Data = match[2];
  let ext = '.png';
  if (mimeType === 'image/jpeg' || mimeType === 'image/jpg') ext = '.jpg';
  else if (mimeType === 'image/webp') ext = '.webp';
  else if (mimeType === 'image/svg+xml') ext = '.svg';
  else if (mimeType === 'image/gif') ext = '.gif';

  const sanitizedBase = (filename ? path.parse(filename).name : 'artwork')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .slice(0, 40);

  const targetFilename = `${Date.now()}_${sanitizedBase}${ext}`;
  const filePath = path.join(UPLOADS_DIR, targetFilename);

  fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));

  const publicUrl = `/uploads/${targetFilename}`;
  res.json({
    success: true,
    url: publicUrl,
    filename: targetFilename,
  });
});

// ======================== VITE INTEGRATION ======================== //

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files from dist
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SHAHMEER STUDIO] Server running on port ${PORT}`);
  });
}

startServer();
