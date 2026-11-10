import { Artwork, AdminAuthResponse, ArtworkStats } from '../types';
import {
  isFirebaseConfigured,
  uploadToFirebaseStorage,
  subscribeToFirestoreArtworks,
} from '../config/firebase';

const TOKEN_KEY = 'shahmeer_admin_token';

export function getAdminToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAdminToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeAdminToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export function authHeaders(): Record<string, string> {
  const token = getAdminToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// 1. Admin Login (Purely server-side authenticated)
export async function adminLogin(password: string): Promise<AdminAuthResponse> {
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      return { success: false, error: data.error || 'Authentication failed' };
    }

    if (data.token) {
      setAdminToken(data.token);
    }
    return data;
  } catch {
    return { success: false, error: 'Network error connecting to security server' };
  }
}

// 2. Change Admin Password (Owner can set new secret key)
export async function changeAdminPassword(
  currentPassword: string,
  newPassword: string
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const res = await fetch('/api/auth/change-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders(),
      },
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      return { success: false, error: data.error || 'Failed to update password' };
    }
    return data;
  } catch {
    return { success: false, error: 'Network error connecting to server' };
  }
}

// 3. Admin Logout
export async function adminLogout(): Promise<void> {
  try {
    await fetch('/api/auth/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders(),
      },
    });
  } catch (err) {
    console.warn('Logout notice:', err);
  } finally {
    removeAdminToken();
  }
}

// 4. Verify Admin Session
export async function verifyAdminSession(): Promise<boolean> {
  const token = getAdminToken();
  if (!token) return false;

  try {
    const res = await fetch('/api/auth/verify', {
      headers: authHeaders(),
    });
    if (!res.ok) {
      removeAdminToken();
      return false;
    }
    const data = await res.json();
    if (!data.authenticated) {
      removeAdminToken();
    }
    return Boolean(data.authenticated);
  } catch {
    return false;
  }
}

// 5. Fetch Artworks
export async function fetchArtworks(): Promise<Artwork[]> {
  const res = await fetch('/api/artworks', {
    headers: authHeaders(),
  });
  if (!res.ok) {
    throw new Error('Failed to load artworks');
  }
  return await res.json();
}

// 6. Real-Time Gallery Synchronization
// Uses Firebase Firestore onSnapshot if available, or Server-Sent Events / Polling
export function subscribeArtworksRealtime(
  onData: (artworks: Artwork[]) => void,
  isAdmin: boolean = false
): () => void {
  // If Firebase is configured with active credentials, prefer direct Firestore onSnapshot
  if (isFirebaseConfigured()) {
    const unsubscribe = subscribeToFirestoreArtworks(onData, isAdmin);
    if (unsubscribe) {
      return unsubscribe;
    }
  }

  // Real-time synchronization via Server-Sent Events (SSE)
  let eventSource: EventSource | null = null;
  let intervalId: any = null;

  try {
    eventSource = new EventSource('/api/artworks/stream');
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (Array.isArray(data)) {
          onData(data);
        }
      } catch (e) {
        console.error('SSE parse error:', e);
      }
    };

    eventSource.onerror = () => {
      // If SSE disconnects, fall back to low-frequency background poll
      if (!intervalId) {
        intervalId = setInterval(async () => {
          try {
            const data = await fetchArtworks();
            onData(data);
          } catch {}
        }, 5000);
      }
    };
  } catch {
    intervalId = setInterval(async () => {
      try {
        const data = await fetchArtworks();
        onData(data);
      } catch {}
    }, 5000);
  }

  return () => {
    if (eventSource) {
      eventSource.close();
    }
    if (intervalId) {
      clearInterval(intervalId);
    }
  };
}

// 7. Create Artwork
export async function createArtwork(payload: {
  title: string;
  description: string;
  category: string;
  imageUrl: string;
  published: boolean;
}): Promise<Artwork> {
  const res = await fetch('/api/artworks', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || 'Failed to create artwork');
  }

  return await res.json();
}

// 8. Update Artwork
export async function updateArtwork(
  id: string,
  payload: Partial<Artwork>
): Promise<Artwork> {
  const res = await fetch(`/api/artworks/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || 'Failed to update artwork');
  }

  return await res.json();
}

// 9. Delete Artwork
export async function deleteArtwork(id: string): Promise<boolean> {
  const res = await fetch(`/api/artworks/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || 'Failed to delete artwork');
  }

  return true;
}

// 10. Upload Artwork Image with Progress Tracking
// Uses Firebase Storage if configured, or Server Permanent Storage
export async function uploadArtworkImage(
  file: File,
  onProgress?: (percent: number) => void
): Promise<string> {
  if (onProgress) onProgress(10);

  if (isFirebaseConfigured()) {
    try {
      const url = await uploadToFirebaseStorage(file, onProgress);
      return url;
    } catch (fbErr) {
      console.warn('Firebase Storage upload failed, falling back to server disk storage:', fbErr);
    }
  }

  // Server disk storage
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        if (onProgress) onProgress(45);
        const dataUrl = reader.result as string;
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...authHeaders(),
          },
          body: JSON.stringify({
            dataUrl,
            filename: file.name,
          }),
        });

        if (onProgress) onProgress(85);

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || 'Failed to upload artwork image');
        }

        const data = await res.json();
        if (onProgress) onProgress(100);
        resolve(data.url);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.readAsDataURL(file);
  });
}

// Helper: Calculate statistics
export function calculateStats(artworks: Artwork[]): ArtworkStats {
  const totalUploaded = artworks.length;
  const totalPublished = artworks.filter((a) => a.published).length;
  const totalDrafts = totalUploaded - totalPublished;
  return { totalUploaded, totalPublished, totalDrafts };
}
