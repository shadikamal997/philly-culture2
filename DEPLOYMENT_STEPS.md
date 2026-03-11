# Step-by-Step Deployment Guide

Follow these steps in order to deploy your Philly Culture platform.

---

## ✅ STEP 1: Verify Your Code Builds

```bash
cd "/Users/shadi/Desktop/pilly culture/philly-culture-update"
npm run build
```

**Expected Result:** Should complete without errors
- If fails: Check the error message and fix before continuing

---

## ✅ STEP 2: Get Your Firebase Credentials

### 2.1 Get Client Config (Public keys - safe to expose)

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project (or create new one)
3. Click **⚙️ Settings** → **Project settings**
4. Scroll to "Your apps" section
5. Click on your web app (or create one if none exists)
6. Copy the config values:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",              // → NEXT_PUBLIC_FIREBASE_API_KEY
  authDomain: "xxx.firebaseapp.com",   // → NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
  projectId: "your-project",           // → NEXT_PUBLIC_FIREBASE_PROJECT_ID
  storageBucket: "xxx.appspot.com",    // → NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
  messagingSenderId: "123456",         // → NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
  appId: "1:123:web:abc"              // → NEXT_PUBLIC_FIREBASE_APP_ID
};
```

### 2.2 Get Admin SDK Credentials (Secret - server-side only)

1. In Firebase Console → **⚙️ Settings** → **Service accounts**
2. Click **"Generate new private key"** button
3. Download the JSON file
4. Open it and copy:
   - `client_email` → FIREBASE_CLIENT_EMAIL
   - `private_key` → FIREBASE_PRIVATE_KEY (keep the `\n` characters!)

---

## ✅ STEP 3: Get Stripe API Keys

### 3.1 For Testing (Start Here)

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys)
2. Make sure you're in **"Test mode"** (toggle at top)
3. Copy these keys:
   - **Publishable key** (starts with `pk_test_`) → NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
   - Click "Reveal test key" for **Secret key** (starts with `sk_test_`) → STRIPE_SECRET_KEY

### 3.2 Enable Automatic Tax (Optional but recommended)

1. Go to [Stripe Tax Settings](https://dashboard.stripe.com/test/settings/tax)
2. Click **"Set up Stripe Tax"**
3. Select **"Digital products and services"**
4. Choose the states where you want to collect tax
5. Click **"Enable"**

---

## ✅ STEP 4: Update Your Local Environment File

Copy `.env.example` to `.env.local` and fill in all the values you collected:

```bash
cp .env.example .env.local
```

Then edit `.env.local` with your actual values from Steps 2 and 3.

**Test locally:**
```bash
npm run dev
```
Visit `http://localhost:3000` - should load without errors

---

## ✅ STEP 5: Deploy Firebase Security Rules

```bash
# Deploy Firestore security rules
firebase deploy --only firestore:rules

# Deploy Firestore indexes
firebase deploy --only firestore:indexes
```

**Expected Result:** 
```
✔ Deploy complete!
```

**Wait 5-10 minutes** for indexes to build before continuing.

---

## ✅ STEP 6: Set Up Admin User

1. Go to [Firestore Database](https://console.firebase.google.com/project/_/firestore)
2. Click **"Start collection"** (if no collections exist)
3. Collection ID: `users`
4. Click "Add document"
5. Document ID: (leave auto-generated or use your user ID)
6. Add these fields:

| Field | Type | Value |
|-------|------|-------|
| email | string | your-email@example.com |
| role | string | admin |
| name | string | Your Name |
| createdAt | timestamp | (click "timestamp" button) |

7. Click **"Save"**

---

## ✅ STEP 7: Choose Your Hosting Platform

### Option A: Deploy to Vercel (Recommended)

#### 7A.1 Install Vercel CLI
```bash
npm install -g vercel
```

#### 7A.2 Login to Vercel
```bash
vercel login
```
Follow the prompts to authenticate.

#### 7A.3 Link Your Project
```bash
vercel link
```
- Select "Link to existing project" or "Create new project"
- Choose your GitHub repo: `shadikamal997/philly-culture2`

#### 7A.4 Add Environment Variables
```bash
vercel env add NEXT_PUBLIC_FIREBASE_API_KEY
```
Paste your value when prompted. Repeat for ALL these variables:

**Public variables (available in all environments):**
- NEXT_PUBLIC_FIREBASE_API_KEY
- NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
- NEXT_PUBLIC_FIREBASE_PROJECT_ID
- NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
- NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
- NEXT_PUBLIC_FIREBASE_APP_ID
- NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
- NEXT_PUBLIC_SITE_URL (use `https://your-project.vercel.app` for now)
- NEXT_PUBLIC_OWNER_EMAIL

**Secret variables (production/preview only):**
- FIREBASE_CLIENT_EMAIL
- FIREBASE_PRIVATE_KEY
- STRIPE_SECRET_KEY
- STRIPE_WEBHOOK_SECRET (leave empty for now, we'll add this later)

**Or use Vercel Dashboard:**
1. Go to [vercel.com](https://vercel.com/dashboard)
2. Select your project → Settings → Environment Variables
3. Add all variables there

#### 7A.5 Deploy
```bash
vercel --prod
```

**Expected Result:**
```
✅ Production: https://your-project.vercel.app
```

### Option B: Deploy to Netlify

#### 7B.1 Install Netlify CLI
```bash
npm install -g netlify-cli
```

#### 7B.2 Login and Deploy
```bash
netlify login
netlify init
netlify deploy --prod
```

#### 7B.3 Add Environment Variables
```bash
netlify env:set NEXT_PUBLIC_FIREBASE_API_KEY "your-value"
```
Or use Netlify Dashboard → Site settings → Environment variables

---

## ✅ STEP 8: Add Custom Domain (Optional)

### If using Vercel:

1. Go to Vercel Dashboard → Your Project → **Settings** → **Domains**
2. Click **"Add"**
3. Enter your domain: `yourdomain.com`
4. Vercel will show you DNS records to add

### Update DNS with your domain registrar:

**For root domain (yourdomain.com):**
- Type: **A**
- Name: **@**
- Value: **76.76.21.21**

**For www (www.yourdomain.com):**
- Type: **CNAME**
- Name: **www**
- Value: **cname.vercel-dns.com**

**Wait 24-48 hours for DNS to propagate**

---

## ✅ STEP 9: Set Up Stripe Webhook

**Important:** Do this AFTER deployment so you have a live URL.

1. Go to [Stripe Webhooks](https://dashboard.stripe.com/test/webhooks)
2. Click **"Add endpoint"**
3. Endpoint URL: `https://your-project.vercel.app/api/webhook/stripe`
   - Replace with your actual domain
4. Description: "Philly Culture Webhook"
5. Select events to listen to:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
6. Click **"Add endpoint"**
7. Click on the newly created endpoint
8. Click **"Reveal"** next to "Signing secret"
9. Copy the secret (starts with `whsec_`)

### Add Webhook Secret to Vercel:

```bash
vercel env add STRIPE_WEBHOOK_SECRET
```
Paste the webhook secret when prompted.

Or in Vercel Dashboard:
- Settings → Environment Variables
- Add: `STRIPE_WEBHOOK_SECRET` = `whsec_...`
- Select: Production ✅

**Redeploy after adding webhook secret:**
```bash
vercel --prod
```

---

## ✅ STEP 10: Test Your Deployment

### 10.1 Check Pages Load

Open these URLs in your browser:

- ✅ `https://your-domain.com` - Homepage
- ✅ `https://your-domain.com/programs` - Programs list
- ✅ `https://your-domain.com/about` - About page
- ✅ `https://your-domain.com/admin` - Should redirect to login

### 10.2 Check Browser Console

1. Open browser DevTools (F12 or right-click → Inspect)
2. Go to **Console** tab
3. Look for errors (red text)
4. Should see no Firebase or API errors

### 10.3 Test Webhook (Optional)

```bash
# Install Stripe CLI
brew install stripe/stripe-brew/stripe

# Login
stripe login

# Forward events to your local server
stripe listen --forward-to https://your-domain.com/api/webhook/stripe

# In another terminal, trigger a test event
stripe trigger checkout.session.completed
```

Check Vercel logs to see if webhook was received.

---

## ✅ STEP 11: Create Test Content

### 11.1 Create a Test Program

1. Go to `https://your-domain.com/admin/programs/create`
2. Fill in the form:
   - Title: "Test Program"
   - Description: "This is a test"
   - Price: 10.00
   - Published: ✅ Yes
3. Click **"Create Program"**

### 11.2 Test Purchase Flow

1. Go to `https://your-domain.com/programs`
2. Click on your test program
3. Click **"Enroll Now"** or **"Purchase"**
4. Should redirect to Stripe checkout
5. Use test card: `4242 4242 4242 4242`
   - Expiry: Any future date (e.g., 12/34)
   - CVC: Any 3 digits (e.g., 123)
   - ZIP: 12345
6. Complete payment
7. Check Firestore → `enrollments` collection
8. Should see new enrollment document

---

## ✅ STEP 12: Monitor Your Deployment

### Check Vercel Logs:
```bash
vercel logs --follow
```

### Check Stripe Dashboard:
- [Payments](https://dashboard.stripe.com/test/payments) - See test payments
- [Webhooks](https://dashboard.stripe.com/test/webhooks) - Check webhook delivery

### Check Firestore:
- [Database](https://console.firebase.google.com/project/_/firestore) - Verify data is being written

---

## 🎯 WHEN READY FOR PRODUCTION (Real Payments)

### Switch to Stripe Live Mode:

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Toggle from **"Test mode"** to **"Live mode"** (top right)
3. Go to [API Keys](https://dashboard.stripe.com/apikeys)
4. Copy **live** keys:
   - Publishable key (`pk_live_...`)
   - Secret key (`sk_live_...`)
5. Go to [Webhooks](https://dashboard.stripe.com/webhooks)
6. Create new webhook for LIVE mode with same URL
7. Copy live webhook secret (`whsec_...`)

### Update Environment Variables in Vercel:

```bash
vercel env add STRIPE_SECRET_KEY production
# Paste your sk_live_... key

vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY production
# Paste your pk_live_... key

vercel env add STRIPE_WEBHOOK_SECRET production
# Paste your live whsec_... key
```

### Redeploy:
```bash
vercel --prod
```

**Test with a small real payment first!**

---

## 🚨 Troubleshooting

### Build fails on Vercel
```bash
# Check locally first
npm run build

# If it works locally, check Vercel build logs
vercel logs
```

### "Permission denied" in Firestore
```bash
# Redeploy security rules
firebase deploy --only firestore:rules
```

### Webhook not receiving events
1. Check webhook URL is correct in Stripe
2. Verify webhook secret in environment variables
3. Check Stripe webhook logs for delivery attempts
4. Ensure endpoint is publicly accessible

### Admin page redirects immediately
1. Make sure user has `role: "admin"` in Firestore users collection
2. Clear browser cookies and cache
3. Check browser console for errors

---

## ✅ Deployment Complete!

Your app is now live at: `https://your-domain.com`

### What's Working:
- ✅ Program browsing and creation
- ✅ Stripe checkout with tax calculation
- ✅ Webhook handling
- ✅ Admin dashboard
- ✅ Security rules

### Next Steps (Optional):
- [ ] Set up user authentication (Firebase Auth)
- [ ] Add lesson content and video player
- [ ] Set up email notifications
- [ ] Add analytics tracking
- [ ] Configure custom email domain

---

## 📞 Need Help?

Check these files for more details:
- [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) - Full technical guide
- [PRODUCTION_LAUNCH_CHECKLIST.md](PRODUCTION_LAUNCH_CHECKLIST.md) - Pre-launch checklist
- [DEPLOY_NOW.md](DEPLOY_NOW.md) - Quick deployment reference
