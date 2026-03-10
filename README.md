# Philly Culture Update 🍕

A modern e-commerce and learning platform for authentic Philadelphia food culture. Built with Next.js 14, Firebase, and Stripe.

## ✨ Features

- 🎓 **Online Academy** - Step-by-step video cooking courses
- 🛒 **E-commerce Shop** - Physical products (sauces, kits, merchandise)
- 💳 **Secure Checkout** - Powered by Stripe with automatic fulfillment
- 👤 **User Dashboard** - Track courses, orders, and certificates
- 🔐 **Admin Panel** - Manage courses, products, orders, and users
- 📱 **Responsive Design** - Mobile-first Tailwind CSS styling
- 🔥 **Firebase Backend** - Authentication, Firestore database, and storage
- ⚡ **Server-Side Rendering** - Fast page loads with Next.js App Router

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Configure your environment variables
# (See DEVELOPMENT.md for detailed setup)

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 📚 Documentation

- **[Development Setup Guide](DEVELOPMENT.md)** - Complete setup instructions
- **[Firebase Setup](FIRESTORE_SETUP.md)** - Database and security rules
- **[Environment Variables](.env.example)** - Required configuration

## 🏗️ Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Authentication:** Firebase Auth
- **Database:** Cloud Firestore
- **Payments:** Stripe
- **Hosting:** Vercel (recommended)

## 📁 Project Structure

```
app/
├── (public)/     # Public marketing pages
├── (auth)/       # Authentication flows
├── (dashboard)/  # User account area
├── (admin)/      # Admin management panel
└── api/          # Backend API routes

components/       # Reusable React components
services/         # Business logic & data access
types/            # TypeScript definitions
firebase/         # Firebase configuration
```

## 🎯 Current Status

**Phase 1 Complete ✅**
- TypeScript compilation errors fixed
- Environment configuration documented
- Admin authentication security implemented
- Build process verified

**Next Steps:**
- Complete stub pages (About, Contact, Blog)
- Implement admin CRUD operations
- Add input validation
- Replace `<img>` with `next/image`

See the [Technical Audit Report](docs/audit-report.md) for detailed analysis.

## 🔧 Development

```bash
# Development server
npm run dev

# Production build
npm run build
npm run start

# Type checking
npx tsc --noEmit

# Linting
npm run lint
```

## 🚢 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables
4. Deploy!

### Environment Variables Required

See [.env.example](.env.example) for the complete list.

## 🔒 Security

- Firebase Authentication for user management
- Role-based access control (User/Admin)
- Server-side validation for all API routes
- Stripe webhook signature verification
- Environment variable validation

## 📄 License

This project is private and proprietary.

## 🆘 Support

For setup issues, see [DEVELOPMENT.md](DEVELOPMENT.md) troubleshooting section.

---

Built with ❤️ for Philadelphia food culture
