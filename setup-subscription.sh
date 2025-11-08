#!/bin/bash

# Subscription System Setup Script
# This script guides you through setting up the Stripe subscription system

set -e

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║   Bank Statement Converter - Subscription Setup Wizard        ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Step 1: Database Migration
echo -e "${BLUE}Step 1: Database Migration${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "You need to run the database migration in Supabase."
echo ""
echo -e "${YELLOW}Instructions:${NC}"
echo "1. Go to https://supabase.com/dashboard/project/lxqctjvjynhlxgzpewwi/sql/new"
echo "2. Copy the contents of: supabase/migrations/20251106_add_subscription_fields.sql"
echo "3. Paste it into the SQL Editor"
echo "4. Click 'Run' to execute the migration"
echo ""
read -p "Press Enter once you've completed the database migration..."
echo -e "${GREEN}✓ Database migration marked as complete${NC}"
echo ""

# Step 2: Install Stripe CLI
echo -e "${BLUE}Step 2: Install Stripe CLI${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if command -v stripe &> /dev/null; then
    echo -e "${GREEN}✓ Stripe CLI is already installed${NC}"
else
    echo "Stripe CLI is not installed. Installing now..."
    echo ""

    # Detect OS and install
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        if command -v brew &> /dev/null; then
            echo "Installing via Homebrew..."
            brew install stripe/stripe-cli/stripe
        else
            echo -e "${YELLOW}Homebrew not found. Please install manually:${NC}"
            echo "Visit: https://stripe.com/docs/stripe-cli#install"
            echo ""
            echo "Or download directly:"
            echo "curl -L https://github.com/stripe/stripe-cli/releases/latest/download/stripe_latest_darwin_arm64.tar.gz -o stripe.tar.gz"
            echo "tar -xvf stripe.tar.gz"
            echo "sudo mv stripe /usr/local/bin/"
            echo ""
            read -p "Press Enter once you've installed Stripe CLI..."
        fi
    else
        echo -e "${YELLOW}Please install Stripe CLI manually:${NC}"
        echo "Visit: https://stripe.com/docs/stripe-cli#install"
        echo ""
        read -p "Press Enter once you've installed Stripe CLI..."
    fi
fi
echo ""

# Step 3: Login to Stripe
echo -e "${BLUE}Step 3: Login to Stripe${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Logging in to your Taxformed Stripe account..."
echo ""
stripe login
echo ""
echo -e "${GREEN}✓ Successfully logged in to Stripe${NC}"
echo ""

# Step 4: Create Stripe Products
echo -e "${BLUE}Step 4: Create Stripe Products & Prices${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Creating Starter plan (£9.99/month)..."

# Create Starter Product
STARTER_PRODUCT=$(stripe products create \
  --name "Starter" \
  --description "Perfect for freelancers and small businesses getting started" \
  --statement-descriptor "CONVERTBANK" \
  --metadata[tier]="starter" \
  --metadata[conversions_limit]="50" \
  --metadata[export_formats]="csv,excel" \
  --metadata[data_retention_days]="30" \
  --format json | jq -r '.id')

echo -e "${GREEN}✓ Created Starter product: ${STARTER_PRODUCT}${NC}"

# Create Starter Price
STARTER_PRICE=$(stripe prices create \
  --product "$STARTER_PRODUCT" \
  --unit-amount 999 \
  --currency gbp \
  --recurring[interval]=month \
  --nickname "Starter Monthly" \
  --format json | jq -r '.id')

echo -e "${GREEN}✓ Created Starter price: ${STARTER_PRICE}${NC}"
echo ""

# Create Professional Product
echo "Creating Professional plan (£19.99/month)..."

PROFESSIONAL_PRODUCT=$(stripe products create \
  --name "Professional" \
  --description "For growing businesses with advanced needs" \
  --statement-descriptor "CONVERTBANK" \
  --metadata[tier]="professional" \
  --metadata[conversions_limit]="150" \
  --metadata[export_formats]="csv,excel,qbo,qfx" \
  --metadata[data_retention_days]="365" \
  --format json | jq -r '.id')

echo -e "${GREEN}✓ Created Professional product: ${PROFESSIONAL_PRODUCT}${NC}"

PROFESSIONAL_PRICE=$(stripe prices create \
  --product "$PROFESSIONAL_PRODUCT" \
  --unit-amount 1999 \
  --currency gbp \
  --recurring[interval]=month \
  --nickname "Professional Monthly" \
  --format json | jq -r '.id')

echo -e "${GREEN}✓ Created Professional price: ${PROFESSIONAL_PRICE}${NC}"
echo ""

# Create Business Product
echo "Creating Business plan (£39.99/month)..."

BUSINESS_PRODUCT=$(stripe products create \
  --name "Business" \
  --description "Enterprise solution with API access and dedicated support" \
  --statement-descriptor "CONVERTBANK" \
  --metadata[tier]="business" \
  --metadata[conversions_limit]="500" \
  --metadata[export_formats]="csv,excel,qbo,qfx,json" \
  --metadata[data_retention_days]="730" \
  --format json | jq -r '.id')

echo -e "${GREEN}✓ Created Business product: ${BUSINESS_PRODUCT}${NC}"

BUSINESS_PRICE=$(stripe prices create \
  --product "$BUSINESS_PRODUCT" \
  --unit-amount 3999 \
  --currency gbp \
  --recurring[interval]=month \
  --nickname "Business Monthly" \
  --format json | jq -r '.id')

echo -e "${GREEN}✓ Created Business price: ${BUSINESS_PRICE}${NC}"
echo ""

# Step 5: Create Payment Links
echo -e "${BLUE}Step 5: Create Payment Links${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "Creating Starter payment link..."
STARTER_LINK=$(stripe payment_links create \
  --line-items[0][price]="$STARTER_PRICE" \
  --line-items[0][quantity]=1 \
  --after-completion[type]=hosted_confirmation \
  --after-completion[hosted_confirmation][custom_message]="Thank you for subscribing to Starter! You can now access your enhanced features." \
  --format json | jq -r '.url')

echo -e "${GREEN}✓ Created Starter payment link${NC}"
echo ""

echo "Creating Professional payment link..."
PROFESSIONAL_LINK=$(stripe payment_links create \
  --line-items[0][price]="$PROFESSIONAL_PRICE" \
  --line-items[0][quantity]=1 \
  --after-completion[type]=hosted_confirmation \
  --after-completion[hosted_confirmation][custom_message]="Thank you for subscribing to Professional! You can now access your enhanced features." \
  --format json | jq -r '.url')

echo -e "${GREEN}✓ Created Professional payment link${NC}"
echo ""

echo "Creating Business payment link..."
BUSINESS_LINK=$(stripe payment_links create \
  --line-items[0][price]="$BUSINESS_PRICE" \
  --line-items[0][quantity]=1 \
  --after-completion[type]=hosted_confirmation \
  --after-completion[hosted_confirmation][custom_message]="Thank you for subscribing to Business! You can now access your enhanced features." \
  --format json | jq -r '.url')

echo -e "${GREEN}✓ Created Business payment link${NC}"
echo ""

# Step 6: Get API Keys
echo -e "${BLUE}Step 6: Retrieve Stripe API Keys${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${YELLOW}Please copy your Stripe Secret Key:${NC}"
echo "1. Go to https://dashboard.stripe.com/apikeys"
echo "2. Copy your 'Secret key' (starts with sk_live_ or sk_test_)"
echo ""
read -p "Paste your Stripe Secret Key here: " STRIPE_SECRET_KEY
echo ""

# Step 7: Create Webhook
echo -e "${BLUE}Step 7: Create Webhook Endpoint${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Please create a webhook endpoint manually:"
echo ""
echo -e "${YELLOW}Instructions:${NC}"
echo "1. Go to https://dashboard.stripe.com/webhooks"
echo "2. Click 'Add endpoint'"
echo "3. Enter URL: https://convertbank-statement.com/api/webhooks/stripe"
echo "4. Select these events:"
echo "   - checkout.session.completed"
echo "   - customer.subscription.created"
echo "   - customer.subscription.updated"
echo "   - customer.subscription.deleted"
echo "   - invoice.payment_succeeded"
echo "   - invoice.payment_failed"
echo "5. Click 'Add endpoint'"
echo "6. Copy the 'Signing secret' (starts with whsec_)"
echo ""
read -p "Paste your Webhook Secret here: " STRIPE_WEBHOOK_SECRET
echo ""

# Step 8: Update Environment Variables
echo -e "${BLUE}Step 8: Update Environment Variables${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Backup existing .env.local
cp .env.local .env.local.backup
echo -e "${GREEN}✓ Backed up .env.local to .env.local.backup${NC}"

# Append new variables to .env.local
cat >> .env.local << EOF

# Stripe Configuration (Added $(date))
STRIPE_SECRET_KEY=$STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET=$STRIPE_WEBHOOK_SECRET

# Stripe Price IDs
STRIPE_STARTER_PRICE_ID=$STARTER_PRICE
STRIPE_PROFESSIONAL_PRICE_ID=$PROFESSIONAL_PRICE
STRIPE_BUSINESS_PRICE_ID=$BUSINESS_PRICE

# Stripe Payment Links (Public)
NEXT_PUBLIC_STRIPE_STARTER_PAYMENT_LINK=$STARTER_LINK
NEXT_PUBLIC_STRIPE_PROFESSIONAL_PAYMENT_LINK=$PROFESSIONAL_LINK
NEXT_PUBLIC_STRIPE_BUSINESS_PAYMENT_LINK=$BUSINESS_LINK
EOF

echo -e "${GREEN}✓ Updated .env.local with Stripe configuration${NC}"
echo ""

# Step 9: Add to Vercel
echo -e "${BLUE}Step 9: Add Environment Variables to Vercel${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Adding environment variables to Vercel..."
echo ""

# Check if already logged in to Vercel
if vercel whoami &> /dev/null; then
    echo -e "${GREEN}✓ Already logged in to Vercel${NC}"
else
    echo "Please log in to Vercel..."
    vercel login
fi
echo ""

# Add environment variables to Vercel
echo "Adding STRIPE_SECRET_KEY..."
echo "$STRIPE_SECRET_KEY" | vercel env add STRIPE_SECRET_KEY production

echo "Adding STRIPE_WEBHOOK_SECRET..."
echo "$STRIPE_WEBHOOK_SECRET" | vercel env add STRIPE_WEBHOOK_SECRET production

echo "Adding STRIPE_STARTER_PRICE_ID..."
echo "$STARTER_PRICE" | vercel env add STRIPE_STARTER_PRICE_ID production

echo "Adding STRIPE_PROFESSIONAL_PRICE_ID..."
echo "$PROFESSIONAL_PRICE" | vercel env add STRIPE_PROFESSIONAL_PRICE_ID production

echo "Adding STRIPE_BUSINESS_PRICE_ID..."
echo "$BUSINESS_PRICE" | vercel env add STRIPE_BUSINESS_PRICE_ID production

echo "Adding NEXT_PUBLIC_STRIPE_STARTER_PAYMENT_LINK..."
echo "$STARTER_LINK" | vercel env add NEXT_PUBLIC_STRIPE_STARTER_PAYMENT_LINK production

echo "Adding NEXT_PUBLIC_STRIPE_PROFESSIONAL_PAYMENT_LINK..."
echo "$PROFESSIONAL_LINK" | vercel env add NEXT_PUBLIC_STRIPE_PROFESSIONAL_PAYMENT_LINK production

echo "Adding NEXT_PUBLIC_STRIPE_BUSINESS_PAYMENT_LINK..."
echo "$BUSINESS_LINK" | vercel env add NEXT_PUBLIC_STRIPE_BUSINESS_PAYMENT_LINK production

echo ""
echo -e "${GREEN}✓ All environment variables added to Vercel${NC}"
echo ""

# Summary
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                    Setup Complete! 🎉                          ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo -e "${GREEN}Summary:${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Stripe Products Created:"
echo "  • Starter (£9.99/month): $STARTER_PRODUCT"
echo "  • Professional (£19.99/month): $PROFESSIONAL_PRODUCT"
echo "  • Business (£39.99/month): $BUSINESS_PRODUCT"
echo ""
echo "Price IDs:"
echo "  • Starter: $STARTER_PRICE"
echo "  • Professional: $PROFESSIONAL_PRICE"
echo "  • Business: $BUSINESS_PRICE"
echo ""
echo "Payment Links:"
echo "  • Starter: $STARTER_LINK"
echo "  • Professional: $PROFESSIONAL_LINK"
echo "  • Business: $BUSINESS_LINK"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Deploy your changes: git add . && git commit -m 'Add subscription system' && git push"
echo "2. Test the subscription flow with Stripe test cards"
echo "3. Switch to live mode when ready for production"
echo ""
echo "Configuration saved to:"
echo "  • .env.local (local development)"
echo "  • Vercel environment variables (production)"
echo ""
echo -e "${GREEN}Your subscription system is now ready to use!${NC}"
echo ""
