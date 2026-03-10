# Phase 6 Quick Reference - Production Hardening

## 🎯 What Changed

### Security Improvements
✅ **Admin APIs now require authentication** - Refund API secured
✅ **Rate limiting added** - Checkout limited to 5/min per IP
✅ **Webhook idempotency** - Duplicate events prevented with `webhookEvents` collection
✅ **Admin routes protected** - Middleware redirects unauthenticated access

### New Security Files
- `lib/adminAuth.ts` - Admin verification utilities
- `lib/envValidation.ts` - Environment variable validation
- `scripts/validate-env.js` - Pre-build environment check

### Error Handling
- `app/admin/error.tsx` - Admin error boundary  
- `app/(public)/academy/error.tsx` - Programs error boundary

### Documentation
- `PRODUCTION_CHECKLIST.md` - Pre-launch checklist
- `DEPLOYMENT_GUIDE.md` - Step-by-step deployment
- `lib/metadata.ts` - SEO helpers

## 🔧 New Scripts

```bash
# Validate environment variables
npm run validate-env

# Type check
npm run type-check

# Build (runs validation automatically)
npm run build
```

## 🚀 Quick Deployment

### 1. Local Test
```bash
npm run validate-env
npm run build
```

### 2. Set Environment Variables in Vercel

**Firebase Client (Public)**
```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
```

**Firebase Admin (Secret)**
```
FIREBASE_ADMIN_PROJECT_ID
FIREBASE_ADMIN_CLIENT_EMAIL
FIREBASE_ADMIN_PRIVATE_KEY
```

**Stripe (Live Mode)**
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 3. Deploy
```bash
vercel --prod
```

### 4. Test Production
- ✅ Admin login works
- ✅ Checkout works (test with $1)
- ✅ Tax calculates
- ✅ Webhook receives events
- ✅ Refund works

## 🔒 Security Checklist

- [ ] Admin routes redirect to login
- [ ] Refund API requires admin token
- [ ] Checkout rate limited
- [ ] Webhook signature verified
- [ ] All secrets in environment variables
- [ ] Firebase rules deployed

## 📊 Monitoring

### Check Webhook Status
Stripe Dashboard → Webhooks → Event logs

### Check Error Logs
Vercel Dashboard → Logs → Search for "error"

### Check Admin Actions
Admin Dashboard → Audit Logs

## 🆘 Troubleshooting

**Webhook not working?**
- Check webhook secret in Vercel env vars
- Verify endpoint URL: `https://yourdomain.com/api/v1/webhook`
- Check Stripe Dashboard → Webhooks → Test

**Admin can't access?**
- Verify user has `role: 'admin'` in Firestore `users` collection
- Check `__session` cookie exists
- Verify Firebase Admin credentials

**Build fails?**
```bash
# Check locally
npm run validate-env
npm run type-check
npm run build
```

## 📚 Documentation

- **Full Deployment Guide**: `DEPLOYMENT_GUIDE.md`
- **Complete Checklist**: `PRODUCTION_CHECKLIST.md`
- **Phase 6 Summary**: `PHASE_6_SUMMARY.md`

## ✅ Production Ready!

Your academy now has:
- 🔒 Enterprise-grade security
- ⚡ Rate limiting protection
- 🛡️ Error boundaries
- 📝 Audit logging
- 🚀 Deploy-ready configuration
- 📊 SEO optimization
- 📖 Complete documentation

**Next**: See `DEPLOYMENT_GUIDE.md` for step-by-step launch instructions!
