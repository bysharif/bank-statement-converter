-- Add subscription and usage tracking fields to profiles table
-- Migration: 20251106_add_subscription_fields
-- Created: 2025-11-06

-- Add subscription-related columns to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'starter', 'professional', 'business')),
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'active' CHECK (subscription_status IN ('active', 'canceled', 'past_due', 'unpaid', 'incomplete', 'trialing', 'incomplete_expired')),
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS stripe_price_id TEXT,
ADD COLUMN IF NOT EXISTS conversions_used_this_month INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS conversions_limit INTEGER DEFAULT 5,
ADD COLUMN IF NOT EXISTS allowed_export_formats TEXT[] DEFAULT ARRAY['csv'],
ADD COLUMN IF NOT EXISTS subscription_start_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS current_period_start TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS current_period_end TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS cancel_at_period_end BOOLEAN DEFAULT FALSE;

-- Create index on stripe_customer_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id ON profiles(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_subscription_id ON profiles(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_tier ON profiles(subscription_tier);

-- Create function to reset monthly usage counters
CREATE OR REPLACE FUNCTION reset_monthly_conversions()
RETURNS void AS $$
BEGIN
  UPDATE profiles
  SET conversions_used_this_month = 0
  WHERE current_period_end IS NOT NULL
  AND current_period_end < NOW()
  AND subscription_status = 'active';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check if user can convert based on their limit
CREATE OR REPLACE FUNCTION can_user_convert(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  user_conversions INTEGER;
  user_limit INTEGER;
BEGIN
  SELECT conversions_used_this_month, conversions_limit
  INTO user_conversions, user_limit
  FROM profiles
  WHERE id = user_id;

  RETURN user_conversions < user_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to increment conversion count
CREATE OR REPLACE FUNCTION increment_conversion_count(user_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE profiles
  SET conversions_used_this_month = conversions_used_this_month + 1,
      updated_at = NOW()
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to update subscription from Stripe webhook
CREATE OR REPLACE FUNCTION update_subscription_from_stripe(
  p_user_id UUID,
  p_tier TEXT,
  p_status TEXT,
  p_stripe_subscription_id TEXT,
  p_stripe_price_id TEXT,
  p_current_period_start TIMESTAMPTZ,
  p_current_period_end TIMESTAMPTZ,
  p_cancel_at_period_end BOOLEAN
)
RETURNS void AS $$
DECLARE
  new_limit INTEGER;
  new_formats TEXT[];
BEGIN
  -- Set limits based on tier
  CASE p_tier
    WHEN 'starter' THEN
      new_limit := 50;
      new_formats := ARRAY['csv'];
    WHEN 'professional' THEN
      new_limit := 150;
      new_formats := ARRAY['csv', 'excel', 'qbo', 'qfx'];
    WHEN 'business' THEN
      new_limit := 500;
      new_formats := ARRAY['csv', 'excel', 'qbo', 'qfx', 'json'];
    ELSE
      new_limit := 5;
      new_formats := ARRAY['csv'];
  END CASE;

  UPDATE profiles
  SET
    subscription_tier = p_tier,
    subscription_status = p_status,
    stripe_subscription_id = p_stripe_subscription_id,
    stripe_price_id = p_stripe_price_id,
    conversions_limit = new_limit,
    allowed_export_formats = new_formats,
    current_period_start = p_current_period_start,
    current_period_end = p_current_period_end,
    cancel_at_period_end = p_cancel_at_period_end,
    updated_at = NOW()
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add RLS policies for subscription data
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own subscription data
DROP POLICY IF EXISTS "Users can view own subscription" ON profiles;
CREATE POLICY "Users can view own subscription"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Policy: Users can update their own profile (but not subscription fields directly)
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id AND
    -- Prevent users from modifying subscription fields directly
    subscription_tier = (SELECT subscription_tier FROM profiles WHERE id = auth.uid()) AND
    stripe_customer_id = (SELECT stripe_customer_id FROM profiles WHERE id = auth.uid())
  );

-- Grant execute permissions on functions to authenticated users
GRANT EXECUTE ON FUNCTION can_user_convert(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_conversion_count(UUID) TO authenticated;

-- Comment on new columns
COMMENT ON COLUMN profiles.subscription_tier IS 'User subscription plan tier';
COMMENT ON COLUMN profiles.subscription_status IS 'Current Stripe subscription status';
COMMENT ON COLUMN profiles.stripe_customer_id IS 'Stripe customer ID for billing';
COMMENT ON COLUMN profiles.stripe_subscription_id IS 'Active Stripe subscription ID';
COMMENT ON COLUMN profiles.conversions_used_this_month IS 'Number of conversions used in current billing period';
COMMENT ON COLUMN profiles.conversions_limit IS 'Maximum conversions allowed per billing period';
COMMENT ON COLUMN profiles.allowed_export_formats IS 'Export formats available for this subscription tier';
COMMENT ON COLUMN profiles.current_period_start IS 'Start of current billing period';
COMMENT ON COLUMN profiles.current_period_end IS 'End of current billing period';
