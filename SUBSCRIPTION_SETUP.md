# Subscription System Setup Guide

This guide will walk you through setting up the complete three-tier subscription system for the Bank Statement Converter application.

## Prerequisites

- Stripe account (use your existing Taxformed account)
- Supabase project with admin access
- Vercel account with project deployed

## Step 1: Run Database Migration

First, apply the subscription schema to your Supabase database:

```bash
# Navigate to your Supabase project dashboard
# Go to SQL Editor and run the migration file:
# supabase/migrations/20251106_add_subscription_fields.sql
```

Alternatively, if you have Supabase CLI installed:

```bash
supabase db push
```

This will add all necessary subscription fields to the `profiles` table and create the helper functions.

## Step 2: Create Stripe Products and Prices

Run these commands in your terminal to create the three subscription products:

### Starter Plan (£9.99/month)

```bash
stripe products create \
  --name "Starter" \
  --description "Perfect for freelancers and small businesses getting started" \
  --statement-descriptor "CONVERTBANK" \
  --metadata[tier]="starter" \
  --metadata[conversions_limit]="50" \
  --metadata[export_formats]="csv,excel" \
  --metadata[data_retention_days]="30"
```

Note the product ID returned (e.g., `prod_xxxxx`), then create the price:

```bash
stripe prices create \
  --product prod_xxxxx \
  --unit-amount 999 \
  --currency gbp \
  --recurring[interval]=month \
  --nickname "Starter Monthly"
```

Save the **price ID** (e.g., `price_xxxxx`) for later.

### Professional Plan (£19.99/month)

```bash
stripe products create \
  --name "Professional" \
  --description "For growing businesses with advanced needs" \
  --statement-descriptor "CONVERTBANK" \
  --metadata[tier]="professional" \
  --metadata[conversions_limit]="150" \
  --metadata[export_formats]="csv,excel,qbo,qfx" \
  --metadata[data_retention_days]="365"

stripe prices create \
  --product prod_xxxxx \
  --unit-amount 1999 \
  --currency gbp \
  --recurring[interval]=month \
  --nickname "Professional Monthly"
```

### Business Plan (£39.99/month)

```bash
stripe products create \
  --name "Business" \
  --description "Enterprise solution with API access and dedicated support" \
  --statement-descriptor "CONVERTBANK" \
  --metadata[tier]="business" \
  --metadata[conversions_limit]="500" \
  --metadata[export_formats]="csv,excel,qbo,qfx,json" \
  --metadata[data_retention_days]="730"

stripe prices create \
  --product prod_xxxxx \
  --unit-amount 3999 \
  --currency gbp \
  --recurring[interval]=month \
  --nickname "Business Monthly"
```

## Step 3: Create Stripe Payment Links

For each price, create a payment link:

```bash
# Starter
stripe payment_links create \
  --line-items[0][price]=price_starter_xxxxx \
  --line-items[0][quantity]=1 \
  --after-completion[type]=hosted_confirmation \
  --after-completion[hosted_confirmation][custom_message]="Thank you for subscribing! You can now access your enhanced features."

# Professional
stripe payment_links create \
  --line-items[0][price]=price_professional_xxxxx \
  --line-items[0][quantity]=1 \
  --after-completion[type]=hosted_confirmation \
  --after-completion[hosted_confirmation][custom_message]="Thank you for subscribing! You can now access your enhanced features."

# Business
stripe payment_links create \
  --line-items[0][price]=price_business_xxxxx \
  --line-items[0][quantity]=1 \
  --after-completion[type]=hosted_confirmation \
  --after-completion[hosted_confirmation][custom_message]="Thank you for subscribing! You can now access your enhanced features."
```

Save all three payment link URLs.

## Step 4: Set Up Stripe Webhook

1. Go to [Stripe Webhooks Dashboard](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. Enter your webhook URL: `https://convertbank-statement.com/api/webhooks/stripe`
4. Select these events to listen to:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Click "Add endpoint"
6. Copy the **Signing secret** (starts with `whsec_`)

## Step 5: Configure Environment Variables Locally

Update your `.env.local` file with the following variables:

```bash
# Stripe Keys (from https://dashboard.stripe.com/apikeys)
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx

# Price IDs (from Step 2)
STRIPE_STARTER_PRICE_ID=price_xxxxxxxxxxxxx
STRIPE_PROFESSIONAL_PRICE_ID=price_xxxxxxxxxxxxx
STRIPE_BUSINESS_PRICE_ID=price_xxxxxxxxxxxxx

# Payment Links (from Step 3)
NEXT_PUBLIC_STRIPE_STARTER_PAYMENT_LINK=https://buy.stripe.com/xxxxxxxxxxxxx
NEXT_PUBLIC_STRIPE_PROFESSIONAL_PAYMENT_LINK=https://buy.stripe.com/xxxxxxxxxxxxx
NEXT_PUBLIC_STRIPE_BUSINESS_PAYMENT_LINK=https://buy.stripe.com/xxxxxxxxxxxxx
```

## Step 6: Add Environment Variables to Vercel

Add all the environment variables to your Vercel project:

```bash
# Using Vercel CLI
vercel env add STRIPE_SECRET_KEY
# Paste your secret key when prompted

vercel env add STRIPE_WEBHOOK_SECRET
# Paste your webhook secret when prompted

vercel env add STRIPE_STARTER_PRICE_ID
# Paste the starter price ID when prompted

vercel env add STRIPE_PROFESSIONAL_PRICE_ID
# Paste the professional price ID when prompted

vercel env add STRIPE_BUSINESS_PRICE_ID
# Paste the business price ID when prompted

# Public variables (visible in browser)
vercel env add NEXT_PUBLIC_STRIPE_STARTER_PAYMENT_LINK
vercel env add NEXT_PUBLIC_STRIPE_PROFESSIONAL_PAYMENT_LINK
vercel env add NEXT_PUBLIC_STRIPE_BUSINESS_PAYMENT_LINK
```

Alternatively, use the [Vercel Dashboard](https://vercel.com/dashboard):
1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add each variable with the appropriate value
4. Make sure to add them for all environments (Production, Preview, Development)

## Step 7: Deploy Changes

Push your changes and redeploy:

```bash
git add .
git commit -m "Add subscription system with Stripe integration"
git push
```

Vercel will automatically deploy the changes.

## Step 8: Test the Integration

### Test in Stripe Test Mode First

1. Use test mode API keys initially
2. Use test card: `4242 4242 4242 4242` (any future expiry, any CVC)
3. Complete a test subscription
4. Verify webhook events are received
5. Check Supabase database for updated subscription data

### Test Flow Checklist

- [ ] New user can sign up with free tier
- [ ] User sees 5 conversion limit on dashboard
- [ ] User can view pricing page at `/pricing`
- [ ] User can click payment link and complete checkout
- [ ] Webhook receives `checkout.session.completed` event
- [ ] Database updates user subscription to paid tier
- [ ] User sees updated limit on dashboard
- [ ] User can perform conversions up to new limit
- [ ] User gets blocked when limit is reached
- [ ] User can access billing page at `/dashboard/billing`
- [ ] User can open Stripe Customer Portal
- [ ] User can cancel subscription via portal
- [ ] Webhook receives `customer.subscription.deleted` event
- [ ] Database downgrades user to free tier

### Production Deployment

Once testing is complete:

1. Switch to live mode API keys in Stripe Dashboard
2. Update environment variables in Vercel with live keys
3. Create new webhook endpoint for production URL
4. Update `STRIPE_WEBHOOK_SECRET` with production webhook secret
5. Redeploy

## Troubleshooting

### Webhook Not Receiving Events

1. Check webhook URL is correct and publicly accessible
2. Verify webhook secret matches in environment variables
3. Check Stripe Dashboard > Webhooks for delivery attempts and errors
4. Review Next.js logs for webhook processing errors

### Subscription Not Updating

1. Verify database migration ran successfully
2. Check Supabase logs for RLS policy errors
3. Ensure `stripe_customer_id` is being stored correctly
4. Verify price IDs in environment variables match Stripe products

### Payment Link Not Working

1. Ensure payment links are active in Stripe Dashboard
2. Verify `NEXT_PUBLIC_` prefix for client-side variables
3. Check browser console for JavaScript errors
4. Confirm products and prices are in live mode (for production)

## Security Checklist

- [ ] Stripe secret keys are never exposed to client
- [ ] Webhook signatures are verified before processing
- [ ] RLS policies are enabled on profiles table
- [ ] User authentication required for all conversion endpoints
- [ ] Environment variables are set in Vercel (not committed to git)
- [ ] `.env.local` is in `.gitignore`

## Support

If you encounter issues:

1. Check [Stripe API Logs](https://dashboard.stripe.com/logs)
2. Review Vercel deployment logs
3. Check Supabase logs for database errors
4. Verify all environment variables are set correctly

## Monthly Maintenance

- Monitor Stripe Dashboard for failed payments
- Review subscription churn metrics
- Update pricing if needed (create new prices, don't modify existing)
- Check webhook endpoint health
- Review and respond to customer support requests regarding billing

---

**Next Steps:**
After completing this setup, your subscription system will be fully functional. Users can:
- Sign up for free tier
- Upgrade to paid plans via payment links
- Manage subscriptions via Stripe Customer Portal
- Track usage on dashboard
- Access features based on subscription tier
