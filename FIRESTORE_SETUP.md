# Firestore Required Indexes & Cloud Functions

## ⚡ Required Indexes (`firestore.indexes.json`)

To deploy these indexes, you can define them in `firestore.indexes.json` or click the link provided in your Firebase Console when a query fails. 

Here are the composite indexes required for your query patterns:

1. **Orders Collection**: 
   - `userId` (ASCENDING), `createdAt` (DESCENDING)
   - *Why: To fetch a specific user's most recent orders quickly.*

2. **Lessons Collection**: 
   - `courseId` (ASCENDING), `order` (ASCENDING)
   - *Why: To sequentially display course contents within a specific course.*

3. **Reviews Collection**: 
   - `itemId` (ASCENDING), `createdAt` (DESCENDING)
   - *Why: To load chronological reviews for a given product or course.*

4. **Products Collection**: 
   - `category` (ASCENDING), `createdAt` (DESCENDING)
   - *Why: To list products chronologically by category filter.*

---

## 📦 Cloud Functions Architecture (`/functions/src/index.ts`)

You will need the following Firebase Cloud Functions to securely orchestrate logic avoiding client-side spoofing:

- **`stripeWebhookHandler`**: Listens to Stripe events via HTTP POST. Main entry point for processing payments.
- **`onOrderPaid`** (Firestore Trigger via `orders` update):
  - **If Digital**: Unlocks course access (`grantCourseAccess`).
  - **If Physical**: Reduces stock count (`reduceStock`).
  - **Notifications**: Triggers `sendOrderConfirmationEmail` (e.g., via trigger email extension or Nodemailer) and sends confirmation to the user.
- **`syncUserRole`** (Auth Trigger): Assigns base Custom Claims (`admin: false`) on new user signup. Creates the parent `users/uid` Firestore document seamlessly.
- **`sendShippingUpdateEmail`** (Firestore Trigger via `orders` update): Watches for `status` changes to 'shipped' ensuring Tracking Number details are securely pushed to the customer inbox.

---

## 🚀 Stripe Webhook Security Flow
1. User clicks Checkout -> `createsCheckoutSession` (Next.js `/api/create-checkout-session` endpoint using Stripe Admin SDK).
2. Order created with `status: "pending"`.
3. Checkout completes -> Stripe calls Firebase Node.js webhook (`/api/webhook/stripe` or Firebase Cloud Http Function).
4. Webhook strictly validates the payload signature.
5. If valid & successful -> Cloud function mutates the Firestore Order to `paid` unlocking downstream triggers!
