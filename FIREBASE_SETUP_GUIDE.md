# 🔥 Firebase Setup Guide - Step by Step

## Prerequisites
- Google account
- 15-20 minutes

---

## Step 1: Create Firebase Project (5 min)

### 1.1 Go to Firebase Console
Visit: https://console.firebase.google.com/

### 1.2 Create New Project
1. Click **"Add project"**
2. **Project name**: `philly-culture-academy` (or your choice)
3. Click **Continue**
4. **Enable Google Analytics**: Choose Yes or No (optional for now)
5. Click **Create project**
6. Wait for project creation (~30 seconds)
7. Click **Continue**

---

## Step 2: Set Up Firebase Authentication (3 min)

### 2.1 Enable Authentication
1. In Firebase Console sidebar, click **"Authentication"**
2. Click **"Get started"**
3. Click **"Sign-in method"** tab

### 2.2 Enable Email/Password Auth
1. Click **"Email/Password"**
2. Toggle **"Enable"** to ON
3. Keep **"Email link (passwordless sign-in)"** OFF for now
4. Click **"Save"**

### 2.3 Optional: Enable Google Sign-In
1. Click **"Google"**
2. Toggle **"Enable"** to ON
3. Select your support email
4. Click **"Save"**

---

## Step 3: Set Up Firestore Database (5 min)

### 3.1 Create Firestore Database
1. In sidebar, click **"Firestore Database"**
2. Click **"Create database"**
3. **Location**: Choose closest to you (e.g., `us-central1`)
   - ⚠️ **Cannot change later!**
4. Click **"Next"**

### 3.2 Security Rules
1. Select **"Start in test mode"** (we'll deploy real rules later)
2. Click **"Enable"**
3. Wait for database creation (~30 seconds)

### 3.3 Deploy Production Rules (IMPORTANT)
**Do this after database is created:**

```bash
# In your project directory
cd "/Users/shadi/Desktop/pilly culture/philly-culture-update"

# Install Firebase CLI (if not already installed)
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in project
firebase init

# Select:
# - Firestore (use arrow keys, space to select, enter to confirm)
# - Use existing project
# - Select your project
# - Accept default: firestore.rules
# - Accept default: firestore.indexes.json

# Deploy rules and indexes
firebase deploy --only firestore
```

---

## Step 4: Get Firebase Client Credentials (3 min)

### 4.1 Add Web App
1. In Firebase Console, click **⚙️ (Settings icon)** → **"Project settings"**
2. Scroll to **"Your apps"** section
3. Click **</> (Web)** icon
4. **App nickname**: `Philly Culture Web App`
5. **DON'T** check "Also set up Firebase Hosting"
6. Click **"Register app"**
7. Click **"Continue to console"**

### 4.2 Copy Client Config
1. Still in **Project Settings** → **General** tab
2. Scroll to **"Your apps"** → **"Web apps"**
3. Click on your web app
4. Under **"SDK setup and configuration"**, select **"Config"**
5. Copy all values:

```javascript
// You'll see something like this:
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "philly-culture-academy.firebaseapp.com",
  projectId: "philly-culture-academy",
  storageBucket: "philly-culture-academy.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};
```

### 4.3 Add to `.env.local`
Create file: `.env.local` in your project root

```bash
# FIREBASE CLIENT SDK (PUBLIC)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=philly-culture-academy.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=philly-culture-academy
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=philly-culture-academy.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
```

---

## Step 5: Get Firebase Admin SDK Credentials (4 min)

### 5.1 Generate Service Account Key
1. In **Project Settings**, click **"Service accounts"** tab
2. Click **"Generate new private key"**
3. Click **"Generate key"**
4. A JSON file will download (e.g., `philly-culture-academy-firebase-adminsdk-xxxxx.json`)
5. **⚠️ KEEP THIS FILE SECRET!** Never commit to git!

### 5.2 Extract Values from JSON
Open the downloaded JSON file. You'll see:

```json
{
  "type": "service_account",
  "project_id": "philly-culture-academy",
  "private_key_id": "abc123...",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBA...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@philly-culture-academy.iam.gserviceaccount.com",
  ...
}
```

### 5.3 Add to `.env.local`
Add these to your `.env.local`:

```bash
# FIREBASE ADMIN SDK (SECRET)
FIREBASE_ADMIN_PROJECT_ID=philly-culture-academy
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@philly-culture-academy.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBA...\n-----END PRIVATE KEY-----\n"
```

**⚠️ IMPORTANT:** 
- Keep the `\n` characters in the private key
- Wrap the entire private key in double quotes
- Do NOT remove the quotes

---

## Step 6: Set Up Stripe (Optional - For Payments)

### 6.1 Create Stripe Account
1. Go to: https://stripe.com
2. Click **"Sign up"**
3. Create account (free)

### 6.2 Get API Keys
1. After login, go to: https://dashboard.stripe.com/test/apikeys
2. Copy **"Publishable key"** (starts with `pk_test_`)
3. Click **"Reveal"** on **"Secret key"** → Copy (starts with `sk_test_`)

### 6.3 Add to `.env.local`
```bash
# STRIPE (SECRET)
STRIPE_SECRET_KEY=sk_test_51Xxxxx...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51Xxxxx...
```

### 6.4 Set Up Webhook (Do this later after deployment)
1. Go to: https://dashboard.stripe.com/test/webhooks
2. Click **"Add endpoint"**
3. **Endpoint URL**: `https://yourdomain.com/api/v1/webhook/stripe`
4. **Events to send**: Select `checkout.session.completed`
5. Click **"Add endpoint"**
6. Click on webhook → **"Signing secret"** → Reveal → Copy
7. Add to `.env.local`:
```bash
STRIPE_WEBHOOK_SECRET=whsec_xxxxx...
```

---

## Step 7: Final .env.local File

Your complete `.env.local` should look like:

```bash
# =========================================
# FIREBASE CLIENT SDK (PUBLIC)
# =========================================
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=philly-culture-academy.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=philly-culture-academy
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=philly-culture-academy.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef123456

# =========================================
# FIREBASE ADMIN SDK (SECRET)
# =========================================
FIREBASE_ADMIN_PROJECT_ID=philly-culture-academy
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@philly-culture-academy.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"

# =========================================
# STRIPE (SECRET)
# =========================================
STRIPE_SECRET_KEY=sk_test_51Xxxxx...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51Xxxxx...
STRIPE_WEBHOOK_SECRET=whsec_xxxxx...

# =========================================
# APPLICATION SETTINGS
# =========================================
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

---

## Step 8: Verify Setup

### 8.1 Test the Build
```bash
cd "/Users/shadi/Desktop/pilly culture/philly-culture-update"
npm run build
```

**Expected output:**
```
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Creating an optimized production build...
```

### 8.2 Start Dev Server
```bash
npm run dev
```

Visit: http://localhost:3000

### 8.3 Test Authentication
1. Go to: http://localhost:3000/register
2. Create account
3. Check Firebase Console → Authentication → Users
4. You should see your new user!

---

## Common Issues & Fixes

### Issue 1: "FIREBASE_ADMIN_PRIVATE_KEY is invalid"
**Fix:** Make sure you:
- Wrapped the key in double quotes
- Kept all `\n` characters
- Copied the ENTIRE key including BEGIN/END lines

### Issue 2: "Firebase: Error (auth/invalid-api-key)"
**Fix:** Check that:
- You copied the correct API key
- No extra spaces in `.env.local`
- You restarted the dev server after adding env vars

### Issue 3: Build fails with "Missing environment variables"
**Fix:** 
- Ensure `.env.local` is in project root (not in subdirectory)
- Check for typos in variable names
- Restart terminal/dev server

### Issue 4: "Cannot find module 'firebase-admin'"
**Fix:**
```bash
npm install firebase-admin
```

---

## Security Checklist

✅ **DO:**
- Keep `.env.local` in `.gitignore` (it already is)
- Store service account JSON file securely
- Use different Firebase projects for dev/production
- Enable Firestore security rules

❌ **DON'T:**
- Commit `.env.local` to git
- Share service account keys
- Use production keys in development
- Disable security rules in production

---

## Next Steps After Setup

Once environment variables are configured:

1. **Create Sample Data** (Option 2)
   - I'll build a seeding script to populate Firestore

2. **Test the App** (Option 3)
   - Complete user journey testing

3. **Deploy to Production** (Option 4)
   - Vercel deployment with production Firebase

---

## Need Help?

If you get stuck:
1. Check the error message in terminal
2. Verify all env vars are correct
3. Restart dev server
4. Check Firebase Console for project setup

**Ready to continue?** Let me know when `.env.local` is set up and we'll move to creating sample data!
