import { Artwork, AdminAuthResponse, ArtworkStats } from '../types';
import {
  isFirebaseConfigured,
  uploadToFirebaseStorage,
  subscribeToFirestoreArtworks,
} from '../config/firebase';

const TOKEN_KEY = 'shahmeer_admin_token';

export function getAdminToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setAdminToken(token: string): void {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch (e) {
    console.warn('Could not persist admin token:', e);
  }
}

export function removeAdminToken(): void {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch (e) {
    console.warn('Could not remove admin token:', e);
  }
}

export function authHeaders(): Record<string, string> {
  const token = getAdminToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Admin Login with resilient network & error handling
 *
 * Requirements:
 * - If server unavailable: "Unable to connect to the authentication server. Please try again."
 * - If credentials incorrect: "Incorrect administrator credentials."
 * - If Firebase config missing: "Authentication configuration is incomplete. Please check Firebase settings."
 */
export async function adminLogin(password: string): Promise<AdminAuthResponse> {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return {
      success: false,
      error: 'Unable to connect to the authentication server. Please try again.',
    };
  }

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ password }),
    });

    const contentType = res.headers.get('content-type') || '';

    // If server returned non-JSON (e.g. 502/503 HTML warmup or proxy error)
    if (!contentType.includes('application/json')) {
      if (res.status === 401 || res.status === 403) {
        return {
          success: false,
          error: 'Incorrect administrator credentials.',
        };
      }
      return {
        success: false,
        error: 'Unable to connect to the authentication server. Please try again.',
      };
    }

    const data = await res.json().catch(() => null);

    if (!res.ok || !data?.success) {
      if (res.status === 401 || res.status === 403) {
        return {
          success: false,
          error: 'Incorrect administrator credentials.',
        };
      }
      return {
        success: false,
        error:
          data?.error ||
          'Unable to connect to the authentication server. Please try again.',
      };
    }

    if (data.token) {
      setAdminToken(data.token);
    }
    return {
      success: true,
      token: data.token,
      expiresAt: data.expiresAt,
      message: data.message,
    };
  } catch {
    return {
      success: false,
      error: 'Unable to connect to the authentication server. Please try again.',
    };
  }
}

/**
 * Change Admin Password
 */
export async function changeAdminPassword(
  currentPassword: string,
  newPassword: string
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const res = await fetch('/api/auth/change-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...authHeaders(),
      },
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok || !data?.success) {
      return {
        success: false,
        error:
          data?.error ||
          'Unable to connect to the authentication server. Please try again.',
      };
    }
    return data;
  } catch {
    return {
      success: false,
      error: 'Unable to connect to the authentication server. Please try again.',
    };
  }
}

/**
 * Admin Logout
 */
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

/**
 * Verify Admin Session
 */
export async function verifyAdminSession(): Promise<boolean> {
  const token = getAdminToken();
  if (!token) return false;

  try {
    const res = await fetch('/api/auth/verify', {
      headers: {
        Accept: 'application/json',
        ...authHeaders(),
      },
    });

    if (!res.ok) {
      removeAdminToken();
      return false;
    }

    const data = await res.json().catch(() => null);
    if (!data?.authenticated) {
      removeAdminToken();
      return false;
    }
    return true;
  } catch {
    // If server temporarily unreachable, preserve token for retry
    return Boolean(token);
  }
}

/**
 * Fetch Artworks
 */
export async function fetchArtworks(): Promise<Artwork[]> {
  try {
    const res = await fetch('/api/artworks', {
      headers: {
        Accept: 'application/json',
        ...authHeaders(),
      },
    });
    if (!res.ok) {
      throw new Error('Failed to load artworks');
    }
    return await res.json();
  } catch (err) {
    console.error('Fetch artworks network error:', err);
    return [];
  }
}

/**
 * Real-Time Gallery Synchronization
 */
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
      if (eventSource) {
        eventSource.close();
        eventSource = null;
      }
      if (!intervalId) {
        intervalId = setInterval(async () => {
          try {
            const data = await fetchArtworks();
            if (data.length > 0) onData(data);
          } catch {}
        }, 6000);
      }
    };
  } catch {
    intervalId = setInterval(async () => {
      try {
        const data = await fetchArtworks();
        if (data.length > 0) onData(data);
      } catch {}
    }, 6000);
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

/**
 * Create Artwork
 */
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
      Accept: 'application/json',
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

/**
 * Update Artwork
 */
export async function updateArtwork(
  id: string,
  payload: Partial<Artwork>
): Promise<Artwork> {
  const res = await fetch(`/api/artworks/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
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

/**
 * Delete Artwork
 */
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

/**
 * Upload Artwork Image with Progress Tracking
 */
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
      console.warn(
        'Firebase Storage upload notice, falling back to server disk storage:',
        fbErr
      );
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
            Accept: 'application/json',
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

/**
 * Calculate Statistics
 */
export function calculateStats(artworks: Artwork[]): ArtworkStats {
  const totalUploaded = artworks.length;
  const totalPublished = artworks.filter((a) => a.published).length;
  const totalDrafts = totalUploaded - totalPublished;
  return { totalUploaded, totalPublished, totalDrafts };
}
