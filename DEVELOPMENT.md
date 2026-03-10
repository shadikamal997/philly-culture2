# Philly Culture Update - Development Setup Guide

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18.x or higher ([Download](https://nodejs.org/))
- **npm** or **yarn** package manager
- **Firebase Project** ([Create one](https://console.firebase.google.com/))
- **Stripe Account** ([Sign up](https://dashboard.stripe.com/register))
- **Git** for version control

---

## 📋 Step 1: Clone & Install

```bash
# Clone the repository
git clone <your-repo-url>
cd philly-culture-update

# Install dependencies
npm install
```

---

## 🔐 Step 2: Environment Configuration

### Create Environment File
```bash
# Copy the example file
cp .env.example .env.local
```

### Configure Firebase (Client-Side)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project → Project Settings → General
3. Scroll to "Your apps" → Web app configuration
4. Copy the config values into `.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123456
```

### Configure Firebase Admin (Server-Side)

1. Go to Firebase Console → Project Settings → **Service Accounts**
2. Click "Generate New Private Key"
3. Download the JSON file
4. Add to `.env.local`:

```env
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYourKeyHere\n-----END PRIVATE KEY-----\n"
```

⚠️ **Important:** The private key must include `\n` newline characters as shown.

### Configure Stripe

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys)
2. Toggle "Test mode" ON (top right)
3. Copy your keys into `.env.local`:

```env
STRIPE_SECRET_KEY=sk_test_51xxxxxxxxxxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51xxxxxxxxxxxxx
```

### Configure Stripe Webhooks (Local Development)

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login to Stripe
stripe login

# Forward webhooks to your local server
stripe listen --forward-to localhost:3000/api/webhook/stripe
```

Copy the webhook signing secret from the output:
```env
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

### Set Application URL

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

---

## 🗄️ Step 3: Configure Firestore Database

### Enable Firestore

1. Firebase Console → Build → Firestore Database
2. Click "Create database"
3. Choose "Start in **test mode**" for development
4. Select your region

### Create Initial Collections

Run these in the Firestore console to create initial structure:

**Collections to create:**
- `users`
- `courses`
- `products`
- `orders`

### Security Rules

1. Copy the contents from `firestore.rules` in this repo
2. Go to Firestore → Rules tab
3. Paste and publish

### Create Admin User

1. Go to Authentication → Users → Add user
2. Set email and password
3. Copy the User UID
4. Go to Firestore → `users` collection → Add document
5. Use the UID as Document ID and add:

```json
{
  "email": "admin@example.com",
  "fullName": "Admin User",
  "role": "admin",
  "purchasedCourses": [],
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

---

## 🏃 Step 4: Run Development Server

```bash
# Start the dev server
npm run dev

# Open in browser
# http://localhost:3000
```

The application will:
- ✅ Validate all environment variables
- ✅ Initialize Firebase
- ✅ Initialize Stripe
- ✅ Start on port 3000

---

## 🧪 Step 5: Test the Application

### Test Authentication
1. Go to http://localhost:3000/register
2. Create a new account
3. Check Firebase Authentication console to verify

### Test Admin Access
1. Login with your admin user
2. Go to http://localhost:3000/admin
3. Should redirect to admin dashboard

### Test Stripe Checkout (with webhook listener running)
1. Add a product to cart
2. Go to checkout
3. Use test card: `4242 4242 4242 4242`
4. Complete checkout
5. Check terminal for webhook events

---

## 📦 Production Build

```bash
# Test production build locally
npm run build
npm run start
```

---

## 🛠️ Common Development Tasks

### Check TypeScript Errors
```bash
npx tsc --noEmit
```

### Run Linter
```bash
npm run lint
```

### Clear Next.js Cache
```bash
rm -rf .next
npm run dev
```

---

## 🔥 Firestore Required Indexes

When you first run queries, Firebase will provide URLs to create required indexes. 

Or manually create in Firestore → Indexes:

1. **Orders by User**
   - Collection: `orders`
   - Fields: `userId` (Ascending), `createdAt` (Descending)

2. **Lessons by Course**
   - Collection: `lessons`
   - Fields: `courseId` (Ascending), `order` (Ascending)

---

## 🚨 Troubleshooting

### "Missing environment variable" error
- Check `.env.local` exists and has all required variables
- Restart the dev server after changing env vars

### Firebase Admin initialization failed
- Verify `FIREBASE_PRIVATE_KEY` has proper `\n` characters
- Check `FIREBASE_CLIENT_EMAIL` is correct

### Stripe webhooks not working
- Ensure `stripe listen` is running in a separate terminal
- Check `STRIPE_WEBHOOK_SECRET` matches the CLI output

### Build fails with type errors
```bash
# Clear TypeScript cache
rm -rf .next
rm -rf node_modules/.cache
npm run build
```

---

## 📂 Project Structure

```
philly-culture-update/
├── app/                    # Next.js 14 App Router
│   ├── (public)/          # Public pages (no auth required)
│   ├── (auth)/            # Auth pages (login, register)
│   ├── (dashboard)/       # User dashboard (auth required)
│   ├── (admin)/           # Admin panel (admin role required)
│   └── api/               # API routes
├── components/            # React components
├── context/               # React Context providers
├── firebase/              # Firebase configuration
├── hooks/                 # Custom React hooks
├── lib/                   # Utility libraries
├── services/              # Business logic & API calls
│   ├── server/           # Server-side only services
│   └── *.ts              # Client-side services
├── types/                 # TypeScript type definitions
│   └── firestore/        # Firestore data models
└── public/               # Static assets
```

---

## 🔒 Security Notes

- Never commit `.env.local` to git
- Use Firebase Security Rules in production
- Rotate Stripe keys regularly
- Enable 2FA on Firebase and Stripe accounts
- Review all API routes for proper authentication

---

## 📖 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Stripe Documentation](https://stripe.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

## 🆘 Getting Help

If you encounter issues:
1. Check the troubleshooting section above
2. Review error messages in browser console and terminal
3. Check Firebase and Stripe dashboards for errors
4. Verify all environment variables are correctly set

---

**Happy Coding! 🎉**
