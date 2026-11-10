/**
 * Firebase Client Configuration & Service Helper
 *
 * Supports Cloud Firestore and Firebase Storage with real-time onSnapshot listeners
 * and progress-tracked image uploads.
 */

import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import {
  getFirestore,
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  type Firestore,
  type Unsubscribe,
} from 'firebase/firestore';
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
  type FirebaseStorage,
} from 'firebase/storage';
import { Artwork } from '../types';

export interface FirebaseClientConfig {
  apiKey?: string;
  authDomain?: string;
  projectId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
  firestoreDatabaseId?: string;
}

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;
let storage: FirebaseStorage | null = null;

export function isFirebaseConfigured(): boolean {
  return Boolean(
    import.meta.env.VITE_FIREBASE_API_KEY &&
    import.meta.env.VITE_FIREBASE_PROJECT_ID
  );
}

export function initFirebase(customConfig?: FirebaseClientConfig) {
  if (app && db && storage) return { app, db, auth, storage };

  const config: FirebaseClientConfig = customConfig || {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    firestoreDatabaseId: import.meta.env.VITE_FIREBASE_DATABASE_ID,
  };

  if (config.apiKey && config.projectId) {
    try {
      app = getApps().length > 0 ? getApps()[0] : initializeApp(config);
      db = config.firestoreDatabaseId
        ? getFirestore(app, config.firestoreDatabaseId)
        : getFirestore(app);
      auth = getAuth(app);
      storage = getStorage(app);
      console.log('[Firebase] Active with project:', config.projectId);
    } catch (err) {
      console.warn('[Firebase] Initialization notice:', err);
    }
  }

  return { app, db, auth, storage };
}

// Auto-attempt initialization
initFirebase();

/**
 * Upload file to Firebase Storage with real-time percentage progress callback
 */
export async function uploadToFirebaseStorage(
  file: File,
  onProgress?: (percent: number) => void
): Promise<string> {
  const { storage: fbStorage } = initFirebase();
  if (!fbStorage) {
    throw new Error('Firebase Storage is not configured yet');
  }

  const sanitized = file.name.replace(/[^a-zA-Z0-9_.-]/g, '_');
  const path = `artworks/${Date.now()}_${sanitized}`;
  const storageRef = ref(fbStorage, path);
  const uploadTask = uploadBytesResumable(storageRef, file, {
    contentType: file.type,
  });

  return new Promise((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const percent = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        );
        if (onProgress) onProgress(percent);
      },
      (error) => {
        reject(error);
      },
      async () => {
        const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
        resolve(downloadUrl);
      }
    );
  });
}

/**
 * Real-time listener for Cloud Firestore published artworks
 */
export function subscribeToFirestoreArtworks(
  onData: (artworks: Artwork[]) => void,
  isAdmin: boolean = false
): Unsubscribe | null {
  const { db: firestore } = initFirebase();
  if (!firestore) return null;

  try {
    const artworksCol = collection(firestore, 'artworks');
    const q = isAdmin
      ? query(artworksCol, orderBy('createdAt', 'desc'))
      : query(
          artworksCol,
          where('published', '==', true),
          orderBy('createdAt', 'desc')
        );

    return onSnapshot(
      q,
      (snapshot) => {
        const list: Artwork[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ ...(docSnap.data() as Artwork), id: docSnap.id });
        });
        onData(list);
      },
      (err) => {
        console.warn('Firestore subscription notice:', err.message);
      }
    );
  } catch (err) {
    console.warn('Failed to attach Firestore listener:', err);
    return null;
  }
}

export { app, db, auth, storage };
