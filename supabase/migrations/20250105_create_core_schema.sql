-- Bank Statement Converter Core Schema Migration
-- Safe migration that handles existing objects

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing policies if they exist (to recreate them)
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

-- Profiles table (may already exist)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Banks table - stores supported UK bank information
CREATE TABLE IF NOT EXISTS public.banks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    logo_url TEXT,
    supported_formats TEXT[],
    parser_config JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Conversion jobs table - tracks file conversion requests
CREATE TABLE IF NOT EXISTS public.conversion_jobs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,

    -- Input file information
    original_filename TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    file_type TEXT NOT NULL,
    file_hash TEXT,

    -- Bank and conversion settings
    bank_id UUID REFERENCES public.banks(id),
    bank_detected TEXT,
    input_format TEXT NOT NULL DEFAULT 'pdf',
    output_format TEXT NOT NULL DEFAULT 'csv',

    -- Processing status
    status TEXT NOT NULL DEFAULT 'pending',
    progress INTEGER DEFAULT 0,
    error_message TEXT,

    -- Results
    transactions_count INTEGER,
    date_range_start DATE,
    date_range_end DATE,
    total_amount DECIMAL(15,2),

    -- File storage paths
    input_file_path TEXT,
    output_file_path TEXT,

    -- Processing metadata
    processing_time_ms INTEGER,
    parser_version TEXT,
    validation_errors JSONB,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days')
);

-- Enable RLS
ALTER TABLE public.conversion_jobs ENABLE ROW LEVEL SECURITY;

-- Transactions table - stores parsed transaction data
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    job_id UUID REFERENCES public.conversion_jobs(id) ON DELETE CASCADE,

    -- Transaction data
    transaction_date DATE NOT NULL,
    description TEXT NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    balance DECIMAL(15,2),

    -- Additional fields
    check_number TEXT,
    reference_number TEXT,
    category TEXT,
    subcategory TEXT,

    -- Processing metadata
    raw_text TEXT,
    confidence_score DECIMAL(3,2),
    is_duplicate BOOLEAN DEFAULT false,
    duplicate_of UUID REFERENCES public.transactions(id),

    -- Row metadata
    row_number INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- API usage tracking table
CREATE TABLE IF NOT EXISTS public.api_usage (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,

    endpoint TEXT NOT NULL,
    method TEXT NOT NULL,

    -- Usage metrics
    files_processed INTEGER DEFAULT 1,
    processing_time_ms INTEGER,
    file_size_bytes BIGINT,

    -- Rate limiting
    ip_address INET,
    user_agent TEXT,

    -- Results
    success BOOLEAN NOT NULL,
    error_code TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.api_usage ENABLE ROW LEVEL SECURITY;

-- Insert default UK banks
INSERT INTO public.banks (name, slug, display_name, supported_formats, is_active) VALUES
('wise', 'wise', 'Wise', ARRAY['pdf'], true),
('barclays', 'barclays', 'Barclays', ARRAY['pdf'], true),
('monzo', 'monzo', 'Monzo', ARRAY['pdf'], true),
('lloyds', 'lloyds', 'Lloyds Banking Group', ARRAY['pdf'], true),
('revolut', 'revolut', 'Revolut', ARRAY['pdf'], true),
('hsbc', 'hsbc', 'HSBC', ARRAY['pdf'], true),
('anna', 'anna', 'Anna Money', ARRAY['pdf'], true),
('santander', 'santander', 'Santander UK', ARRAY['pdf'], true),
('natwest', 'natwest', 'NatWest', ARRAY['pdf'], true)
ON CONFLICT (slug) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_conversion_jobs_user_id ON public.conversion_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_conversion_jobs_status ON public.conversion_jobs(status);
CREATE INDEX IF NOT EXISTS idx_conversion_jobs_created_at ON public.conversion_jobs(created_at);
CREATE INDEX IF NOT EXISTS idx_transactions_job_id ON public.transactions(job_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON public.transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_api_usage_user_id ON public.api_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_api_usage_created_at ON public.api_usage(created_at);

-- Row Level Security Policies

-- Profiles: Users can only see and edit their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Banks: Public read access
DROP POLICY IF EXISTS "Banks are publicly readable" ON public.banks;
CREATE POLICY "Banks are publicly readable" ON public.banks
    FOR SELECT USING (true);

-- Conversion jobs: Users can only access their own jobs
DROP POLICY IF EXISTS "Users can view own conversion jobs" ON public.conversion_jobs;
CREATE POLICY "Users can view own conversion jobs" ON public.conversion_jobs
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own conversion jobs" ON public.conversion_jobs;
CREATE POLICY "Users can insert own conversion jobs" ON public.conversion_jobs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own conversion jobs" ON public.conversion_jobs;
CREATE POLICY "Users can update own conversion jobs" ON public.conversion_jobs
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own conversion jobs" ON public.conversion_jobs;
CREATE POLICY "Users can delete own conversion jobs" ON public.conversion_jobs
    FOR DELETE USING (auth.uid() = user_id);

-- Transactions: Users can only access transactions from their jobs
DROP POLICY IF EXISTS "Users can view own transactions" ON public.transactions;
CREATE POLICY "Users can view own transactions" ON public.transactions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.conversion_jobs
            WHERE id = transactions.job_id
            AND user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "System can insert transactions" ON public.transactions;
CREATE POLICY "System can insert transactions" ON public.transactions
    FOR INSERT WITH CHECK (true);

-- API usage: Users can only see their own usage
DROP POLICY IF EXISTS "Users can view own API usage" ON public.api_usage;
CREATE POLICY "Users can view own API usage" ON public.api_usage
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can insert API usage" ON public.api_usage;
CREATE POLICY "System can insert API usage" ON public.api_usage
    FOR INSERT WITH CHECK (true);

-- Functions for automatic updates
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS handle_profiles_updated_at ON public.profiles;
DROP TRIGGER IF EXISTS handle_banks_updated_at ON public.banks;

-- Recreate triggers
CREATE TRIGGER handle_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_banks_updated_at
    BEFORE UPDATE ON public.banks
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name')
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop and recreate trigger for new users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Database schema migration completed successfully!';
    RAISE NOTICE 'Created tables: banks, conversion_jobs, transactions, api_usage';
    RAISE NOTICE 'Configured Row Level Security policies';
    RAISE NOTICE 'Inserted % UK banks', (SELECT COUNT(*) FROM public.banks);
END $$;
