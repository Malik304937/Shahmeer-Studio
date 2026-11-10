# SHAHMEER STUDIO – SETUP & DEPLOYMENT GUIDE

**Brand:** SHAHMEER STUDIO  
**Instagram:** [@shahmeer.studio](https://www.instagram.com/shahmeer.studio/)  
**Theme:** Premium Black & Gold (`#080808` / `#D4AF37`)  
**Official Crest:** Royal Gold Emblem with Crown and Interlocking 'S'

---

## 1. Quick Local Execution

The project comes with a built-in production Express server supporting file uploads, persistent JSON disk storage, and server-side password authentication.

```bash
# 1. Install dependencies
npm install

# 2. Run dev server (Full-stack Express + Vite)
npm run dev

# App runs at: http://localhost:3000
```

### Administrator Access & Password Privacy
- **Admin URL:** `/admin` or click **"Admin Login"** in the top navigation.
- **Security:** The password is authenticated purely on the server side using SHA-256 with studio salt and session tokens; it is never exposed in frontend bundles or responses.
- **Change Password:** The owner can update their secret password at any time via the **"Change Password"** action inside the Admin Dashboard.

---

## 2. Firebase Cloud Firestore & Firebase Storage Setup

This project includes hardened **Cloud Firestore** and **Firebase Storage** security rules.

### Step 1: Create Firebase Project
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Click **Add Project** and name it (e.g. `shahmeer-studio`).
3. Enable **Cloud Firestore** in production mode.
4. Enable **Firebase Storage**.

### Step 2: Deploy Firestore Security Rules
Copy the contents of `firestore.rules` or deploy via Firebase CLI:
```bash
firebase deploy --only firestore:rules
```

Key security highlights in `firestore.rules`:
- Public visitors have read-only access strictly limited to records where `published == true`.
- Create, update, and delete operations are restricted to verified studio admins.
- Schema validation enforces valid titles (1-150 chars), allowed categories, and valid image URLs.

### Step 3: Deploy Firebase Storage Rules
Copy the contents of `storage.rules` or deploy via Firebase CLI:
```bash
firebase deploy --only storage
```
- Public users have read-only access to view artwork images.
- Uploads are restricted to authenticated admins, with a 25MB file size limit and image-only MIME enforcement.

### Step 4: Configure Client Environment Variables
Copy `.env.example` to `.env` and set your Firebase web app keys:
```env
VITE_FIREBASE_API_KEY="your-api-key"
VITE_FIREBASE_AUTH_DOMAIN="shahmeer-studio.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="shahmeer-studio"
VITE_FIREBASE_STORAGE_BUCKET="shahmeer-studio.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
VITE_FIREBASE_APP_ID="your-app-id"
```

---

## 3. Vercel Deployment Guide

To deploy Shahmeer Studio to Vercel:

### Option A: Standard Full-Stack / Node.js
1. Push your repository to GitHub, GitLab, or Bitbucket.
2. Go to [vercel.com](https://vercel.com) and click **"Add New Project"**.
3. Import your repository.
4. Set Build and Output Settings:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. In **Environment Variables**, optionally set:
   - `ADMIN_PASSWORD`: Your secret administrator password.

### Option B: Vercel SPA with Firebase Backend
If using Cloud Firestore & Firebase Storage as your backend:
1. Provide the `VITE_FIREBASE_*` environment variables in your Vercel project settings.
2. The included `vercel.json` automatically handles single-page app routing.

---

## 4. Verification Checklist

- [x] Royal Gold Emblem integrated in Logo, Navbar, Hero, About, Admin, and Favicon.
- [x] Home page with logo "SHAHMEER STUDIO", headline "DESIGN THAT MAKES YOU DIFFERENT", and gold particles.
- [x] Initial gallery empty-state displays: `"New Creative Projects Coming Soon."` (no placeholder or fake projects).
- [x] Instagram DM contact section linking directly to `@shahmeer.studio`.
- [x] Buttons: "DM FOR CUSTOM DESIGN", "CONTACT ON INSTAGRAM", and "ORDER YOUR DESIGN".
- [x] Admin login with complete password privacy (no default password text, no hints).
- [x] Owner can update secret admin password securely from dashboard.
- [x] Permanent artwork storage with progress bar.
- [x] Real-time gallery synchronization across all devices and browsers.
- [x] Full artwork upload with categories: Logo Design, T-Shirt Design, Poster Design, Social Media Design, Branding, Other Designs.
- [x] Publish / unpublish toggling, editing, deletion with confirmation modal.
- [x] Full-screen lightbox preview with keyboard shortcuts (Escape, Left/Right arrows).
- [x] Mobile responsive navigation drawer.
