# Manual Setup Guide (No CLI Required)

This guide walks you through setting up subscriptions using only the Stripe Dashboard and Vercel Dashboard.

## Part 1: Database Migration (5 minutes)

### Step 1: Open Supabase SQL Editor

1. Go to: https://supabase.com/dashboard/project/lxqctjvjynhlxgzpewwi/sql/new
2. You'll see the SQL Editor interface

### Step 2: Copy and Run the Migration

1. Open the file: `supabase/migrations/20251106_add_subscription_fields.sql`
2. Copy ALL the contents (Cmd+A, then Cmd+C)
3. Paste into the Supabase SQL Editor
4. Click the **"Run"** button (or press Cmd+Enter)
5. You should see: "Success. No rows returned"

✅ **Database is now ready!**

---

## Part 2: Create Stripe Products (15 minutes)

### Step 1: Go to Stripe Products Page

Visit: https://dashboard.stripe.com/products

### Step 2: Create Starter Product

1. Click **"+ Add product"**
2. Fill in:
   - **Name**: `Starter`
   - **Description**: `Perfect for freelancers and small businesses getting started`
   - **Pricing model**: Select "Standard pricing"
   - **Price**: `9.99`
   - **Billing period**: `Monthly`
   - **Currency**: `GBP`
3. Click **"Add product"**
4. **IMPORTANT**: Copy the Price ID (looks like `price_xxxxxxxxxx`) - you'll need this later
5. Click on the product name to edit it
6. Scroll down to **"Additional options"**
7. Set **Statement descriptor** to: `CONVERTBANK`
8. In **Metadata**, add:
   ```
   tier: starter
   conversions_limit: 50
   export_formats: csv,excel
   data_retention_days: 30
   ```
9. Click **"Save product"**

### Step 3: Create Professional Product

Repeat the same process with these details:
- **Name**: `Professional`
- **Description**: `For growing businesses with advanced needs`
- **Price**: `19.99`
- **Billing period**: `Monthly`
- **Currency**: `GBP`
- **Statement descriptor**: `CONVERTBANK`
- **Metadata**:
  ```
  tier: professional
  conversions_limit: 150
  export_formats: csv,excel,qbo,qfx
  data_retention_days: 365
  ```

**Save the Price ID!**

### Step 4: Create Business Product

Repeat with these details:
- **Name**: `Business`
- **Description**: `Enterprise solution with API access and dedicated support`
- **Price**: `39.99`
- **Billing period**: `Monthly`
- **Currency**: `GBP`
- **Statement descriptor**: `CONVERTBANK`
- **Metadata**:
  ```
  tier: business
  conversions_limit: 500
  export_formats: csv,excel,qbo,qfx,json
  data_retention_days: 730
  ```

**Save the Price ID!**

---

## Part 3: Create Payment Links (10 minutes)

### Step 1: Go to Payment Links

Visit: https://dashboard.stripe.com/payment-links

### Step 2: Create Starter Payment Link

1. Click **"+ New"**
2. Select the **Starter** product/price
3. Under "After payment", select **"Show a confirmation page"**
4. In "Confirmation page message", enter:
   ```
   Thank you for subscribing to Starter! You can now access your enhanced features.
   ```
5. Click **"Create link"**
6. **COPY THE FULL URL** (looks like `https://buy.stripe.com/xxxxx`)

### Step 3: Create Professional Payment Link

Repeat for Professional with message:
```
Thank you for subscribing to Professional! You can now access your enhanced features.
```

**COPY THE FULL URL**

### Step 4: Create Business Payment Link

Repeat for Business with message:
```
Thank you for subscribing to Business! You can now access your enhanced features.
```

**COPY THE FULL URL**

---

## Part 4: Set Up Webhook (5 minutes)

### Step 1: Go to Webhooks Page

Visit: https://dashboard.stripe.com/webhooks

### Step 2: Create New Endpoint

1. Click **"Add endpoint"**
2. **Endpoint URL**: `https://convertbank-statement.com/api/webhooks/stripe`
3. **Description**: `Bank Statement Converter Subscription Events`
4. Click **"Select events"**
5. Search for and check these events:
   - ✅ `checkout.session.completed`
   - ✅ `customer.subscription.created`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
   - ✅ `invoice.payment_succeeded`
   - ✅ `invoice.payment_failed`
6. Click **"Add events"**
7. Click **"Add endpoint"**
8. **COPY THE SIGNING SECRET** (click "Reveal" - starts with `whsec_`)

---

## Part 5: Get API Keys (2 minutes)

### Step 1: Go to API Keys

Visit: https://dashboard.stripe.com/apikeys

### Step 2: Copy Secret Key

1. Find **"Secret key"** (starts with `sk_test_` or `sk_live_`)
2. Click **"Reveal test key"** (or "Reveal live key" for production)
3. **COPY THE KEY**

---

## Part 6: Update Environment Variables (10 minutes)

You now have all these values:
- ✅ Stripe Secret Key
- ✅ Webhook Signing Secret
- ✅ 3 Price IDs
- ✅ 3 Payment Link URLs

### Step 1: Update Local .env.local

Open `.env.local` and add:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_secret_here

# Stripe Price IDs
STRIPE_STARTER_PRICE_ID=price_your_starter_price_id
STRIPE_PROFESSIONAL_PRICE_ID=price_your_professional_price_id
STRIPE_BUSINESS_PRICE_ID=price_your_business_price_id

# Stripe Payment Links (Public)
NEXT_PUBLIC_STRIPE_STARTER_PAYMENT_LINK=https://buy.stripe.com/starter_link
NEXT_PUBLIC_STRIPE_PROFESSIONAL_PAYMENT_LINK=https://buy.stripe.com/professional_link
NEXT_PUBLIC_STRIPE_BUSINESS_PAYMENT_LINK=https://buy.stripe.com/business_link
```

### Step 2: Add to Vercel

1. Go to: https://vercel.com/sharif-6062s-projects/bank-statement-converter/settings/environment-variables
2. Click **"Add New"** for each variable:

**Secret Variables** (all environments: Production, Preview, Development):
- `STRIPE_SECRET_KEY` = (paste your secret key)
- `STRIPE_WEBHOOK_SECRET` = (paste your webhook secret)
- `STRIPE_STARTER_PRICE_ID` = (paste starter price ID)
- `STRIPE_PROFESSIONAL_PRICE_ID` = (paste professional price ID)
- `STRIPE_BUSINESS_PRICE_ID` = (paste business price ID)

**Public Variables** (all environments):
- `NEXT_PUBLIC_STRIPE_STARTER_PAYMENT_LINK` = (paste starter link)
- `NEXT_PUBLIC_STRIPE_PROFESSIONAL_PAYMENT_LINK` = (paste professional link)
- `NEXT_PUBLIC_STRIPE_BUSINESS_PAYMENT_LINK` = (paste business link)

---

## Part 7: Deploy (5 minutes)

### Step 1: Commit and Push

```bash
git add .
git commit -m "Add complete subscription system with Stripe integration

- Three-tier pricing (Starter, Professional, Business)
- Database schema with subscription tracking
- Stripe webhooks for subscription events
- Usage tracking and limit enforcement
- Pricing and billing pages
- Customer Portal integration"

git push
```

### Step 2: Verify Deployment

1. Go to https://vercel.com/sharif-6062s-projects/bank-statement-converter
2. Wait for deployment to complete
3. Check that all environment variables are set

---

## Part 8: Test (15 minutes)

### Test with Stripe Test Mode

1. Make sure you're using **test mode** keys (sk_test_xxx)
2. Visit: https://convertbank-statement.com/pricing
3. Click "Subscribe Now" on Starter plan
4. Use test card: `4242 4242 4242 4242`
   - Expiry: Any future date
   - CVC: Any 3 digits
   - ZIP: Any 5 digits
5. Complete checkout
6. Verify:
   - ✅ You're redirected to confirmation page
   - ✅ Webhook event received (check Stripe Dashboard > Webhooks)
   - ✅ Supabase profile updated with subscription
   - ✅ Dashboard shows new limit
   - ✅ Can perform conversions

### Go Live

Once testing is successful:

1. Go to Stripe Dashboard
2. Toggle to **"Live mode"** (top right)
3. Create the same products/prices/payment links in live mode
4. Create new webhook in live mode
5. Update Vercel environment variables with **live** keys
6. Redeploy

---

## Troubleshooting

### Webhook not receiving events

1. Check Stripe Dashboard > Webhooks > Click your endpoint
2. Look at "Recent events" - any failures?
3. Verify URL is exactly: `https://convertbank-statement.com/api/webhooks/stripe`
4. Check that webhook secret matches your environment variable

### Subscription not updating database

1. Check Supabase logs: https://supabase.com/dashboard/project/lxqctjvjynhlxgzpewwi/logs/explorer
2. Verify migration ran successfully
3. Check RLS policies are active
4. Verify user has stripe_customer_id in profiles table

### Payment link shows error

1. Ensure products are "Active" in Stripe
2. Verify you're in correct mode (test vs live)
3. Check that payment links haven't expired
4. Verify price IDs match in environment variables

---

## Quick Reference

**Stripe Dashboard URLs:**
- Products: https://dashboard.stripe.com/products
- Payment Links: https://dashboard.stripe.com/payment-links
- Webhooks: https://dashboard.stripe.com/webhooks
- API Keys: https://dashboard.stripe.com/apikeys
- Events Log: https://dashboard.stripe.com/events

**Supabase URLs:**
- SQL Editor: https://supabase.com/dashboard/project/lxqctjvjynhlxgzpewwi/sql
- Table Editor: https://supabase.com/dashboard/project/lxqctjvjynhlxgzpewwi/editor
- Logs: https://supabase.com/dashboard/project/lxqctjvjynhlxgzpewwi/logs

**Vercel URLs:**
- Project: https://vercel.com/sharif-6062s-projects/bank-statement-converter
- Environment Variables: https://vercel.com/sharif-6062s-projects/bank-statement-converter/settings/environment-variables
- Deployments: https://vercel.com/sharif-6062s-projects/bank-statement-converter/deployments

---

**Estimated Total Time: 52 minutes**

Good luck! 🚀
