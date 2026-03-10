# Production Deployment Guide

## Pre-Deployment Checklist

### 1. Environment Variables Setup

Create production environment variables in Vercel:

```bash
# Firebase Client (Public - safe to expose)
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-app.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123

# Firebase Admin (Server-side SECRET)
FIREBASE_ADMIN_PROJECT_ID=your-project-id
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Stripe LIVE Keys (Production)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_LIVE_KEY
STRIPE_SECRET_KEY=sk_live_YOUR_LIVE_SECRET
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET

# App Configuration
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NODE_ENV=production
```

### 2. Firebase Setup

#### A. Firestore Security Rules

Deploy security rules to production:

```bash
firebase deploy --only firestore:rules
```

Example rules (already in `firestore.rules`):
- Public read on `programs` collection
- Authenticated write on `enrollments` for own user
- Admin-only writes on `adminLogs`

#### B. Firestore Indexes

Create indexes for queries:

```bash
firebase deploy --only firestore:indexes
```

Required indexes:
- `enrollments`: `userEmail` (ascending), `programId` (ascending)
- `enrollments`: `status` (ascending), `createdAt` (descending)
- `programs`: `published` (ascending), `createdAt` (descending)

#### C. Firebase Admin Custom Claims

Set admin role for your user:

```javascript
// Run this once in Firebase Functions or Node.js script
const admin = require('firebase-admin');
admin.auth().setCustomUserClaims('USER_UID', { role: 'admin' });
```

### 3. Stripe Configuration

#### A. Switch to Live Mode

In Stripe Dashboard:
1. Toggle to "Live mode" (top right)
2. Get live API keys from Developers → API keys
3. Update environment variables with live keys

#### B. Enable Automatic Tax

1. Go to Stripe Dashboard → Settings → Tax
2. Enable "Automatic tax collection"
3. Select "Digital goods" as product type
4. Add US states where you want to collect tax

#### C. Create Production Webhook

1. Go to Developers → Webhooks
2. Click "Add endpoint"
3. Enter: `https://yourdomain.com/api/v1/webhook`
4. Select events: `checkout.session.completed`
5. Copy webhook signing secret to `STRIPE_WEBHOOK_SECRET`

#### D. Test Webhook Delivery

```bash
# Listen to Stripe events locally
stripe listen --forward-to localhost:3000/api/v1/webhook

# Trigger test event
stripe trigger checkout.session.completed
```

### 4. Deployment to Vercel

#### A. Connect Repository

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link project
vercel link

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

#### B. Configure Vercel Project

In Vercel Dashboard:
1. Go to Project Settings
2. Environment Variables → Add all production env vars
3. Build & Development Settings:
   - Framework Preset: Next.js
   - Root Directory: ./
   - Build Command: `npm run build`
   - Output Directory: .next

#### C. Custom Domain

1. Go to Project Settings → Domains
2. Add your custom domain
3. Update DNS records (Vercel provides instructions)
4. Wait for SSL certificate (automatic)

### 5. Post-Deployment Testing

#### Test Critical Flows

```bash
# Homepage loads
curl https://yourdomain.com

# Admin requires auth
curl https://yourdomain.com/admin
# Should redirect to /login

# Webhook endpoint
curl -X POST https://yourdomain.com/api/v1/webhook
# Should return 400 (no signature)
```

#### Test Payment Flow

1. Create test program with $1 price
2. Go through checkout process
3. Use Stripe test card: `4242 4242 4242 4242`
4. Verify enrollment created in Firestore
5. Check webhook logs in Vercel
6. Verify tax calculated correctly

#### Test Admin Functions

1. Login as admin
2. Navigate to `/admin`
3. Verify all dashboards load
4. Test refund on test enrollment
5. Export tax CSV
6. Check audit logs

### 6. Monitoring Setup

#### A. Vercel Analytics (Built-in)

Already included in Vercel Pro plan:
- Real-time analytics
- Web Vitals monitoring
- Deployment logs

#### B. Stripe Monitoring

Configure alerts in Stripe Dashboard:
- Failed payments
- Webhook failures
- Unusual activity

#### C. Error Tracking (Optional: Sentry)

```bash
npm install @sentry/nextjs

# Initialize
npx @sentry/wizard@latest -i nextjs
```

Add to `sentry.config.js`:
```javascript
Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});
```

### 7. Backup Strategy

#### A. Firestore Daily Backups

Enable in Firebase Console:
- Go to Firestore → Settings
- Enable "Automated backups"
- Set retention: 30 days

#### B. Export Data Manually

```bash
# Export Firestore data
gcloud firestore export gs://your-bucket/backups

# Import Firestore data
gcloud firestore import gs://your-bucket/backups/[TIMESTAMP]
```

#### C. Stripe Data Export

In Stripe Dashboard:
- Reports → Data export
- Schedule daily exports
- Store in secure location

## Common Issues & Solutions

### Issue: Webhook Not Receiving Events

**Solution:**
1. Check webhook URL is correct
2. Verify webhook secret in env vars
3. Check Stripe Dashboard → Webhooks → Event logs
4. Ensure endpoint is publicly accessible
5. Check Vercel function logs

### Issue: Admin Routes Not Protected

**Solution:**
1. Verify middleware.ts is deployed
2. Check Firebase Admin SDK initialized
3. Verify user has `role: 'admin'` in Firestore
4. Check cookie `__session` is set

### Issue: Tax Not Calculating

**Solution:**
1. Verify Stripe automatic tax is enabled
2. Check `automatic_tax: { enabled: true }` in checkout
3. Verify tax code `txcd_10000000` (digital goods)
4. Test with different states
5. Check Stripe Dashboard → Tax settings

### Issue: Build Fails on Vercel

**Solution:**
1. Run `npm run build` locally first
2. Check TypeScript errors: `npm run type-check`
3. Verify all env vars are set in Vercel
4. Check Vercel build logs for specific error
5. Ensure Node.js version matches (recommended: 20.x)

### Issue: Database Connection Errors

**Solution:**
1. Verify Firebase config in env vars
2. Check Firebase Admin credentials
3. Ensure Firestore is enabled in Firebase Console
4. Check security rules allow access
5. Verify IP allowlist (if configured)

## Performance Optimization

### Image Optimization

Use Next.js Image component:

```tsx
import Image from 'next/image';

<Image
  src="/program-thumbnail.jpg"
  alt="Program"
  width={600}
  height={400}
  priority // For above-the-fold images
/>
```

### Caching Strategy

Add to page components:

```tsx
// app/programs/page.tsx
export const revalidate = 60; // Revalidate every 60 seconds
```

### Font Optimization

Already configured in `layout.tsx` with `next/font`.

## Security Best Practices

### 1. Keep Secrets Secret
- Never commit `.env.local` to Git
- Use Vercel environment variables UI
- Rotate API keys quarterly

### 2. Monitor Admin Access
- Check audit logs weekly
- Review admin user list monthly
- Disable unused admin accounts

### 3. Rate Limiting
- Already implemented for critical endpoints
- Monitor rate limit logs
- Adjust limits based on traffic

### 4. Regular Updates
- Update dependencies monthly: `npm update`
- Check for security alerts: `npm audit`
- Update Stripe/Firebase SDKs

## Maintenance Schedule

### Daily
- [ ] Monitor error logs
- [ ] Check webhook success rate
- [ ] Review new enrollments

### Weekly
- [ ] Export tax data
- [ ] Review admin actions
- [ ] Check performance metrics

### Monthly
- [ ] Update dependencies
- [ ] Review Firestore usage
- [ ] Analyze analytics data
- [ ] Test critical flows

### Quarterly
- [ ] Full security audit
- [ ] Rotate API keys
- [ ] Review pricing strategy
- [ ] Update content

## Support & Documentation

### User Documentation
- Student help center: `/help`
- Video tutorials (recommended)
- Email support: support@yourdomain.com

### Admin Documentation
- Admin guide: `ADMIN_GUIDE.md`
- API documentation: `API_DOCS.md`
- Troubleshooting: See this guide

## Rollback Plan

If critical issues occur:

```bash
# Revert to previous deployment
vercel rollback

# Check deployment history
vercel list

# Deploy specific version
vercel --prod [DEPLOYMENT_URL]
```

## Success Metrics

Track these KPIs:

- Conversion rate (visitors → purchases)
- Average order value
- Student completion rate
- Certificate issuance rate
- Support ticket volume
- Page load time (target: < 2s)
- Error rate (target: < 0.1%)

## Next Steps After Launch

1. **Week 1**: Monitor closely, fix bugs
2. **Week 2-4**: Collect user feedback
3. **Month 2**: Analyze data, optimize
4. **Month 3**: Plan new features

---

**Need Help?**
- Vercel Support: https://vercel.com/support
- Stripe Support: https://support.stripe.com
- Firebase Support: https://firebase.google.com/support

**Emergency Contact**: [Your contact info]
