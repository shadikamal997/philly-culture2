# PHASE 4 QUICK REFERENCE
## Stripe Webhook Setup & Environment Variables

---

## 🔑 **Environment Variables Required**

Add these to your `.env.local` file:

```bash
# ═══════════════════════════════════════════════════════
# STRIPE CONFIGURATION
# ═══════════════════════════════════════════════════════

# Get from: https://dashboard.stripe.com/test/apikeys
STRIPE_SECRET_KEY=your_stripe_test_secret_key_from_dashboard

# Get from: https://dashboard.stripe.com/test/apikeys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_test_publishable_key_from_dashboard

# Get after setting up webhook endpoint (see below)
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret_from_dashboard

# ═══════════════════════════════════════════════════════
# SITE CONFIGURATION
# ═══════════════════════════════════════════════════════

# Development
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Production
# NEXT_PUBLIC_SITE_URL=https://your-production-domain.com

# ═══════════════════════════════════════════════════════
# OWNER CONFIGURATION
# ═══════════════════════════════════════════════════════

NEXT_PUBLIC_OWNER_EMAIL=your-email@example.com
```

---

## 🎯 **Local Development Setup (Stripe CLI)**

### **Step 1: Install Stripe CLI**

**macOS:**
```bash
brew install stripe/stripe-cli/stripe
```

**Windows:**
Download from: https://github.com/stripe/stripe-cli/releases

**Linux:**
```bash
wget https://github.com/stripe/stripe-cli/releases/latest/download/stripe_linux_x86_64.tar.gz
tar -xvf stripe_linux_x86_64.tar.gz
sudo mv stripe /usr/local/bin/
```

### **Step 2: Login to Stripe**

```bash
stripe login
```

This opens your browser to authenticate. Copy the pairing code shown in terminal.

### **Step 3: Start Webhook Listener**

```bash
stripe listen --forward-to localhost:3000/api/webhook/stripe
```

**Expected Output:**
```
> Ready! You are using Stripe API Version [2026-02-25]. Your webhook signing secret is whsec_abc123xyz...
```

### **Step 4: Copy Webhook Secret**

Copy the `whsec_...` value from the output above.

### **Step 5: Update .env.local**

```bash
STRIPE_WEBHOOK_SECRET=whsec_abc123xyz... # Paste the value from Step 4
```

### **Step 6: Restart Dev Server**

```bash
npm run dev
```

---

## 🚀 **Production Setup (Stripe Dashboard)**

### **Step 1: Create Webhook Endpoint**

1. Go to: https://dashboard.stripe.com/webhooks
2. Click **"Add endpoint"**
3. Enter endpoint URL:
   ```
   https://your-production-domain.com/api/webhook/stripe
   ```

### **Step 2: Select Events**

Select these events to listen to:
- ✅ `payment_intent.succeeded`
- ✅ `payment_intent.payment_failed`

### **Step 3: Copy Signing Secret**

After creating the endpoint:
1. Click on the newly created endpoint
2. Click **"Reveal"** in the "Signing secret" section
3. Copy the `whsec_...` value

### **Step 4: Update Production Environment Variables**

Add to your production environment (Vercel, Netlify, etc.):

```bash
STRIPE_WEBHOOK_SECRET=your_production_webhook_secret
STRIPE_SECRET_KEY=your_stripe_live_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_live_publishable_key
NEXT_PUBLIC_SITE_URL=https://your-production-domain.com
```

---

## 🧪 **Testing Stripe Webhooks**

### **Test Local Webhook**

In a separate terminal, trigger a test webhook:

```bash
stripe trigger payment_intent.succeeded
```

**Expected in dev server logs:**
```
✅ Created order abc123 for user user_xyz
✅ Unlocked course course-123 for user user_xyz
✅ Reduced inventory for tool tool-456 by 2 (10 → 8)
✅ Sent enrollment email for course course-123
✅ Sent confirmation email for order abc123
```

### **Test Failed Payment**

```bash
stripe trigger payment_intent.payment_failed
```

**Expected:**
```
❌ Payment failed for PaymentIntent pi_xyz: card_declined
```

---

## 🔍 **Debugging Common Issues**

### **Issue: "Webhook signature verification failed"**

**Cause:** Mismatch between `STRIPE_WEBHOOK_SECRET` and actual secret

**Fix:**
1. Stop dev server
2. Stop Stripe CLI listener
3. Restart Stripe CLI: `stripe listen --forward-to localhost:3000/api/webhook/stripe`
4. Copy new webhook secret (changes each time)
5. Update `.env.local` with new secret
6. Restart dev server

### **Issue: "No webhook events received"**

**Cause:** Stripe CLI not forwarding or wrong URL

**Fix:**
1. Verify Stripe CLI is running and shows "Ready!"
2. Check URL matches: `localhost:3000/api/webhook/stripe`
3. Test with: `stripe trigger payment_intent.succeeded`

### **Issue: "Order not created after payment"**

**Cause:** Webhook handler error or not configured

**Fix:**
1. Check webhook logs in terminal
2. Verify `STRIPE_WEBHOOK_SECRET` is set
3. Check Stripe Dashboard → Webhooks → Event logs
4. Look for errors in server logs

### **Issue: "Inventory not deducting"**

**Cause:** Wrong collection name or Firestore rules

**Fix:**
1. Verify collection is `tools` (not `products`)
2. Check Firestore rules allow server writes
3. Look for transaction errors in webhook logs

---

## 📊 **Verifying Phase 4 Integration**

### **Complete End-to-End Test**

**Prerequisites:**
- [ ] Dev server running (`npm run dev`)
- [ ] Stripe CLI listening (`stripe listen --forward-to ...`)
- [ ] `.env.local` has all required variables
- [ ] Test course and tool created in Firestore

**Steps:**

1. **Create Test Products:**
   ```typescript
   // Course: $100, taxable: true, status: 'published'
   // Tool: $50, inventory: 10, taxable: true
   ```

2. **Add to Cart & Checkout:**
   - Login as customer
   - Add course and tool to cart
   - Enter shipping address (state: TX)
   - Click checkout

3. **Complete Payment:**
   - Use test card: `4242 4242 4242 4242`
   - Expiry: `12/34`
   - CVC: `123`
   - Click "Pay"

4. **Verify Webhook Logs:**
   ```
   ✅ payment_intent.succeeded event received
   ✅ Order created: order_abc123
   ✅ Course unlocked
   ✅ Inventory deducted: 10 → 9
   ✅ Emails sent
   ```

5. **Verify Firestore:**
   - Check `orders` collection → new order exists
   - Check order has: `taxAmount`, `taxRate`, `state`, `total`
   - Check `users/{userId}` → `purchasedCourses` includes course ID
   - Check `tools/{toolId}` → `inventory` is now 9

6. **Verify Owner Dashboard:**
   - Go to `/owner/orders`
   - See new order with correct amounts
   - Go to `/owner/revenue`
   - See updated revenue and tax stats

---

## 🎯 **Test Cards**

Use these Stripe test cards for different scenarios:

| Card Number          | Scenario                | Expected Result              |
|---------------------|-------------------------|------------------------------|
| 4242 4242 4242 4242 | Successful payment      | Payment succeeds             |
| 4000 0000 0000 0002 | Card declined           | Payment fails                |
| 4000 0000 0000 9995 | Insufficient funds      | Payment fails                |
| 4000 0000 0000 0069 | Expired card            | Payment fails                |
| 4000 0025 0000 3155 | Requires authentication | 3D Secure challenge          |

**All test cards:**
- Use any future expiry date (e.g., 12/34)
- Use any 3-digit CVC (e.g., 123)
- Use any ZIP code (e.g., 78701)

---

## 📁 **Phase 4 File Locations**

Quick reference to find Phase 4 files:

```
philly-culture-update/
├── lib/
│   └── tax.ts                          # Tax calculation engine
├── types/
│   └── firestore/
│       └── order.ts                    # Order type definitions
├── app/
│   ├── api/
│   │   ├── checkout/
│   │   │   └── route.ts                # Checkout API (PaymentIntent)
│   │   └── webhook/
│   │       └── stripe/
│   │           └── route.ts            # Webhook handler
│   └── owner/
│       ├── orders/
│       │   └── page.tsx                # Orders management page
│       └── revenue/
│           └── page.tsx                # Revenue analytics page
├── PHASE_4_SUMMARY.md                  # Implementation summary
├── PHASE_4_TESTING.md                  # Testing guide
└── PHASE_4_QUICK_REFERENCE.md          # This file
```

---

## 🎨 **Owner Dashboard URLs**

| Page     | URL              | Purpose                          |
|----------|------------------|----------------------------------|
| Orders   | `/owner/orders`  | View and manage all orders       |
| Revenue  | `/owner/revenue` | Financial analytics and tax data |
| Courses  | `/owner/courses` | Manage courses (Phase 3)         |
| Tools    | `/owner/tools`   | Manage tools (Phase 3)           |

---

## 💡 **Quick Tips**

### **Tax Testing**

Test different states to verify tax calculations:

```typescript
// Texas: 8.25%
// $100 → $8.25 tax → $108.25 total

// California: 7.25%
// $100 → $7.25 tax → $107.25 total

// Oregon: 0%
// $100 → $0 tax → $100 total
```

### **Inventory Testing**

1. Set inventory to 1
2. Try to buy quantity 2
3. Should get error: "Insufficient inventory"

### **Price Manipulation Prevention**

1. Open DevTools → Network tab
2. Intercept checkout request
3. Change item price to $1
4. Server still charges real price from Firestore ✅

### **Webhook Logs**

Check webhook activity:
- **Local:** Terminal running `stripe listen`
- **Production:** Stripe Dashboard → Webhooks → Events

---

## 🔗 **Useful Links**

- **Stripe Dashboard:** https://dashboard.stripe.com
- **Stripe Test Cards:** https://stripe.com/docs/testing
- **Stripe CLI Docs:** https://stripe.com/docs/stripe-cli
- **Webhook Events:** https://stripe.com/docs/api/events
- **PaymentIntent API:** https://stripe.com/docs/api/payment_intents

---

## ✅ **Phase 4 Completion Checklist**

- [ ] Environment variables set in `.env.local`
- [ ] Stripe CLI installed and authenticated
- [ ] Webhook listener running (`stripe listen`)
- [ ] Dev server running (`npm run dev`)
- [ ] Test course created (taxable: true)
- [ ] Test tool created (inventory: 10, taxable: true)
- [ ] Completed test purchase successfully
- [ ] Order created in Firestore
- [ ] Inventory deducted
- [ ] Course unlocked
- [ ] Dashboard shows correct data
- [ ] All Phase 4 files have 0 TypeScript errors ✅

---

**Phase 4 Complete! 🎉**

Your Philly Culture app now has a production-ready e-commerce system with US tax compliance, secure payment processing, and comprehensive order management.

**Next:** Test with real purchases in Stripe test mode, then deploy to production when ready!
