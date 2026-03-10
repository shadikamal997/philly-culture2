# Production Launch Checklist

## 🚀 Pre-Launch Checklist

### Environment Configuration
- [ ] Set `NODE_ENV=production` in deployment platform
- [ ] Configure production Firebase project
- [ ] Add `STRIPE_LIVE_SECRET_KEY` to environment variables
- [ ] Add `pk_live_...` Stripe publishable key
- [ ] Update `NEXT_PUBLIC_SITE_URL` to production domain
- [ ] Verify all Firebase env vars are production values
- [ ] Check `.env.production` is NOT committed to git

### Stripe Configuration
- [ ] Create production Stripe webhook endpoint
- [ ] Configure webhook URL: `https://yourdomain.com/api/webhook/stripe`
- [ ] Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`
- [ ] Copy production webhook secret to env vars
- [ ] Test webhook with Stripe test mode first
- [ ] Verify webhook signature verification works
- [ ] Disable test mode and enable live mode when ready

### Firebase Setup
- [ ] Deploy Firestore security rules to production
- [ ] Create compound indexes for queries:
  - `orders`: `(status, createdAt desc)`
  - `users`: `(role, createdAt desc)`
- [ ] Verify Admin SDK service account has proper permissions
- [ ] Test authentication flows in production
- [ ] Enable email verification in Firebase Console
- [ ] Configure authorized domains for auth

### Database Collections
- [ ] Verify `users` collection structure
- [ ] Verify `courses` collection structure
- [ ] Verify `products` collection structure (if using tools/products)
- [ ] Verify `orders` collection structure
- [ ] Create `webhookEvents` collection (auto-created on first webhook)
- [ ] Set up `analytics` collection (optional, for aggregation)

### Security
- [ ] Review Firestore security rules
- [ ] Test owner/assistant/customer role restrictions
- [ ] Verify checkout validation works
- [ ] Test webhook idempotency
- [ ] Check for exposed API keys in client code
- [ ] Enable HTTPS redirect
- [ ] Configure CORS if needed

### Performance
- [ ] Run production build: `npm run build`
- [ ] Check bundle size (should be <500KB for main bundle)
- [ ] Verify images are optimized
- [ ] Test loading skeletons appear correctly
- [ ] Check pagination works for large datasets
- [ ] Monitor Firestore read/write costs in dev mode first

### Testing (Use Stripe Test Mode First!)
- [ ] Registration flow
- [ ] Login/logout
- [ ] Password reset
- [ ] Course purchase (test card: 4242 4242 4242 4242)
- [ ] Product purchase
- [ ] Tax calculation accuracy
- [ ] Inventory deduction
- [ ] Order confirmation emails
- [ ] Dashboard access (customer, assistant, owner)
- [ ] Revenue analytics
- [ ] CSV export
- [ ] Error boundaries (trigger intentional errors)
- [ ] Mobile responsiveness
- [ ] Dark mode

### Content
- [ ] Add at least 3-5 published courses
- [ ] Add product inventory
- [ ] Set product images
- [ ] Configure pricing
- [ ] Write course descriptions
- [ ] Add owner account
- [ ] Test assistant account creation

### Monitoring & Analytics
- [ ] Set up error monitoring (Sentry, LogRocket)
- [ ] Configure Google Analytics (optional)
- [ ] Set up uptime monitoring (UptimeRobot, etc.)
- [ ] Enable Stripe Dashboard notifications
- [ ] Configure Firebase email alerts for quota limits

### Legal & Compliance
- [ ] Privacy Policy page
- [ ] Terms of Service page
- [ ] Cookie consent (if tracking users)
- [ ] GDPR compliance (if EU users)
- [ ] Tax collection compliance
- [ ] Return/refund policy

---

## 🎯 Launch Day

### Final Checks
- [ ] Disable Stripe test mode, enable LIVE mode
- [ ] Update webhook from test to production endpoint
- [ ] Verify production domain is live
- [ ] Test one real purchase with small amount
- [ ] Check webhook received and processed
- [ ] Verify order appears in dashboard
- [ ] Confirm email notifications sent
- [ ] Check inventory updated correctly

### Communication
- [ ] Announce launch to stakeholders
- [ ] Prepare customer support channels
- [ ] Share owner/admin credentials securely
- [ ] Document any known issues
- [ ] Set expectations for response times

---

## 📊 Post-Launch (First 24 Hours)

### Monitoring
- [ ] Monitor Stripe Dashboard for payments
- [ ] Check Firestore usage/costs
- [ ] Review error logs
- [ ] Watch for failed webhooks
- [ ] Monitor email delivery rates
- [ ] Check application performance

### Support
- [ ] Respond to user questions promptly
- [ ] Document common issues
- [ ] Fix critical bugs immediately
- [ ] Plan hotfix releases if needed

### Analytics
- [ ] Track conversion rates
- [ ] Monitor cart abandonment
- [ ] Check average order value
- [ ] Review most popular products
- [ ] Analyze traffic sources

---

## 🔧 Rollback Plan

If critical issues arise:

1. **Disable new orders:**
   - Redirect `/checkout` to maintenance page
   - Or set all products to `status: 'inactive'`

2. **Stripe:**
   - Switch back to test mode temporarily
   - Pause webhook processing

3. **Database:**
   - Firestore allows point-in-time recovery
   - Export critical collections before major changes

4. **Deployment:**
   - Most platforms (Vercel) allow instant rollback
   - Keep previous deployment active for fast revert

---

## ✅ Success Indicators

Your launch is successful if:
- ✅ Users can register and login
- ✅ Payments process correctly
- ✅ Webhooks are received and processed
- ✅ Orders appear in owner dashboard
- ✅ Email confirmations sent
- ✅ No critical errors in logs
- ✅ Performance is acceptable (<3s page loads)
- ✅ Mobile experience is smooth

---

## 📞 Emergency Contacts

Keep these handy:
- Stripe Support: dashboard.stripe.com/support
- Firebase Support: firebase.google.com/support
- Deployment Platform Support (Vercel, etc.)
- Your team contact info

---

## 🎉 You're Ready to Launch!

This checklist ensures a smooth, professional production deployment. Take your time with each step, and don't rush. A careful launch prevents headaches later.

**Good luck! 🚀**
