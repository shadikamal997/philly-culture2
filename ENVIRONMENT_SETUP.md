# Environment Configuration Guide

## Environment Variables Setup

### Development (.env.local)
```env
# Firebase Development
NEXT_PUBLIC_FIREBASE_API_KEY=your_dev_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-dev-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-dev-project
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-dev-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_dev_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_dev_app_id

# Firebase Admin (Development)
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-dev-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Stripe Test Keys
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Site URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Node Environment
NODE_ENV=development
```

### Production (.env.production)
```env
# Firebase Production
NEXT_PUBLIC_FIREBASE_API_KEY=your_prod_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-prod-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-prod-project
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-prod-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_prod_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_prod_app_id

# Firebase Admin (Production)
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-prod-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Stripe LIVE Keys (Production Only)
STRIPE_LIVE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_... (production webhook secret)

# Fallback Test Key (Optional)
STRIPE_SECRET_KEY=sk_test_... (fallback if live key not set)

# Site URL
NEXT_PUBLIC_SITE_URL=https://your-domain.com

# Node Environment
NODE_ENV=production
```

## Environment Detection

The system automatically uses the correct Stripe key based on `NODE_ENV`:

- **Development**: Uses `STRIPE_SECRET_KEY` (test mode)
- **Production**: Uses `STRIPE_LIVE_SECRET_KEY` (live mode)

## Stripe Webhook Configuration

### Development
1. Use Stripe CLI for local testing:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhook/stripe
   ```
2. Copy the webhook signing secret to `STRIPE_WEBHOOK_SECRET`

### Production
1. Go to Stripe Dashboard → Webhooks
2. Add endpoint: `https://your-domain.com/api/webhook/stripe`
3. Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`
4. Copy the webhook signing secret to production env vars

## Deployment Checklist

Before deploying to production:

- [ ] Set `NODE_ENV=production`
- [ ] Configure production Firebase project
- [ ] Add Stripe LIVE keys (`STRIPE_LIVE_SECRET_KEY`, `pk_live_...`)
- [ ] Update `NEXT_PUBLIC_SITE_URL` to production domain
- [ ] Configure production Stripe webhook
- [ ] Test Stripe webhook signature verification
- [ ] Verify Firestore security rules are deployed
- [ ] Enable Firestore indexes for queries
- [ ] Set up error monitoring (Sentry, LogRocket, etc.)
- [ ] Configure rate limiting (if using Upstash)
- [ ] Test auth flows in production
- [ ] Verify email service configuration

## Security Best Practices

1. **Never commit `.env.local` or `.env.production`** to version control
2. Add to `.gitignore`:
   ```
   .env.local
   .env.production
   .env*.local
   ```
3. Use your deployment platform's environment variables UI (Vercel, Netlify, etc.)
4. Rotate keys regularly
5. Use different Firebase projects for dev/staging/prod
6. Monitor for suspicious activity in Stripe Dashboard

## Vercel Deployment

Set environment variables in Vercel dashboard:

1. Go to Project → Settings → Environment Variables
2. Add all production variables
3. Select "Production" environment
4. Redeploy to apply changes

## Testing Production Locally

To test production build locally:

```bash
# Build production version
npm run build

# Start production server
npm start
```

Ensure `.env.production` is configured correctly.
