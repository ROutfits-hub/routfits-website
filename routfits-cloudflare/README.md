# ROutfits — Cloudflare Pages + Stripe test checkout

A Lithuanian-language, EUR-denominated clothing store demo. Responsive storefront, size selection, persistent local cart, server-side Stripe Checkout Session creation, Lithuania + EU shipping address collection.

## Important limitations

- **Demo only.** Sample products and CSS illustrations are not real product photos.
- Stripe test mode only; API intentionally rejects live keys. No real charges.
- Delivery is **€0 demo shipping** for all supported EU destinations. Replace with genuine shipping rates, tax handling, and a real delivery policy before launch.
- This starter **does not save orders, manage stock, or implement Stripe webhooks**. The success page alone is not proof of payment. Do not use as a production store until verified webhooks, an order database, stock controls, confirmation emails, returns/privacy terms and legal business information are implemented.
- Cloudflare Pages free tier has usage and build limits. Stripe payment processing has transaction fees for live accounts. Custom domains are optional and usually paid.

## Deploy using GitHub (recommended for Pages Functions)

1. Create a free Cloudflare account at https://dash.cloudflare.com/ and a GitHub repository for this folder. Do not commit secrets.
2. Push the **contents** of this project folder to GitHub.
3. In Cloudflare dashboard: Workers & Pages → Create → Pages → Connect to Git → choose the repository.
4. Set **Framework preset: None**, **Build command: (leave blank)**, **Build output directory: `public`**, and **Root directory: `/`**.
5. Deploy. Cloudflare automatically detects `functions/api/checkout.js` as the `/api/checkout` endpoint.
6. In the Pages project Settings → Variables and Secrets, add `STRIPE_SECRET_KEY` as an **encrypted secret** for Preview and Production environments. Use a Stripe **test mode** secret key beginning with `sk_test_`. Redeploy after setting it. Never place the secret in HTML, JavaScript under public/, or GitHub.
7. Go to your assigned `*.pages.dev` URL, add products to the cart, and try checkout.

## Stripe setup

1. An authorized adult/business owner should create/operate the Stripe account and complete any required verification.
2. Open https://dashboard.stripe.com/test/apikeys and copy the **test secret key** into Cloudflare's secret setting.
3. Test Stripe Checkout with Stripe's published test card **4242 4242 4242 4242**, a future expiry date, and any CVC. This is a test card number, not a real payment method.
4. The checkout accepts delivery addresses in EU countries (including Lithuania), and collects billing address and phone number.

## Run locally

Requires Node.js 20+.

```bash
npm install
# Create .dev.vars (never commit it) containing:
# STRIPE_SECRET_KEY=sk_test_your_key_here
npx wrangler pages dev public
```

Open the local URL printed by Wrangler. For the production deployment, configure secrets in the Cloudflare dashboard.

## Editing products

Demo products exist in TWO places:
- `public/app.js` → `products` array (display names, prices in cents, sizes, illustration colors)
- `functions/api/checkout.js` → `PRODUCTS` (trusted server-side product names, prices in cents, and sizes)

**Update both** when editing products. The server never trusts browser-submitted prices.

## Before accepting real orders

Implement Stripe webhook signature verification for `checkout.session.completed` and any relevant asynchronous payment events; persist orders and paid status in Cloudflare D1; idempotently process event IDs; confirm prices, shipping, VAT and stock; add order confirmation email and admin tools. Publish required business contact information, privacy/cookie policies, delivery/returns and consumer-rights terms. Do not ship based solely on the success URL. Add a real product photo library with licensed photos.

## File structure

```
public/index.html           Storefront
public/style.css            Responsive styling
public/app.js               Cart and catalog
public/success.html         Demo success page
functions/api/checkout.js   Server-side Stripe session endpoint
package.json                Wrangler dev dependency
```
