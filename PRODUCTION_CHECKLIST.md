/**
 * PRODUCTION LAUNCH CHECKLIST
 * 
 * Complete this checklist before deploying to production
 */

## 🔒 SECURITY

### Authentication & Authorization
- [ ] Admin routes protected with Firebase Auth + role verification
- [ ] All `/admin` routes redirect unauthenticated users to login
- [ ] Server-side token verification in all admin API routes
- [ ] Session cookies are httpOnly and secure
- [ ] CORS configured correctly (if using external API calls)

### API Security
- [ ] Stripe webhook signature verification enabled
- [ ] Rate limiting configured on all critical endpoints
- [ ] Refund API requires admin authentication
- [ ] No sensitive data exposed in client-side code
- [ ] Environment variables validated on startup

### Data Protection
- [ ] Firestore security rules deployed
- [ ] Storage security rules deployed (if using Firebase Storage)
- [ ] User data encrypted in transit (HTTPS)
- [ ] No API keys in client bundle (only NEXT_PUBLIC_* vars)

## 💳 STRIPE CONFIGURATION

### Live Mode Setup
- [ ] Switched from test keys to live keys
- [ ] `STRIPE_SECRET_KEY` is live key (starts with `sk_live_`)
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is live key (starts with `pk_live_`)
- [ ] `STRIPE_WEBHOOK_SECRET` is from live webhook endpoint
- [ ] Automatic tax enabled in live mode
- [ ] Digital goods tax code configured (`txcd_10000000`)

### Webhook Configuration
- [ ] Production webhook endpoint registered in Stripe dashboard
- [ ] Webhook signing secret added to environment variables
- [ ] Test webhook delivery in Stripe dashboard
- [ ] Idempotency keys implemented (webhookEvents collection)
- [ ] Webhook failure alerts configured

### Tax Compliance
- [ ] Tested tax calculation for CA, TX, FL, NY
- [ ] Tax amount stored in enrollments
- [ ] Tax CSV export working for accountant
- [ ] Billing address collection enabled
- [ ] Tax reporting dashboard accessible

## 🔥 FIREBASE CONFIGURATION

### Firestore
- [ ] Security rules deployed to production
- [ ] Indexes created for all queries
- [ ] Collections: programs, enrollments, users, adminLogs, webhookEvents
- [ ] Firestore daily backup enabled
- [ ] Firestore emulator tested (optional)

### Firebase Auth
- [ ] Production Firebase project created
- [ ] Email/password auth enabled
- [ ] Custom claims configured for admin role
- [ ] Password reset emails configured
- [ ] Auth domain configured

### Admin SDK
- [ ] Service account created
- [ ] Private key added to environment variables
- [ ] Admin SDK initialized server-side only
- [ ] Service account has correct permissions

## 🌐 DEPLOYMENT (Vercel)

### Environment Variables
- [ ] All env vars added to Vercel project settings
- [ ] Production and preview environments configured separately
- [ ] Secrets not committed to Git (.env.local in .gitignore)
- [ ] Environment validation script runs on build

### Domain & SSL
- [ ] Custom domain connected
- [ ] SSL certificate active (automatic with Vercel)
- [ ] DNS configured correctly
- [ ] www redirect configured (if needed)

### Build Configuration
- [ ] Build succeeds without errors
- [ ] `npm run build` passes locally
- [ ] TypeScript compilation successful
- [ ] No console errors in production build
- [ ] Next.js config optimized (caching, image optimization)

## 📊 MONITORING & LOGGING

### Error Tracking
- [ ] Sentry installed (optional but recommended)
- [ ] Error boundaries catch React errors
- [ ] API errors logged with context
- [ ] Webhook failures logged
- [ ] Admin actions logged to audit trail

### Performance Monitoring
- [ ] Lighthouse score > 90
- [ ] Core Web Vitals passing
- [ ] Images optimized (using next/image)
- [ ] Fonts optimized
- [ ] JavaScript bundle size optimized

### Alerts
- [ ] Stripe webhook failure alerts
- [ ] Payment failure notifications
- [ ] Critical error notifications
- [ ] Downtime monitoring (e.g., UptimeRobot)

## 🎨 CONTENT & UX

### Program Content
- [ ] All programs have proper metadata
- [ ] Images optimized and uploaded
- [ ] Pricing correct
- [ ] Program descriptions complete
- [ ] Lessons structured correctly

### Pages
- [ ] Terms of Service page live
- [ ] Privacy Policy page live
- [ ] Refund policy documented
- [ ] Contact page working
- [ ] About page complete

### SEO
- [ ] Meta tags on all pages
- [ ] Open Graph images configured
- [ ] Sitemap.xml generated
- [ ] Robots.txt configured
- [ ] Structured data (Course schema) added

## ✅ FUNCTIONALITY TESTING

### User Flows
- [ ] User can register account
- [ ] User can log in
- [ ] User can browse programs
- [ ] User can purchase program (test with $1 product)
- [ ] Enrollment created successfully
- [ ] Tax calculated correctly
- [ ] User can access purchased program
- [ ] Lesson unlock logic works
- [ ] Progress tracking works
- [ ] Certificate generation works

### Admin Flows
- [ ] Admin can log in
- [ ] Admin dashboard loads with real data
- [ ] Admin can view orders
- [ ] Admin can process refunds
- [ ] Admin can view students
- [ ] Admin can manage cohorts
- [ ] Tax dashboard exports CSV correctly
- [ ] Analytics dashboard shows metrics

### Edge Cases
- [ ] Duplicate purchase prevention works
- [ ] Expired access handled correctly
- [ ] Webhook retries handled (idempotency)
- [ ] 404 page displays correctly
- [ ] Error pages display correctly
- [ ] Mobile responsive

## 📝 LEGAL & COMPLIANCE

### Documentation
- [ ] Terms of Service reviewed by legal (if needed)
- [ ] Privacy Policy includes data collection details
- [ ] Cookie policy (if using analytics)
- [ ] GDPR compliance (if targeting EU)
- [ ] Accessibility statement (WCAG 2.1 AA)

### Tax Compliance
- [ ] Sales tax collection enabled
- [ ] Tax reporting process documented
- [ ] Accountant has access to CSV exports
- [ ] IRS filing process understood

## 🚀 LAUNCH DAY

### Pre-Launch
- [ ] Full backup of Firestore
- [ ] DNS TTL reduced (for quick rollback)
- [ ] Rollback plan documented
- [ ] Team notified of launch

### Post-Launch
- [ ] Monitor error logs for 24 hours
- [ ] Test critical flows in production
- [ ] Verify webhook delivery
- [ ] Check Stripe dashboard for payments
- [ ] Monitor performance metrics

## 📞 SUPPORT READINESS

### Contact
- [ ] Support email configured
- [ ] Contact form working
- [ ] Response time SLA defined
- [ ] FAQ page created

### Documentation
- [ ] Student help center
- [ ] Admin documentation
- [ ] Troubleshooting guide
- [ ] Video tutorials (optional)

---

## ENVIRONMENT VARIABLES CHECKLIST

### Required for Production
```bash
# Firebase Client (Public)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Firebase Admin (Server - SECRET)
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=

# Stripe (Test or Live)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# App Config
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NODE_ENV=production
```

### Verification Commands
```bash
# Build check
npm run build

# Type check
npx tsc --noEmit

# Environment validation
# (Add to package.json: "validate-env": "node -e 'require(\"./lib/envValidation\").enforceRequiredEnv()'")

# Test webhook locally
stripe listen --forward-to localhost:3000/api/v1/webhook

# Deploy to Vercel
vercel --prod
```

---

**IMPORTANT**: Do NOT deploy until all critical items are checked.
Contact your team lead if any items are unclear.
