# AZC E-Commerce

Next.js 16 e-commerce app with:
- Customer storefront and checkout
- Admin panel (products, orders, users, settings, pages)
- Stripe, PayPal, and Cash On Delivery flows
- MongoDB persistence via Mongoose

## Tech Stack
- Next.js App Router
- TypeScript
- NextAuth
- MongoDB + Mongoose
- Tailwind CSS + shadcn/ui
- Stripe + PayPal

## Local Setup
1. Install dependencies:
```bash
npm install
```
2. Create `.env.local` with required variables:
```bash
MONGODB_URI=
AUTH_SECRET=
NEXTAUTH_URL=
APP_URL=
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
PAYPAL_CLIENT_ID=
PAYPAL_APP_SECRET=
PAYPAL_API_URL=https://api-m.sandbox.paypal.com
RESEND_API_KEY=
SENDER_NAME=
SENDER_EMAIL=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
BCRYPT_SALT_ROUNDS=12
```
3. Run development server:
```bash
npm run dev
```

## Scripts
- `npm run dev` - start development server
- `npm run build` - production build
- `npm run start` - run production server
- `npm run lint` - ESLint checks
- `npm run seed` - seed database
- `npm run email` - email template preview

## Security Notes
- Password reset tokens are hashed before database storage.
- Password reset email URLs use trusted configured app URL values.
- API auth endpoints are now covered by middleware rate limiting.
- Stripe and PayPal payment verification includes amount/currency checks.

## Deployment Checklist
- Set all required environment variables
- Use HTTPS in production
- Verify Stripe webhook secret and endpoint
- Verify PayPal production API credentials and endpoint
- Run:
```bash
npm run lint
npm run build
```
