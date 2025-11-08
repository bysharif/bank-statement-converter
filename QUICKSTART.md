# Quick Start - Subscription Setup

Follow these steps in order. Total time: ~30 minutes.

## ✅ Step 1: Run Database Migration (2 min)

1. **Open Supabase SQL Editor:**
   - Go to: https://supabase.com/dashboard/project/lxqctjvjynhlxgzpewwi/sql/new
   - Sign in if needed

2. **Run the migration:**
   - Open `supabase/migrations/20251106_add_subscription_fields.sql`
   - Copy ALL contents (Cmd+A, Cmd+C)
   - Paste into SQL Editor
   - Click **"Run"** button
   - Should see: "Success. No rows returned"

---

## ✅ Step 2: Create Stripe Products (10 min)

**Go to:** https://dashboard.stripe.com/products

### Create 3 Products:

| Product | Price | Statement Descriptor | Metadata |
|---------|-------|---------------------|----------|
| **Starter** | £9.99/month | CONVERTBANK | tier: `starter`<br>conversions_limit: `50`<br>export_formats: `csv,excel`<br>data_retention_days: `30` |
| **Professional** | £19.99/month | CONVERTBANK | tier: `professional`<br>conversions_limit: `150`<br>export_formats: `csv,excel,qbo,qfx`<br>data_retention_days: `365` |
| **Business** | £39.99/month | CONVERTBANK | tier: `business`<br>conversions_limit: `500`<br>export_formats: `csv,excel,qbo,qfx,json`<br>data_retention_days: `730` |

**📝 SAVE THESE:**
- Starter Price ID: `price_xxxxxxxx`
- Professional Price ID: `price_xxxxxxxx`
- Business Price ID: `price_xxxxxxxx`

---

## ✅ Step 3: Create Payment Links (5 min)

**Go to:** https://dashboard.stripe.com/payment-links

Create 3 payment links (one for each product):

1. Click "+ New"
2. Select product
3. After payment → "Show a confirmation page"
4. Message: `Thank you for subscribing! You can now access your enhanced features.`
5. Click "Create link"

**📝 SAVE THESE URLS:**
- Starter Link: `https://buy.stripe.com/xxxxxxxx`
- Professional Link: `https://buy.stripe.com/xxxxxxxx`
- Business Link: `https://buy.stripe.com/xxxxxxxx`

---

## ✅ Step 4: Create Webhook (3 min)

**Go to:** https://dashboard.stripe.com/webhooks

1. Click "+ Add endpoint"
2. **Endpoint URL:** `https://convertbank-statement.com/api/webhooks/stripe`
3. **Select events:** (click "Select events")
   - ✅ checkout.session.completed
   - ✅ customer.subscription.created
   - ✅ customer.subscription.updated
   - ✅ customer.subscription.deleted
   - ✅ invoice.payment_succeeded
   - ✅ invoice.payment_failed
4. Click "Add endpoint"
5. Click "Reveal" on Signing secret

**📝 SAVE THIS:**
- Webhook Secret: `whsec_xxxxxxxx`

---

## ✅ Step 5: Get API Key (1 min)

**Go to:** https://dashboard.stripe.com/apikeys

1. Find "Secret key"
2. Click "Reveal test key" (use test mode for now)

**📝 SAVE THIS:**
- Secret Key: `sk_test_xxxxxxxx`

---

## ✅ Step 6: Update .env.local (2 min)

Open `.env.local` and add at the bottom:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_paste_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_paste_your_secret_here

# Stripe Price IDs
STRIPE_STARTER_PRICE_ID=price_paste_starter_id_here
STRIPE_PROFESSIONAL_PRICE_ID=price_paste_professional_id_here
STRIPE_BUSINESS_PRICE_ID=price_paste_business_id_here

# Stripe Payment Links (Public)
NEXT_PUBLIC_STRIPE_STARTER_PAYMENT_LINK=https://buy.stripe.com/paste_starter_link
NEXT_PUBLIC_STRIPE_PROFESSIONAL_PAYMENT_LINK=https://buy.stripe.com/paste_professional_link
NEXT_PUBLIC_STRIPE_BUSINESS_PAYMENT_LINK=https://buy.stripe.com/paste_business_link
```

**Save the file!**

---

## ✅ Step 7: Add to Vercel (5 min)

**Go to:** https://vercel.com/sharif-6062s-projects/bank-statement-converter/settings/environment-variables

For each variable below, click "+ Add New":
- Select all 3 environments: Production, Preview, Development
- Paste the value

**Add these 8 variables:**

1. `STRIPE_SECRET_KEY` = (your secret key)
2. `STRIPE_WEBHOOK_SECRET` = (your webhook secret)
3. `STRIPE_STARTER_PRICE_ID` = (starter price ID)
4. `STRIPE_PROFESSIONAL_PRICE_ID` = (professional price ID)
5. `STRIPE_BUSINESS_PRICE_ID` = (business price ID)
6. `NEXT_PUBLIC_STRIPE_STARTER_PAYMENT_LINK` = (starter link URL)
7. `NEXT_PUBLIC_STRIPE_PROFESSIONAL_PAYMENT_LINK` = (professional link URL)
8. `NEXT_PUBLIC_STRIPE_BUSINESS_PAYMENT_LINK` = (business link URL)

---

## ✅ Step 8: Deploy (2 min)

```bash
git add .
git commit -m "Add subscription system"
git push
```

Wait for Vercel to deploy (auto-deploys on push).

---

## ✅ Step 9: Test (10 min)

1. **Go to:** https://convertbank-statement.com/pricing
2. **Click** "Subscribe Now" on Starter
3. **Use test card:** `4242 4242 4242 4242`
   - Expiry: 12/30
   - CVC: 123
   - ZIP: 12345
4. **Complete checkout**
5. **Verify:**
   - ✅ See confirmation message
   - ✅ Check Stripe Dashboard > Customers (new customer created)
   - ✅ Check Stripe Dashboard > Webhooks (event received)
   - ✅ Login to your app
   - ✅ Go to Dashboard - see 50 conversions limit
   - ✅ Go to Billing - see Starter plan active

---

## 🎉 Done!

Your subscription system is live in test mode.

### Next Steps:

**To go live:**
1. Toggle Stripe to "Live mode"
2. Recreate products/links in live mode
3. Create new webhook for live mode
4. Update Vercel with live keys
5. Redeploy

### Need Help?

Check the detailed guides:
- `SETUP_MANUAL.md` - Detailed step-by-step instructions
- `SUBSCRIPTION_SETUP.md` - Technical reference

### Test Cards:

- **Success:** `4242 4242 4242 4242`
- **Decline:** `4000 0000 0000 0002`
- **3D Secure:** `4000 0025 0000 3155`

All test cards use any future expiry, any CVC, any ZIP.
