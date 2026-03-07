# Chilahati Firebase + Vercel Setup

## Vercel Environment Variables

Use the values below in **Vercel Project Settings → Environment Variables**.

### Public client-side variables (safe to expose)

```env
NEXT_PUBLIC_SITE_URL=https://www.chilahati.com
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDTYI4W1wsA_KUaJ7s2WpZPILiML5oLsK4
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=chilahati-archive.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=chilahati-archive
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=chilahati-archive.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=109134747142
NEXT_PUBLIC_FIREBASE_APP_ID=1:109134747142:web:ab28f14f4e2798b3fb9587
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-RKSDJMMC1D
```

### Firebase Admin SDK — server-only (never expose in client code)

Create a service account key from **Firebase Console → Project Settings → Service accounts → Generate new private key**.

```env
FIREBASE_PROJECT_ID=chilahati-archive
FIREBASE_CLIENT_EMAIL=your-service-account@chilahati-archive.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

> **Vercel tip:** Paste the private key with literal `\n` characters. Do not add extra quotes; Vercel handles the string correctly.

### Application secrets

Generate secure random values with `openssl rand -base64 48`.

```env
JWT_SECRET=replace-with-a-long-random-secret
SESSION_SECRET=replace-with-a-second-long-random-secret
ADMIN_EMAILS=sopnotory26@gmail.com
```

---

## Firebase Console Settings

### Authentication

Enable these sign-in providers under **Firebase Console → Authentication → Sign-in method**:

```
Email/Password  → Enabled
Google          → Enabled
  Project support email : sopnotory26@gmail.com
  Public-facing name    : Chilahati.com
Authorized domains:
  chilahati.com
  www.chilahati.com
  localhost
```

### Firestore Database

1. Go to **Firebase Console → Firestore Database → Create database**
2. Choose **Production mode** (rules are in `rules.txt`)
3. Select the nearest region (e.g. `asia-south1` for Bangladesh)

#### Required composite indexes

Create these indexes under **Firestore → Indexes → Composite**:

| Collection     | Fields                               | Order |
|----------------|--------------------------------------|-------|
| archive_items  | category ASC, createdAt DESC         | —     |
| archive_items  | category ASC, subType ASC, createdAt DESC | —  |
| submissions    | status ASC, createdAt DESC           | —     |

> Without these indexes the multi-field queries will throw a Firestore error with a link to create the index automatically — click that link as a shortcut.

### Firebase Storage

1. Go to **Firebase Console → Storage → Get started**
2. Choose **Production mode**
3. Storage rules are in `rules.txt` (only admin can write, public can read `/public/**`)

---

## Deploy Security Rules

Security rules live in `rules.txt`. Copy the two rule blocks into the Firebase Console **or** use the Firebase CLI:

```bash
# Install CLI once
npm install -g firebase-tools
firebase login

# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy Storage rules
firebase deploy --only storage
```

---

## Data Architecture

| Firestore collection | Document ID | Purpose |
|----------------------|-------------|---------|
| `archive_items`      | `{slug}`    | Published archive entries |
| `submissions`        | auto-ID     | Pending community contributions |
| `users`              | `{uid}`     | User profiles (Firebase UID = doc ID) |
| `contacts`           | auto-ID     | Contact-form submissions |

**Admin account:** `sopnotory26@gmail.com` — set in `ADMIN_EMAILS` env var and enforced in Firestore/Storage rules.

---

## Search Result Icon

The site favicon comes from `src/app/icon.svg`. Google will pick up the new icon on its next crawl after deployment.